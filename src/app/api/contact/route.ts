import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const rateLimit = await checkRateLimit(ip, "contact_form", { maxRequests: 5, windowSeconds: 60 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many messages sent. Please wait a minute." } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message || "Invalid contact form data." } },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    const [savedMsg] = await db.insert(contactMessages).values({
      name,
      email: email.toLowerCase().trim(),
      subject,
      message,
      status: "unread",
    }).returning();

    return NextResponse.json({
      success: true,
      data: {
        id: savedMsg.id,
        message: "Thank you for reaching out! Our cybersecurity team will respond shortly.",
      },
    });
  } catch (error) {
    console.error("Contact submit error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to submit contact message." } },
      { status: 500 }
    );
  }
}
