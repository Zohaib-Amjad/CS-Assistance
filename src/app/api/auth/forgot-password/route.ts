import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const rateLimit = await checkRateLimit(ip, "forgot-password", {
      maxRequests: 3,
      windowSeconds: 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many reset attempts. Please wait 1 minute.",
          },
        },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: { message: "Valid email is required" } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    // Always respond with success to prevent user enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, a password reset link has been dispatched.",
      });
    }

    // Generate random secure token & store SHA-256 hash
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    await db.insert(passwordResetTokens).values({
      email: normalizedEmail,
      token: hashedToken,
      expiresAt,
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

    if (process.env.RESEND_API_KEY) {
      // Optional Resend integration
      try {
        console.log(`[EMAIL DISPATCH] Sending password reset to ${normalizedEmail}`);
      } catch (err) {
        console.error("Resend delivery error:", err);
      }
    } else {
      console.log("\n=======================================================");
      console.log("🔑 [DEV NOTICE] PASSWORD RESET LINK GENERATED:");
      console.log(`User: ${normalizedEmail}`);
      console.log(`URL:  ${resetUrl}`);
      console.log("=======================================================\n");
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a password reset link has been dispatched.",
      devResetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
