// ─── Types ──────────────────────────────────────────────────────────────────

export interface LcUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "instructor" | "learner";
}

export interface LcLesson {
  id: string;
  title: string;
  type: "Video" | "Document" | "Image" | "Quiz";
  videoUrl?: string;
  documentUrl?: string;
  imageUrl?: string;
  quizId?: string;
  description?: string;
}

export interface LcQuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
}

export interface LcQuiz {
  id: string;
  questions: LcQuizQuestion[];
  maxAttempts: number;
}

export interface LcCourse {
  id: string;
  title: string;
  instructorId: string;
  tags: string[];
  description: string;
  isPublished: boolean;
  visibility: "everyone" | "signed_in";
  accessRule: "open" | "invitation" | "payment";
  price: number;
  coverImage?: string;
  duration: number;
  createdAt: number;
  lessons: LcLesson[];
  quizzes: LcQuiz[];
}

export interface LcEnrollment {
  userId: string;
  courseId: string;
  enrolledAt: number;
  completedAt?: number;
  isCompleted: boolean;
  completedLessons: string[];
}

export interface LcReview {
  id: string;
  courseId: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface LcPoints {
  userId: string;
  points: number;
}

export interface LcBadge {
  name: string;
  awardedAt: number;
}

export interface LcQuizAttempt {
  userId: string;
  courseId: string;
  quizId: string;
  score: number;
  pointsEarned: number;
  attemptNumber: number;
  completedAt: number;
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  users: "learnova_users",
  courses: "learnova_courses",
  enrollments: "learnova_enrollments",
  reviews: "learnova_reviews",
  points: "learnova_points",
  quizAttempts: "learnova_quiz_attempts",
  badges: (userId: string) => `learnova_badges_${userId}`,
} as const;

// ─── Generic helpers ─────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Users (read-only from auth storage) ─────────────────────────────────────

export function getUsers(): LcUser[] {
  return load<LcUser[]>(KEYS.users, []);
}

export function getUserById(id: string): LcUser | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByEmail(email: string): LcUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function updateUserRole(userId: string, role: LcUser["role"]): void {
  const users = getUsers().map((u) => (u.id === userId ? { ...u, role } : u));
  save(KEYS.users, users);
}

export function deleteUser(userId: string): void {
  if (userId === "default-admin-001") return;
  const users = getUsers().filter((u) => u.id !== userId);
  save(KEYS.users, users);
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export function getCourses(): LcCourse[] {
  return load<LcCourse[]>(KEYS.courses, []);
}

export function getCourseById(id: string): LcCourse | undefined {
  return getCourses().find((c) => c.id === id);
}

export function getPublishedCourses(): LcCourse[] {
  return getCourses().filter((c) => c.isPublished);
}

export function getInstructorCourses(instructorId: string): LcCourse[] {
  return getCourses().filter((c) => c.instructorId === instructorId);
}

export function createCourse(
  data: Omit<LcCourse, "id" | "createdAt" | "lessons" | "quizzes">,
): LcCourse {
  const course: LcCourse = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    lessons: [],
    quizzes: [],
  };
  const courses = getCourses();
  save(KEYS.courses, [...courses, course]);
  return course;
}

export function updateCourse(id: string, updates: Partial<LcCourse>): LcCourse {
  const courses = getCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error(`Course ${id} not found`);
  const updated = { ...courses[idx], ...updates, id };
  courses[idx] = updated;
  save(KEYS.courses, courses);
  return updated;
}

export function deleteCourse(id: string): void {
  save(
    KEYS.courses,
    getCourses().filter((c) => c.id !== id),
  );
}

// ─── Enrollments ─────────────────────────────────────────────────────────────

export function getEnrollments(): LcEnrollment[] {
  return load<LcEnrollment[]>(KEYS.enrollments, []);
}

export function getUserEnrollments(userId: string): LcEnrollment[] {
  return getEnrollments().filter((e) => e.userId === userId);
}

export function getEnrollment(
  userId: string,
  courseId: string,
): LcEnrollment | undefined {
  return getEnrollments().find(
    (e) => e.userId === userId && e.courseId === courseId,
  );
}

export function enrollUser(userId: string, courseId: string): LcEnrollment {
  const existing = getEnrollment(userId, courseId);
  if (existing) return existing;
  const enrollment: LcEnrollment = {
    userId,
    courseId,
    enrolledAt: Date.now(),
    isCompleted: false,
    completedLessons: [],
  };
  const enrollments = getEnrollments();
  save(KEYS.enrollments, [...enrollments, enrollment]);
  return enrollment;
}

export function completeCourse(userId: string, courseId: string): void {
  const enrollments = getEnrollments().map((e) =>
    e.userId === userId && e.courseId === courseId
      ? { ...e, isCompleted: true, completedAt: Date.now() }
      : e,
  );
  save(KEYS.enrollments, enrollments);
}

export function markLessonComplete(
  userId: string,
  courseId: string,
  lessonId: string,
): void {
  let found = false;
  const enrollments = getEnrollments().map((e) => {
    if (e.userId === userId && e.courseId === courseId) {
      found = true;
      const completedLessons = e.completedLessons.includes(lessonId)
        ? e.completedLessons
        : [...e.completedLessons, lessonId];
      return { ...e, completedLessons };
    }
    return e;
  });
  if (!found) {
    // auto-enroll
    enrollments.push({
      userId,
      courseId,
      enrolledAt: Date.now(),
      isCompleted: false,
      completedLessons: [lessonId],
    });
  }
  save(KEYS.enrollments, enrollments);
}

export function getLessonProgress(userId: string, courseId: string): string[] {
  const e = getEnrollment(userId, courseId);
  return e ? e.completedLessons : [];
}

export function getEnrollmentsByCourse(courseId: string): LcEnrollment[] {
  return getEnrollments().filter((e) => e.courseId === courseId);
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function getReviews(courseId: string): LcReview[] {
  return load<LcReview[]>(KEYS.reviews, []).filter(
    (r) => r.courseId === courseId,
  );
}

export function addReview(
  courseId: string,
  userId: string,
  authorName: string,
  rating: number,
  comment: string,
): LcReview {
  const review: LcReview = {
    id: crypto.randomUUID(),
    courseId,
    userId,
    authorName,
    rating,
    comment,
    createdAt: Date.now(),
  };
  const reviews = load<LcReview[]>(KEYS.reviews, []);
  save(KEYS.reviews, [...reviews, review]);
  return review;
}

export function hasReviewed(userId: string, courseId: string): boolean {
  return load<LcReview[]>(KEYS.reviews, []).some(
    (r) => r.userId === userId && r.courseId === courseId,
  );
}

// ─── Points ──────────────────────────────────────────────────────────────────

export function getPoints(userId: string): number {
  const pts = load<LcPoints[]>(KEYS.points, []);
  return pts.find((p) => p.userId === userId)?.points ?? 0;
}

export function addPoints(userId: string, pts: number): number {
  const all = load<LcPoints[]>(KEYS.points, []);
  const idx = all.findIndex((p) => p.userId === userId);
  if (idx >= 0) {
    all[idx] = { ...all[idx], points: all[idx].points + pts };
  } else {
    all.push({ userId, points: pts });
  }
  save(KEYS.points, all);
  return all.find((p) => p.userId === userId)?.points ?? pts;
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export function getBadges(userId: string): LcBadge[] {
  return load<LcBadge[]>(KEYS.badges(userId), []);
}

export function awardBadge(userId: string, badgeName: string): void {
  const badges = getBadges(userId);
  if (badges.some((b) => b.name === badgeName)) return;
  save(KEYS.badges(userId), [
    ...badges,
    { name: badgeName, awardedAt: Date.now() },
  ]);
}

// ─── Quiz Attempts ────────────────────────────────────────────────────────────

export function getQuizAttempts(
  userId: string,
  courseId: string,
  quizId: string,
): LcQuizAttempt[] {
  return load<LcQuizAttempt[]>(KEYS.quizAttempts, []).filter(
    (a) =>
      a.userId === userId && a.courseId === courseId && a.quizId === quizId,
  );
}

export function addQuizAttempt(
  userId: string,
  courseId: string,
  quizId: string,
  score: number,
  pointsEarned: number,
): LcQuizAttempt {
  const existing = getQuizAttempts(userId, courseId, quizId);
  const attempt: LcQuizAttempt = {
    userId,
    courseId,
    quizId,
    score,
    pointsEarned,
    attemptNumber: existing.length + 1,
    completedAt: Date.now(),
  };
  const all = load<LcQuizAttempt[]>(KEYS.quizAttempts, []);
  save(KEYS.quizAttempts, [...all, attempt]);
  return attempt;
}

// ─── Reporting ────────────────────────────────────────────────────────────────

export interface ReportRow {
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: number;
  isCompleted: boolean;
  completedAt?: number;
  completedLessons: number;
  totalLessons: number;
}

export function getReportingData(instructorId?: string): ReportRow[] {
  const courses = instructorId
    ? getInstructorCourses(instructorId)
    : getCourses();
  const enrollments = getEnrollments();
  const users = getUsers();

  const rows: ReportRow[] = [];
  for (const enrollment of enrollments) {
    const course = courses.find((c) => c.id === enrollment.courseId);
    if (!course) continue;
    const user = users.find((u) => u.id === enrollment.userId);
    if (!user) continue;
    rows.push({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      courseId: course.id,
      courseTitle: course.title,
      enrolledAt: enrollment.enrolledAt,
      isCompleted: enrollment.isCompleted,
      completedAt: enrollment.completedAt,
      completedLessons: enrollment.completedLessons.length,
      totalLessons: course.lessons.length,
    });
  }
  return rows;
}
