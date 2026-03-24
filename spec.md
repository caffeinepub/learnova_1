# LearnOva — Learner Website (Step 3)

## Current State
- Authentication, roles, admin/instructor backoffice are live.
- Instructor can create/edit courses with lessons (Video/Document/Image), options, and quizzes with point rewards.
- LearnerDashboard exists as a stub at `/learner`.
- Backend has: UserProfile, Course (with publish/visibility), Lessons implied via frontend state only.

## Requested Changes (Diff)

### Add
- **My Courses page** (`/learner/courses`): Grid of enrolled course cards (thumbnail, title, progress %, tags). Search bar. Profile panel sidebar with avatar, points total, earned badges.
- **Course Detail page** (`/learner/courses/:id`): Hero image + title, progress bar, overview description, tabbed: Lessons | Ratings & Reviews. Lesson list with status icons (locked/complete/in-progress). "Complete Course" CTA when all lessons done.
- **Full-Screen Lesson Player** (`/learner/courses/:id/lessons/:lessonId`): Renders Video (iframe/video tag), Document (PDF viewer/link), Image (full-size display), or Quiz. Back button to course detail. Mark lesson complete on finish.
- **Quiz Flow**: One question per page within lesson player. Multiple choice selection, submit answer. Points popup on correct answer (shows points earned for attempt). Supports up to 4 attempt tiers as configured by instructor. Progress through all questions.
- **Ratings & Reviews tab**: Star rating (1-5) + text review. Show aggregate rating and list of reviews.
- **Course completion flow**: Button enabled when all lessons complete. Triggers completion state, shows congratulations modal with total points earned and badges awarded.
- **Backend additions**: Enrollments, lesson progress, quiz attempts/scores, course reviews, learner points/badges.

### Modify
- LearnerDashboard: Update to redirect/navigate to `/learner/courses`.
- App.tsx: Add new learner routes.

### Remove
- Nothing removed.

## Implementation Plan
1. Extend Motoko backend with: Enrollment, LessonProgress, QuizAttempt, CourseReview, LearnerBadge types and CRUD functions.
2. Add new routes in App.tsx: `/learner/courses`, `/learner/courses/:id`, `/learner/courses/:id/lessons/:lessonId`.
3. Build `LearnerCoursesPage` with course cards, search, profile/badges sidebar.
4. Build `CourseDetailPage` with progress bar, lesson list tabs, reviews tab, completion button.
5. Build `LessonPlayerPage` with type-based rendering (video/doc/image/quiz).
6. Build `QuizPlayerComponent` with per-question flow, attempt tracking, points popup.
7. Build `RatingsReviews` tab component.
8. Build course completion modal.
