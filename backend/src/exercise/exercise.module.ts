import { Module } from "@nestjs/common";
import { ExerciseController } from "./controllers/exercise.controller";
import { ExerciseService } from "./services/exercise.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    SupabaseModule,
    AuthModule, // For JwtAuthGuard
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
