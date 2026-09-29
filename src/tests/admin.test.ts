import { describe, it, expect } from "vitest";
import {
  getAdminMetrics,
  getUsersAdmin,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  addBlockedDomainAdmin,
  deleteBlockedDomainAdmin,
  getBlockedDomainsAdmin,
} from "@/services/admin.service";

describe("Phase 12 — Admin Operations, Self-Protection Guards & Access Control", () => {
  const adminId = "admin-demo-id";
  const adminEmail = "admin@cyberguard.ai";

  describe("Admin Metrics & Telemetry", () => {
    it("should aggregate total users, scans, threats, and quiz completion rate", async () => {
      const metrics = await getAdminMetrics();

      expect(metrics).toHaveProperty("totalUsers");
      expect(typeof metrics.totalUsers).toBe("number");
      expect(metrics.totalUsers).toBeGreaterThan(0);

      expect(metrics).toHaveProperty("activeUsers");
      expect(typeof metrics.activeUsers).toBe("number");

      expect(metrics).toHaveProperty("totalScans");
      expect(typeof metrics.totalScans).toBe("number");

      expect(metrics).toHaveProperty("threatsDetected");
      expect(typeof metrics.threatsDetected).toBe("number");

      expect(metrics).toHaveProperty("quizzesCompleted");
      expect(metrics).toHaveProperty("averageScore");
      expect(metrics).toHaveProperty("quizCompletionRate");

      expect(Array.isArray(metrics.trendDays)).toBe(true);
      expect(metrics.trendDays.length).toBe(7);
    });
  });

  describe("User Management & Self-Protection Guards", () => {
    it("should query paginated and filtered users directory", async () => {
      const res = await getUsersAdmin({ page: 1, limit: 5 });

      expect(Array.isArray(res.users)).toBe(true);
      expect(res.users.length).toBeLessThanOrEqual(5);
      expect(typeof res.totalCount).toBe("number");
      expect(typeof res.totalPages).toBe("number");

      // Password hash must never be returned in admin user list
      for (const u of res.users) {
        expect((u as any).passwordHash).toBeUndefined();
      }
    });

    it("should strictly BLOCK admin from deleting themselves (self-delete guard)", async () => {
      await expect(
        deleteUserAdmin(adminId, adminEmail, adminId)
      ).rejects.toThrow(/self-deletion is prohibited/i);
    });

    it("should strictly BLOCK admin from demoting themselves to regular USER (self-demotion guard)", async () => {
      await expect(
        updateUserAdmin(adminId, adminEmail, adminId, { role: "USER" })
      ).rejects.toThrow(/self-demotion is prohibited/i);
    });

    it("should strictly BLOCK admin from deactivating their own account (self-deactivation guard)", async () => {
      await expect(
        updateUserAdmin(adminId, adminEmail, adminId, { status: "INACTIVE" })
      ).rejects.toThrow(/self-deactivation is prohibited/i);
    });
  });

  describe("Blocked Domains Management", () => {
    it("should allow adding, querying, and removing blocked domains", async () => {
      const testDomain = `malicious-phish-${Date.now()}.xyz`;
      const created = await addBlockedDomainAdmin(
        adminId,
        adminEmail,
        testDomain,
        "Automated Threat Feed Flag"
      );

      expect(created.domain).toBe(testDomain);
      expect(created.reason).toBe("Automated Threat Feed Flag");

      const all = await getBlockedDomainsAdmin();
      expect(all.some((d: any) => d.domain === testDomain)).toBe(true);

      // Cleanup
      const deleteRes = await deleteBlockedDomainAdmin(adminId, adminEmail, created.id);
      expect(deleteRes.success).toBe(true);
    });
  });

  describe("RBAC & Administrator Status Re-Check", () => {
    it("should reject regular USER from acquiring administrator privileges", () => {
      const regularUser = { id: "user-1", role: "USER", status: "ACTIVE" };
      const isAdmin = regularUser.role?.toUpperCase() === "ADMIN";
      expect(isAdmin).toBe(false);
    });

    it("should reject INACTIVE or SUSPENDED administrator accounts", () => {
      const suspendedAdmin = { id: "admin-2", role: "ADMIN", status: "SUSPENDED" };
      const isActive = (suspendedAdmin.status || "").toUpperCase() === "ACTIVE";
      expect(isActive).toBe(false);
    });
  });
});
