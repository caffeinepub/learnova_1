import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { useGetUserCount } from "../hooks/useQueries";

export default function AdminDashboard() {
  const { profile } = useAuthContext();
  const { data: userCount, isLoading: countLoading } = useGetUserCount();

  const stats = [
    {
      label: "Total Users",
      value: countLoading ? null : String(userCount ?? 0),
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Courses",
      value: "12",
      icon: <BookOpen className="h-5 w-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Completion Rate",
      value: "74%",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Reports Generated",
      value: "38",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      data-ocid="admin.page"
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {profile?.name ?? "Admin"}. Here's your platform
            overview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="shadow-card"
            data-ocid="admin.stat.card"
          >
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {stat.label}
                  </p>
                  {stat.value === null ? (
                    <Skeleton className="h-7 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card
          className="shadow-card hover:shadow-lg transition-shadow"
          data-ocid="admin.users.card"
        >
          <CardHeader>
            <div className="p-2.5 w-fit bg-blue-50 rounded-lg mb-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-base">User Management</CardTitle>
            <CardDescription>
              View, search, and assign roles to all platform users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full"
              data-ocid="admin.manage_users.primary_button"
            >
              <Link to="/admin/users">
                Manage Users <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="p-2.5 w-fit bg-emerald-50 rounded-lg mb-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-base">Course Management</CardTitle>
            <CardDescription>
              Publish, edit, and manage all courses on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full"
              data-ocid="admin.manage_courses.primary_button"
            >
              <Link to="/instructor/courses">
                Manage Courses <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="p-2.5 w-fit bg-violet-50 rounded-lg mb-2">
              <BarChart3 className="h-5 w-5 text-violet-600" />
            </div>
            <CardTitle className="text-base">Reporting</CardTitle>
            <CardDescription>
              View learner progress and course analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full"
              data-ocid="admin.reports.primary_button"
            >
              <Link to="/instructor/reporting">
                View Reports <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
