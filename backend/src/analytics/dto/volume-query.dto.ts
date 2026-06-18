import { IsString, IsOptional, IsIn } from "class-validator";

export class VolumeQueryDto {
  @IsOptional()
  @IsIn(["day", "week", "month", "year"])
  timeframe?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
