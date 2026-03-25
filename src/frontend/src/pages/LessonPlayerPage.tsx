import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  ImageIcon,
  PanelLeft,
  Paperclip,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import QuizPlayerComponent from "../components/QuizPlayerComponent";
import { useAuthContext } from "../contexts/AuthContext";
import * as localDb from "../lib/localDb";

// ── Badge system ──
const BADGE_TIERS = [
  { name: "Starter", emoji: "🌟", min: 0, max: 19 },
  { name: "Newbie", emoji: "🌱", min: 20, max: 39 },
  { name: "Explorer", emoji: "🔍", min: 40, max: 59 },
  { name: "Achiever", emoji: "🎅", min: 60, max: 79 },
  { name: "Specialist", emoji: "⭐", min: 80, max: 99 },
  { name: "Expert", emoji: "🚀", min: 100, max: 119 },
  { name: "Master", emoji: "🏆", min: 120, max: Number.POSITIVE_INFINITY },
];

function getBadgeTier(pts: number) {
  return [...BADGE_TIERS].reverse().find((t) => pts >= t.min) ?? BADGE_TIERS[0];
}

function getNextBadgeTier(pts: number) {
  return BADGE_TIERS.find((t) => t.min > pts) ?? null;
}

function getBadgeProgress(pts: number) {
  const current = getBadgeTier(pts);
  const next = getNextBadgeTier(pts);
  if (!next) return 100;
  const range = next.min - current.min;
  const progress = pts - current.min;
  return Math.min(100, Math.round((progress / range) * 100));
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}`;
  return null;
}

function getGoogleDocsPreviewUrl(url: string): string {
  if (url.includes("docs.google.com")) {
    const base = url
      .replace(/\/(edit|view|preview)(\?.*)?$/, "")
      .replace(/\/?(\?.*)?$/, "");
    return `${base}/preview`;
  }
  return url;
}

function VideoPlayer({ url }: { url: string }) {
  const embedUrl = getYouTubeEmbedUrl(url) ?? getVimeoEmbedUrl(url);
  if (embedUrl) {
    return (
      <div className="w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          title="Video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }
  return (
    <div className="w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
      <video src={url} controls className="w-full h-full object-contain">
        <track kind="captions" />
      </video>
    </div>
  );
}

function DocumentViewer({ url }: { url?: string }) {
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-zinc-900 border border-zinc-800 rounded-xl gap-3">
        <FileText className="h-10 w-10 text-zinc-600" />
        <p className="text-sm text-zinc-500">No document provided</p>
      </div>
    );
  }
  const previewUrl = getGoogleDocsPreviewUrl(url);
  return (
    <div className="space-y-3">
      <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <iframe
          src={previewUrl}
          className="w-full"
          style={{ height: "65vh" }}
          title="Document viewer"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
      <div className="flex justify-end">
        <Button
          data-ocid="lesson_player.secondary_button"
          variant="outline"
          size="sm"
          onClick={() => window.open(url, "_blank")}
          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in new tab
        </Button>
      </div>
    </div>
  );
}

function ImageViewer({ url, title }: { url?: string; title: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-zinc-900 border border-zinc-800 rounded-xl gap-3">
        <ImageIcon className="h-10 w-10 text-zinc-600" />
        <p className="text-sm text-zinc-500">No image provided</p>
      </div>
    );
  }
  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-center">
        <button
          type="button"
          className="border-0 bg-transparent p-0 cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open image fullscreen"
        >
          <img
            src={url}
            alt={title}
            className="max-h-[60vh] object-contain rounded-lg transition-opacity hover:opacity-90"
          />
        </button>
      </div>
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
            data-ocid="lesson_player.modal"
          >
            <button
              type="button"
              data-ocid="lesson_player.close_button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 text-white hover:bg-zinc-700 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              transition={{ duration: 0.2 }}
              src={url}
              alt={title}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface BadgePopupProps {
  earnedPoints: number;
  totalPoints: number;
  onClose: () => void;
  onContinue: () => void;
}

function BadgePopup({
  earnedPoints,
  totalPoints,
  onClose,
  onContinue,
}: BadgePopupProps) {
  const currentTier = getBadgeTier(totalPoints);
  const nextTier = getNextBadgeTier(totalPoints);
  const progress = getBadgeProgress(totalPoints);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      data-ocid="quiz.modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 24 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />
        <button
          type="button"
          data-ocid="quiz.close_button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 py-8 flex flex-col items-center text-center gap-5">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="text-5xl"
          >
            🎉
          </motion.div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">
              You have earned{" "}
              <span className="text-blue-400">+{earnedPoints} points</span>
            </h2>
            <p className="text-sm text-zinc-400">
              Total:{" "}
              <span className="text-white font-semibold">
                {totalPoints} pts
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl px-5 py-3">
            <span className="text-3xl">{currentTier.emoji}</span>
            <div className="text-left">
              <p className="font-bold text-white text-sm">{currentTier.name}</p>
              {nextTier ? (
                <p className="text-xs text-zinc-400">
                  {totalPoints}/{nextTier.min} pts to {nextTier.name}
                </p>
              ) : (
                <p className="text-xs text-zinc-400">Max tier reached!</p>
              )}
            </div>
          </div>

          {nextTier && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>{currentTier.name}</span>
                <span>{nextTier.name}</span>
              </div>
              <Progress value={progress} className="h-2 bg-zinc-700" />
            </div>
          )}

          <Button
            data-ocid="quiz.confirm_button"
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-2.5"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams({ strict: false }) as {
    courseId: string;
    lessonId: string;
  };
  const navigate = useNavigate();
  const { userId } = useAuthContext();

  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" && window.innerWidth >= 768,
  );
  const [marking, setMarking] = useState(false);
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [, forceUpdate] = useState(0);

  const course = localDb.getCourseById(courseId);
  const lessons = course?.lessons ?? [];

  const completedIds = new Set(
    userId ? localDb.getLessonProgress(userId, courseId) : [],
  );

  const currentIdx = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[currentIdx !== -1 ? currentIdx : 0];
  const effectiveIdx = currentIdx !== -1 ? currentIdx : 0;
  const prevLesson = effectiveIdx > 0 ? lessons[effectiveIdx - 1] : null;
  const nextLesson =
    effectiveIdx < lessons.length - 1 ? lessons[effectiveIdx + 1] : null;
  const isComplete = completedIds.has(lessonId);
  const completedCount = completedIds.size;
  const totalLessons = lessons.length;
  const progressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleMarkComplete = () => {
    if (!userId || isComplete) return;
    setMarking(true);
    try {
      localDb.markLessonComplete(userId, courseId, lessonId);
      forceUpdate((n) => n + 1);
      toast.success("Lesson marked as complete!");
    } catch {
      toast.error("Failed to mark lesson as complete");
    } finally {
      setMarking(false);
    }
  };

  const handleQuizComplete = (pts: number) => {
    if (userId) {
      localDb.markLessonComplete(userId, courseId, lessonId);
      const newTotal = localDb.addPoints(userId, pts);
      setEarnedPoints(pts);
      setTotalPoints(newTotal);
      forceUpdate((n) => n + 1);
    } else {
      setEarnedPoints(pts);
      setTotalPoints(pts);
    }
    setShowBadgePopup(true);
  };

  const handlePopupContinue = () => {
    setShowBadgePopup(false);
    if (nextLesson) {
      navigate({ to: `/learner/courses/${courseId}/lessons/${nextLesson.id}` });
    }
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        Lesson not found
      </div>
    );
  }

  // Map LcLesson to expected shape
  const lessonUrl = lesson.videoUrl ?? lesson.documentUrl ?? lesson.imageUrl;
  const lessonDescription = lesson.description;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      <AnimatePresence>
        {showBadgePopup && (
          <BadgePopup
            earnedPoints={earnedPoints}
            totalPoints={totalPoints}
            onClose={() => setShowBadgePopup(false)}
            onContinue={handlePopupContinue}
          />
        )}
      </AnimatePresence>

      {/* Header strip */}
      <header className="flex items-center gap-3 px-3 h-12 border-b border-zinc-800 bg-zinc-900 flex-shrink-0">
        <button
          type="button"
          data-ocid="lesson_player.toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          data-ocid="lesson_player.link"
          onClick={() => navigate({ to: "/learner/courses" })}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Courses
        </button>

        <div className="flex-1" />
        <span className="text-xs text-zinc-400 font-medium">
          Lesson {effectiveIdx + 1} of {lessons.length}
        </span>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close sidebar"
          />
        )}

        {/* Left Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-hidden absolute inset-y-0 left-0 z-30 md:relative md:z-auto"
              data-ocid="lesson_player.panel"
            >
              <div
                className="flex flex-col h-full overflow-hidden"
                style={{ width: 280 }}
              >
                <div className="px-4 pt-4 pb-3 border-b border-zinc-800 flex-shrink-0">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                    Course
                  </p>
                  <h2 className="text-sm font-bold text-white truncate leading-snug">
                    {course?.title ?? "Course Lessons"}
                  </h2>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-400">Progress</span>
                      <span className="text-xs font-semibold text-blue-400">
                        {progressPct}%
                      </span>
                    </div>
                    <Progress
                      value={progressPct}
                      className="h-1.5 bg-zinc-700"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                  {lessons.map((l, idx) => {
                    const isLessonComplete = completedIds.has(l.id);
                    const isCurrent = l.id === (lessonId ?? lessons[0]?.id);
                    return (
                      <div key={l.id}>
                        <button
                          type="button"
                          data-ocid={`lesson_player.item.${idx + 1}`}
                          onClick={() =>
                            navigate({
                              to: `/learner/courses/${courseId}/lessons/${l.id}`,
                            })
                          }
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                            isCurrent
                              ? "bg-zinc-800 text-white"
                              : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                          }`}
                        >
                          {isLessonComplete ? (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          ) : (
                            <Circle className="h-4 w-4 flex-shrink-0 text-zinc-600" />
                          )}
                          <span className="text-sm font-medium truncate flex-1">
                            {idx + 1}. {l.title}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
              <motion.div
                key={lessonId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                      {lesson.type}
                    </span>
                    {isComplete && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-blue-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                    {lesson.title}
                  </h1>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                    {lessonDescription ?? "No description provided."}
                  </p>
                </div>

                <div className="border-t border-zinc-800 mb-6" />

                <div className="space-y-4">
                  {lesson.type === "Video" && lessonUrl && (
                    <VideoPlayer url={lessonUrl} />
                  )}
                  {lesson.type === "Video" && !lessonUrl && (
                    <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
                      <p className="text-zinc-500">No video URL provided</p>
                    </div>
                  )}
                  {lesson.type === "Document" && (
                    <DocumentViewer url={lessonUrl} />
                  )}
                  {lesson.type === "Image" && (
                    <ImageViewer url={lessonUrl} title={lesson.title} />
                  )}
                  {lesson.type === "Quiz" && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <QuizPlayerComponent
                        courseId={courseId}
                        quizId={lesson.quizId ?? "q1"}
                        onComplete={(pts) => handleQuizComplete(pts)}
                      />
                    </div>
                  )}
                </div>

                <div className="h-24" />
              </motion.div>
            </div>
          </div>

          {/* Bottom navigation bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-6 py-3 border-t border-zinc-800 bg-zinc-900 gap-1 sm:gap-2">
            <Button
              data-ocid="lesson_player.secondary_button"
              variant="outline"
              disabled={!prevLesson}
              onClick={() =>
                prevLesson &&
                navigate({
                  to: `/learner/courses/${courseId}/lessons/${prevLesson.id}`,
                })
              }
              className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 text-xs sm:text-sm px-2 sm:px-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Previous
            </Button>

            <Button
              data-ocid="lesson_player.primary_button"
              onClick={handleMarkComplete}
              disabled={isComplete || marking || lesson.type === "Quiz"}
              variant="outline"
              className={`border-zinc-700 ${
                isComplete
                  ? "bg-blue-600/20 border-blue-600/40 text-blue-400 hover:bg-blue-600/20"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-800"
              } disabled:opacity-50`}
            >
              {isComplete ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-blue-400" />
                  Completed
                </>
              ) : marking ? (
                "Marking..."
              ) : lesson.type === "Quiz" ? (
                "Complete Quiz to Mark"
              ) : (
                "Mark as Complete"
              )}
            </Button>

            <Button
              data-ocid="lesson_player.link"
              disabled={!nextLesson}
              onClick={() =>
                nextLesson &&
                navigate({
                  to: `/learner/courses/${courseId}/lessons/${nextLesson.id}`,
                })
              }
              className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:bg-blue-600 text-xs sm:text-sm px-2 sm:px-4"
            >
              Next Content
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
