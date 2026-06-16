import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsPositive, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutDto } from './create-workout.dto';

export class UpdateWorkoutDto extends PartialType(CreateWorkoutDto) {}