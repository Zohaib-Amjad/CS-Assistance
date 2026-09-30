import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.status = (user as any).status || "ACTIVE";
        token.tokenVersion = (user as any).tokenVersion ?? 1;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || "USER";
        (session.user as any).status = (token.status as string) || "ACTIVE";
        (session.user as any).tokenVersion = (token.tokenVersion as number) ?? 1;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
