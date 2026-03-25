# LearnOva — Payment Checkout Flow

## Current State
- Courses have an `accessRule` stored in localStorage at `learnova_course_options_${courseId}` with values: `open`, `invitation`, or `payment`.
- When `accessRule === 'payment'`, LearnerCoursesPage shows a "Buy Course" amber button.
- Clicking it currently navigates straight to the course detail page — no checkout UI.
- Course options also store a `price` field (set by instructor in Options tab).
- Enrollment uses `enrollCourse({ courseId })` backend call.
- Cover images are stored in localStorage as `learnova_cover_${courseId}`.

## Requested Changes (Diff)

### Add
- New `CheckoutPage` at `/learner/courses/:id/checkout`:
  - Course cover image (or gradient fallback), title, price
  - Payment form: cardholder name, card number, expiry (MM/YY), CVV
  - "Pay Now" button: simulates processing, calls `enrollCourse`, redirects to course detail
  - Back link to My Courses

### Modify
- `handleAction` in LearnerCoursesPage: `buy` variant navigates to checkout (with login guard for guests).
- `getCourseButtonVariant`: if learner is already enrolled in a payment course, return `start` or `continue` instead of `buy`.

### Remove
- Nothing.

## Implementation Plan
1. Create `CheckoutPage.tsx`.
2. Register route in `App.tsx`.
3. Update `handleAction` and `getCourseButtonVariant` in `LearnerCoursesPage.tsx`.
