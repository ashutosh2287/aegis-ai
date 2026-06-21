import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenService {
  constructor(
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
    public readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Sign an access token
   * @param userId - The user ID
   * @returns The access token string
   */
  signAccessToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      },
    );
  }

  /**
   * Sign a refresh token and store its hash in the database
   * @param userId - The user ID
   * @returns The refresh token string
   */
  async signRefreshToken(userId: string): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    // Hash the refresh token for storage
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // Calculate expiration date
    const expiresInMs = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_MS') || 7 * 24 * 60 * 60 * 1000; // 7 days
    const expiresAt = new Date(Date.now() + expiresInMs).toISOString();

    // Store the hash in the database
    const { error } = await this.supabaseService
      .getClient()
      .from('refresh_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to store refresh token: ${error.message}`);
    }

    return refreshToken;
  }

  /**
   * Verify a refresh token and return the payload
   * @param token - The refresh token to verify
   * @returns Promise containing the userId if valid
   * @throws UnauthorizedException if token is invalid or expired
   */
  async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return { userId: payload.sub };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Check if the refresh token exists in our database and is not expired
   * @param userId - The user ID
   * @param refreshToken - The refresh token to check
   * @returns Promise<boolean>
   */
  async isValidRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('refresh_tokens')
      .select('token_hash')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString());

    if (error || !data || data.length === 0) {
      return false;
    }

    for (const row of data) {
      const match = await bcrypt.compare(refreshToken, row.token_hash);
      if (match) return true;
    }

    return false;
  }

  /**
   * Remove a refresh token from the database (logout)
   * @param refreshToken - The refresh token to remove
   */
  async removeRefreshToken(refreshToken: string): Promise<void> {
    const { data, error: fetchError } = await this.supabaseService
      .getClient()
      .from('refresh_tokens')
      .select('id, token_hash');

    if (fetchError) {
      throw new InternalServerErrorException(`Failed to fetch refresh tokens: ${fetchError.message}`);
    }

    if (!data || data.length === 0) return;

    for (const row of data) {
      const match = await bcrypt.compare(refreshToken, row.token_hash);
      if (match) {
        const { error } = await this.supabaseService
          .getClient()
          .from('refresh_tokens')
          .delete()
          .eq('id', row.id);

        if (error) {
          throw new InternalServerErrorException(`Failed to remove refresh token: ${error.message}`);
        }
        return;
      }
    }
  }

  /**
   * Hash a token (for storage comparison)
   * @param token - The token to hash
   * @returns The hashed token
   */
  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }
}