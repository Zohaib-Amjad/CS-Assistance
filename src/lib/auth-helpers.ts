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
