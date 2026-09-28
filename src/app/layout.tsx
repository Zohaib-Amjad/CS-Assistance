import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CyberGuard AI — AI-Powered Cyber Security Assistant",
  description: "A defensive cybersecurity education platform featuring AI phishing detection, SSRF-safe URL scanning, client-side password audits, interactive quizzes, and security guidance.",
  keywords: ["cybersecurity", "phishing detection", "password strength", "URL scanner", "AI security assistant", "cyber awareness quiz"],
  authors: [{ name: "CyberGuard AI Team" }],
  icons: {
    icon: "/assets/cyber-logo.svg",
    shortcut: "/assets/cyber-logo.svg",
    apple: "/assets/cyber-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
