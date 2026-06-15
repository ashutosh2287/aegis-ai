import { ExerciseService } from '../services/exercise.service';
import { CreateExerciseDto } from '../dto/create-exercise.dto';
import { UpdateExerciseDto } from '../dto/update-exercise.dto';
import { ExerciseQueryDto } from '../dto/exercise-query.dto';
import { ExerciseResponseDto } from '../dto/exercise-response.dto';
import { Request } from 'express';
export declare class ExerciseController {
    private readonly exerciseService;
    constructor(exerciseService: ExerciseService);
    getExercises(query: ExerciseQueryDto): Promise<ExerciseResponseDto[]>;
    getExerciseById(id: string): Promise<ExerciseResponseDto>;
    createExercise(createExerciseDto: CreateExerciseDto, req: Request): Promise<ExerciseResponseDto>;
    updateExercise(id: string, updateExerciseDto: UpdateExerciseDto, req: Request): Promise<ExerciseResponseDto>;
    deleteExercise(id: string, req: Request): Promise<{
        message: string;
    }>;
}
