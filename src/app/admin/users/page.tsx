import React from "react";
import { getAllUsersAdmin } from "@/services/admin.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const usersList = await getAllUsersAdmin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              User Access & Role Management
            </h1>
            <Badge variant="secondary" className="text-xs">{usersList.length} Total Users</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Audit registered accounts, review security scores, and manage role-based authorization levels.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Registered Users Directory</CardTitle>
            <CardDescription className="text-xs">Active platform participants and assigned RBAC privileges</CardDescription>
          </div>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Security Score</TableHead>
                <TableHead>Email Scans</TableHead>
                <TableHead>URL Scans</TableHead>
                <TableHead>Quizzes</TableHead>
                <TableHead>Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((u: any) => {
                const initials = u.name
                  ? u.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U";

                const isAdmin = u.role === "admin";

                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {u.image ? <AvatarImage src={u.image} /> : null}
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-foreground">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isAdmin ? "secondary" : "outline"} className="capitalize text-[10px] font-bold">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-extrabold text-foreground">
                      {u.securityScore}/100
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.phishingScansCount}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.urlScansCount}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.quizzesCompletedCount}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
