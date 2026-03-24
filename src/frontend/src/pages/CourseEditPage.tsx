import { QuizTab } from "@/components/QuizTab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/contexts/AuthContext";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bold,
  BookOpen,
  Camera,
  ClipboardList,
  Eye,
  FileText,
  GripVertical,
  HelpCircle,
  ImageIcon,
  Italic,
  List,
  Mail,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Underline,
  UserPlus,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Attachment {
  id: string;
  kind: "file" | "url";
  value: string;
  label: string;
}

interface Lesson {
  id: string;
  title: string;
  type: "Video" | "Document" | "Image";
  videoUrl?: string;
  documentFile?: string;
  imageUrl?: string;
  description: string;
  attachments: Attachment[];
}

interface CourseFormState {
  title: string;
  tags: string;
  website: string;
  responsiblePerson: string;
  published: boolean;
  imageUrl: string | null;
}

const SEED_LESSONS: Lesson[] = [
  {
    id: "1",
    title: "Introduction to React Hooks",
    type: "Video",
    videoUrl: "https://youtube.com/watch?v=example1",
    description:
      "A comprehensive overview of React Hooks and how they replace class lifecycle methods.",
    attachments: [],
  },
  {
    id: "2",
    title: "Setting Up Your Development Environment",
    type: "Document",
    documentFile: "setup-guide.pdf",
    description:
      "Step-by-step guide to configuring VS Code, Node.js, and npm for React development.",
    attachments: [
      {
        id: "a1",
        kind: "url",
        value: "https://nodejs.org",
        label: "Node.js Download",
      },
    ],
  },
  {
    id: "3",
    title: "Component Architecture Diagram",
    type: "Image",
    imageUrl: "https://example.com/diagram.png",
    description:
      "Visual reference for understanding component hierarchy and data flow in large apps.",
    attachments: [],
  },
];

function emptyLesson(): Lesson {
  return {
    id: crypto.randomUUID(),
    title: "",
    type: "Video",
    description: "",
    attachments: [],
  };
}

interface LessonEditorDialogProps {
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onSave: (lesson: Lesson) => void;
}

