---
name: workout-schema-assumed
description: Assumed database schema for workout module based on code analysis.
metadata:
  type: reference
---

**Assumed Schema (NOT VERIFIED)**

Table: workouts
Columns:
* id (string, primary key)
* user_id (string, foreign key to users)
* name (string, nullable)
* description (string, nullable)
* created_at (timestamp)
* updated_at (timestamp)
* deleted_at (timestamp, nullable for soft delete)

Table: workout_exercises
Columns:
* id (string, primary key)
* workout_id (string, foreign key to workouts)
* exercise_id (string, foreign key to exercises)
* created_at (timestamp)

Table: workout_sets
Columns:
* id (string, primary key)
* workout_exercise_id (string, foreign key to workout_exercises)
* set_number (integer)
* reps (integer)
* weight (numeric, nullable)
* distance (numeric, nullable)
* duration (integer, nullable in seconds)
* created_at (timestamp)

**Note**: These assumptions are derived from the WorkoutService code. No actual schema files (SQL, migration, Prisma, TypeORM entities) were found in the repository. Therefore, schema validation could not be completed.

