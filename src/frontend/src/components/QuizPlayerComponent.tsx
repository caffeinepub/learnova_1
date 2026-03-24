import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
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

interface Props {
  courseId: string;
  quizId: string;
  onComplete?: () => void;
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

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [lastPoints, setLastPoints] = useState(0);
  const [questionResults, setQuestionResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const question = quizData.questions[currentQ];
  const totalAttempts = (pastAttempts ?? []).length + 1;

  const getPointsForAttempt = (attemptNum: number) => {
    if (attemptNum === 1) return rewards.attempt1;
    if (attemptNum === 2) return rewards.attempt2;
    if (attemptNum === 3) return rewards.attempt3;
    return rewards.attempt4;
  };

  const handleSubmit = () => {
    if (!selected) return;
    const correct =
      question.options.find((o) => o.id === selected)?.isCorrect ?? false;
    setSubmitted(true);
    setAttempts((a) => a + 1);

    if (correct) {
      const pts = getPointsForAttempt(totalAttempts + attempts);
      setLastPoints(pts);
      setTotalPoints((p) => p + pts);
      setShowPointsPopup(true);
      setTimeout(() => setShowPointsPopup(false), 2000);
    }
  };

  const handleNext = async () => {
    if (!submitted) return;
    const correct =
      question.options.find((o) => o.id === selected)?.isCorrect ?? false;
    const newResults = [...questionResults, correct];
    setQuestionResults(newResults);

    if (currentQ + 1 >= quizData.questions.length) {
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
      setFinished(true);
      onComplete?.();
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

  if (finished) {
    const score = questionResults.filter(Boolean).length;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-8"
      >
        <div className="text-5xl mb-2">
          {score === quizData.questions.length
            ? "🏆"
            : score >= quizData.questions.length / 2
              ? "👍"
              : "📚"}
        </div>
        <h3 className="text-2xl font-bold">Quiz Complete!</h3>
        <p className="text-muted-foreground">
          {score} / {quizData.questions.length} correct
        </p>
        <div className="bg-primary/10 rounded-xl inline-block px-6 py-3">
          <div className="text-3xl font-bold text-primary">+{totalPoints}</div>
          <div className="text-sm text-muted-foreground">points earned</div>
        </div>
      </motion.div>
    );
  }

  const isCorrect =
    submitted && question.options.find((o) => o.id === selected)?.isCorrect;
  const maxAttempts = 3;

  return (
    <div className="relative">
      {/* Points Popup */}
      <AnimatePresence>
        {showPointsPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white font-bold px-5 py-2 rounded-full text-lg shadow-xl">
              +{lastPoints} pts! 🎉
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                classes += "border-green-500 bg-green-50 text-green-800";
              else if (opt.id === selected && !opt.isCorrect)
                classes += "border-red-400 bg-red-50 text-red-700";
              else classes += "border-border opacity-50";
            } else {
              classes +=
                selected === opt.id
                  ? "border-primary bg-primary/10 text-primary"
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
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {submitted && opt.id === selected && !opt.isCorrect && (
                    <XCircle className="h-4 w-4 text-red-500" />
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
            {currentQ + 1 >= quizData.questions.length
              ? "Finish Quiz"
              : "Next Question"}
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
              Skip
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-500">Max attempts reached</span>
            <Button data-ocid="quiz.primary_button" onClick={handleNext}>
              {currentQ + 1 >= quizData.questions.length
                ? "Finish Quiz"
                : "Next Question"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
