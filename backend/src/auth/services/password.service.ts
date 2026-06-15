import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class PasswordService {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Request a password reset
   * @param email - The email to reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const redirectTo = `${this.configService.get<string>('WEB_URL')}/auth/reset-password`;

    const { error } = await this.supabaseService
      .getClient()
      .auth.resetPasswordForEmail(email, {
        redirectTo,
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to send reset password email: ${error.message}`);
    }

    return { message: 'Password reset email sent' };
  }
}