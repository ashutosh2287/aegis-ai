import { MovementPattern, DifficultyLevel } from '../../common/enums/database.enums';
export declare class ExerciseResponseDto {
    id: string;
    name: string;
    description?: string;
    movementPattern: MovementPattern;
    difficulty: DifficultyLevel;
    videoUrl?: string;
    instructions?: string;
    isCustom: boolean;
    createdBy?: string;
    parentVariationId?: string;
    tags: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    muscleGroups?: string[];
    equipmentNeeded?: string[];
}
