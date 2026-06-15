import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class OAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Initiate Google OAuth
   * @returns The URL to redirect to for Google OAuth
   */
  async initiateGoogleLogin(): Promise<{ url: string }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${this.configService.get<string>('WEB_URL')}/auth/google/callback`,
        },
      });

    if (error) {
      throw new InternalServerErrorException(`Google OAuth failed: ${error.message}`);
    }

    return { url: data.url };
  }

  /**
   * Handle Google OAuth callback
   * @param code - The code from the callback
   * @returns Promise containing the user and tokens
   */
  async handleGoogleCallback(code: string) {
    // Exchange the code for a session
    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth.exchangeCodeForSession(code);

    if (authError) {
      throw new InternalServerErrorException(`Google OAuth failed: ${authError.message}`);
    }

    const user = authData.user;
    if (!user) {
      throw new InternalServerErrorException('No user returned from Google OAuth');
    }

    return { user };
  }
}