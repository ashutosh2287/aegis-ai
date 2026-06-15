import { MovementPattern, DifficultyLevel } from '../../common/enums/database.enums';
export interface Exercise {
    id: string;
    name: string;
    description: string | null;
    movementPattern: MovementPattern;
    difficulty: DifficultyLevel;
    videoUrl: string | null;
    instructions: string | null;
    isCustom: boolean;
    createdBy: string | null;
    parentVariationId: string | null;
    tags: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