function LessonEditorDialog({
  open,
  onClose,
  lesson,
  onSave,
}: LessonEditorDialogProps) {
  const isEdit = !!lesson;
  const [form, setForm] = useState<Lesson>(() =>
    lesson ? { ...lesson } : emptyLesson(),
  );
  const [activeTab, setActiveTab] = useState("content");
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);
  const [listActive, setListActive] = useState(false);
  const [newAtt, setNewAtt] = useState<{
    label: string;
    kind: "file" | "url";
    value: string;
  } | null>(null);

  function handleOpenChange(v: boolean) {
    if (v) {
      setForm(lesson ? { ...lesson } : emptyLesson());
      setActiveTab("content");
      setBoldActive(false);
      setItalicActive(false);
      setUnderlineActive(false);
      setListActive(false);
      setNewAtt(null);
    } else {
      onClose();
    }
  }

  function handleSave() {
    if (!form.title.trim()) {
      toast.error("Lesson title is required.");
      setActiveTab("content");
      return;
    }
    onSave(form);
  }

  function commitAtt() {
    if (!newAtt) return;
    if (!newAtt.label.trim() && !newAtt.value.trim()) {
      setNewAtt(null);
      return;
    }
    setForm((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        { id: crypto.randomUUID(), ...newAtt },
      ],
    }));
    setNewAtt(null);
  }

  const typeOptions: Array<{
    value: Lesson["type"];
    label: string;
    icon: React.ReactNode;
    sel: string;
  }> = [
    {
      value: "Video",
      label: "Video",
      icon: <Video className="w-4 h-4" />,
      sel: "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
    {
      value: "Document",
      label: "Document",
      icon: <FileText className="w-4 h-4" />,
      sel: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      value: "Image",
      label: "Image",
      icon: <ImageIcon className="w-4 h-4" />,
      sel: "border-green-400 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl w-full p-0 overflow-hidden"
        data-ocid="lesson_editor.dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Lesson" : "Add Lesson"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col"
        >
          <TabsList className="mx-6 mt-4 h-9 bg-muted/60 border border-border w-auto self-start">
            <TabsTrigger
              value="content"
              className="text-xs px-4"
              data-ocid="lesson_editor.content.tab"
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="text-xs px-4"
              data-ocid="lesson_editor.description.tab"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              className="text-xs px-4"
              data-ocid="lesson_editor.attachments.tab"
            >
              Attachments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="px-6 py-4 space-y-5 mt-0">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lesson-title"
                placeholder="Enter lesson title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-9"
                data-ocid="lesson_editor.title.input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Type</Label>
              <div className="flex gap-2 flex-wrap">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, type: opt.value }))
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      form.type === opt.value
                        ? opt.sel
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                    data-ocid={`lesson_editor.type_${opt.value.toLowerCase()}.toggle`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {form.type === "Video" && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1.5"
                >
                  <Label htmlFor="video-url" className="text-sm font-medium">
                    Video URL
                  </Label>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={form.videoUrl ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, videoUrl: e.target.value }))
                    }
                    className="h-9"
                    data-ocid="lesson_editor.video_url.input"
                  />
                </motion.div>
              )}
              {form.type === "Document" && (
                <motion.div
                  key="document"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1.5"
                >
                  <Label htmlFor="doc-file" className="text-sm font-medium">
                    Upload Document
                  </Label>
                  <Input
                    id="doc-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    className="h-9 cursor-pointer"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        setForm((prev) => ({ ...prev, documentFile: f.name }));
                    }}
                    data-ocid="lesson_editor.document.upload_button"
                  />
                  {form.documentFile && (
                    <p className="text-xs text-muted-foreground">
                      {form.documentFile}
                    </p>
                  )}
                </motion.div>
              )}
              {form.type === "Image" && (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="image-url" className="text-sm font-medium">
                      Image URL
                    </Label>
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://example.com/image.png"
                      value={form.imageUrl ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                      className="h-9"
                      data-ocid="lesson_editor.image_url.input"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">
                      OR
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="image-file" className="text-sm font-medium">
                      Upload Image
                    </Label>
                    <Input
                      id="image-file"
                      type="file"
                      accept="image/*"
                      className="h-9 cursor-pointer"
                      data-ocid="lesson_editor.image.upload_button"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="description" className="px-6 py-4 space-y-3 mt-0">
            <Label className="text-sm font-medium">Description</Label>
            <div className="flex items-center gap-1 p-1.5 border border-border rounded-lg bg-muted/40">
              {(
                [
                  {
                    key: "bold",
                    icon: <Bold className="w-3.5 h-3.5" />,
                    active: boldActive,
                    toggle: () => setBoldActive((v) => !v),
                    ocid: "lesson_editor.bold.toggle",
                  },
                  {
                    key: "italic",
                    icon: <Italic className="w-3.5 h-3.5" />,
                    active: italicActive,
                    toggle: () => setItalicActive((v) => !v),
                    ocid: "lesson_editor.italic.toggle",
                  },
                  {
                    key: "underline",
                    icon: <Underline className="w-3.5 h-3.5" />,
                    active: underlineActive,
                    toggle: () => setUnderlineActive((v) => !v),
                    ocid: "lesson_editor.underline.toggle",
                  },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={btn.toggle}
                  className={`p-1.5 rounded w-8 h-8 flex items-center justify-center transition-colors hover:bg-background ${
                    btn.active
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground"
                  }`}
                  data-ocid={btn.ocid}
                >
                  {btn.icon}
                </button>
              ))}
              <div className="w-px h-5 bg-border mx-1" />
              <button
                type="button"
                onClick={() => setListActive((v) => !v)}
                className={`p-1.5 rounded w-8 h-8 flex items-center justify-center transition-colors hover:bg-background ${
                  listActive
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground"
                }`}
                data-ocid="lesson_editor.list.toggle"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
            <Textarea
              placeholder="Write a clear description of what learners will gain from this lesson…"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="min-h-[180px] resize-y text-sm"
              data-ocid="lesson_editor.description.textarea"
            />
          </TabsContent>

          <TabsContent value="attachments" className="px-6 py-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Attachments</Label>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5"
                onClick={() => setNewAtt({ label: "", kind: "url", value: "" })}
                data-ocid="lesson_editor.add_attachment.button"
              >
                <Plus className="w-3.5 h-3.5" /> Add Attachment
              </Button>
            </div>

            {form.attachments.length === 0 && !newAtt && (
              <div
                className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-lg text-center"
                data-ocid="lesson_editor.attachments.empty_state"
              >
                <Paperclip className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No attachments yet
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add files or URLs to supplement this lesson
                </p>
              </div>
            )}

            <div className="space-y-2">
              {form.attachments.map((att, idx) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30"
                  data-ocid={`lesson_editor.attachments.item.${idx + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {att.label || "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {att.value}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {att.kind === "url" ? "URL" : "File"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        attachments: prev.attachments.filter(
                          (a) => a.id !== att.id,
                        ),
                      }))
                    }
                    className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                    data-ocid={`lesson_editor.attachments.delete_button.${idx + 1}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {newAtt && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Label"
                      value={newAtt.label}
                      onChange={(e) =>
                        setNewAtt((prev) =>
                          prev ? { ...prev, label: e.target.value } : null,
                        )
                      }
                      className="h-8 text-xs flex-1"
                      data-ocid="lesson_editor.attachment_label.input"
                    />
                    <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
                      {(["url", "file"] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() =>
                            setNewAtt((prev) =>
                              prev ? { ...prev, kind: k, value: "" } : null,
                            )
                          }
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            newAtt.kind === k
                              ? "bg-primary text-primary-foreground"
                              : "bg-background text-muted-foreground hover:bg-muted"
                          }`}
                          data-ocid={`lesson_editor.attachment_kind_${k}.toggle`}
                        >
                          {k.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  {newAtt.kind === "url" ? (
                    <Input
                      type="url"
                      placeholder="https://example.com/resource"
                      value={newAtt.value}
                      onChange={(e) =>
                        setNewAtt((prev) =>
                          prev ? { ...prev, value: e.target.value } : null,
                        )
                      }
                      className="h-8 text-xs"
                      data-ocid="lesson_editor.attachment_url.input"
                    />
                  ) : (
                    <Input
                      type="file"
                      className="h-8 text-xs cursor-pointer"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f)
                          setNewAtt((prev) =>
                            prev ? { ...prev, value: f.name } : null,
                          );
                      }}
                      data-ocid="lesson_editor.attachment_file.upload_button"
                    />
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={commitAtt}
                      data-ocid="lesson_editor.attachment_save.button"
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setNewAtt(null)}
                      data-ocid="lesson_editor.attachment_cancel.button"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 pb-6 pt-2 border-t border-border mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="lesson_editor.cancel_button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            data-ocid="lesson_editor.save_button"
          >
            {isEdit ? "Save Changes" : "Add Lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CourseEditPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { courseId?: string };
  const courseId = params.courseId ?? "new";
  const { actor } = useActor();
  const [saving, setSaving] = useState(false);

  const { data: allCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => (actor ? actor.getCourses() : []),
    enabled: !!actor,
  });

  const [form, setForm] = useState<CourseFormState>({
    title: "Introduction to React & Modern Hooks",
    tags: "React, JavaScript, Frontend",
    website: "",
    responsiblePerson: "",
    published: false,
    imageUrl: null,
  });

  const [courseOptions, setCourseOptions] = useState({
    visibility: "everyone" as "everyone" | "signed_in",
    accessRule: "open" as "open" | "invitation" | "payment",
    price: "",
    courseAdmin: "",
  });

  const [lessons, setLessons] = useState<Lesson[]>(SEED_LESSONS);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!allCourses) return;
    const c = allCourses.find((x) => x.id.toString() === courseId);
    if (!c) return;
    setForm((prev) => ({
      ...prev,
      title: c.title,
      tags: (c.tags ?? []).join(", "),
      published: c.isPublished,
    }));
  }, [allCourses, courseId]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
  }

  function handleRemoveImage() {
    if (form.imageUrl) URL.revokeObjectURL(form.imageUrl);
    setForm((prev) => ({ ...prev, imageUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSaveLesson(lesson: Lesson) {
    const isNew = !editingLesson;
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === lesson.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = lesson;
        return next;
      }
      return [...prev, lesson];
    });
    setEditorOpen(false);
    toast.success(isNew ? "Lesson added!" : "Lesson updated!", {
      description: `"${lesson.title}" has been saved.`,
    });
  }

  const typeBadge: Record<Lesson["type"], string> = {
    Video:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    Document:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    Image:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300",
  };
  const typeIconBg: Record<Lesson["type"], string> = {
    Video: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    Document:
      "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    Image: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
  };
  const typeIcon: Record<Lesson["type"], React.ReactNode> = {
    Video: <Video className="w-3.5 h-3.5" />,
    Document: <FileText className="w-3.5 h-3.5" />,
    Image: <ImageIcon className="w-3.5 h-3.5" />,
  };

  return (
    <div className="min-h-screen bg-background" data-ocid="course_edit.page">
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => navigate({ to: "/instructor/courses" })}
            data-ocid="course_edit.link"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate text-foreground">
              {form.title || "Untitled Course"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Course ID: {courseId}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="flex items-center gap-2"
              data-ocid="course_edit.toggle"
            >
              <Switch
                checked={form.published}
                onCheckedChange={async (v) => {
                  setForm((p) => ({ ...p, published: v }));
                  if (actor && courseId !== "new") {
                    try {
                      await actor.updateCourse(BigInt(courseId), {
                        title: form.title,
                        tags: form.tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                        lessonCount: BigInt(lessons.length),
                        duration: BigInt(0),
                        isPublished: v,
                      });
                      toast.success(
                        v ? "Course published!" : "Course set to draft.",
                      );
                    } catch {
                      toast.error("Failed to update publish status.");
                    }
                  } else {
                    toast.success(
                      v ? "Course published!" : "Course set to draft.",
                    );
                  }
                }}
                className={
                  form.published ? "data-[state=checked]:bg-emerald-500" : ""
                }
              />
              <span
                className={`text-xs font-medium hidden sm:inline ${form.published ? "text-emerald-600" : "text-muted-foreground"}`}
              >
                {form.published ? "Published" : "Draft"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs hidden sm:flex gap-1.5"
              data-ocid="course_edit.secondary_button"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs hidden md:flex gap-1.5"
              data-ocid="course_edit.attendees.secondary_button"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Attendees
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs hidden md:flex gap-1.5"
              data-ocid="course_edit.contact.secondary_button"
            >
              <Mail className="w-3.5 h-3.5" /> Contact Attendees
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              disabled={saving}
              onClick={async () => {
                if (!actor || courseId === "new") {
                  toast.success("Changes saved!", {
                    description: `"${form.title}" has been updated.`,
                  });
                  return;
                }
                setSaving(true);
                try {
                  await actor.updateCourse(BigInt(courseId), {
                    title: form.title,
                    tags: form.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                    lessonCount: BigInt(lessons.length),
                    duration: BigInt(0),
                    isPublished: form.published,
                  });
                  toast.success("Changes saved!", {
                    description: `"${form.title}" has been updated.`,
                  });
                } catch {
                  toast.error("Failed to save changes.");
                } finally {
                  setSaving(false);
                }
              }}
              data-ocid="course_edit.save_button"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
            <div data-ocid="course_edit.upload_button">
              <Label className="text-sm font-medium mb-2 block">
                Course Image
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                data-ocid="course_edit.dropzone"
              />
              {form.imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border aspect-video">
                  <img
                    src={form.imageUrl}
                    alt="Course cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-3.5 h-3.5" /> Change
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs gap-1.5"
                      onClick={handleRemoveImage}
                      data-ocid="course_edit.delete_button"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full aspect-video border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Upload course image
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </div>
                </button>
              )}
            </div>

            <Card className="border shadow-card">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="course-title" className="text-sm font-medium">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="course-title"
                    placeholder="Enter course title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="h-9"
                    data-ocid="course_edit.title.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="course-tags" className="text-sm font-medium">
                    Tags
                  </Label>
                  <Input
                    id="course-tags"
                    placeholder="React, JavaScript, Frontend"
                    value={form.tags}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tags: e.target.value }))
                    }
                    className="h-9"
                    data-ocid="course_edit.tags.input"
                  />
                  {form.tags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {form.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="course-website"
                    className="text-sm font-medium"
                  >
                    Website
                  </Label>
                  <Input
                    id="course-website"
                    placeholder="https://example.com"
                    type="url"
                    value={form.website}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, website: e.target.value }))
                    }
                    className="h-9"
                    data-ocid="course_edit.website.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="course-responsible"
                    className="text-sm font-medium"
                  >
                    Responsible Person
                  </Label>
                  <Input
                    id="course-responsible"
                    placeholder="Name or email"
                    value={form.responsiblePerson}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        responsiblePerson: e.target.value,
                      }))
                    }
                    className="h-9"
                    data-ocid="course_edit.responsible.input"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="content" data-ocid="course_edit.panel">
            <TabsList className="h-10 bg-muted/60 border border-border">
              <TabsTrigger
                value="content"
                className="gap-1.5 text-xs sm:text-sm"
                data-ocid="course_edit.content.tab"
              >
                <BookOpen className="w-3.5 h-3.5" /> Content
              </TabsTrigger>
              <TabsTrigger
                value="description"
                className="gap-1.5 text-xs sm:text-sm"
                data-ocid="course_edit.description.tab"
              >
                <FileText className="w-3.5 h-3.5" /> Description
              </TabsTrigger>
              <TabsTrigger
                value="options"
                className="gap-1.5 text-xs sm:text-sm"
                data-ocid="course_edit.options.tab"
              >
                <Settings className="w-3.5 h-3.5" /> Options
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="gap-1.5 text-xs sm:text-sm"
                data-ocid="course_edit.quiz.tab"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Quiz
              </TabsTrigger>
            </TabsList>

            {/* Content tab */}
            <TabsContent value="content" className="mt-4">
              <Card className="border shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-foreground">
                      Course Content
                    </h3>
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => {
                        setEditingLesson(null);
                        setEditorOpen(true);
                      }}
                      data-ocid="lessons.open_modal_button"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Content
                    </Button>
                  </div>

                  {lessons.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-14 text-center border-2 border-dashed border-border rounded-xl"
                      data-ocid="lessons.empty_state"
                    >
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        No lessons yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                        Click "Add Content" to create your first lesson — video,
                        document, or image.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {lessons.map((lesson, idx) => (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors group"
                            data-ocid={`lessons.item.${idx + 1}`}
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 cursor-grab transition-colors" />
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeIconBg[lesson.type]}`}
                            >
                              {typeIcon[lesson.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {lesson.title}
                              </p>
                              {lesson.description && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs shrink-0 border font-medium gap-1.5 ${typeBadge[lesson.type]}`}
                            >
                              {typeIcon[lesson.type]}
                              {lesson.type}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  data-ocid={`lessons.dropdown_menu.${idx + 1}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingLesson(lesson);
                                    setEditorOpen(true);
                                  }}
                                  className="gap-2 cursor-pointer"
                                  data-ocid={`lessons.edit_button.${idx + 1}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setLessons((prev) =>
                                      prev.filter((l) => l.id !== lesson.id),
                                    );
                                    toast.error("Lesson deleted.");
                                  }}
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                  data-ocid={`lessons.delete_button.${idx + 1}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Options tab */}
            <TabsContent
              value="options"
              className="mt-4"
              data-ocid="course_edit.options_content.panel"
            >
              <Card className="border shadow-card">
                <CardContent className="p-6 space-y-0">
                  {/* Visibility */}
                  <div className="py-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="sm:w-56 shrink-0">
                        <p className="text-sm font-medium text-foreground">
                          Visibility
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Who can see this course
                        </p>
                      </div>
                      <div className="flex rounded-lg border border-border overflow-hidden self-start">
                        {(
                          [
                            {
                              value: "everyone",
                              label: "Everyone",
                              ocid: "course_options.visibility_everyone.toggle",
                            },
                            {
                              value: "signed_in",
                              label: "Signed In",
                              ocid: "course_options.visibility_signed_in.toggle",
                            },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setCourseOptions((prev) => ({
                                ...prev,
                                visibility: opt.value,
                              }))
                            }
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                              courseOptions.visibility === opt.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-background text-muted-foreground border-l border-border hover:bg-muted first:border-l-0"
                            }`}
                            data-ocid={opt.ocid}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Access Rule */}
                  <div className="py-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="sm:w-56 shrink-0">
                        <p className="text-sm font-medium text-foreground">
                          Access Rule
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          How learners can enroll
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex rounded-lg border border-border overflow-hidden self-start">
                          {(
                            [
                              {
                                value: "open",
                                label: "Open",
                                ocid: "course_options.access_open.toggle",
                              },
                              {
                                value: "invitation",
                                label: "On Invitation",
                                ocid: "course_options.access_invitation.toggle",
                              },
                              {
                                value: "payment",
                                label: "On Payment",
                                ocid: "course_options.access_payment.toggle",
                              },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setCourseOptions((prev) => ({
                                  ...prev,
                                  accessRule: opt.value,
                                }))
                              }
                              className={`px-4 py-2 text-sm font-medium transition-colors border-l border-border first:border-l-0 ${
                                courseOptions.accessRule === opt.value
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background text-muted-foreground hover:bg-muted"
                              }`}
                              data-ocid={opt.ocid}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        <AnimatePresence>
                          {courseOptions.accessRule === "payment" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1.5 pt-1">
                                <Label
                                  htmlFor="course-price"
                                  className="text-sm font-medium"
                                >
                                  Price (USD)
                                </Label>
                                <Input
                                  id="course-price"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={courseOptions.price}
                                  onChange={(e) =>
                                    setCourseOptions((prev) => ({
                                      ...prev,
                                      price: e.target.value,
                                    }))
                                  }
                                  className="h-9 w-40"
                                  data-ocid="course_options.price.input"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Course Admin */}
                  <div className="py-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="sm:w-56 shrink-0">
                        <p className="text-sm font-medium text-foreground">
                          Course Admin
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Assign a course administrator
                        </p>
                      </div>
                      <Input
                        placeholder="Name or email"
                        value={courseOptions.courseAdmin}
                        onChange={(e) =>
                          setCourseOptions((prev) => ({
                            ...prev,
                            courseAdmin: e.target.value,
                          }))
                        }
                        className="h-9 max-w-xs"
                        data-ocid="course_options.course_admin.input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Description placeholder */}
            <TabsContent value="description" className="mt-4">
              <Card className="border shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <ClipboardList className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    Description
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Write a compelling course description for prospective
                    learners.
                  </p>
                  <Badge variant="outline" className="mt-4 text-xs">
                    Coming soon
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quiz tab */}
            <TabsContent value="quiz" className="mt-4">
              <Card className="border shadow-card">
                <CardContent className="py-6 px-6">
                  <QuizTab />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <footer className="border-t border-border mt-16 py-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <LessonEditorDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        lesson={editingLesson}
        onSave={handleSaveLesson}
      />
    </div>
  );
}
