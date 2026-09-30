import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/services/user.service";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getUserById(session.user.id);
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getUserById(session.user.id);
  if (!user || (user.status && user.status.toUpperCase() !== "ACTIVE")) {
    redirect("/login?error=AccountSuspended");
  }

  return user;
}

export async function requireUser() {
  return requireAuth();
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user || user.role?.toUpperCase() !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Authentication required", status: 401 as const };
  }
  const user = await getUserById(session.user.id);
  if (!user) {
    return { error: "User not found", status: 401 as const };
  }
  if (user.status && user.status.toUpperCase() !== "ACTIVE") {
    return { error: "Account is inactive or suspended", status: 403 as const };
  }
  if (user.role?.toUpperCase() !== "ADMIN") {
    return { error: "Access denied. Administrator privileges required.", status: 403 as const };
  }
  return { user };
}
