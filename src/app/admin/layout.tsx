import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Header } from "@/components/layout/header";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar className="hidden lg:flex shrink-0 sticky top-0" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Header user={adminUser as any} title="Security Operations Center (SOC) Administration" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
