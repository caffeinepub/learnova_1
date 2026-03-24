import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileQuestion, HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type Quiz, QuizBuilder } from "./QuizBuilder";
import type { RewardsConfig } from "./RewardsPanel";

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

const DEFAULT_REWARDS: RewardsConfig = {
  attempt1: 100,
  attempt2: 75,
  attempt3: 50,
  attempt4plus: 25,
};

const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: genId(),
    title: "React Fundamentals Quiz",
    rewards: { ...DEFAULT_REWARDS },
    questions: [
      {
        id: genId(),
        text: "What hook is used to manage local state in a functional component?",
        options: [
          { id: genId(), text: "useEffect", isCorrect: false },
          { id: genId(), text: "useState", isCorrect: true },
          { id: genId(), text: "useReducer", isCorrect: false },
          { id: genId(), text: "useContext", isCorrect: false },
        ],
      },
      {
        id: genId(),
        text: "Which method is used to update state derived from previous state?",
        options: [
          { id: genId(), text: "setState(value)", isCorrect: false },
          { id: genId(), text: "setState((prev) => ...)", isCorrect: true },
          { id: genId(), text: "forceUpdate()", isCorrect: false },
        ],
      },
    ],
  },
  {
    id: genId(),
    title: "JavaScript Concepts Check",
    rewards: { ...DEFAULT_REWARDS },
    questions: [
      {
        id: genId(),
        text: "What is the output of typeof null in JavaScript?",
        options: [
          { id: genId(), text: '"null"', isCorrect: false },
          { id: genId(), text: '"object"', isCorrect: true },
          { id: genId(), text: '"undefined"', isCorrect: false },
        ],
      },
    ],
  },
];

export function QuizTab() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(SAMPLE_QUIZZES);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function handleAddQuiz() {
    const newQuiz: Quiz = {
      id: genId(),
      title: "New Quiz",
      questions: [],
      rewards: { ...DEFAULT_REWARDS },
    };
    setQuizzes((prev) => [...prev, newQuiz]);
    setEditingQuiz(newQuiz);
  }

  function handleEdit(quiz: Quiz) {
    setEditingQuiz(quiz);
  }

  function handleSaveQuiz(updated: Quiz) {
    setQuizzes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setEditingQuiz(null);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      setQuizzes((prev) => prev.filter((q) => q.id !== deleteTarget));
      setDeleteTarget(null);
    }
  }

  if (editingQuiz) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={editingQuiz.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <QuizBuilder
            quiz={editingQuiz}
            onSave={handleSaveQuiz}
            onBack={() => setEditingQuiz(null)}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Quizzes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {quizzes.length} quiz{quizzes.length !== 1 ? "es" : ""} in this
            course
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={handleAddQuiz}
          data-ocid="quiz_tab.add_quiz_button"
        >
          <Plus className="w-4 h-4" /> Add Quiz
        </Button>
      </div>

      {/* Quiz list */}
      {quizzes.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 px-8 text-center rounded-xl border border-dashed border-border"
          data-ocid="quiz_tab.empty_state"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <FileQuestion className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No quizzes yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Add a quiz to test your learners' knowledge and reward them for
            correct answers.
          </p>
          <Button
            size="sm"
            className="mt-4 gap-1.5"
            onClick={handleAddQuiz}
            data-ocid="quiz_tab.empty_state_add_button"
          >
            <Plus className="w-4 h-4" /> Create First Quiz
          </Button>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="quiz_tab.list">
          {quizzes.map((quiz, idx) => (
            <motion.div
              key={quiz.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, delay: idx * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors group"
              data-ocid={`quiz_tab.item.${idx + 1}`}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {quiz.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {quiz.questions.length} question
                    {quiz.questions.length !== 1 ? "s" : ""}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Up to {quiz.rewards.attempt1} pts (1st attempt)
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEdit(quiz)}
                  data-ocid={`quiz_tab.edit_button.${idx + 1}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:text-destructive"
                  onClick={() => setDeleteTarget(quiz.id)}
                  data-ocid={`quiz_tab.delete_button.${idx + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirm dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="quiz_tab.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="quiz_tab.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="quiz_tab.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
