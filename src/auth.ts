import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, loginAttempts, activityLogs } from "@/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { loginSchema } from "@/lib/validation";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const { password } = parsed.data;

        // 1. Brute-force check: 5 failed attempts in the last 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentFailures = await db.query.loginAttempts.findMany({
          where: and(
            eq(loginAttempts.email, email),
            eq(loginAttempts.success, false),
            gte(loginAttempts.createdAt, tenMinutesAgo)
          ),
        });

        if (recentFailures.length >= 5) {
          throw new Error("Too many failed login attempts. Please try again in 10 minutes.");
        }

        // 2. Fetch user from database
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
          // Record failed attempt
          await db.insert(loginAttempts).values({
            email,
            success: false,
          });
          return null;
        }

        // 3. Verify password hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          await db.insert(loginAttempts).values({
            email,
            success: false,
          });
          return null;
        }

        // 4. Reject inactive or suspended users
        const normStatus = (user.status || "").toUpperCase();
        if (normStatus !== "ACTIVE") {
          throw new Error("Your account has been deactivated or suspended. Please contact security support.");
        }

        // 5. Record successful login attempt
        await db.insert(loginAttempts).values({
          email,
          success: true,
        });

        // 6. Calculate login streak and update last login timestamp
        const todayStr = new Date().toISOString().split("T")[0];
        let newStreak = user.loginStreak || 1;

        if (user.lastStreakDate) {
          const lastDate = new Date(user.lastStreakDate);
          const currentDate = new Date(todayStr);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }

        await db
          .update(users)
          .set({
            lastLoginAt: new Date(),
            loginStreak: newStreak,
            lastStreakDate: todayStr,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        // 7. Record activity log
        await db.insert(activityLogs).values({
          userId: user.id,
          type: "LOGIN",
          title: "User Authenticated",
          description: "Signed in securely to CyberGuard AI dashboard",
          metadata: { ip: "127.0.0.1", userAgent: "Browser" },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user.role || "USER").toUpperCase(),
          status: normStatus,
          tokenVersion: user.tokenVersion ?? 1,
          image: user.image,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.status = (user as any).status || "ACTIVE";
        token.tokenVersion = (user as any).tokenVersion ?? 1;
        return token;
      }

      // Live session validation: if tokenVersion changed in DB or user was suspended
      if (token?.id) {
        const freshUser = await db.query.users.findFirst({
          where: eq(users.id, token.id as string),
        });

        if (!freshUser) {
          return null as any;
        }

        const freshStatus = (freshUser.status || "").toUpperCase();
        if (freshStatus !== "ACTIVE") {
          return null as any;
        }

        if ((freshUser.tokenVersion ?? 1) !== token.tokenVersion) {
          // Token version bumped, session invalidated
          return null as any;
        }

        token.role = (freshUser.role || "USER").toUpperCase();
        token.status = freshStatus;
      }

      return token;
    },
  },
});
