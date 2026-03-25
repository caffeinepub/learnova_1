import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Crown,
  Flame,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import * as localDb from "../lib/localDb";
import type { LcCourse } from "../lib/localDb";

// ─── Badge Tier System ─────────────────────────────────────────────────────────
const BADGE_TIERS = [
  {
    name: "Starter",
    min: 0,
    max: 19,
    color: "text-slate-500",
    bg: "bg-slate-100",
    border: "border-slate-300",
    icon: Star,
  },
  {
    name: "Newbie",
    min: 20,
    max: 39,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    icon: Sparkles,
  },
  {
    name: "Explorer",
    min: 40,
    max: 59,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-300",
    icon: BookOpen,
  },
  {
    name: "Achiever",
    min: 60,
    max: 79,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-300",
    icon: Trophy,
  },
  {
    name: "Specialist",
    min: 80,
    max: 99,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-300",
    icon: Zap,
  },
  {
    name: "Expert",
    min: 100,
    max: 119,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-300",
    icon: Flame,
  },
  {
    name: "Master",
    min: 120,
    max: Number.POSITIVE_INFINITY,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-300",
    icon: Crown,
  },
];

function getBadgeTier(pts: number) {
  return BADGE_TIERS.findLast((t) => pts >= t.min) ?? BADGE_TIERS[0];
}

const GRADIENTS = [
  "from-violet-500 via-indigo-600 to-indigo-700",
  "from-fuchsia-500 via-purple-600 to-purple-700",
  "from-cyan-500 via-blue-500 to-blue-700",
  "from-emerald-500 via-teal-500 to-teal-700",
  "from-orange-500 via-amber-500 to-red-600",
  "from-pink-500 via-rose-500 to-rose-700",
];

function generateDescription(title: string): string {
  return `Master the fundamentals of ${title} with hands-on exercises and real-world projects.`;
}

type ButtonVariant = "join" | "start" | "continue" | "buy";

function getCourseButtonVariant(
  course: LcCourse,
  isLoggedIn: boolean,
  enrolledIds: Set<string>,
  progressPct: number,
): ButtonVariant {
  if (course.accessRule === "payment" && !enrolledIds.has(course.id))
    return "buy";
  if (!isLoggedIn) return "join";
  if (!enrolledIds.has(course.id)) return "start";
  if (progressPct < 100) return "continue";
  return "start";
}

interface CourseCardProps {
  course: LcCourse;
  idx: number;
  isLoggedIn: boolean;
  enrolledIds: Set<string>;
  completedLessonsMap: Map<string, number>;
  onAction: (courseId: string, variant: ButtonVariant) => void;
}

function CourseCard({
  course,
  idx,
  isLoggedIn,
  enrolledIds,
  completedLessonsMap,
  onAction,
}: CourseCardProps) {
  const totalLessons = course.lessons.length;
  const completedCount = completedLessonsMap.get(course.id) ?? 0;
  const pct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const variant = getCourseButtonVariant(course, isLoggedIn, enrolledIds, pct);
  const initial = course.title.trim()[0]?.toUpperCase() ?? "C";

  const buttonConfig = {
    join: {
      label: "Join Course",
      className:
        "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
      outline: true,
    },
    start: {
      label: "Start",
      className: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: false,
    },
    continue: {
      label: "Continue",
      className: "bg-emerald-600 text-white hover:bg-emerald-700",
      outline: false,
    },
    buy: {
      label: "Buy Course",
      className: "bg-amber-500 text-white hover:bg-amber-600",
      outline: false,
    },
  }[variant];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Card className="overflow-hidden h-full flex flex-col shadow-card hover:shadow-lg transition-shadow duration-300 border-border/60">
        <div
          className={`h-40 relative overflow-hidden bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} flex items-center justify-center shrink-0`}
        >
          <span className="text-5xl font-black text-white/30 select-none">
            {initial}
          </span>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
        <CardContent className="flex flex-col flex-1 pt-4 pb-4 px-4 gap-3">
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold leading-snug line-clamp-2 text-foreground text-sm">
              {course.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {generateDescription(course.title)}
            </p>
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 3).map((tag) => (
                <UiBadge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {tag}
                </UiBadge>
              ))}
            </div>
          </div>
          {variant === "continue" && totalLessons > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>
                  {completedCount}/{totalLessons} lessons
                </span>
                <span className="font-medium text-emerald-600">{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          )}
          <Button
            data-ocid={`courses.item.${idx + 1}`}
            size="sm"
            variant={buttonConfig.outline ? "outline" : "default"}
            className={`w-full text-xs font-semibold gap-1.5 ${buttonConfig.className}`}
            onClick={() => onAction(course.id, variant)}
          >
            {variant === "buy" && <ShoppingCart className="h-3.5 w-3.5" />}
            {variant === "continue" && <Zap className="h-3.5 w-3.5" />}
            {buttonConfig.label}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ProfilePanelProps {
  name: string;
  email: string;
  points: number;
  enrolledCount: number;
}

