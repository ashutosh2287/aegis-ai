import { Module } from "@nestjs/common";
import { WorkoutSetsService } from "./workout-sets.service";
import { WorkoutSetsController } from "./workout-sets.controller";

@Module({
  controllers: [WorkoutSetsController],
  providers: [WorkoutSetsService],
})
export class WorkoutSetsModule {}
