import {
  MovementPattern,
  DifficultyLevel,
} from "../../common/enums/database.enums";

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  movementPattern: MovementPattern;
  difficulty: DifficultyLevel;
  videoUrl: string | null;
  instructions: string | null;
  isCustom: boolean;
  createdBy: string | null; // UUID of the user who created it (if custom)
  parentVariationId: string | null; // UUID of the parent exercise (if a variation)
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
