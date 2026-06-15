import { MovementPattern, DifficultyLevel } from '../../common/enums/database.enums';
export declare class ExerciseQueryDto {
    search?: string;
    muscleGroups?: string[];
    equipment?: string[];
    movementPatterns?: MovementPattern[];
    difficulties?: DifficultyLevel[];
    limit?: number;
    offset?: number;
}
