# Backend Agent - Complete Backend Structure

## Overview

Aegis AI Backend is a **NestJS** application that serves as the API server for a workout tracker. It uses **Supabase** as the database and authentication provider, with **JWT** tokens for session management.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | NestJS (TypeScript) |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth + JWT (access + refresh tokens) |
| API Documentation | Swagger/OpenAPI |
| Validation | class-validator + class-transformer |
| Logging | Pino (via nestjs-pino) |
| Security | Helmet, Rate limiting (Throttler) |
| Testing | Jest |

## Directory Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── config/
│   │   └── config.validation.ts   # Environment validation (Joi)
│   ├── supabase/                  # Database connection layer
│   │   ├── supabase.module.ts     # Global module, creates Supabase client
│   │   ├── supabase.service.ts    # Service wrapper for Supabase client
│   │   └── index.ts
│   ├── auth/                      # Authentication module
│   │   ├── auth.module.ts
│   │   ├── controllers/
│   │   │   └── auth.controller.ts # Auth endpoints
│   │   ├── services/
│   │   │   ├── auth.service.ts    # Main auth logic
│   │   │   ├── token.service.ts   # JWT + refresh token management
│   │   │   ├── oauth.service.ts   # Google OAuth
│   │   │   ├── profile.service.ts # User profile CRUD
│   │   │   └── password.service.ts # Password reset
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── refresh-token.guard.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── refresh-token.strategy.ts
│   │   ├── dto/                   # Request/response DTOs
│   │   └── interfaces/
│   ├── exercise/                  # Exercise CRUD module
│   │   ├── exercise.module.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   │   └── exercise.service.ts
│   │   ├── dto/
│   │   └── interfaces/
│   ├── workout/                   # Workout CRUD module
│   │   ├── workout.module.ts
│   │   ├── workout.controller.ts
│   │   ├── workout.service.ts
│   │   ├── dto/
│   │   └── interfaces/
│   ├── workout-exercises/         # Junction: Workout ↔ Exercise
│   ├── workout-sessions/          # Workout session tracking
│   ├── workout-sets/              # Individual sets per exercise
│   ├── analytics/                 # Analytics module
│   ├── health/                    # Health check endpoint
│   │   └── health.controller.ts
│   └── common/                    # Shared utilities
│       ├── filters/               # Exception filters
│       ├── interceptors/          # Response/timeout interceptors
│       ├── middleware/            # Security middleware
│       ├── enums/                 # Database enums
│       └── interfaces/            # Shared interfaces
├── supabase/
│   ├── migrations/                # SQL migration files
│   └── config.toml
├── dist/                          # Compiled output
├── test/                          # E2E tests
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## How the Backend Works

### 1. Application Bootstrap (`main.ts`)

The application starts in `src/main.ts`:

```
NestFactory.create(AppModule)
  → Set global prefix: /api
  → Apply ValidationPipe (whitelist, transform, forbidNonWhitelisted)
  → Apply HttpExceptionFilter (global error handling)
  → Apply TimeoutInterceptor + ResponseInterceptor
  → Apply SecurityMiddleware + Helmet
  → Enable CORS
  → Setup Swagger (dev only)
  → Listen on port (default 4000)
```

### 2. Module System

The app uses NestJS modules. Key modules in `app.module.ts`:

| Module | Purpose |
|--------|---------|
| ConfigModule | Environment variables, global |
| LoggerModule | Pino logging |
| ThrottlerModule | Rate limiting (10 req/60s) |
| SupabaseModule | Database client (global) |
| AuthModule | Authentication/authorization |
| ExerciseModule | Exercise CRUD |
| WorkoutModule | Workout CRUD |
| WorkoutExercisesModule | Workout-Exercise junction |
| WorkoutSessionsModule | Session tracking |
| WorkoutSetsModule | Set tracking |
| AnalyticsModule | Analytics |
| TerminusModule | Health checks |
| ServeStaticModule | Static file serving |

### 3. Database Connection (Supabase)

**Location**: `src/supabase/`

The Supabase client is created as a **global provider** in `supabase.module.ts`:

```typescript
// Creates Supabase client with service role key
provide: 'SUPABASE_CLIENT'
useFactory: (configService) => {
  return createClient(
    configService.get('SUPABASE_URL'),
    configService.get('SUPABASE_SERVICE_ROLE_KEY')
  );
}
```

**How services use it:**

```typescript
// Any service can inject SupabaseService
constructor(private readonly supabaseService: SupabaseService) {}

// Then use the client directly
const { data, error } = await this.supabaseService
  .getClient()
  .from('table_name')
  .select('*')
  .eq('id', id);
```

**Key methods in SupabaseService:**
- `getClient()` - Returns the raw Supabase client
- `realtime(tableName, callback)` - Subscribe to real-time changes
- `getSupabaseUrl()` / `getSupabaseAnonKey()` - Get config values

### 4. Authentication Flow

**JWT Token System:**
- Access token: Short-lived (15m), signed with `JWT_SECRET`
- Refresh token: Long-lived (7d), signed with `JWT_REFRESH_SECRET`, hashed and stored in DB

**Signup Flow:**
1. User sends email/password/firstName/lastName
2. Create user in Supabase Auth (`auth.signUp`)
3. Create profile in `profiles` table
4. Generate access token (JWT)
5. Generate refresh token, hash it, store in `refresh_tokens` table
6. Return tokens + user info

