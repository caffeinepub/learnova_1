import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

interface QuizData {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

interface QuizRewards {
  attempt1: number;
  attempt2: number;
  attempt3: number;
  attempt4: number;
}

const SAMPLE_QUIZ: QuizData = {
  id: "q1",
  title: "Knowledge Check",
  questions: [
    {
      id: "qq1",
      text: "What is the main benefit of this course?",
      options: [
        { id: "o1", text: "Enhanced skills and knowledge", isCorrect: true },
        { id: "o2", text: "Free snacks", isCorrect: false },
        { id: "o3", text: "Guaranteed promotion", isCorrect: false },
        { id: "o4", text: "None of the above", isCorrect: false },
      ],
    },
    {
      id: "qq2",
      text: "How often should you practice the learned concepts?",
      options: [
        { id: "o1", text: "Never", isCorrect: false },
        { id: "o2", text: "Once a month", isCorrect: false },
        { id: "o3", text: "Regularly and consistently", isCorrect: true },
        { id: "o4", text: "Only during exams", isCorrect: false },
      ],
    },
    {
      id: "qq3",
      text: "What is the best way to retain new information?",
      options: [
        { id: "o1", text: "Passive reading only", isCorrect: false },
        { id: "o2", text: "Active recall and practice", isCorrect: true },
        { id: "o3", text: "Watching videos once", isCorrect: false },
        { id: "o4", text: "Skipping notes", isCorrect: false },
      ],
    },
  ],
};

type QuizPhase = "intro" | "questions";

interface Props {
  courseId: string;
  quizId: string;
  onComplete?: (points: number) => void;
}

export default function QuizPlayerComponent({
  courseId,
  quizId,
  onComplete,
}: Props) {
  const { actor, isFetching } = useActor();
  const enabled = !!actor && !isFetching;

  const { data: pastAttempts } = useQuery({
    queryKey: ["quizAttempts", courseId, quizId],
    queryFn: async () =>
      actor ? actor.getMyQuizAttempts(BigInt(courseId), quizId) : [],
    enabled,
  });

  const quizData: QuizData = (() => {
    try {
      const raw = localStorage.getItem(`learnova_quizzes_${courseId}`);
      if (raw) {
        const quizzes: QuizData[] = JSON.parse(raw);
        const found = quizzes.find((q) => q.id === quizId);
        if (found && found.questions?.length > 0) return found;
      }
    } catch {}
    return SAMPLE_QUIZ;
  })();

  const rewards: QuizRewards = (() => {
    try {
      const raw = localStorage.getItem(
        `learnova_quiz_rewards_${courseId}_${quizId}`,
      );
      if (raw) return JSON.parse(raw);
    } catch {}
    return { attempt1: 100, attempt2: 70, attempt3: 40, attempt4: 20 };
  })();

  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [questionResults, setQuestionResults] = useState<boolean[]>([]);

  const question = quizData.questions[currentQ];
  const totalAttempts = (pastAttempts ?? []).length + 1;
  const isLastQuestion = currentQ + 1 >= quizData.questions.length;

  const getPointsForAttempt = (attemptNum: number) => {
    if (attemptNum === 1) return rewards.attempt1;
    if (attemptNum === 2) return rewards.attempt2;
    if (attemptNum === 3) return rewards.attempt3;
    return rewards.attempt4;
  };

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct =
      question.options.find((o) => o.id === selected)?.isCorrect ?? false;
    if (correct) {
      const pts = getPointsForAttempt(totalAttempts + attempts);
      setTotalPoints((p) => p + pts);
    }
  };