function ProfilePanel({
  name,
  email,
  points,
  enrolledCount,
}: ProfilePanelProps) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "LN";
  const currentTier = getBadgeTier(points);
  const nextTierIdx =
    BADGE_TIERS.findIndex((t) => t.name === currentTier.name) + 1;
  const nextTier =
    nextTierIdx < BADGE_TIERS.length ? BADGE_TIERS[nextTierIdx] : null;
  const progressToNext = nextTier
    ? Math.round(
        ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100,
      )
    : 100;
  const TierIcon = currentTier.icon;

  return (
    <Card className="sticky top-6 overflow-hidden border-border/60 shadow-card">
      <div className="h-20 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)]" />
      </div>
      <CardContent className="pt-0 pb-5 px-5">
        <div className="flex flex-col items-center -mt-10 mb-4">
          <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-base mt-3 text-foreground">
            {name || "Learner"}
          </h3>
          {email && <p className="text-xs text-muted-foreground">{email}</p>}
        </div>
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200/60 rounded-xl px-4 py-3 mb-4">
          <Zap className="h-5 w-5 text-indigo-600 fill-indigo-200" />
          <span className="text-2xl font-black text-indigo-700">
            {points.toLocaleString()}
          </span>
          <span className="text-sm text-indigo-500 font-medium">pts</span>
        </div>
        <div
          className={`rounded-xl border-2 ${currentTier.border} ${currentTier.bg} px-4 py-3 mb-4 flex items-center gap-3`}
        >
          <div className="p-2 rounded-lg bg-white/70 shadow-sm">
            <TierIcon className={`h-5 w-5 ${currentTier.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${currentTier.color}`}>
              {currentTier.name}
            </p>
            {nextTier ? (
              <p className="text-xs text-muted-foreground">
                {points} / {nextTier.min} pts to {nextTier.name}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Max level reached!
              </p>
            )}
          </div>
        </div>
        {nextTier && (
          <div className="mb-4">
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}
        <div className="space-y-1 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            All Tiers
          </p>
          {BADGE_TIERS.slice(0, -1).map((tier) => {
            const achieved = points >= tier.min;
            const TIcon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors ${
                  achieved
                    ? `${tier.bg} ${tier.color}`
                    : "text-muted-foreground"
                }`}
              >
                <TIcon
                  className={`h-3 w-3 shrink-0 ${achieved ? tier.color : "text-muted-foreground/50"}`}
                />
                <span
                  className={`flex-1 font-medium ${achieved ? "" : "opacity-50"}`}
                >
                  {tier.name}
                </span>
                <span className={`text-[10px] ${achieved ? "" : "opacity-40"}`}>
                  {tier.min} pts
                </span>
                {achieved && (
                  <CheckCircle2 className={`h-3 w-3 ${tier.color}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
          <BookOpen className="h-3.5 w-3.5" />
          <span>
            {enrolledCount} course{enrolledCount !== 1 ? "s" : ""} enrolled
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LearnerCoursesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, userId, userName, userEmail } = useAuthContext();
  const [search, setSearch] = useState("");

  const published = useMemo(() => localDb.getPublishedCourses(), []);

  const filtered = useMemo(
    () =>
      published.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [published, search],
  );

  const enrolledIds = useMemo(() => {
    if (!userId) return new Set<string>();
    return new Set(localDb.getUserEnrollments(userId).map((e) => e.courseId));
  }, [userId]);

  const completedLessonsMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!userId) return map;
    for (const course of published) {
      const completed = localDb.getLessonProgress(userId, course.id);
      map.set(course.id, completed.length);
    }
    return map;
  }, [published, userId]);

  const points = userId ? localDb.getPoints(userId) : 0;

  function handleAction(courseId: string, variant: ButtonVariant) {
    if (variant === "buy") {
      if (!isAuthenticated) {
        navigate({
          to: "/login",
          search: { redirect: `/learner/courses/${courseId}/checkout` },
        });
      } else {
        navigate({ to: `/learner/courses/${courseId}/checkout` });
      }
      return;
    }
    if (!isAuthenticated && (variant === "join" || variant === "start")) {
      navigate({
        to: "/login",
        search: { redirect: `/learner/courses/${courseId}` },
      });
      return;
    }
    navigate({ to: `/learner/courses/${courseId}` });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                My Courses
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Continue your learning journey
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="relative mb-6"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="courses.search_input"
                className="pl-10 bg-card border-border/70 focus-visible:ring-primary/30"
                placeholder="Search courses by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </motion.div>
            {filtered.length === 0 ? (
              <motion.div
                data-ocid="courses.empty_state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground text-sm">
                  {search
                    ? "No results found for your search."
                    : "No courses available right now."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
                  },
                }}
              >
                {filtered.map((course, idx) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    idx={idx}
                    isLoggedIn={isAuthenticated}
                    enrolledIds={enrolledIds}
                    completedLessonsMap={completedLessonsMap}
                    onAction={handleAction}
                  />
                ))}
              </motion.div>
            )}
          </div>
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-full lg:w-72 shrink-0"
          >
            <ProfilePanel
              name={userName ?? ""}
              email={userEmail ?? ""}
              points={points}
              enrolledCount={enrolledIds.size}
            />
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
