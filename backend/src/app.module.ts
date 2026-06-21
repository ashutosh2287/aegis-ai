import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { ThrottlerModule, ThrottlerModuleOptions, ThrottlerOptions } from '@nestjs/throttler';
import { ServeStaticModule, ServeStaticModuleOptions } from '@nestjs/serve-static';
import { join } from 'path';
import { configValidationSchema } from './config/config.validation';
import { ExerciseModule } from './exercise/exercise.module';
import { WorkoutModule } from './workout/workout.module';
import { WorkoutSetsModule } from './workout-sets/workout-sets.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';
import { WorkoutExercisesModule } from './workout-exercises/workout-exercises.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    // ConfigModule must be imported first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development', '.env'],
      validationSchema: configValidationSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              }
            : undefined,
      },
    }),
    // Throttler for rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => [{
        ttl: config.get<number>('throttle.ttl') ?? 60,
        limit: config.get<number>('throttle.limit') || 10,
      } as ThrottlerOptions],
    }),
    // Terminus for health checks
    TerminusModule,
    // Supabase module
    SupabaseModule,
    // Auth module
    AuthModule,
    // Exercise module
    ExerciseModule,
    // Analytics module
    AnalyticsModule,
    // Serve static files (if needed for uploads, etc.)
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): ServeStaticModuleOptions[] => [{
        rootPath: join(__dirname, '..', config.get<string>('upload.dir') ?? 'uploads'),
        serveRoot: '/uploads',
      }],
    }),
    WorkoutModule,
    WorkoutSetsModule,
    WorkoutSessionsModule,
    WorkoutExercisesModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}