  const handleNext = async () => {
    if (!submitted) return;
    const correct =
      question.options.find((o) => o.id === selected)?.isCorrect ?? false;
    const newResults = [...questionResults, correct];
    setQuestionResults(newResults);

    if (isLastQuestion) {
      // Submit to backend
      if (actor) {
        try {
          const score = BigInt(newResults.filter(Boolean).length);
          await actor.submitQuizAttempt(
            BigInt(courseId),
            quizId,
            score,
            BigInt(totalPoints),
          );
        } catch {}
      }
      onComplete?.(totalPoints);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setSubmitted(false);
      setAttempts(0);
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
  };

  // ── Intro Screen ──
  if (phase === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center text-center gap-6 py-6"
        data-ocid="quiz.panel"
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Quiz
          </p>
          <h2 className="text-2xl font-bold text-white">{quizData.title}</h2>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-blue-400">
              {quizData.questions.length}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {quizData.questions.length === 1 ? "Question" : "Questions"}
            </span>
          </div>
          <div className="w-px h-10 bg-zinc-700" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-emerald-400">∞</span>
            <span className="text-xs text-zinc-400 font-medium">Attempts</span>
          </div>
        </div>

        {/* Multiple attempts notice */}
        <div className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/25 rounded-xl px-4 py-3 text-left max-w-sm">
          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300 leading-snug">
            <span className="font-semibold text-blue-200">
              Multiple attempts allowed.
            </span>{" "}
            You can retake this quiz as many times as you like. Points decrease
            with each attempt.
          </p>
        </div>

        <Button
          data-ocid="quiz.primary_button"
          onClick={() => setPhase("questions")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-semibold text-base"
        >
          Start Quiz
        </Button>
      </motion.div>
    );
  }

  // ── Questions Phase ──
  const isCorrect =
    submitted && question.options.find((o) => o.id === selected)?.isCorrect;
  const maxAttempts = 3;

  return (
    <div className="relative">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Question {currentQ + 1} of {quizData.questions.length}
        </span>
        <div className="flex gap-1">
          {quizData.questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i < currentQ
                  ? questionResults[i]
                    ? "bg-green-500"
                    : "bg-red-400"
                  : i === currentQ
                    ? "bg-primary"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-5"
      >
        <h3 className="text-lg font-semibold mb-4">{question.text}</h3>
        <div className="space-y-2">
          {question.options.map((opt) => {
            let classes =
              "w-full text-left p-3 rounded-lg border transition-all text-sm font-medium ";
            if (submitted) {
              if (opt.isCorrect)
                classes += "border-green-500 bg-green-500/10 text-green-300";
              else if (opt.id === selected && !opt.isCorrect)
                classes += "border-red-400 bg-red-500/10 text-red-300";
              else classes += "border-border opacity-50";
            } else {
              classes +=
                selected === opt.id
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-border hover:border-primary/50 hover:bg-accent cursor-pointer";
            }
            return (
              <button
                type="button"
                key={opt.id}
                className={classes}
                onClick={() => !submitted && setSelected(opt.id)}
                disabled={submitted}
              >
                <span className="flex items-center gap-2">
                  {submitted && opt.isCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {submitted && opt.id === selected && !opt.isCorrect && (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {!submitted ? (
          <Button
            data-ocid="quiz.submit_button"
            onClick={handleSubmit}
            disabled={!selected}
          >
            Submit Answer
          </Button>
        ) : isCorrect ? (
          <Button data-ocid="quiz.primary_button" onClick={handleNext}>
            {isLastQuestion ? "Proceed and Complete Quiz" : "Proceed"}
          </Button>
        ) : attempts < maxAttempts ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {maxAttempts - attempts} attempts remaining
            </span>
            <Button
              data-ocid="quiz.secondary_button"
              variant="outline"
              onClick={handleRetry}
            >
              Try Again
            </Button>
            <Button data-ocid="quiz.primary_button" onClick={handleNext}>
              {isLastQuestion ? "Proceed and Complete Quiz" : "Skip"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-400">Max attempts reached</span>
            <Button data-ocid="quiz.primary_button" onClick={handleNext}>
              {isLastQuestion ? "Proceed and Complete Quiz" : "Proceed"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
