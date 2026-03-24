import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { BarChart3, BookOpen, ExternalLink, PlusCircle } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";

const RECENT_COURSES = [
  {
    title: "Introduction to React & Modern Hooks",
    lessons: 14,
    status: "Published",
  },
  { title: "Advanced TypeScript Patterns", lessons: 12, status: "Draft" },
  { title: "Node.js REST API Architecture", lessons: 18, status: "Published" },
];

export default function InstructorDashboard() {
  const { profile } = useAuthContext();
  const navigate = useNavigate();

  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      data-ocid="instructor.page"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Instructor
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Instructor Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {profile?.name ?? "Instructor"}. Manage your courses and
          track learners.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="p-2.5 w-fit bg-blue-50 rounded-lg mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>
              Create, edit, and publish your courses. Add lessons, quizzes, and
              manage learner access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full gap-2"
              onClick={() => navigate({ to: "/instructor/courses" })}
              data-ocid="instructor.courses.primary_button"
            >
              <ExternalLink className="h-4 w-4" /> Open Courses Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate({ to: "/instructor/courses" })}
              data-ocid="instructor.create_course.secondary_button"
            >
              <PlusCircle className="h-4 w-4" /> Create New Course
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="p-2.5 w-fit bg-violet-50 rounded-lg mb-2">
              <BarChart3 className="h-5 w-5 text-violet-600" />
            </div>
            <CardTitle>Reporting</CardTitle>
            <CardDescription>
              Track participant progress, quiz scores, and time spent per
              course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              data-ocid="instructor.reports.secondary_button"
            >
              View Reports
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-3">
              Detailed reporting available in Step 3
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Recent Courses</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 text-muted-foreground"
            onClick={() => navigate({ to: "/instructor/courses" })}
            data-ocid="instructor.view_all_courses.link"
          >
            View all <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECENT_COURSES.map((course, i) => (
            <Card
              key={course.title}
              className="border shadow-xs"
              data-ocid={`instructor.course.item.${i + 1}`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm leading-snug">
                      {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {course.lessons} lessons
                    </p>
                  </div>
                  <Badge
                    className={
                      course.status === "Published"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs shrink-0"
                        : "bg-amber-100 text-amber-700 border-amber-200 text-xs shrink-0"
                    }
                  >
                    {course.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
