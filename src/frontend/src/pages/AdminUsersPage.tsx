import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Principal } from "@dfinity/principal";
import {
  AlertTriangle,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type UserProfile, UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useGetUsers, useSetUserRole } from "../hooks/useQueries";

type DisplayRole = "admin" | "instructor" | "learner";

function getRoleDisplay(profile: UserProfile): DisplayRole {
  if (profile.role === UserRole.admin) return "admin";
  if (profile.avatarUrl?.includes("instructor")) return "instructor";
  return "learner";
}

function RoleBadge({ role }: { role: DisplayRole }) {
  const map = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    instructor: "bg-blue-100 text-blue-700 border-blue-200",
    learner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <Badge className={`${map[role]} capitalize font-medium`}>{role}</Badge>
  );
}

export default function AdminUsersPage() {
  const { data: users, isLoading } = useGetUsers();
  const setRole = useSetUserRole();
  const { actor } = useActor();
  const [search, setSearch] = useState("");
  const [resetting, setResetting] = useState(false);

  const filtered = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRoleChange = async (user: UserProfile, newRole: DisplayRole) => {
    let backendRole: UserRole;
    if (newRole === "admin") backendRole = UserRole.admin;
    else backendRole = UserRole.user;

    try {
      await setRole.mutateAsync({
        user: user.principal as unknown as Principal,
        role: backendRole,
      });
      toast.success(`Updated ${user.name}'s role to ${newRole}`);
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const handleResetDatabase = async () => {
    if (!actor) {
      toast.error("Not connected to backend.");
      return;
    }
    setResetting(true);
    try {
      await (actor as any).resetDatabase();
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Database reset successfully. Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset database. Please try again.");
      setResetting(false);
    }
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      data-ocid="admin_users.page"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Admin → Users
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            {users
              ? `${users.length} total users registered`
              : "Loading users..."}
          </p>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> All Users
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-ocid="admin_users.search_input"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="p-6 space-y-3"
              data-ocid="admin_users.loading_state"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-8 w-28" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="py-16 text-center text-muted-foreground"
              data-ocid="admin_users.empty_state"
            >
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No users found</p>
              <p className="text-sm mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin_users.table">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-12 pl-5">#</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right pr-5">
                      Change Role
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user, idx) => (
                    <TableRow
                      key={String(user.id)}
                      data-ocid={`admin_users.row.${idx + 1}`}
                    >
                      <TableCell className="pl-5 text-muted-foreground text-sm">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {user.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={getRoleDisplay(user)} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <Select
                          defaultValue={getRoleDisplay(user)}
                          onValueChange={(v) =>
                            handleRoleChange(user, v as DisplayRole)
                          }
                        >
                          <SelectTrigger
                            className="w-36"
                            data-ocid={`admin_users.role.select.${idx + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="instructor">
                              Instructor
                            </SelectItem>
                            <SelectItem value="learner">Learner</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <div className="mt-10" data-ocid="admin_users.panel">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-semibold text-destructive uppercase tracking-wide">
            Danger Zone
          </h2>
        </div>
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Reset Database</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Permanently delete all users, courses, enrollments, progress,
                  reviews, and points. This cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="shrink-0 gap-2"
                    disabled={resetting}
                    data-ocid="admin_users.delete_button"
                  >
                    <Trash2 className="h-4 w-4" />
                    {resetting ? "Resetting..." : "Reset Database"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="admin_users.dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                      This will permanently delete{" "}
                      <span className="font-semibold text-foreground">
                        all users, courses, enrollments, and progress data
                      </span>
                      . You will be logged out immediately and this action{" "}
                      <span className="font-semibold text-destructive">
                        cannot be undone
                      </span>
                      .
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="admin_users.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetDatabase}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-ocid="admin_users.confirm_button"
                    >
                      Reset Database
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