**Login Flow:**
1. User sends email/password
2. Authenticate with Supabase Auth (`auth.signInWithPassword`)
3. Fetch or create profile
4. Generate new tokens
5. Return tokens + user info

**Token Refresh Flow:**
1. Client sends refresh token
2. Verify JWT signature
3. Check if token hash exists in DB and not expired
4. Generate new access + refresh tokens
5. Delete old refresh token, insert new one (rotation)

**Guards:**
- `JwtAuthGuard` - Protects routes requiring authentication
- `RefreshTokenGuard` - Protects refresh endpoint

### 5. API Endpoints

All endpoints are prefixed with `/api`.

**Auth (`/api/auth`):**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Create new user |
| POST | `/login` | No | Login user |
| POST | `/refresh` | RefreshToken | Get new access token |
| POST | `/logout` | JWT | Remove refresh token |
| POST | `/reset-password` | No | Request password reset |
| GET | `/google` | No | Initiate Google OAuth |
| GET | `/google/callback` | No | Google OAuth callback |
| GET | `/me` | JWT | Get current user profile |
| PATCH | `/profile` | JWT | Update user profile |
| PATCH | `/onboarding` | JWT | Complete onboarding |

**Exercises (`/api/exercises`):**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | JWT | List exercises (with filters) |
| GET | `/:id` | JWT | Get exercise by ID |
| POST | `/` | JWT | Create custom exercise |
| PATCH | `/:id` | JWT | Update exercise |
| DELETE | `/:id` | JWT | Delete exercise |

**Workouts (`/api/workouts`):**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | JWT | List user workouts |
| GET | `/:id` | JWT | Get workout with exercises/sets |
| POST | `/` | JWT | Create workout |
| PATCH | `/:id` | JWT | Update workout |
| DELETE | `/:id` | JWT | Soft delete workout |

### 6. Database Schema (Migrations)

**Tables:**

```sql
-- User profiles (extends auth.users)
profiles (
  id UUID PK → auth.users(id),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  training_years INT,
  primary_goal TEXT,
  experience_level ENUM,
  preferred_units ENUM,
  goals TEXT[],
  equipment TEXT[],
  target_days_per_week INT,
  weight NUMERIC,
  weight_unit ENUM,
  referral_source TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  created_at, updated_at, deleted_at
)

-- Refresh tokens
refresh_tokens (
  id UUID PK,
  user_id UUID → auth.users(id),
  token_hash TEXT,
  expires_at TIMESTAMPTZ,
  created_at
)

-- Workout sessions
workout_sessions (
  id UUID PK,
  user_id UUID → auth.users(id),
  workout_id UUID,
  status ENUM (active/completed/abandoned),
  started_at, completed_at,
  duration_seconds INT,
  notes TEXT
)

-- Exercises (from exercise.service.ts queries)
exercises (
  id UUID PK,
  name TEXT,
  description TEXT,
  movement_pattern ENUM,
  difficulty ENUM,
  video_url TEXT,
  instructions TEXT,
  is_custom BOOLEAN,
  created_by UUID,
  parent_variation_id UUID,
  tags TEXT[],
  is_active BOOLEAN
)

-- Junction tables
exercise_muscles (exercise_id, muscle_id)
exercise_equipment (exercise_id, equipment_id)
workout_exercises (id, workout_id, exercise_id)
workout_sets (id, workout_exercise_id, set_number, reps, weight, rpe, notes)
```

### 7. Configuration

**Environment Variables** (validated in `config.validation.ts`):

```env
NODE_ENV=development
PORT=4000

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# JWT
JWT_SECRET=your_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN_MS=604800000

# Web URL (for OAuth callbacks)
WEB_URL=http://localhost:3000

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### 8. How to Build and Run

```bash
# Install dependencies
npm install

# Development
npm run start:dev     # Starts with hot reload

# Build
npm run build         # Compiles to dist/

# Production
npm start             # Runs dist/main.js

# Test
npm run test          # Unit tests
npm run test:e2e      # E2E tests
```

### 9. Key Patterns for Building a Database Agent

To connect an agent to this database:

1. **Use the Supabase client directly** - The `SupabaseService.getClient()` returns the raw Supabase JS client
2. **All queries use the pattern:**
   ```typescript
   const { data, error } = await supabase
     .from('table_name')
     .select('*')
     .eq('column', value);
   ```
3. **Service role key bypasses RLS** - The backend uses `SUPABASE_SERVICE_ROLE_KEY` which has full access
4. **Real-time subscriptions available** via `supabaseService.realtime(tableName, callback)`
5. **All tables have soft delete** via `deleted_at` column
6. **UUIDs are primary keys** throughout

### 10. Error Handling

- Global `HttpExceptionFilter` catches all exceptions
- Services throw NestJS exceptions: `NotFoundException`, `BadRequestException`, `UnauthorizedException`, `InternalServerErrorException`
- Supabase errors are caught and wrapped in appropriate HTTP exceptions
- Validation errors are caught by `ValidationPipe`

### 11. Security

- **Helmet**: Sets security headers
- **Rate limiting**: 10 requests per 60 seconds per IP
- **CORS**: Configurable origin
- **JWT validation**: Access tokens verified on protected routes
- **Input validation**: DTOs validated with class-validator
- **Refresh token rotation**: Old tokens deleted on refresh