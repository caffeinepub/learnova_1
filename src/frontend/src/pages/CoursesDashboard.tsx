import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Clock,
  Edit3,
  Eye,
  LayoutGrid,
  List,
  Plus,
  Share2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  tags: string[];
  views: number;
  lessons: number;
  duration: string;
  status: "Published" | "Draft";
}

const INITIAL_COURSES: Course[] = [
  {
    id: "1",
    title: "Introduction to React & Modern Hooks",
    tags: ["React", "JavaScript", "Frontend"],
    views: 1842,
    lessons: 14,
    duration: "4h 20min",
    status: "Published",
  },
  {
    id: "2",
    title: "Python for Data Science Fundamentals",
    tags: ["Python", "Data Science"],
    views: 3201,
    lessons: 20,
    duration: "6h 15min",
    status: "Published",
  },
  {
    id: "3",
    title: "UI/UX Design Principles & Figma",
    tags: ["Design", "Figma", "UX"],
    views: 987,
    lessons: 10,
    duration: "3h 00min",
    status: "Published",
  },
  {
    id: "4",
    title: "Digital Marketing Strategy 2026",
    tags: ["Marketing", "SEO"],
    views: 421,
    lessons: 8,
    duration: "2h 40min",
    status: "Draft",
  },
  {
    id: "5",
    title: "Advanced TypeScript Patterns",
    tags: ["TypeScript", "JavaScript"],
    views: 0,
    lessons: 12,
    duration: "3h 50min",
    status: "Draft",
  },
  {
    id: "6",
    title: "Node.js REST API Architecture",
    tags: ["Node.js", "Backend", "API"],
    views: 2134,
    lessons: 18,
    duration: "5h 30min",
    status: "Published",
  },
];

const TAG_COLORS: Record<string, string> = {
  React: "bg-sky-100 text-sky-700 border-sky-200",
  JavaScript: "bg-yellow-100 text-yellow-700 border-yellow-200",
  TypeScript: "bg-blue-100 text-blue-700 border-blue-200",
  Python: "bg-green-100 text-green-700 border-green-200",
  "Data Science": "bg-purple-100 text-purple-700 border-purple-200",
  Design: "bg-pink-100 text-pink-700 border-pink-200",
  Figma: "bg-orange-100 text-orange-700 border-orange-200",
  UX: "bg-rose-100 text-rose-700 border-rose-200",
  Marketing: "bg-teal-100 text-teal-700 border-teal-200",
  SEO: "bg-lime-100 text-lime-700 border-lime-200",
  Frontend: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Node.js": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Backend: "bg-slate-100 text-slate-700 border-slate-200",
  API: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

function tagClass(tag: string) {
  return TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border";
}

function StatusBadge({ status }: { status: Course["status"] }) {
  return status === "Published" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
      Draft
    </span>
  );
}

interface CourseCardProps {
  course: Course;
  index: number;
  onEdit: (course: Course) => void;
  onShare: (course: Course) => void;
}

