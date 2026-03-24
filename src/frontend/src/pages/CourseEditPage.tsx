import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  ClipboardList,
  Eye,
  FileText,
  HelpCircle,
  ImageIcon,
  Mail,
  Settings,
  UserPlus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface CourseFormState {
  title: string;
  tags: string;
  website: string;
  responsiblePerson: string;
  published: boolean;
  imageUrl: string | null;
}

export default function CourseEditPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { courseId?: string };
  const courseId = params.courseId ?? "new";

  const [form, setForm] = useState<CourseFormState>({
    title: "Introduction to React & Modern Hooks",
    tags: "React, JavaScript, Frontend",
    website: "",
    responsiblePerson: "",
    published: false,
    imageUrl: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageUrl: url }));
  }

  function handleRemoveImage() {
    if (form.imageUrl) URL.revokeObjectURL(form.imageUrl);
    setForm((prev) => ({ ...prev, imageUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handlePublishToggle(checked: boolean) {
    setForm((prev) => ({ ...prev, published: checked }));
    toast.success(checked ? "Course published!" : "Course set to draft.");
  }

  function handleSave() {
    toast.success("Changes saved!", {
      description: `"${form.title}" has been updated.`,
    });
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="course_edit.page">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          {/* Back + title */}
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

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Publish toggle */}
            <div
              className="flex items-center gap-2"
              data-ocid="course_edit.toggle"
            >
              <Switch
                checked={form.published}
                onCheckedChange={handlePublishToggle}
                className={
                  form.published ? "data-[state=checked]:bg-emerald-500" : ""
                }
              />
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  form.published ? "text-emerald-600" : "text-muted-foreground"
                }`}
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
              onClick={handleSave}
              data-ocid="course_edit.save_button"
            >
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Page body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Upper section: image upload + form fields */}
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
            {/* Image upload */}
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

            {/* Form fields */}
            <Card className="border shadow-card">
              <CardContent className="p-6 space-y-5">
                {/* Title */}
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

                {/* Tags */}
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

                {/* Website */}
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

                {/* Responsible person */}
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

          {/* Tabs section */}
          <Tabs defaultValue="content" data-ocid="course_edit.panel">
            <TabsList className="h-10 bg-muted/60 border border-border">
              <TabsTrigger
                value="content"
                className="gap-1.5 text-xs sm:text-sm"
                data-ocid="course_edit.content.tab"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="description"
                className="gap-1.5 text-xs sm:text-sm"
                data-ocid="course_edit.description.tab"
              >
                <FileText className="w-3.5 h-3.5" />
                Description
              </TabsTrigger>
              <TabsTrigger
                value="options"
                className="gap-1.5 text-xs sm:text-sm"
                data-ocid="course_edit.options.tab"
              >
                <Settings className="w-3.5 h-3.5" />
                Options
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="gap-1.5 text-xs sm:text-sm"
                data-ocid="course_edit.quiz.tab"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Quiz
              </TabsTrigger>
            </TabsList>

            {[
              {
                value: "content",
                icon: BookOpen,
                label: "Course Content",
                desc: "Add lessons, videos, documents and other learning materials.",
              },
              {
                value: "description",
                icon: ClipboardList,
                label: "Description",
                desc: "Write a compelling course description for prospective learners.",
              },
              {
                value: "options",
                icon: Settings,
                label: "Course Options",
                desc: "Configure visibility, access rules, and enrollment settings.",
              },
              {
                value: "quiz",
                icon: HelpCircle,
                label: "Quiz Builder",
                desc: "Create quizzes and configure attempt-based reward settings.",
              },
            ].map(({ value, icon: Icon, label, desc }) => (
              <TabsContent key={value} value={value} className="mt-4">
                <Card className="border shadow-card">
                  <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {label}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      {desc}
                    </p>
                    <Badge variant="outline" className="mt-4 text-xs">
                      Coming soon
                    </Badge>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
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
    </div>
  );
}
