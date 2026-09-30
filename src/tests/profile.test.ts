import { describe, it, expect } from "vitest";
import {
  validateImageMagicBytes,
  LocalDiskStorageProvider,
} from "@/services/storage.service";
import { checkAchievements } from "@/services/achievement.service";
import {
  getUserProfileData,
  updateUserProfile,
  changeUserPassword,
} from "@/services/user.service";

describe("Phase 10 — Profile, Storage Abstraction, Achievements & Settings", () => {
  describe("Avatar Storage Abstraction & MIME/Size Validation", () => {
    it("should validate magic bytes for JPEG, PNG, and WebP images", () => {
      // Valid PNG header: 89 50 4E 47 0D 0A 1A 0A
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      expect(validateImageMagicBytes(pngBuffer, "image/png")).toBe(true);

      // Valid JPEG header: FF D8 FF
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]);
      expect(validateImageMagicBytes(jpegBuffer, "image/jpeg")).toBe(true);

      // Valid WebP header: 'RIFF' .... 'WEBP'
      const webpBuffer = Buffer.concat([
        Buffer.from("RIFF", "ascii"),
        Buffer.from([0x00, 0x00, 0x00, 0x00]),
        Buffer.from("WEBP", "ascii"),
      ]);
      expect(validateImageMagicBytes(webpBuffer, "image/webp")).toBe(true);

      // Invalid fake header (e.g. executable or text file renamed to .png)
      const fakeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00", "ascii");
      expect(validateImageMagicBytes(fakeBuffer, "image/png")).toBe(false);
    });

    it("should enforce strict 2MB maximum file size", async () => {
      const storage = new LocalDiskStorageProvider();
      const largeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3 MB

      await expect(
        storage.saveAvatar(largeBuffer, "huge.png", "image/png")
      ).rejects.toThrow(/exceeds 2 MB limit/i);
    });

    it("should reject disallowed MIME types like text/plain or application/pdf", async () => {
      const storage = new LocalDiskStorageProvider();
      const pdfBuffer = Buffer.from("%PDF-1.4 file content here");

      await expect(
        storage.saveAvatar(pdfBuffer, "document.pdf", "application/pdf")
      ).rejects.toThrow(/unsupported file type/i);
    });
  });

  describe("Server-Side Achievement Engine (checkAchievements)", () => {
    it("should evaluate all achievements with progress and unlock criteria", async () => {
      const result = await checkAchievements("user-demo-id");

      expect(Array.isArray(result.all)).toBe(true);
      expect(result.all.length).toBeGreaterThanOrEqual(8);

      const codes = result.all.map((a) => a.code);
      expect(codes).toContain("quiz_master");
      expect(codes).toContain("security_expert");
      expect(codes).toContain("active_user");
      expect(codes).toContain("first_scan");
      expect(codes).toContain("first_quiz");
      expect(codes).toContain("url_guardian");
      expect(codes).toContain("phishing_detector");
      expect(codes).toContain("security_champion");

      // Check progress format
      for (const ach of result.all) {
        expect(ach).toHaveProperty("title");
        expect(ach).toHaveProperty("description");
        expect(ach).toHaveProperty("icon");
        expect(typeof ach.unlocked).toBe("boolean");
        expect(ach.progress).toBeDefined();
        expect(typeof ach.progress.current).toBe("number");
        expect(typeof ach.progress.target).toBe("number");
        expect(ach.progress.target).toBeGreaterThan(0);
        expect(typeof ach.progress.percentage).toBe("number");
        expect(ach.progress.percentage).toBeGreaterThanOrEqual(0);
        expect(ach.progress.percentage).toBeLessThanOrEqual(100);
      }
    });

    it("should return top 3 recent achievements for profile display", async () => {
      const result = await checkAchievements("user-demo-id");
      expect(Array.isArray(result.recent)).toBe(true);
      expect(result.recent.length).toBeLessThanOrEqual(3);
    });
  });

  describe("Profile & User Service Operations", () => {
    it("should fetch complete profile data with stats and score", async () => {
      const profile = await getUserProfileData("user-demo-id");
      expect(profile).not.toBeNull();
      expect(profile?.user.name).toBeTruthy();
      expect(profile?.user.email).toBeTruthy();
      expect(profile?.stats).toBeDefined();
      expect(typeof profile?.stats.quizzesTaken).toBe("number");
      expect(typeof profile?.stats.scansPerformed).toBe("number");
      expect(typeof profile?.stats.threatsDetected).toBe("number");
      expect(typeof profile?.stats.securityScore).toBe("number");
    });

    it("should update profile details and save successfully", async () => {
      const updated = await updateUserProfile("user-demo-id", {
        country: "Pakistan",
        bio: "Senior Cybersecurity Researcher",
      });

      expect(updated.country).toBe("Pakistan");
      expect(updated.bio).toBe("Senior Cybersecurity Researcher");
    });
  });
});
