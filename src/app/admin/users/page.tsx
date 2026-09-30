"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowUpDown,
  Filter,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  plan: string;
  status: string;
  securityScore: number;
  phone?: string | null;
  country?: string | null;
  bio?: string | null;
  createdAt: string | number;
}

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    plan: "FREE",
    status: "ACTIVE",
    country: "Pakistan",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    role: "USER",
    plan: "FREE",
    status: "ACTIVE",
    phone: "",
    country: "Pakistan",
    bio: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sortBy,
        sortOrder,
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (roleFilter !== "All") params.set("role", roleFilter);
      if (planFilter !== "All") params.set("plan", planFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList(data.data.users || []);
        setTotalCount(data.data.totalCount || 0);
        setTotalPages(data.data.totalPages || 1);
      } else {
        toast.error(data.error?.message || "Failed to fetch users.");
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      toast.error("Error loading user directory.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, roleFilter, planFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Toggle row selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(usersList.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Export CSV
  const handleExportCSV = () => {
    const targetUsers =
      selectedIds.size > 0
        ? usersList.filter((u) => selectedIds.has(u.id))
        : usersList;

    if (targetUsers.length === 0) {
      toast.warning("No users available to export.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Role", "Plan", "Status", "Security Score", "Country", "Joined On"];
    const rows = targetUsers.map((u) => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      u.role,
      u.plan,
      u.status,
      u.securityScore,
      `"${u.country || ""}"`,
      new Date(u.createdAt).toISOString().slice(0, 10),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cyberguard-users-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${targetUsers.length} user records to CSV.`);
  };

  // Add User Submission
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`User '${data.data.name}' created successfully!`);
        setAddOpen(false);
        setAddForm({
          name: "",
          email: "",
          password: "",
          role: "USER",
          plan: "FREE",
          status: "ACTIVE",
          country: "Pakistan",
        });
        loadUsers();
      } else {
        toast.error(data.error?.message || "Failed to create user.");
      }
    } catch (err) {
      toast.error("Error creating user account.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      role: user.role || "USER",
      plan: user.plan || "FREE",
      status: user.status || "ACTIVE",
      phone: user.phone || "",
      country: user.country || "Pakistan",
      bio: user.bio || "",
    });
    setEditOpen(true);
  };

  // Save Edit Submission
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`User '${data.data.name}' updated successfully!`);
        setEditOpen(false);
        loadUsers();
      } else {
        toast.error(data.error?.message || "Failed to update user.");
      }
    } catch (err) {
      toast.error("Error updating user.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (user: UserItem) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  // Delete User Action
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}?mode=soft`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`User '${selectedUser.name}' deactivated successfully.`);
        setDeleteOpen(false);
        loadUsers();
      } else {
        toast.error(data.error?.message || "Failed to delete user.");
      }
    } catch (err) {
      toast.error("Error deleting user.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date helper: "15 May 2024"
  const formatJoinedDate = (dateVal: string | number) => {
    if (!dateVal) return "15 May 2024";
    const d = new Date(dateVal);
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header matching 11. Admin Panel (Users) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-sm shadow-md shadow-indigo-500/30">
              11.
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Users
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage user accounts, RBAC roles, subscription plans, and account status.
          </p>
        </div>

        {/* Action Controls: Search & Add User */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box with Search Icon */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9.5 rounded-xl text-xs h-10 border-border bg-card shadow-2xs"
            />
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            onClick={handleExportCSV}
            size="sm"
            className="rounded-xl text-xs h-10 px-3.5 border-border hover:bg-muted font-semibold"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </Button>

          {/* + Add User Button */}
          <Button
            onClick={() => setAddOpen(true)}
            size="sm"
            className="rounded-xl text-xs h-10 px-4.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground flex items-center gap-1.5 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </span>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {["All", "Active", "Inactive"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-border">|</span>

          {/* Role Filter */}
          <div className="flex items-center gap-1">
            {["All", "User", "Admin"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRoleFilter(r);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  roleFilter === r
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <span className="text-border">|</span>

          {/* Plan Filter */}
          <div className="flex items-center gap-1">
            {["All", "Free", "Premium"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPlanFilter(p);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  planFilter === p
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          Showing <span className="font-bold text-foreground">{usersList.length}</span> of {totalCount} users
        </div>
      </div>

      {/* Main Table Card matching 11-admin-users.png */}
      <Card className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-border">
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={usersList.length > 0 && selectedIds.size === usersList.length}
                    className="h-4 w-4 rounded text-indigo-600 border-border"
                  />
                </TableHead>
                <TableHead className="font-bold text-xs">Name</TableHead>
                <TableHead className="font-bold text-xs">Email</TableHead>
                <TableHead className="font-bold text-xs">Status</TableHead>
                <TableHead className="font-bold text-xs">Joined On</TableHead>
                <TableHead className="text-right font-bold text-xs pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">Loading users...</p>
                  </TableCell>
                </TableRow>
              ) : usersList.length > 0 ? (
                usersList.map((u) => {
                  const initials = u.name
                    ? u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U";

                  const isActive = (u.status || "").toUpperCase() === "ACTIVE";
                  const isSelected = selectedIds.has(u.id);

                  return (
                    <TableRow
                      key={u.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isSelected ? "bg-indigo-50/30 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(u.id)}
                          className="h-4 w-4 rounded text-indigo-600 border-border"
                        />
                      </TableCell>

                      {/* Name with Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
                            <AvatarFallback className="text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/admin/users/${u.id}`}
                              className="text-xs sm:text-sm font-bold text-foreground hover:text-indigo-600 transition-colors block"
                            >
                              {u.name}
                            </Link>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                              {u.role} • {u.plan}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="text-xs sm:text-sm text-muted-foreground">
                        {u.email}
                      </TableCell>

                      {/* Status: Active (green) / Inactive (red) */}
                      <TableCell>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-xs text-rose-600 dark:text-rose-400">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            Inactive
                          </span>
                        )}
                      </TableCell>

                      {/* Joined On */}
                      <TableCell className="text-xs text-muted-foreground">
                        {formatJoinedDate(u.createdAt)}
                      </TableCell>

                      {/* Actions: Edit (pencil), Delete (red trash) */}
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit user details and role"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDelete(u)}
                            title="Deactivate / Delete user"
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No users matching the filter criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page <span className="font-bold text-foreground">{currentPage}</span> of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="rounded-xl h-8 text-xs px-3"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="rounded-xl h-8 text-xs px-3"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* DIALOG: + ADD USER */}
      {/* ========================================================================= */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              <span>Add New User</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provision a new account with customized role permissions and temporary credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="add-name" className="text-xs font-semibold">
                Full Name
              </Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. Fatima Noor"
                required
                className="rounded-xl text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-email" className="text-xs font-semibold">
                Email Address
              </Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="fatima.noor@example.com"
                required
                className="rounded-xl text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-pass" className="text-xs font-semibold">
                Temporary Password
              </Label>
              <Input
                id="add-pass"
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                placeholder="CyberGuard2026!"
                className="rounded-xl text-xs h-10"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role</Label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-card text-xs px-2.5"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Plan</Label>
                <select
                  value={addForm.plan}
                  onChange={(e) => setAddForm({ ...addForm, plan: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-card text-xs px-2.5"
                >
                  <option value="FREE">FREE</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status</Label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-card text-xs px-2.5"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                {submitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: EDIT USER */}
      {/* ========================================================================= */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Edit className="h-5 w-5 text-indigo-600" />
              <span>Edit User: {selectedUser?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update roles, subscription plan tiers, and account active state.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-semibold">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="rounded-xl text-xs h-10"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role</Label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-card text-xs px-2.5"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Plan</Label>
                <select
                  value={editForm.plan}
                  onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-card text-xs px-2.5"
                >
                  <option value="FREE">FREE</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-card text-xs px-2.5"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-semibold">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+92 300..."
                  className="rounded-xl text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-country" className="text-xs font-semibold">
                  Country
                </Label>
                <Input
                  id="edit-country"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  placeholder="Pakistan"
                  className="rounded-xl text-xs h-10"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: CONFIRM DELETE USER */}
      {/* ========================================================================= */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm rounded-3xl p-6 space-y-4 border-rose-200 dark:border-rose-900/60">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Deactivate User?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to deactivate <span className="font-bold text-foreground">{selectedUser?.name}</span> ({selectedUser?.email})?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={submitting}
              className="rounded-xl text-xs font-bold"
            >
              {submitting ? "Deactivating..." : "Deactivate User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
