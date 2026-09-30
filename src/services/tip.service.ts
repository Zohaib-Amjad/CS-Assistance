import { db } from "@/db";
import { securityTips } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getDailyTip() {
  const dailyTips = await db.query.securityTips.findMany({
    where: eq(securityTips.isDaily, true),
  });

  if (dailyTips.length > 0) {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dailyTips[dayOfYear % dailyTips.length];
  }

  const anyTip = await db.query.securityTips.findFirst({
    orderBy: [desc(securityTips.createdAt)],
  });

  return anyTip || {
    id: "default",
    title: "Verify Before You Click",
    category: "Phishing Prevention",
    text: "Always inspect the true domain name in the address bar before entering passwords or OTPs.",
    actionPrompt: "Check links with the CyberGuard URL scanner.",
    isDaily: true,
  };
}

export async function getAllTips() {
  return db.query.securityTips.findMany({
    orderBy: [desc(securityTips.createdAt)],
  });
}
