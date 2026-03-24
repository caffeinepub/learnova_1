# LearnOva – Points & Badge Logic

## Current State
- `submitQuizAttempt` on the backend already calls `addPointsInternal`, so points ARE accumulated per-quiz-attempt in the canister.
- `getMyPoints()` returns the real running total from the backend.
- The profile panel on My Courses page queries `getMyPoints()` via React Query.
- `LessonPlayerPage` computes badge popup points using **localStorage** (stale, wrong) instead of the backend total.
- Badge thresholds are inconsistent across files: `LessonPlayerPage` uses Newbie(0), ..., Master(100). `LearnerCoursesPage` uses Newbie(0), ..., Legend(120). Neither matches the user's required tiers.
- `myPoints` query is never invalidated after quiz completion, so the profile panel doesn't refresh.

## Requested Changes (Diff)

### Add
- Fetch actual post-attempt total from `actor.getMyPoints()` inside `handleQuizComplete` in LessonPlayerPage.
- `qc.invalidateQueries(["myPoints"])` after quiz completion so profile panel refreshes live.

### Modify
- **Badge thresholds** unified across both files to exactly match user spec:
  - Newbie: 20+ pts
  - Explorer: 40+ pts
  - Achiever: 60+ pts
  - Specialist: 80+ pts
  - Expert: 100+ pts
  - Master: 120+ pts
  - (Below 20: "Starter" — no badge unlocked yet)
- `LessonPlayerPage.handleQuizComplete`: replace localStorage point tracking with live backend fetch.
- `LearnerCoursesPage` BADGE_TIERS: remove Legend tier, shift thresholds to the spec values.

### Remove
- localStorage-based points tracking in LessonPlayerPage (learnova_learner_points key).
- Legend badge tier from LearnerCoursesPage.

## Implementation Plan
1. Update `BADGE_TIERS` in `LessonPlayerPage.tsx` to new spec (Starter <20, Newbie 20, Explorer 40, Achiever 60, Specialist 80, Expert 100, Master 120).
2. In `handleQuizComplete`, after the quiz attempt is submitted, call `actor.getMyPoints()` to get the real total, then invalidate `["myPoints"]` query.
3. Pass the live backend total to `BadgePopup`.
4. Update `BADGE_TIERS` in `LearnerCoursesPage.tsx` to match the same spec (remove Legend, adjust thresholds).
5. Validate and deploy.
