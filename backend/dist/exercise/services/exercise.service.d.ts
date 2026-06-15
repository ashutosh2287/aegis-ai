import { SupabaseService } from '../../supabase/supabase.service';
import { CreateExerciseDto } from '../dto/create-exercise.dto';
import { UpdateExerciseDto } from '../dto/update-exercise.dto';
import { ExerciseQueryDto } from '../dto/exercise-query.dto';
import { ExerciseWithRelations } from '../interfaces/exercise-with-relations.interface';
export declare class ExerciseService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getExercises(query: ExerciseQueryDto): Promise<ExerciseWithRelations[]>;
    getExerciseById(id: string): Promise<ExerciseWithRelations | null>;
    createExercise(createExerciseDto: CreateExerciseDto, userId: string): Promise<ExerciseWithRelations>;
    updateExercise(id: string, updateExerciseDto: UpdateExerciseDto, userId: string): Promise<ExerciseWithRelations>;
    deleteExercise(id: string, userId: string): Promise<void>;
}
