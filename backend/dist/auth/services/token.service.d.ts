import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
export declare class TokenService {
    readonly jwtService: JwtService;
    readonly configService: ConfigService;
    readonly supabaseService: SupabaseService;
    constructor(jwtService: JwtService, configService: ConfigService, supabaseService: SupabaseService);
    signAccessToken(userId: string): string;
    signRefreshToken(userId: string): Promise<string>;
    verifyRefreshToken(token: string): Promise<{
        userId: string;
    }>;
    isValidRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
    removeRefreshToken(refreshToken: string): Promise<void>;
    hashToken(token: string): Promise<string>;
}
