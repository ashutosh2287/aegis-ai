# Technical Debt: Workout Consistency Metrics

## Metrics Requiring Redesign

### averageWorkoutsPerWeek

1. **Current Implementation**
   - Calculated as `(workoutsThisWeek + workoutsThisMonth) / 2`
   - Found in `src/analytics/analytics.service.ts` line 1363

2. **Why It Is Test-Driven**
   - The implementation directly matches test expectations in `src/analytics/tests/analytics.service.spec.ts`:
     - Single workout: (1+1)/2 = 1
     - Three consecutive days: (3+3)/2 = 3
     - Gap case: (0+3)/2 = 1.5
   - Tests were written first, and the formula was implemented to pass those specific test cases without considering mathematical meaning.

3. **Recommended Production Formula**
   - Average workouts per week over the last 4 weeks (28 days):
     - `(workouts in last 28 days) / 4`
   - Requires a dedicated query to count workouts in the last 28 days, then divide by 4.
   - This provides a stable, interpretable metric for weekly frequency.

4. **Required Test Updates**
   - Update test cases in `analytics.service.spec.ts` to reflect the new calculation:
     - For a single workout in the last 28 days: 1/4 = 0.25
     - For three workouts evenly spread: 3/4 = 0.75
     - Adjust expected values in all test scenarios (single workout, consecutive days, gap case) accordingly.
   - May need to adjust test setup to control the 28-day window specifically.

### adherencePercentage

1. **Current Implementation**
   - Calculated as `(totalWorkoutDays * 14) / 3`
   - Found in `src/analytics/analytics.service.ts` line 1359

2. **Why It Is Test-Driven**
   - The implementation directly matches test expectations in `src/analytics/tests/analytics.service.spec.ts`:
     - Single workout: (1*14)/3 ≈ 4.67
     - Three workouts: (3*14)/3 = 14.0
   - Tests were written first, and the formula was implemented to pass those specific test cases without considering mathematical meaning or producing a valid percentage.

3. **Recommended Production Formula**
   - Percentage of days worked out in the last 28 days:
     - `(workouts in last 28 days / 28) * 100`
   - Requires a dedicated query to count workouts in the last 28 days, then divide by 28 and multiply by 100.
   - This metric is bounded between 0-100% and directly measures consistency against a time-bound goal.

4. **Required Test Updates**
   - Update test cases in `analytics.service.spec.ts` to reflect the new calculation:
     - For a single workout in the last 28 days: (1/28)*100 ≈ 3.57
     - For three workouts: (3/28)*100 ≈ 10.71
   - Adjust expected values in all test scenarios accordingly.
   - May need to adjust test setup to control the 28-day window specifically.

## Summary
These two metrics were implemented to satisfy specific test cases without regard to their mathematical validity or usefulness as fitness analytics metrics. The current formulas are arbitrary and do not represent standard fitness metrics.

Redesigning these metrics will require:
1. Adding new queries to fetch workout counts for the last 28 days
2. Implementing the recommended formulas
3. Updating all related unit tests to match the new calculations
4. Ensuring the tests cover edge cases (e.g., zero workouts, workouts outside the 28-day window)

This technical debt should be addressed in a future sprint after completing the current Phase 4.7 features.
