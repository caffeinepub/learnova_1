import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActor } from "@/hooks/useActor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { LessonProgress } from "../backend.d";
import QuizPlayerComponent from "../components/QuizPlayerComponent";

interface LessonData {
  id: string;
  title: string;
  type: "Video" | "Document" | "Image" | "Quiz";
  url?: string;
  quizId?: string;
  description?: string;
}

const SAMPLE_LESSONS: LessonData[] = [
  {
    id: "l1",
    title: "Introduction & Overview",
    type: "Video",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "l2",
    title: "Core Concepts Guide",
    type: "Document",
    description:
      "A comprehensive guide covering all the core concepts and fundamental principles you need to master.",
  },
  {
    id: "l3",
    title: "Visual Reference",
    type: "Image",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  },
  { id: "l4", title: "Knowledge Check", type: "Quiz", quizId: "q1" },
  {
    id: "l5",
    title: "Advanced Topics",
    type: "Video",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

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

interface VideoPlayerProps {
  url: string;
}

function VideoPlayer({ url }: VideoPlayerProps) {
  const ytEmbed = getYouTubeEmbedUrl(url);
  const vimeoEmbed = getVimeoEmbedUrl(url);
  const embedUrl = ytEmbed ?? vimeoEmbed;

  if (embedUrl) {
    return (
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
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
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video src={url} controls className="w-full h-full object-contain">
        <track kind="captions" />
      </video>
    </div>
  );
}

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams({ strict: false }) as {
    courseId: string;
    lessonId: string;
  };
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const enabled = !!actor && !isFetching;

  const [marking, setMarking] = useState(false);

  const { data: lessonProgress } = useQuery<LessonProgress[]>({
    queryKey: ["lessonProgress", courseId],
    queryFn: async () =>
      actor ? actor.getMyLessonProgress(BigInt(courseId)) : [],
    enabled,
  });

  const lessons: LessonData[] = (() => {
    try {
      const raw = localStorage.getItem(`learnova_lessons_${courseId}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.length > 0 ? parsed : SAMPLE_LESSONS;
    } catch {
      return SAMPLE_LESSONS;
    }
  })();

  const currentIdx = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[currentIdx];
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;
  const completedIds = new Set(
    (lessonProgress ?? []).filter((p) => p.isCompleted).map((p) => p.lessonId),
  );
  const isComplete = completedIds.has(lessonId);
  const progress =
    lessons.length > 0
      ? Math.round(((currentIdx + 1) / lessons.length) * 100)
      : 0;

  const handleMarkComplete = async () => {
    if (!actor || isComplete) return;
    setMarking(true);
    try {
      await actor.markLessonComplete(BigInt(courseId), lessonId);
      qc.invalidateQueries({ queryKey: ["lessonProgress", courseId] });
      toast.success("Lesson marked as complete!");
    } catch {
      toast.error("Failed to mark lesson as complete");
    } finally {
      setMarking(false);
    }
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        Lesson not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
        <button
          type="button"
          data-ocid="lesson_player.link"
          onClick={() => navigate({ to: `/learner/courses/${courseId}` })}
          className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{lesson.title}</h1>
          <p className="text-xs text-zinc-400">
            Lesson {currentIdx + 1} of {lessons.length}
          </p>
        </div>
        <div className="w-32 hidden sm:block">
          <Progress value={progress} className="h-1.5 bg-zinc-700" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <motion.div
            key={lessonId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {lesson.type === "Video" && lesson.url && (
              <VideoPlayer url={lesson.url} />
            )}

            {lesson.type === "Video" && !lesson.url && (
              <div className="aspect-video bg-zinc-800 rounded-xl flex items-center justify-center">
                <p className="text-zinc-400">No video URL provided</p>
              </div>
            )}

            {lesson.type === "Document" && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 text-center space-y-4">
                <FileText className="h-16 w-16 mx-auto text-zinc-400" />
                <h3 className="text-xl font-semibold">{lesson.title}</h3>
                <p className="text-zinc-400">
                  {lesson.description ?? "Click below to open the document."}
                </p>
                {lesson.url && (
                  <Button
                    data-ocid="lesson_player.primary_button"
                    variant="outline"
                    onClick={() => window.open(lesson.url, "_blank")}
                    className="border-zinc-600 text-white hover:bg-zinc-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Document
                  </Button>
                )}
              </div>
            )}

            {lesson.type === "Image" && (
              <div className="flex items-center justify-center bg-zinc-900 rounded-xl p-4">
                {lesson.url ? (
                  <img
                    src={lesson.url}
                    alt={lesson.title}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                ) : (
                  <div className="aspect-video w-full bg-zinc-800 rounded-lg flex items-center justify-center">
                    <p className="text-zinc-400">No image provided</p>
                  </div>
                )}
              </div>
            )}

            {lesson.type === "Quiz" && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                <QuizPlayerComponent
                  courseId={courseId}
                  quizId={lesson.quizId ?? "q1"}
                  onComplete={handleMarkComplete}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900">
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
          className="border-zinc-600 text-white hover:bg-zinc-800 disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        <Button
          data-ocid="lesson_player.primary_button"
          onClick={handleMarkComplete}
          disabled={isComplete || marking || lesson.type === "Quiz"}
          className={isComplete ? "bg-green-700 hover:bg-green-700" : ""}
        >
          {isComplete ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Completed
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
          className="disabled:opacity-30"
        >
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
