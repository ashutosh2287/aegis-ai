import { IsString, IsOptional, IsIn } from "class-validator";

export class ProgressionQueryDto {
  @IsOptional()
  @IsIn(["week", "month", "year", "all"])
  timeframe?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
