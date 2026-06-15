import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly jwtService;
    private readonly supabaseService;
    constructor(configService: ConfigService, jwtService: JwtService, supabaseService: SupabaseService);
    validate(payload: any): Promise<any>;
}
export {};
