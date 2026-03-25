import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UpdateCourseDto {
    title: string;
    duration: bigint;
    isPublished: boolean;
    tags: Array<string>;
    lessonCount: bigint;
}
export type ProfileId = bigint;
export interface Enrollment {
    completedAt?: Time;
    principal: Principal;
    isCompleted: boolean;
    enrolledAt: Time;
    courseId: CourseId;
}
export interface EmailUserPublic {
    id: string;
    name: string;
    createdAt: Time;
    role: string;
    email: string;
}
export interface Badge {
    name: string;
    awardedAt: Time;
}
export interface Course {
    id: CourseId;
    title: string;
    duration: bigint;
    isPublished: boolean;
    views: bigint;
    createdAt: Time;
    tags: Array<string>;
    instructorId: Principal;
    lessonCount: bigint;
}
export interface LearnerCourseReport {
    completedAt?: Time;
    learnerPrincipal: Principal;
    startedAt?: Time;
    isCompleted: boolean;
    completedLessons: bigint;
    enrolledAt: Time;
    courseId: CourseId;
}
export interface QuizAttempt {
    completedAt: Time;
    score: bigint;
    pointsEarned: bigint;
    quizId: string;
    courseId: CourseId;
    attemptNumber: bigint;
}
export type CourseId = bigint;
export interface CreateCourseDto {
    title: string;
}
export interface CreateUserProfileDto {
    name: string;
    email: string;
}
export interface UpdateUserProfileDto {
    name: string;
    email: string;
}
export interface LessonProgress {
    lessonId: string;
    completedAt?: Time;
    isCompleted: boolean;
    courseId: CourseId;
}
export interface UserProfile {
    id: ProfileId;
    principal: Principal;
    name: string;
    createdAt: Time;
    role: UserRole;
    email: string;
    avatarUrl: string;
}
export interface Review {
    principal: Principal;
    createdAt: Time;
    comment: string;
    rating: bigint;
    courseId: CourseId;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardBadge(principal: Principal, badgeName: string): Promise<void>;
    completeCourse(courseId: CourseId): Promise<void>;
    createCourse(dto: CreateCourseDto): Promise<Course>;
    createProfile(createProfileDto: CreateUserProfileDto): Promise<UserProfile>;
    deleteEmailUser(id: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    doesAdminExist(): Promise<boolean>;
    enrollCourse(arg0: {
        courseId: CourseId;
    }): Promise<void>;
    enrollLearnerByEmail(courseId: CourseId, email: string): Promise<void>;
    getAllEmailUsers(): Promise<Array<EmailUserPublic>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserRole(): Promise<UserRole>;
    getCourseAttendees(courseId: CourseId): Promise<Array<UserProfile>>;
    getCourseReviews(courseId: CourseId): Promise<Array<Review>>;
    getCourses(): Promise<Array<Course>>;
    getEmailUserById(id: string): Promise<{
        __kind__: "ok";
        ok: EmailUserPublic;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getEnrollments(principal: Principal): Promise<Array<Enrollment>>;
    getMyBadges(): Promise<Array<Badge>>;
    getMyCourseCompletions(): Promise<Array<Enrollment>>;
    getMyCourses(): Promise<Array<Course>>;
    getMyLessonProgress(courseId: CourseId): Promise<Array<LessonProgress>>;
    getMyPoints(): Promise<bigint>;
    getMyQuizAttempts(courseId: CourseId, quizId: string): Promise<Array<QuizAttempt>>;
    getReportingData(): Promise<Array<LearnerCourseReport>>;
    getUserCount(): Promise<bigint>;
    getUserProfile(principal: Principal): Promise<UserProfile>;
    incrementCourseViews(id: CourseId): Promise<void>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    loginEmailUser(email: string, password: string): Promise<{
        __kind__: "ok";
        ok: EmailUserPublic;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markLessonComplete(courseId: CourseId, lessonId: string): Promise<void>;
    registerEmailUser(email: string, password: string, name: string, role: string): Promise<{
        __kind__: "ok";
        ok: EmailUserPublic;
    } | {
        __kind__: "err";
        err: string;
    }>;
    resetDatabase(): Promise<void>;
    resetEmailUsers(): Promise<void>;
    seedFirstAdmin(): Promise<void>;
    setUserRole(user: Principal, role: UserRole): Promise<void>;
    submitQuizAttempt(courseId: CourseId, quizId: string, score: bigint, pointsEarned: bigint): Promise<void>;
    submitReview(courseId: CourseId, rating: bigint, comment: string): Promise<void>;
    updateCourse(id: CourseId, dto: UpdateCourseDto): Promise<Course>;
    updateEmailUserRole(id: string, role: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateMyProfile(updateProfileDto: UpdateUserProfileDto): Promise<void>;
}
