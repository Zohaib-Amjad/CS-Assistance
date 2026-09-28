import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation";
import { db } from "@/db";
import { users, notifications, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const rateLimit = await checkRateLimit(ip, "register", {
      maxRequests: 5,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many signup attempts. Please try again in 1 minute.",
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              result.error.errors[0]?.message || "Invalid registration data",
          },
        },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "An account with this email address already exists.",
          },
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        plan: "FREE",
        status: "ACTIVE",
        securityScore: 75,
      })
      .returning();

    // Welcome Notification
    await db.insert(notifications).values({
      userId: newUser.id,
      title: "Welcome to CyberGuard AI! 🛡️",
      message:
        "Your defensive cybersecurity suite is ready. Run your first email or URL scan to begin earning badges.",
      type: "SUCCESS",
      isRead: false,
    });

    // Activity Log
    await db.insert(activityLogs).values({
      userId: newUser.id,
      type: "LOGIN",
      title: "Account Registered",
      description: "New user account created and initialized with 75 baseline security score",
      metadata: { plan: "FREE" },
    });

    const { passwordHash: _, ...safeUser } = newUser;

    return NextResponse.json(
      {
        success: true,
        data: {
          user: safeUser,
          message: "Account created successfully.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create account. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
