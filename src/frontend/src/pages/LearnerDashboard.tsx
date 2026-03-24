import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Flame, Star, Trophy } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";

const BADGE_LEVELS = [
  { label: "Newbie", points: 20, color: "bg-gray-100 text-gray-600" },
  { label: "Explorer", points: 40, color: "bg-blue-100 text-blue-600" },
  { label: "Achiever", points: 60, color: "bg-emerald-100 text-emerald-700" },
  { label: "Specialist", points: 80, color: "bg-violet-100 text-violet-700" },
  { label: "Expert", points: 100, color: "bg-amber-100 text-amber-700" },
  { label: "Master", points: 120, color: "bg-rose-100 text-rose-700" },
];

const MOCK_COURSES = [
  {
    title: "Complete React & TypeScript Masterclass",
    progress: 68,
    lessons: 42,
    completed: 28,
  },
  {
    title: "Data Science with Python",
    progress: 30,
    lessons: 58,
    completed: 17,
  },
];

export default function LearnerDashboard() {
  const { profile } = useAuthContext();
  const totalPoints = 45;

  const currentBadge =
    BADGE_LEVELS.filter((b) => b.points <= totalPoints).pop() ??
    BADGE_LEVELS[0];
  const nextBadge = BADGE_LEVELS.find((b) => b.points > totalPoints);
  const progress = nextBadge
    ? ((totalPoints - (currentBadge.points - 20)) / 20) * 100
    : 100;

  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      data-ocid="learner.page"
    >
      <div className="mb-8">
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-2">
          Learner
        </Badge>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.name?.split(" ")[0] ?? "Learner"}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Keep up the great work. You're making amazing progress!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> My Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-2">
              <p className="text-4xl font-bold text-foreground">
                {totalPoints}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total Points
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium">
                  Current:{" "}
                  <Badge className={`${currentBadge.color} text-xs ml-1`}>
                    {currentBadge.label}
                  </Badge>
                </span>
                {nextBadge && (
                  <span className="text-muted-foreground">
                    Next: {nextBadge.label}
                  </span>
                )}
              </div>
              <Progress value={progress} className="h-2" />
              {nextBadge && (
                <p className="text-xs text-muted-foreground">
                  {nextBadge.points - totalPoints} pts to reach{" "}
                  {nextBadge.label}
                </p>
              )}
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Badge Levels
              </p>
              <div className="space-y-1.5">
                {BADGE_LEVELS.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs">{b.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {b.points} pts
                      </span>
                      {totalPoints >= b.points && (
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">My Courses</h2>
            <Badge variant="secondary" className="ml-auto text-xs">
              {MOCK_COURSES.length} enrolled
            </Badge>
          </div>
          {MOCK_COURSES.map((course, i) => (
            <Card
              key={course.title}
              className="shadow-card"
              data-ocid={`learner.course.item.${i + 1}`}
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">{course.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course.completed} / {course.lessons} lessons completed
                    </p>
                  </div>
                  <Badge
                    className={
                      course.progress === 100
                        ? "bg-emerald-100 text-emerald-700 text-xs"
                        : "bg-blue-100 text-blue-700 text-xs"
                    }
                  >
                    {course.progress === 100 ? "Completed" : "In Progress"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium text-foreground">
                      {course.progress}%
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="shadow-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-5 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  7-Day Learning Streak! 🔥
                </p>
                <p className="text-xs text-muted-foreground">
                  You've been consistent. Keep going to earn bonus points!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
