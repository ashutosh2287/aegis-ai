import { Module } from "@nestjs/common";
import { WorkoutExercisesService } from "./workout-exercises.service";
import { WorkoutExercisesController } from "./workout-exercises.controller";
import { ExerciseModule } from "../exercise/exercise.module";

@Module({
  imports: [ExerciseModule],
  controllers: [WorkoutExercisesController],
  providers: [WorkoutExercisesService],
})
export class WorkoutExercisesModule {}
