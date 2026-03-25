import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "../contexts/AuthContext";
import { useDoesAdminExist, useSeedFirstAdmin } from "../hooks/useQueries";

const FEATURED_COURSES = [
  {
    id: 1,
    title: "Complete React & TypeScript Masterclass",
    instructor: "Dr. Sarah Chen",
    tags: ["React", "TypeScript", "Frontend"],
    lessons: 42,
    duration: "18h 30m",
    rating: 4.9,
    students: 2840,
    cover:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=220&fit=crop",
  },
  {
    id: 2,
    title: "Data Science with Python: Zero to Hero",
    instructor: "Prof. Michael Torres",
    tags: ["Python", "Data Science", "ML"],
    lessons: 58,
    duration: "24h 15m",
    rating: 4.8,
    students: 3620,
    cover:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=220&fit=crop",
  },
  {
    id: 3,
    title: "UI/UX Design Fundamentals",
    instructor: "Emma Williams",
    tags: ["Design", "Figma", "UX"],
    lessons: 35,
    duration: "14h 00m",
    rating: 4.7,
    students: 1985,
    cover:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=220&fit=crop",
  },
];

export default function HomePage() {
  const { isAuthenticated, refetchProfile } = useAuthContext();
  const { data: adminExists } = useDoesAdminExist();
  const seedAdmin = useSeedFirstAdmin();
  const navigate = useNavigate();

  const handleClaimAdmin = async () => {
    try {
      await seedAdmin.mutateAsync();
      refetchProfile();
      toast.success("You are now the platform Admin!");
      navigate({ to: "/admin" });
    } catch {
      toast.error("Failed to claim admin role.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-sidebar text-sidebar-foreground py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 text-sm px-4 py-1">
            🎓 The Future of Learning
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Unlock Your Potential with{" "}
            <span className="text-primary">LearnOva</span>
          </h1>
          <p className="text-lg text-sidebar-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Access world-class courses, earn badges, and advance your career —
            all on one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => navigate({ to: "/dashboard" })}
                className="bg-primary hover:bg-primary/90 text-white gap-2"
                data-ocid="home.go_dashboard.primary_button"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate({ to: "/login" })}
                className="bg-primary hover:bg-primary/90 text-white gap-2"
                data-ocid="home.get_started.primary_button"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent gap-2"
              data-ocid="home.explore_courses.secondary_button"
            >
              <PlayCircle className="h-4 w-4" /> Explore Courses
            </Button>
          </div>

          {isAuthenticated && adminExists === false && (
            <div className="mt-6 p-4 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-sm flex items-center justify-between gap-4">
              <span>
                No admin exists yet. You can claim the Admin role for this
                platform.
              </span>
              <Button
                size="sm"
                onClick={handleClaimAdmin}
                disabled={seedAdmin.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                data-ocid="home.claim_admin.primary_button"
              >
                {seedAdmin.isPending ? "Claiming..." : "Claim Admin"}
              </Button>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
          {[
            {
              icon: <BookOpen className="h-6 w-6" />,
              label: "Courses",
              value: "200+",
            },
            {
              icon: <Users className="h-6 w-6" />,
              label: "Learners",
              value: "12,000+",
            },
            {
              icon: <Star className="h-6 w-6" />,
              label: "Avg Rating",
              value: "4.8 ★",
            },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="flex justify-center text-primary">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-sidebar-foreground/60 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Featured Courses
              </h2>
              <p className="text-muted-foreground mt-1">
                Curated picks for curious minds
              </p>
            </div>
            <Link
              to="/"
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_COURSES.map((course, i) => (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
                data-ocid={`home.course.item.${i + 1}`}
              >
                <div className="relative">
                  <img
                    src={course.cover}
                    alt={course.title}
                    className="w-full h-44 object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-primary text-white text-xs">
                    <GraduationCap className="h-3 w-3 mr-1" /> {course.lessons}{" "}
                    lessons
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {course.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="text-base leading-snug line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {course.instructor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>⏱ {course.duration}</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
                      {course.rating} ({course.students.toLocaleString()})
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    variant={isAuthenticated ? "default" : "outline"}
                    data-ocid={`home.course_join.button.${i + 1}`}
                  >
                    {isAuthenticated ? "Start Learning" : "Join Course"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
