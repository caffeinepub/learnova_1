# LearnOva

## Current State
- Courses Dashboard at `/instructor/courses` with Kanban/List views, course cards, search, create/edit popups.
- Edit action currently opens a simple dialog to rename the course title only.
- Backend has `Course` type with title, tags, views, lessonCount, duration, isPublished, instructorId.
- No dedicated Course Edit page exists yet.

## Requested Changes (Diff)

### Add
- New page: `CourseEditPage` at `/instructor/courses/:courseId/edit`
- Page header bar with:
  - Back button (to Courses Dashboard)
  - Course title display
  - Publish toggle (switch labeled Draft / Published)
  - Preview button
  - Add Attendees button
  - Contact Attendees button
- Course image upload section (click to upload, shows preview)
- Form fields: Title (text), Tags (comma-separated or tag input), Website (text), Responsible Person (text)
- Four tabs: Content, Description, Options, Quiz (all empty/placeholder for now)
- Wire the Edit button in CoursesDashboard to navigate to `/instructor/courses/:id/edit`

### Modify
- `App.tsx`: Add route `/instructor/courses/:courseId/edit` pointing to `CourseEditPage`
- `CoursesDashboard.tsx`: Change `onEdit` handler to navigate to the edit page instead of opening dialog (remove edit dialog)

### Remove
- Edit dialog from CoursesDashboard (replaced by full edit page navigation)

## Implementation Plan
1. Create `src/frontend/src/pages/CourseEditPage.tsx` with header, image upload, form fields, and 4 empty tabs
2. Update `App.tsx` to add the new route with courseId param
3. Update `CoursesDashboard.tsx` Edit button to use `useNavigate` to go to `/instructor/courses/:id/edit`
