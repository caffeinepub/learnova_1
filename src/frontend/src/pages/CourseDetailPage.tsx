import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Film,
  Image,
  Lock,
  Play,
  Search,
  Star,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import type {
  Badge as BadgeType,
  Course,
  Enrollment,
  LessonProgress,
  Review,
} from "../backend.d";
import { useAuthContext } from "../contexts/AuthContext";

interface LessonData {
  id: string;
  title: string;
  type: "Video" | "Document" | "Image" | "Quiz";
  url?: string;
  quizId?: string;
}

const SAMPLE_LESSONS: LessonData[] = [
  {
    id: "l1",
    title: "Introduction & Overview",
    type: "Video",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  { id: "l2", title: "Core Concepts", type: "Document" },
  { id: "l3", title: "Visual Reference Guide", type: "Image" },
  { id: "l4", title: "Knowledge Check", type: "Quiz", quizId: "q1" },
  {
    id: "l5",
    title: "Advanced Topics",
    type: "Video",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Video: <Film className="h-3.5 w-3.5" />,
  Document: <FileText className="h-3.5 w-3.5" />,
  Image: <Image className="h-3.5 w-3.5" />,
  Quiz: <BookOpen className="h-3.5 w-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  Video: "bg-blue-100 text-blue-700",
  Document: "bg-green-100 text-green-700",
  Image: "bg-purple-100 text-purple-700",
  Quiz: "bg-orange-100 text-orange-700",
};

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

function StarRating({
  value,
  onChange,
  readonly,
}: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              (hover || value) >= n
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function CourseDetailPage() {
  const { courseId } = useParams({ strict: false }) as { courseId: string };
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const { profile } = useAuthContext();
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  const [completing, setCompleting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionRewards, setCompletionRewards] = useState<{
    points: bigint;
    badges: BadgeType[];
  } | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [lessonSearch, setLessonSearch] = useState("");

  const courseIdBig = BigInt(courseId);

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => (actor ? actor.getCourses() : []),
    enabled,
  });

  const { data: lessonProgress } = useQuery<LessonProgress[]>({
    queryKey: ["lessonProgress", courseId],
    queryFn: async () => (actor ? actor.getMyLessonProgress(courseIdBig) : []),
    enabled,
  });

  const { data: completions } = useQuery<Enrollment[]>({
    queryKey: ["myCourseCompletions"],
    queryFn: async () => (actor ? actor.getMyCourseCompletions() : []),
    enabled,
  });

  const { data: reviews, refetch: refetchReviews } = useQuery<Review[]>({
    queryKey: ["courseReviews", courseId],
    queryFn: async () => (actor ? actor.getCourseReviews(courseIdBig) : []),
    enabled,
  });

  const course = (courses ?? []).find((c) => c.id.toString() === courseId);
  const isInstructorOrAdmin =
    profile?.role === UserRole.admin ||
    (profile?.role as string) === "instructor";

  if (course && course.isPublished === false && !isInstructorOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Course Not Available</h2>
        <p className="text-muted-foreground">
          This course is not currently published.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/learner/courses" })}
        >
          Back to My Courses
        </Button>
      </div>
    );
  }

  const lessons: LessonData[] = (() => {
    try {
      const raw = localStorage.getItem(`learnova_lessons_${courseId}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.length > 0 ? parsed : SAMPLE_LESSONS;
    } catch {
      return SAMPLE_LESSONS;
    }
  })();

  const isEnrolled = (completions ?? []).some(
    (e) => e.courseId.toString() === courseId,
  );
  const completedIds = new Set(
    (lessonProgress ?? []).filter((p) => p.isCompleted).map((p) => p.lessonId),
  );
  const progressPct =
    lessons.length > 0
      ? Math.round((completedIds.size / lessons.length) * 100)
      : 0;
  const allComplete =
    lessons.length > 0 && completedIds.size === lessons.length;

  const alreadyReviewed = (reviews ?? []).some(
    (r) => r.principal?.toString() === profile?.principal?.toString(),
  );

  const filteredLessons = lessons.filter((l) =>
    l.title.toLowerCase().includes(lessonSearch.toLowerCase()),
  );

  const handleEnroll = async () => {
    if (!actor) return;
    setEnrolling(true);
    try {
      await actor.enrollCourse({ courseId: courseIdBig });
      qc.invalidateQueries({ queryKey: ["myCourseCompletions"] });
      toast.success("Enrolled successfully!");
    } catch {
      toast.error("Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const handleComplete = async () => {
    if (!actor) return;
    setCompleting(true);
    try {
      await actor.completeCourse(courseIdBig);
      const [pts, bdgs] = await Promise.all([
        actor.getMyPoints(),
        actor.getMyBadges(),
      ]);
      setCompletionRewards({ points: pts, badges: bdgs });
      setShowCompletionModal(true);
      qc.invalidateQueries({ queryKey: ["myCourseCompletions"] });
      qc.invalidateQueries({ queryKey: ["myPoints"] });
      qc.invalidateQueries({ queryKey: ["myBadges"] });
    } catch {
      toast.error("Failed to complete course");
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!actor) return;
    setSubmittingReview(true);
    try {
      await actor.submitReview(
        courseIdBig,
        BigInt(reviewRating),
        reviewComment,
      );
      toast.success("Review submitted!");
      setReviewComment("");
      refetchReviews();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating =
    (reviews ?? []).length > 0
      ? (reviews ?? []).reduce((sum, r) => sum + Number(r.rating), 0) /
        (reviews ?? []).length
      : 0;

  // Gradient index based on courseId
  const gradientIdx =
    Number.parseInt(courseId.replace(/\D/g, "") || "0", 10) % GRADIENTS.length;
  const initial = course?.title.trim()[0]?.toUpperCase() ?? "C";

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">
          Loading course...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            type="button"
            data-ocid="course_detail.link"
            onClick={() => navigate({ to: "/learner/courses" })}
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </button>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {(course.tags ?? []).map((tag) => (
                <Badge
                  key={tag}
                  className="bg-white/20 text-white border-white/30"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {Number(course.duration)} hrs
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> {lessons.length} lessons
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs defaultValue="overview">
          <div className="overflow-x-auto mb-6">
            <TabsList data-ocid="course_detail.tab" className="w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
          </div>

          {/* ── Overview Tab ────────────────────────────────────────── */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Cover image block */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div
                  className={`h-48 rounded-2xl overflow-hidden bg-gradient-to-br ${GRADIENTS[gradientIdx]} flex items-center justify-center relative`}
                >
                  <span className="text-8xl font-black text-white/25 select-none">
                    {initial}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                <div className="mt-4">
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {course.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {generateDescription(course.title)}
                  </p>
                </div>
              </motion.div>

              {/* Progress section */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {progressPct}% Completed
                  </span>
                </div>
                <Progress value={progressPct} className="h-3" />

                {/* Stat pills */}
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground px-3 py-1.5 rounded-full border border-border">
                    <BookOpen className="h-3 w-3" />
                    Total: {lessons.length}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed: {completedIds.size}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full border border-rose-200">
                    <Clock className="h-3 w-3" />
                    Incomplete: {lessons.length - completedIds.size}
                  </span>
                </div>
              </motion.div>

              {/* Search bar */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-ocid="lessons.search_input"
                  className="pl-10"
                  placeholder="Search lessons..."
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                />
              </motion.div>

              {/* Lesson list */}
              <div className="space-y-2">
                {filteredLessons.length === 0 ? (
                  <div
                    data-ocid="lessons.empty_state"
                    className="text-center py-8 text-muted-foreground text-sm"
                  >
                    No lessons match your search.
                  </div>
                ) : (
                  filteredLessons.map((lesson, idx) => {
                    const isDone = completedIds.has(lesson.id);
                    const isInProgress = isEnrolled && !isDone;
                    return (
                      <motion.div
                        key={lesson.id}
                        data-ocid={`course_lessons.item.${idx + 1}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          !isEnrolled
                            ? "opacity-70 cursor-default"
                            : "hover:bg-accent cursor-pointer"
                        }`}
                        onClick={() => {
                          if (isEnrolled)
                            navigate({
                              to: `/learner/courses/${courseId}/lessons/${lesson.id}`,
                            });
                        }}
                      >
                        <span className="text-muted-foreground text-xs w-5 text-right shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {lesson.title}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPE_COLORS[lesson.type]}`}
                        >
                          {TYPE_ICONS[lesson.type]}
                          {lesson.type}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                        ) : isInProgress ? (
                          <Play className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Enroll / Complete Course button */}
              <div className="flex gap-2 pt-2">
                {!isEnrolled ? (
                  <Button
                    data-ocid="course_detail.primary_button"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full sm:w-auto"
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </Button>
                ) : allComplete ? (
                  <Button
                    data-ocid="course_detail.primary_button"
                    onClick={handleComplete}
                    disabled={completing}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    {completing ? "Completing..." : "Complete Course"}
                  </Button>
                ) : null}
              </div>
            </div>
          </TabsContent>

          {/* ── Reviews Tab ─────────────────────────────────────────── */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              {/* Aggregate */}
              <Card>
                <CardContent className="pt-5 flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {avgRating.toFixed(1)}
                    </div>
                    <StarRating value={Math.round(avgRating)} readonly />
                    <div className="text-sm text-muted-foreground mt-1">
                      {(reviews ?? []).length} reviews
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              {isEnrolled && !alreadyReviewed && (
                <Card>
                  <CardContent className="pt-5 space-y-3">
                    <h3 className="font-semibold">Leave a Review</h3>
                    <StarRating
                      value={reviewRating}
                      onChange={setReviewRating}
                    />
                    <Textarea
                      data-ocid="review.textarea"
                      placeholder="Share your experience..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                    />
                    <Button
                      data-ocid="review.submit_button"
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewComment.trim()}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* List */}
              {(reviews ?? []).length === 0 ? (
                <div
                  data-ocid="reviews.empty_state"
                  className="text-center py-10 text-muted-foreground"
                >
                  No reviews yet. Be the first to add one.
                </div>
              ) : (
                (reviews ?? []).map((review, idx) => (
                  <Card
                    key={review.principal?.toString() ?? idx}
                    data-ocid={`reviews.item.${idx + 1}`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {review.principal
                              ?.toString()
                              .slice(0, 2)
                              .toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating
                              value={Number(review.rating)}
                              readonly
                            />
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                Number(review.createdAt) / 1_000_000,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <Dialog
            open={showCompletionModal}
            onOpenChange={setShowCompletionModal}
          >
            <DialogContent
              data-ocid="completion.dialog"
              className="text-center"
            >
              <DialogHeader>
                <div className="text-6xl mb-2">🎉</div>
                <DialogTitle className="text-2xl">
                  Course Completed!
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="bg-primary/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-primary">
                    {Number(completionRewards?.points ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Points Earned
                  </div>
                </div>
                {(completionRewards?.badges ?? []).length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Badges Awarded</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {(completionRewards?.badges ?? []).map((b) => (
                        <Badge
                          key={b.name}
                          className="bg-amber-100 text-amber-800"
                        >
                          ⭐ {b.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button
                data-ocid="completion.close_button"
                onClick={() => setShowCompletionModal(false)}
                className="w-full"
              >
                Continue Learning
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