function CourseCard({ course, index, onEdit, onShare }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Card className="group border shadow-card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
              {course.title}
            </CardTitle>
            <StatusBadge status={course.status} />
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {course.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-[10px] font-medium px-1.5 py-0 border ${tagClass(tag)}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {course.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {course.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 flex-1"
              onClick={() => onEdit(course)}
              data-ocid={`courses.edit_button.${index + 1}`}
            >
              <Edit3 className="w-3 h-3" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 flex-1"
              onClick={() => onShare(course)}
              data-ocid={`courses.share.${index + 1}.button`}
            >
              <Share2 className="w-3 h-3" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CoursesDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );
  const published = filtered.filter((c) => c.status === "Published");
  const drafts = filtered.filter((c) => c.status === "Draft");

  function handleCreate() {
    if (!newCourseName.trim()) return;
    const newCourse: Course = {
      id: Date.now().toString(),
      title: newCourseName.trim(),
      tags: [],
      views: 0,
      lessons: 0,
      duration: "0min",
      status: "Draft",
    };
    setCourses((prev) => [newCourse, ...prev]);
    setNewCourseName("");
    setCreateOpen(false);
    toast.success("Course created!", {
      description: `"${newCourse.title}" added as a draft.`,
    });
  }

  function handleEdit(course: Course) {
    navigate({ to: `/instructor/courses/${course.id}/edit` });
  }

  function handleShare(course: Course) {
    const link = `${window.location.origin}/courses/${course.id}`;
    navigator.clipboard.writeText(link).catch(() => {});
    toast.success("Link copied!", {
      description: link,
    });
  }

  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-ocid="courses.page"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {courses.length} courses total &middot; {published.length} published
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-52 h-9 text-sm pl-3"
              data-ocid="courses.search_input"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center border rounded-md overflow-hidden h-9">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 h-full flex items-center gap-1.5 text-xs font-medium transition-colors ${
                view === "kanban"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
              type="button"
              data-ocid="courses.kanban.tab"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 h-full flex items-center gap-1.5 text-xs font-medium transition-colors ${
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
              type="button"
              data-ocid="courses.list.tab"
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          <Button
            size="icon"
            className="h-9 w-9 rounded-md"
            onClick={() => setCreateOpen(true)}
            data-ocid="courses.open_modal_button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === "kanban" ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Draft column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h2 className="font-semibold text-sm text-foreground">Draft</h2>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {drafts.length}
                </span>
              </div>
              <div className="space-y-3">
                {drafts.length === 0 ? (
                  <div
                    className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-lg"
                    data-ocid="courses.drafts.empty_state"
                  >
                    No courses yet. Click + to create your first course.
                  </div>
                ) : (
                  drafts.map((course, i) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      index={i}
                      onEdit={handleEdit}
                      onShare={handleShare}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Published column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="font-semibold text-sm text-foreground">
                  Published
                </h2>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {published.length}
                </span>
              </div>
              <div className="space-y-3">
                {published.length === 0 ? (
                  <div
                    className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-lg"
                    data-ocid="courses.published.empty_state"
                  >
                    No courses yet. Click + to create your first course.
                  </div>
                ) : (
                  published.map((course, i) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      index={drafts.length + i}
                      onEdit={handleEdit}
                      onShare={handleShare}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border shadow-card overflow-hidden">
              <Table data-ocid="courses.table">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Tags</TableHead>
                    <TableHead className="font-semibold text-center">
                      <span className="flex items-center gap-1 justify-center">
                        <Eye className="w-3.5 h-3.5" /> Views
                      </span>
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      <span className="flex items-center gap-1 justify-center">
                        <BookOpen className="w-3.5 h-3.5" /> Lessons
                      </span>
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      <span className="flex items-center gap-1 justify-center">
                        <Clock className="w-3.5 h-3.5" /> Duration
                      </span>
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                        data-ocid="courses.list.empty_state"
                      >
                        No results found for your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((course, i) => (
                      <TableRow
                        key={course.id}
                        className="hover:bg-muted/30 transition-colors"
                        data-ocid={`courses.row.item.${i + 1}`}
                      >
                        <TableCell className="font-medium max-w-[220px]">
                          <span className="line-clamp-2 leading-snug">
                            {course.title}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {course.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className={`text-[10px] font-medium px-1.5 py-0 border ${tagClass(tag)}`}
                              >
                                {tag}
                              </Badge>
                            ))}
                            {course.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{course.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {course.views.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {course.lessons}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {course.duration}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={course.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => handleEdit(course)}
                              data-ocid={`courses.list.edit_button.${i + 1}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => handleShare(course)}
                              data-ocid={`courses.list.share.${i + 1}.button`}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md" data-ocid="courses.dialog">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="course-name">Course Name</Label>
            <Input
              id="course-name"
              placeholder="e.g. Introduction to Machine Learning"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
              data-ocid="courses.input"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              data-ocid="courses.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newCourseName.trim()}
              data-ocid="courses.submit_button"
            >
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
