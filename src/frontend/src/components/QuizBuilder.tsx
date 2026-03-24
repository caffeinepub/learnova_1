import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckSquare,
  HelpCircle,
  Plus,
  Trash2,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type RewardsConfig, RewardsPanel } from "./RewardsPanel";

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: AnswerOption[];
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  rewards: RewardsConfig;
}

interface QuizBuilderProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onBack: () => void;
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

export function QuizBuilder({ quiz, onSave, onBack }: QuizBuilderProps) {
  const [title, setTitle] = useState(quiz.title);
  const [questions, setQuestions] = useState<Question[]>(quiz.questions);
  const [selectedId, setSelectedId] = useState<string | null>(
    quiz.questions[0]?.id ?? null,
  );
  const [rewards, setRewards] = useState<RewardsConfig>(quiz.rewards);
  const [rewardsOpen, setRewardsOpen] = useState(false);

  const selectedQuestion = questions.find((q) => q.id === selectedId) ?? null;

  function addQuestion() {
    const q: Question = {
      id: genId(),
      text: "",
      options: [
        { id: genId(), text: "", isCorrect: false },
        { id: genId(), text: "", isCorrect: false },
      ],
    };
    setQuestions((prev) => [...prev, q]);
    setSelectedId(q.id);
  }

  function deleteQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setSelectedId((prev) => {
      if (prev !== id) return prev;
      const remaining = questions.filter((q) => q.id !== id);
      return remaining[0]?.id ?? null;
    });
  }

  function updateQuestionText(id: string, text: string) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  }

  function addOption(questionId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                { id: genId(), text: "", isCorrect: false },
              ],
            }
          : q,
      ),
    );
  }

  function updateOption(questionId: string, optionId: string, text: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, text } : o,
              ),
            }
          : q,
      ),
    );
  }

  function toggleCorrect(questionId: string, optionId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o,
              ),
            }
          : q,
      ),
    );
  }

  function deleteOption(questionId: string, optionId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q,
      ),
    );
  }

  function handleSave() {
    onSave({ ...quiz, title, questions, rewards });
  }

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Builder header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          data-ocid="quiz_builder.back_button"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 max-w-sm font-semibold text-base h-9"
          placeholder="Quiz title…"
          data-ocid="quiz_builder.title.input"
        />
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setRewardsOpen(true)}
            data-ocid="quiz_builder.rewards_button"
          >
            <Trophy className="w-4 h-4 text-yellow-500" /> Rewards
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            data-ocid="quiz_builder.save_button"
          >
            Save Quiz
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden rounded-xl border border-border">
        {/* Left sidebar: question list */}
        <div className="w-[260px] shrink-0 flex flex-col bg-muted/30 border-r border-border">
          <div className="px-3 py-3 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Questions
              {questions.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">
                  {questions.length}
                </Badge>
              )}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <HelpCircle className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No questions yet
                </p>
              </div>
            ) : (
              <div className="py-1">
                {questions.map((q, idx) => (
                  <motion.button
                    key={q.id}
                    layout
                    onClick={() => setSelectedId(q.id)}
                    className={`w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors group ${
                      selectedId === q.id
                        ? "bg-primary/10 border-l-2 border-primary"
                        : "border-l-2 border-transparent hover:bg-muted/60"
                    }`}
                    data-ocid={`quiz_builder.question.item.${idx + 1}`}
                  >
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                        selectedId === q.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-xs text-foreground leading-snug line-clamp-2">
                      {q.text || (
                        <span className="text-muted-foreground italic">
                          Untitled question
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(q.id);
                      }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive"
                      data-ocid={`quiz_builder.question.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={addQuestion}
              data-ocid="quiz_builder.add_question_button"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </Button>
          </div>
        </div>

        {/* Right panel: question editor */}
        <div className="flex-1 overflow-y-auto bg-background">
          <AnimatePresence mode="wait">
            {selectedQuestion ? (
              <motion.div
                key={selectedQuestion.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="p-6 space-y-6"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Question Text</Label>
                  <Textarea
                    rows={3}
                    value={selectedQuestion.text}
                    onChange={(e) =>
                      updateQuestionText(selectedQuestion.id, e.target.value)
                    }
                    placeholder="Enter your question here…"
                    className="resize-none text-sm"
                    data-ocid="quiz_builder.question.textarea"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Answer Options
                    </Label>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" /> Check all correct
                      answers
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedQuestion.options.map((opt, oIdx) => (
                      <motion.div
                        key={opt.id}
                        layout
                        className="flex items-center gap-3 group"
                        data-ocid={`quiz_builder.option.item.${oIdx + 1}`}
                      >
                        <Checkbox
                          id={`opt-${opt.id}`}
                          checked={opt.isCorrect}
                          onCheckedChange={() =>
                            toggleCorrect(selectedQuestion.id, opt.id)
                          }
                          className="shrink-0"
                          data-ocid={`quiz_builder.option.checkbox.${oIdx + 1}`}
                        />
                        <Input
                          value={opt.text}
                          onChange={(e) =>
                            updateOption(
                              selectedQuestion.id,
                              opt.id,
                              e.target.value,
                            )
                          }
                          placeholder={`Option ${oIdx + 1}`}
                          className={`flex-1 text-sm h-9 transition-all ${
                            opt.isCorrect
                              ? "border-green-400 bg-green-50/40 dark:bg-green-950/20"
                              : ""
                          }`}
                          data-ocid={`quiz_builder.option.input.${oIdx + 1}`}
                        />
                        {selectedQuestion.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              deleteOption(selectedQuestion.id, opt.id)
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-destructive"
                            data-ocid={`quiz_builder.option.delete_button.${oIdx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {selectedQuestion.options.length < 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => addOption(selectedQuestion.id)}
                      data-ocid="quiz_builder.add_option_button"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Option
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-8"
              >
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <HelpCircle className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  No question selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Add a question from the left panel or select an existing one.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <RewardsPanel
        open={rewardsOpen}
        onOpenChange={setRewardsOpen}
        rewards={rewards}
        onSave={setRewards}
      />
    </div>
  );
}
