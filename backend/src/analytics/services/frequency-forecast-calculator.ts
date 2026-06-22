import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { FrequencyProjectionDto } from '../dto/frequency-projection.dto';

@Injectable()
export class FrequencyForecastCalculator {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Calculate frequency projection based on historical data
   * @param userId The user's ID
   * @returns Frequency projection for weekly, monthly and consistency trend projection
   */
  async calculateProjection(userId: string): Promise<FrequencyProjectionDto> {
    // Fetch the user's target_days_per_week from their profile
    let targetFrequency = 4; // default
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('profiles')
        .select('target_days_per_week')
        .eq('id', userId)
        .single();

      if (!error && data?.target_days_per_week) {
        targetFrequency = data.target_days_per_week;
      }
    } catch {
      // Use default
    }

    // TODO: Implement actual forecasting logic using workout history
    return new FrequencyProjectionDto(
      targetFrequency - 1, // predicted current (assume slightly below target)
      (targetFrequency - 1) * 4, // predicted monthly
      85, // consistency score placeholder
    );
  }
}