import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Sign an access token
   * @param userId - The user's UUID
   * @returns Access token string
   */
  signAccessToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      },
    );
  }

  /**
   * Sign a refresh token
   * @param userId - The user's UUID
   * @returns Refresh token string
   */
  signRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      },
    );
  }

  /**
   * Verify a refresh token and return the payload
   * @param token - The refresh token to verify
   * @returns Promise containing the userId if valid
   * @throws BadRequestException if token is invalid or expired
   */
  async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return { userId: payload.sub };
    } catch (error) {
      throw new BadRequestException('Invalid or expired refresh token');
    }
  }

  /**
   * Decode a token without verification (for debugging)
   * @param token - The token to decode
   * @returns The decoded payload
   */
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }

  /**
   * Validate a user (to be implemented in user module)
   * This is a placeholder for business logic
   * @param email - User's email
   * @param password - User's password
   * @returns User object if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<any> {
    // This would be implemented in the UserService (business module)
    // For now, we throw an error indicating it's not implemented
    throw new Error('User validation not implemented in foundation');
  }
}