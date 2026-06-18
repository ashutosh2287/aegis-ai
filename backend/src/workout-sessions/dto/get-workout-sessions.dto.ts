import { IsString, IsOptional, IsIn, IsInt, Min } from "class-validator";
import { Transform } from "class-transformer";
import { SessionStatus } from "../../common/enums/database.enums";

export class GetWorkoutSessionsDto {
  @IsOptional()
  @IsIn([
    SessionStatus.ACTIVE,
    SessionStatus.COMPLETED,
    SessionStatus.ABANDONED,
  ])
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  workoutId?: string;

  @IsOptional()
  @IsString()
  startDate?: string; // ISO date string

  @IsOptional()
  @IsString()
  endDate?: string; // ISO date string

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = "started_at";

  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC";
}
