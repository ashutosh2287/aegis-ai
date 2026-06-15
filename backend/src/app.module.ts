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

@Module({
  imports: [
    // ConfigModule must be imported first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development', '.env'],
      validationSchema: configValidationSchema,
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
    // Serve static files (if needed for uploads, etc.)
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): ServeStaticModuleOptions[] => [{
        rootPath: join(__dirname, '..', config.get<string>('upload.dir') ?? 'uploads'),
        serveRoot: '/uploads',
      }],
    }),
    WorkoutModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}