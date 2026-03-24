import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Columns,
  Search,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Course, LearnerCourseReport, UserProfile } from "../backend.d";
import { useAuthContext } from "../contexts/AuthContext";

type LearnerStatus = "yetToStart" | "inProgress" | "completed";
type FilterStatus = LearnerStatus | "all";

const STATUS_LABEL: Record<LearnerStatus, string> = {
  yetToStart: "Yet to Start",
  inProgress: "In Progress",
  completed: "Completed",
};

const STATUS_BADGE_CLASS: Record<LearnerStatus, string> = {
  yetToStart: "bg-slate-100 text-slate-600 border-slate-200",
  inProgress: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

interface StatCard {
  key: FilterStatus;
  label: string;
  icon: React.ReactNode;
  bgClass: string;
  iconBg: string;
  ringClass: string;
  textClass: string;
}

const STAT_CARDS: StatCard[] = [
  {
    key: "all",
    label: "Total Participants",
    icon: <Users className="h-5 w-5" />,
    bgClass: "bg-blue-50 hover:bg-blue-100",
    iconBg: "bg-blue-100 text-blue-600",
    ringClass: "ring-2 ring-blue-400 bg-blue-50",
    textClass: "text-blue-700",
  },
  {
    key: "yetToStart",
    label: "Yet to Start",
    icon: <BookOpen className="h-5 w-5" />,
    bgClass: "bg-slate-50 hover:bg-slate-100",
    iconBg: "bg-slate-100 text-slate-600",
    ringClass: "ring-2 ring-slate-400 bg-slate-50",
    textClass: "text-slate-700",
  },
  {
    key: "inProgress",
    label: "In Progress",
    icon: <Clock className="h-5 w-5" />,
    bgClass: "bg-amber-50 hover:bg-amber-100",
    iconBg: "bg-amber-100 text-amber-600",
    ringClass: "ring-2 ring-amber-400 bg-amber-50",
    textClass: "text-amber-700",
  },
  {
    key: "completed",
    label: "Completed",
    icon: <CheckCircle2 className="h-5 w-5" />,
    bgClass: "bg-emerald-50 hover:bg-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-600",
    ringClass: "ring-2 ring-emerald-400 bg-emerald-50",
    textClass: "text-emerald-700",
  },
];

type ColKey =
  | "srNo"
  | "courseName"
  | "participantName"
  | "enrolledDate"
  | "startDate"
  | "timeSpent"
  | "completionPct"
  | "completedDate"
  | "status";

const ALL_COLUMNS: { key: ColKey; label: string }[] = [
  { key: "srNo", label: "Sr. No." },
  { key: "courseName", label: "Course Name" },
  { key: "participantName", label: "Participant Name" },
  { key: "enrolledDate", label: "Enrolled Date" },
  { key: "startDate", label: "Start Date" },
  { key: "timeSpent", label: "Time Spent" },
  { key: "completionPct", label: "Completion %" },
  { key: "completedDate", label: "Completed Date" },
  { key: "status", label: "Status" },
];

type VisibleColumns = Record<ColKey, boolean>;

const defaultVisible: VisibleColumns = {
  srNo: true,
  courseName: true,
  participantName: true,
  enrolledDate: true,
  startDate: true,
  timeSpent: true,
  completionPct: true,
  completedDate: true,
  status: true,
};

interface ProgressRow {
  id: string;
  courseName: string;
  participantName: string;
  enrolledDate: string;
  startDate: string;
  timeSpent: string;
  completionPct: number;
  completedDate: string;
  status: LearnerStatus;
}

function nsToDateStr(ns: bigint): string {
  return new Date(Number(ns / 1_000_000n)).toISOString().split("T")[0];
}

function buildRowsFromReports(
  reports: LearnerCourseReport[],
  courses: Course[],
  users: UserProfile[],
): ProgressRow[] {
  const courseMap = new Map<string, Course>();
  for (const c of courses) courseMap.set(String(c.id), c);

  const userMap = new Map<string, UserProfile>();
  for (const u of users) userMap.set(u.principal.toString(), u);

  const rows: ProgressRow[] = [];
  for (const report of reports) {
    const course = courseMap.get(String(report.courseId));
    const user = userMap.get(report.learnerPrincipal.toString());
    if (!course || !user) continue;

    const lessonCount = Number(course.lessonCount);
    const completionPct =
      lessonCount > 0
        ? Math.round((Number(report.completedLessons) / lessonCount) * 100)
        : 0;

    let status: LearnerStatus;
    if (report.isCompleted) {
      status = "completed";
    } else if (completionPct === 0 && !report.startedAt) {
      status = "yetToStart";
    } else {
      status = "inProgress";
    }

    rows.push({
      id: `${report.learnerPrincipal.toString()}-${String(report.courseId)}`,
      courseName: course.title,
      participantName: user.name,
      enrolledDate: nsToDateStr(report.enrolledAt),
      startDate: report.startedAt ? nsToDateStr(report.startedAt) : "—",
      timeSpent: "—",
      completionPct,
      completedDate: report.completedAt ? nsToDateStr(report.completedAt) : "—",
      status,
    });
  }
  return rows;
}

export default function ReportingDashboardPage() {
  const navigate = useNavigate();
  const { role } = useAuthContext();
  const { actor, isFetching } = useActor();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [visibleColumns, setVisibleColumns] =
    useState<VisibleColumns>(defaultVisible);
  const [panelOpen, setPanelOpen] = useState(false);

  const enabled = !!actor && !isFetching;

  const { data: reportingData = [], isLoading: reportingLoading } = useQuery<
    LearnerCourseReport[]
  >({
    queryKey: ["reportingData"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getReportingData();
    },
    enabled,
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourses();
    },
    enabled,
  });

  const { data: users = [] } = useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled,
  });

  const allRows = useMemo(
    () => buildRowsFromReports(reportingData, courses, users),
    [reportingData, courses, users],
  );

  const counts = {
    all: allRows.length,
    yetToStart: allRows.filter((r) => r.status === "yetToStart").length,
    inProgress: allRows.filter((r) => r.status === "inProgress").length,
    completed: allRows.filter((r) => r.status === "completed").length,
  };

  const filtered = allRows.filter((row) => {
    const matchesFilter = activeFilter === "all" || row.status === activeFilter;
    const matchesCourse =
      selectedCourse === "all" ||
      courses.some(
        (c) => String(c.id) === selectedCourse && c.title === row.courseName,
      );
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      row.courseName.toLowerCase().includes(q) ||
      row.participantName.toLowerCase().includes(q);
    return matchesFilter && matchesCourse && matchesSearch;
  });

  const handleCardClick = (key: FilterStatus) => {
    setActiveFilter((prev) => (prev === key ? "all" : key));
  };

  const toggleCol = (key: ColKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const roleBadgeClass =
    role === "admin"
      ? "bg-violet-100 text-violet-700 border-violet-200"
      : "bg-blue-100 text-blue-700 border-blue-200";

  const visibleCols = ALL_COLUMNS.filter((c) => visibleColumns[c.key]);

  const isLoading = reportingLoading;

  return (
    <div className="min-h-screen bg-background" data-ocid="reporting.page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 self-start"
            onClick={() => navigate({ to: "/instructor" })}
            data-ocid="reporting.back.button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-violet-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Reporting Dashboard
                </h1>
              </div>
              <Badge className={roleBadgeClass}>
                {role === "admin" ? "Admin" : "Instructor"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1 ml-11">
              Track learner progress across your courses
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((card, i) => {
            const isActive = activeFilter === card.key;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive
                      ? card.ringClass
                      : `${card.bgClass} border-transparent`
                  }`}
                  onClick={() => handleCardClick(card.key)}
                  data-ocid={`reporting.${card.key === "all" ? "total" : card.key}.card`}
                >
                  <CardContent className="pt-5 pb-4 px-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${card.iconBg}`}>
                        {card.icon}
                      </div>
                      {isActive && (
                        <span className="text-xs font-medium text-muted-foreground">
                          Filtered
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-3xl font-bold mb-0.5 ${
                        isActive ? card.textClass : "text-foreground"
                      }`}
                    >
                      {isLoading ? "—" : counts[card.key]}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {card.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by course name or participant name…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="reporting.search_input"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger
              className="w-full sm:w-56"
              data-ocid="reporting.course.select"
            >
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem key={String(c.id)} value={String(c.id)}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2 shrink-0"
            onClick={() => setPanelOpen(true)}
            data-ocid="reporting.columns.button"
          >
            <Columns className="h-4 w-4" />
            Columns
          </Button>
        </div>

        {/* Active filter indicator */}
        {activeFilter !== "all" && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Showing:</span>
            <Badge variant="secondary" className="gap-1">
              {STATUS_LABEL[activeFilter as LearnerStatus]}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={() => setActiveFilter("all")}
              data-ocid="reporting.clear_filter.button"
            >
              Clear filter
            </Button>
          </div>
        )}

        {/* Table */}
        <Card data-ocid="reporting.table" className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    {visibleCols.map((col) => (
                      <TableHead
                        key={col.key}
                        className={`whitespace-nowrap ${
                          col.key === "srNo" ? "w-16 pl-5" : ""
                        } ${
                          col.key === "completionPct" ? "min-w-[140px]" : ""
                        }`}
                      >
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={visibleCols.length}
                        className="text-center py-12 text-muted-foreground"
                        data-ocid="reporting.loading_state"
                      >
                        Loading learner progress…
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={visibleCols.length}
                        className="text-center py-12"
                        data-ocid="reporting.empty_state"
                      >
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-8 w-8 opacity-30" />
                          <span className="text-sm">
                            {allRows.length === 0
                              ? "No learner progress data yet."
                              : "No learners match the current filter."}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row, i) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-muted/20 transition-colors"
                        data-ocid={`reporting.learner.item.${i + 1}`}
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="pl-5 text-sm text-muted-foreground font-medium">
                            {i + 1}
                          </TableCell>
                        )}
                        {visibleColumns.courseName && (
                          <TableCell className="text-sm font-medium max-w-[180px] truncate">
                            {row.courseName}
                          </TableCell>
                        )}
                        {visibleColumns.participantName && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {row.participantName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm whitespace-nowrap">
                                {row.participantName}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.enrolledDate && (
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {row.enrolledDate}
                          </TableCell>
                        )}
                        {visibleColumns.startDate && (
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {row.startDate}
                          </TableCell>
                        )}
                        {visibleColumns.timeSpent && (
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {row.timeSpent}
                          </TableCell>
                        )}
                        {visibleColumns.completionPct && (
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <Progress
                                value={row.completionPct}
                                className="h-1.5 flex-1"
                              />
                              <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">
                                {row.completionPct}%
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.completedDate && (
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {row.completedDate}
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Badge
                              className={`text-xs whitespace-nowrap ${
                                STATUS_BADGE_CLASS[row.status]
                              }`}
                            >
                              {STATUS_LABEL[row.status]}
                            </Badge>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Row count */}
        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-right">
            Showing {filtered.length} of {allRows.length} records
          </p>
        )}

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>

      {/* Column Visibility Side Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/10 z-40"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              key="panel"
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-[260px] bg-background border-l border-border shadow-xl z-50 flex flex-col"
              data-ocid="reporting.columns.panel"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Columns className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm text-foreground">
                    Show / Hide Columns
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPanelOpen(false)}
                  data-ocid="reporting.columns.close_button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {ALL_COLUMNS.map((col) => (
                  <div key={col.key} className="flex items-center gap-3">
                    <Checkbox
                      id={`col-${col.key}`}
                      checked={visibleColumns[col.key]}
                      onCheckedChange={() => toggleCol(col.key)}
                      data-ocid={`reporting.col.${col.key}.checkbox`}
                    />
                    <Label
                      htmlFor={`col-${col.key}`}
                      className="text-sm cursor-pointer select-none"
                    >
                      {col.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setVisibleColumns(defaultVisible)}
                  data-ocid="reporting.columns.reset_button"
                >
                  Reset to Default
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
