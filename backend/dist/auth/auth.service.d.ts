import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly supabaseService;
    constructor(jwtService: JwtService, configService: ConfigService, supabaseService: SupabaseService);
    signAccessToken(userId: string): string;
    signRefreshToken(userId: string): string;
    verifyRefreshToken(token: string): Promise<{
        userId: string;
    }>;
    decodeToken(token: string): any;
    validateUser(email: string, password: string): Promise<any>;
}
