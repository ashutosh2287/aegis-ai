import { Injectable } from '@nestjs/common';
import { ProfileTool } from './profile.tool';

export interface NutritionContext {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
  dietaryPreference: string;
}

@Injectable()
export class NutritionTool {
  constructor(private readonly profileTool: ProfileTool) {}

  async getNutritionContext(userId: string, activityLevel?: string, dietaryPreference?: string): Promise<NutritionContext> {
    const profile = await this.profileTool.getUserProfile(userId);

    return {
      weight: profile.weight || 70,
      height: profile.height || 170,
      age: profile.age || 25,
      gender: profile.gender || 'male',
      activityLevel: activityLevel || 'moderate',
      goal: profile.primaryGoal || profile.goals[0] || 'general_fitness',
      dietaryPreference: dietaryPreference || 'non_vegetarian',
    };
  }

  calculateBMR(context: NutritionContext): number {
    if (context.gender.toLowerCase() === 'male') {
      return 10 * context.weight + 6.25 * context.height - 5 * context.age + 5;
    }
    return 10 * context.weight + 6.25 * context.height - 5 * context.age - 161;
  }

  calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return bmr * (multipliers[activityLevel] || 1.55);
  }

  calculateGoalCalories(tdee: number, goal: string): number {
    switch (goal) {
      case 'fat_loss':
        return Math.round(tdee - 500);
      case 'muscle_gain':
        return Math.round(tdee + 300);
      case 'strength':
        return Math.round(tdee + 200);
      default:
        return Math.round(tdee);
    }
  }

  calculateMacros(goalCalories: number, goal: string, weight: number): { protein: number; carbohydrates: number; fat: number } {
    let proteinPerKg: number;
    let carbPercentage: number;
    let fatPercentage: number;

    switch (goal) {
      case 'muscle_gain':
        proteinPerKg = 2.0;
        carbPercentage = 0.45;
        fatPercentage = 0.25;
        break;
      case 'fat_loss':
        proteinPerKg = 2.2;
        carbPercentage = 0.35;
        fatPercentage = 0.30;
        break;
      case 'strength':
        proteinPerKg = 1.8;
        carbPercentage = 0.45;
        fatPercentage = 0.25;
        break;
      default:
        proteinPerKg = 1.6;
        carbPercentage = 0.40;
        fatPercentage = 0.30;
    }

    const protein = Math.round(weight * proteinPerKg);
    const proteinCalories = protein * 4;
    const fatCalories = goalCalories * fatPercentage;
    const fat = Math.round(fatCalories / 9);
    const carbCalories = goalCalories - proteinCalories - fatCalories;
    const carbohydrates = Math.round(carbCalories / 4);

    return { protein, carbohydrates, fat };
  }
}
