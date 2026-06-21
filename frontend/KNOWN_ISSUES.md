# Aegis AI Frontend - Known Issues Report

**Phase**: 4.9.7  
**Date**: 2026-06-20  

---

## CRITICAL

### KI-001: Sidebar Navigation Routes Mismatch
- **Severity**: Critical
- **Component**: `src/components/layout/Sidebar.tsx`
- **Description**: All sidebar NavLink paths use `/dashboard`, `/analytics`, `/records`, `/workouts`, `/history`, `/exercises`, `/insights`, `/goals` but the router defines these routes under `/app/*` (e.g., `/app/dashboard`, `/app/analytics`). Clicking any sidebar link navigates to a non-existent route, showing a blank page or 404.
- **Affected Lines**: Sidebar.tsx:52, 64, 76, 92, 104, 116, 132, 144
- **Expected**: Links should be `/app/dashboard`, `/app/analytics`, etc.
- **Impact**: Users cannot navigate between pages using the sidebar. Only direct URL entry or programmatic navigation (e.g., after login) works.

### KI-002: Mobile Navigation Routes Mismatch
- **Severity**: Critical
- **Component**: `src/components/layout/MobileNav.tsx`
- **Description**: Same issue as KI-001. Mobile nav links use `/dashboard`, `/workouts`, `/analytics`, `/insights`, `/profile` instead of `/app/dashboard`, `/app/workouts`, etc.
- **Affected Lines**: MobileNav.tsx:14, 27, 39, 51, 63
- **Impact**: Mobile users cannot navigate between pages.

### KI-003: Active Session Shows Exercise ID Instead of Name
- **Severity**: Critical
- **Component**: `src/pages/ActiveSessionPage.tsx:367`
- **Description**: `exerciseName` is set to `se.workoutExerciseId` (a UUID) instead of the actual exercise name. Users see raw IDs like "a1b2c3d4-..." instead of "Bench Press".
- **Impact**: Users cannot identify which exercise they are performing during a workout session.

---

## HIGH

### KI-004: Login/Register Buttons Have Invalid CSS Class
- **Severity**: High
- **Component**: `LoginPage.tsx:120`, `RegisterPage.tsx:206`
- **Description**: Both buttons use `w-flex` which is not a valid Tailwind CSS class. Should be `w-full` for full-width buttons.
- **Impact**: Buttons may not render at full width as intended. Layout may appear broken on certain screen sizes.

### KI-005: Sidebar Logout Button Has Invalid CSS Class
- **Severity**: High
- **Component**: `src/components/layout/Sidebar.tsx:160`
- **Description**: Logout button uses `flex w-items-center` where `w-items-center` is not a valid Tailwind class. Should be `flex items-center`.
- **Impact**: Logout button layout may be misaligned.

---

## MEDIUM

### KI-006: Forgot Password Not Implemented
- **Severity**: Medium
- **Component**: `LoginPage.tsx:110`
- **Description**: "Forgot password?" link points to `#` (no-op). No password reset flow exists.
- **Impact**: Users who forget their password have no self-service recovery option.

### KI-007: Remember Me Checkbox Not Functional
- **Severity**: Medium
- **Component**: `LoginPage.tsx:99-105`
- **Description**: "Remember me" checkbox is cosmetic only. The auth store always uses localStorage persistence regardless of this checkbox state.
- **Impact**: Users expect session persistence to be optional; currently it is always on.

### KI-008: Newsletter Checkbox Not Wired
- **Severity**: Medium
- **Component**: `RegisterPage.tsx:191-199`
- **Description**: "Subscribe to newsletter" checkbox is cosmetic only. The value is not sent to the backend during registration.
- **Impact**: Users who check the box expect to receive newsletters but will not.

---

## LOW

### KI-009: Profile Page Is Placeholder
- **Severity**: Low
- **Component**: `ProfilePage.tsx`
- **Description**: Page renders only a title and placeholder text. No profile editing, avatar upload, or account settings.
- **Impact**: Users expect profile management functionality.

### KI-010: Records Page Is Placeholder
- **Severity**: Low
- **Component**: `RecordsPage.tsx`
- **Description**: Page renders only a title and placeholder text. No personal records display despite the feature existing in the Analytics page.
- **Impact**: Users navigating to Records see no data.

### KI-011: Insights Page Is Placeholder
- **Severity**: Low
- **Component**: `InsightsPage.tsx`
- **Description**: Page renders only a title and placeholder text. No AI-generated insights.
- **Impact**: Users navigating to Insights see no data.

### KI-012: Workout Card Shows Backend Dependency Placeholder
- **Severity**: Low
- **Component**: `WorkoutsPage.tsx:183`
- **Description**: "Last performed" field displays "Backend dependency: lastPerformed field required" as placeholder text.
- **Impact**: Users see technical jargon instead of useful information.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 2 |
| Medium | 3 |
| Low | 4 |
| **Total** | **12** |
