import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { OnboardingDto } from '../dto/onboarding.dto';
import { UserProfile } from '../interfaces/auth.interface';
import { TokenService } from './token.service';
import { OAuthService } from './oauth.service';
import { ProfileService } from './profile.service';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly oauthService: OAuthService,
    private readonly profileService: ProfileService,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Sign up a new user
   * @param signupDto - The signup data
   * @returns Promise containing access and refresh tokens
   */
  async signup(signupDto: SignupDto): Promise<{ token: string; refreshToken: string; user: { id: string; firstName: string; lastName: string; email: string } }> {
    const { email, password, firstName, lastName } = signupDto;
    const fullName = `${firstName} ${lastName}`.trim();

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await this.tokenService.supabaseService.getClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      console.error('[signup] Supabase auth error:', authError);
      throw new InternalServerErrorException(`Failed to create user: ${authError.message}`);
    }

    const user = authData.user;
    if (!user) {
      console.error('[signup] No user returned from Supabase Auth. authData:', JSON.stringify(authData));
      throw new InternalServerErrorException('No user returned from Supabase Auth');
    }

    // Step 2: Create profile for the user
    const profileData = {
      id: user.id,
      username: user.email?.split('@')[0] || undefined,
      full_name: fullName,
      avatar_url: null,
      bio: null,
      training_years: 0,
      primary_goal: null,
      experience_level: 'beginner',
      preferred_units: 'metric',
      timezone: 'UTC',
      notification_preferences: { email: true, push: true, workout_reminder: true },
    };

    console.error('[signup] Creating profile for user:', user.id);
    try {
      await this.profileService.createProfile(profileData);
    } catch (err) {
      console.error('[signup] Profile creation failed:', err);
      throw err;
    }

    // Step 3: Generate access and refresh tokens
    const token = this.tokenService.signAccessToken(user.id);
    const refreshToken = await this.tokenService.signRefreshToken(user.id);

    return {
      token,
      refreshToken,
      user: { id: user.id, firstName, lastName, email },
    };
  }

  /**
   * Log in a user
   * @param loginDto - The login data
   * @returns Promise containing access and refresh tokens
   */
  async login(loginDto: LoginDto): Promise<{ token: string; refreshToken: string; user: { id: string; firstName: string; lastName: string; email: string } }> {
    const { email, password } = loginDto;

    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await this.tokenService.supabaseService.getClient().auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('[login] Supabase auth error:', authError.message, authError);
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = authData.user;
    if (!user) {
      console.error('[login] No user returned from Supabase Auth');
      throw new InternalServerErrorException('No user returned from Supabase Auth');
    }

    // Step 2: Ensure profile exists
    let profile;
    try {
      profile = await this.profileService.getProfile(user.id);
    } catch (err) {
      console.error('[login] Profile fetch failed, creating profile:', (err as Error).message);
      profile = await this.profileService.createProfile({
        id: user.id,
        username: user.email?.split('@')[0] || undefined,
        full_name: (user.user_metadata as any)?.full_name || `${(user.user_metadata as any)?.first_name || ''} ${(user.user_metadata as any)?.last_name || ''}`.trim(),
        experience_level: 'beginner',
        preferred_units: 'metric',
        timezone: 'UTC',
        notification_preferences: { email: true, push: true, workout_reminder: true },
      });
    }

    // Step 3: Generate access and refresh tokens
    const token = this.tokenService.signAccessToken(user.id);
    const refreshToken = await this.tokenService.signRefreshToken(user.id);

    const firstName = (user.user_metadata as any)?.first_name || (user.user_metadata as any)?.full_name?.split(' ')[0] || '';
    const lastName = (user.user_metadata as any)?.last_name || (user.user_metadata as any)?.full_name?.split(' ').slice(1).join(' ') || '';

    return {
      token,
      refreshToken,
      user: { id: user.id, firstName, lastName, email: user.email || email },
    };
  }

  /**
   * Refresh access token using a refresh token
   * @param refreshTokenDto - The refresh token
   * @returns Promise containing new access and refresh tokens
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshTokenDto;

    // Step 1: Verify the refresh token and extract user ID
    let payload: any;
    try {
      payload = await this.tokenService.jwtService.verifyAsync(refreshToken, {
        secret: this.tokenService.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Step 2: Check if the refresh token exists in our database and is not expired
    const isValid = await this.tokenService.isValidRefreshToken(userId, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Step 3: Generate new access and refresh tokens
    const newAccessToken = this.tokenService.signAccessToken(userId);
    const newRefreshToken = await this.tokenService.signRefreshToken(userId);

    // Step 4: Update the refresh token in the database (rotate: delete old, insert new)
    // We'll delete the old token and insert a new one.
    await this.tokenService.removeRefreshToken(refreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Log out a user by removing their refresh token
   * @param refreshToken - The refresh token to remove
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.removeRefreshToken(refreshToken);
  }

  /**
   * Request a password reset
   * @param resetPasswordDto - The email to reset
   */
  async requestPasswordReset(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.passwordService.requestPasswordReset(resetPasswordDto.email);
  }

  /**
   * Get the current user's profile
   * @param userId - The user ID from the JWT
   * @returns The user profile with isOnboarded flag
   */
  async getProfile(userId: string): Promise<UserProfile & { is_onboarded: boolean }> {
    const profile = await this.profileService.getProfile(userId);
    return {
      ...profile,
      is_onboarded: !!profile.onboarding_completed_at,
    };
  }

  /**
   * Complete onboarding for a user
   * @param userId - The user ID from the JWT
   * @param onboardingDto - The onboarding data
   * @returns The updated profile with isOnboarded flag
   */
  async completeOnboarding(userId: string, onboardingDto: OnboardingDto): Promise<UserProfile & { is_onboarded: boolean }> {
    const profile = await this.profileService.completeOnboarding(userId, onboardingDto);
    return {
      ...profile,
      is_onboarded: true,
    };
  }

  /**
   * Update the current user's profile
   * @param userId - The user ID from the JWT
   * @param updateProfileDto - The data to update
   * @returns The updated profile
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfile> {
    return this.profileService.updateProfile(userId, updateProfileDto);
  }

  /**
   * Initiate Google OAuth
   * @returns The URL to redirect to for Google OAuth
   */
  async initiateGoogleLogin(): Promise<{ url: string }> {
    return this.oauthService.initiateGoogleLogin();
  }

  /**
   * Handle Google OAuth callback
   * @param code - The code from the callback
   * @returns Promise containing the user and tokens
   */
  async handleGoogleCallback(code: string) {
    const { user } = await this.oauthService.handleGoogleCallback(code);

    // Check if profile exists, if not create one
    let profile = await this.profileService.getProfile(user.id).catch(() => null);

    if (!profile) {
      // Create profile
      const profileData = {
        id: user.id,
        username: user.email?.split('@')[0] || undefined,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        bio: null,
        training_years: 0,
        primary_goal: null,
        experience_level: 'beginner',
        preferred_units: 'metric',
        timezone: 'UTC',
        notification_preferences: { email: true, push: true, workout_reminder: true },
      };

      profile = await this.profileService.createProfile(profileData);
    }

    // Generate our own JWT tokens
    const accessToken = this.tokenService.signAccessToken(user.id);
    const refreshToken = await this.tokenService.signRefreshToken(user.id);

    return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
  }
}