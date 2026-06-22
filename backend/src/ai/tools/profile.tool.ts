import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { UserProfileContext } from '../interfaces/user-context.interface';

@Injectable()
export class ProfileTool {
  private readonly logger = new Logger(ProfileTool.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getUserProfile(userId: string): Promise<UserProfileContext> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        this.logger.error(`Failed to fetch user profile: ${error.message}`);
        throw error;
      }

      if (!data) {
        throw new Error('User profile not found');
      }

      return {
        id: data.id,
        age: data.date_of_birth ? this.calculateAge(data.date_of_birth) : null,
        gender: data.gender || null,
        height: data.height || null,
        weight: data.weight || null,
        goals: data.goals || [],
        experienceLevel: data.experience_level || 'beginner',
        equipment: data.equipment || [],
        targetDaysPerWeek: data.target_days_per_week || null,
        trainingYears: data.training_years || 0,
        primaryGoal: data.primary_goal || null,
        preferredUnits: data.preferred_units || 'metric',
      };
    } catch (error) {
      this.logger.error(`Error in getUserProfile: ${(error as Error).message}`);
      return {
        id: userId,
        age: null,
        gender: null,
        height: null,
        weight: null,
        goals: [],
        experienceLevel: 'beginner',
        equipment: [],
        targetDaysPerWeek: null,
        trainingYears: 0,
        primaryGoal: null,
        preferredUnits: 'metric',
      };
    }
  }

  private calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
