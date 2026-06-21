# Aegis AI Frontend - Potential UX Risks

**Phase**: 4.9.7  
**Date**: 2026-06-20  

---

## RISK-001: Navigation Dead Ends (Critical)
- **Category**: Navigation
- **Description**: Due to the sidebar/mobile nav route mismatch (see KI-001, KI-002), users who click navigation links will land on blank pages with no error message or redirect. There is no 404 catch-all route in the router.
- **User Impact**: Users will think the app is broken. No visual feedback explains what happened.
- **Mitigation**: Fix NavLink paths to use `/app/*` prefix. Add a 404 catch-all route.

---

## RISK-002: No Password Recovery Flow
- **Category**: Authentication
- **Description**: The "Forgot password?" link is a dead link (`#`). Users who forget their password have no way to recover their account without contacting support.
- **User Impact**: Locked-out users cannot self-serve. Increases support burden. May cause user abandonment.
- **Mitigation**: Implement password reset flow (email-based token or Supabase Auth password reset).

---

## RISK-003: Exercise Name Not Displayed During Workout
- **Category**: Active Workout
- **Description**: During an active workout session, exercise names display as raw UUIDs (workoutExerciseId) instead of human-readable names (see KI-003).
- **User Impact**: Users cannot identify which exercise they are performing. This is the most critical moment in the app - mid-workout - and the core information is missing.
- **Mitigation**: Map workoutExerciseId to exercise name during session initialization.

---

## RISK-004: No Offline Support
- **Category**: Reliability
- **Description**: The app requires a network connection for all operations. There is no service worker, no offline caching, and no queued mutation support.
- **User Impact**: Users in gym environments with poor connectivity cannot use the app. Workout data entered during a session may be lost if the connection drops.
- **Mitigation**: Consider adding a service worker for static assets and a mutation queue for offline resilience.

---

## RISK-005: No Session Persistence Across Tab Reloads During Active Workout
- **Category**: Active Workout
- **Description**: Active workout state is held entirely in React state (useReducer). If the user accidentally closes the tab or the browser crashes, all unsaved set data is lost.
- **User Impact**: Users who spend 30-60 minutes logging sets may lose all progress.
- **Mitigation**: Persist active session state to localStorage or use a debounce-save pattern to the backend.

---

## RISK-006: No Confirmation Before Leaving Active Workout
- **Category**: Active Workout
- **Description**: There is no `beforeunload` event handler or route change guard when the user is in an active workout session. Navigating away silently abandons the session.
- **User Impact**: Accidental navigation (e.g., browser back button, clicking a link) loses the workout context.
- **Mitigation**: Add a confirmation dialog when the user tries to leave an active session.

---

## RISK-007: No Input Sanitization on Weight/Reps Fields
- **Category**: Data Integrity
- **Description**: Weight and Reps inputs accept any number including negative values and decimals. There is no max value constraint.
- **User Impact**: Users can accidentally enter negative weights or absurdly large values, corrupting their training data and analytics.
- **Mitigation**: Add min/max constraints. Weight: 0-1000 kg. Reps: 0-100. Consider integer-only for reps.

---

## RISK-008: No Visual Feedback on Workout Card Click
- **Category**: Interaction
- **Description**: When clicking a workout card to start a session, there is a brief "Starting..." badge but no loading overlay or skeleton. The card opacity changes but the user may not notice.
- **User Impact**: Users may click multiple times (mitigated by the `startingWorkoutId` guard) or think the app is unresponsive.
- **Mitigation**: Add a full-card loading overlay or disable the entire card during session creation.

---

## RISK-009: Session Expired Banner Auto-Redirect May Be Too Fast
- **Category**: Session Management
- **Description**: The SessionExpiredBanner auto-redirects to login after 3 seconds. Users may not have time to read the message or save any in-progress work.
- **User Impact**: Users may be confused by the sudden redirect. If they were in the middle of typing, their data is lost.
- **Mitigation**: Increase timeout to 5-8 seconds or add a manual "Sign in" button and let the auto-redirect be a secondary action.

---

## RISK-010: No Toast Dismiss on Navigation
- **Category**: Feedback
- **Description**: Toast notifications persist across page navigation. If a user completes a workout and navigates away before the 3-second auto-dismiss, the toast may reappear or linger.
- **User Impact**: Minor visual clutter. Not critical but affects polish.
- **Mitigation**: Ensure toasts are cleared on route change or use a key-based approach.

---

## RISK-011: Dashboard Data May Be Stale
- **Category**: Data Freshness
- **Description**: Dashboard data is fetched via React Query but there is no explicit refetch-on-focus or refetch-interval configured. Users who leave the app open for hours may see stale data.
- **User Impact**: Users may make training decisions based on outdated volume/streak information.
- **Mitigation**: Add `refetchOnWindowFocus: true` and a reasonable `staleTime` to dashboard queries.

---

## RISK-012: No Dark Mode Support
- **Category**: Accessibility / Comfort
- **Description**: The app uses a light-only theme. Users in dark environments (e.g., dimly lit gyms) may experience eye strain.
- **User Impact**: Reduced comfort for a significant portion of users who prefer dark mode.
- **Mitigation**: Add a dark mode toggle using Tailwind's `dark:` variant.

---

## Summary

| Category | Count | Severity Range |
|----------|-------|----------------|
| Navigation | 1 | Critical |
| Authentication | 1 | Medium |
| Active Workout | 3 | High-Medium |
| Data Integrity | 1 | Medium |
| Interaction | 1 | Low |
| Session Management | 1 | Medium |
| Feedback | 1 | Low |
| Data Freshness | 1 | Low |
| Accessibility | 1 | Low |
| Reliability | 1 | High |
| **Total** | **12** | |

---

## Priority Recommendations

1. **Immediate** (Block UAT): Fix navigation routes (RISK-001), fix exercise name display (RISK-003)
2. **Before Release**: Add password recovery (RISK-002), add beforeunload guard (RISK-006), validate weight/reps inputs (RISK-007)
3. **Post-Release**: Add offline support (RISK-004), session persistence (RISK-005), dark mode (RISK-012)
