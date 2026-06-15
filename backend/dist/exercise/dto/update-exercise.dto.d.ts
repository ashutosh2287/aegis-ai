import { MovementPattern, DifficultyLevel } from '../../common/enums/database.enums';
export declare class UpdateExerciseDto {
    name?: string;
    description?: string;
    movementPattern?: MovementPattern;
    difficulty?: DifficultyLevel;
    videoUrl?: string;
    instructions?: string;
    muscleGroups?: string[];
    equipmentNeeded?: string[];
    tags?: string[];
}
