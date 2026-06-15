import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { UserProfile } from '../interfaces/auth.interface';

@Injectable()
export class ProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a profile for a user
   * @param profileData - The profile data to insert
   */
  async createProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to create profile: ${error.message}`);
    }

    if (!data) {
      throw new InternalServerErrorException('Profile not created');
    }

    return data;
  }

  /**
   * Get the profile for a user
   * @param userId - The user ID
   * @returns The user profile
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch profile: ${error.message}`);
    }

    if (!data) {
      throw new InternalServerErrorException('Profile not found');
    }

    return data;
  }

  /**
   * Update the profile for a user
   * @param userId - The user ID
   * @param updateData - The data to update
   * @returns The updated profile
   */
  async updateProfile(userId: string, updateData: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to update profile: ${error.message}`);
    }

    if (!data) {
      throw new InternalServerErrorException('Profile not found or not updated');
    }

    return data;
  }
}