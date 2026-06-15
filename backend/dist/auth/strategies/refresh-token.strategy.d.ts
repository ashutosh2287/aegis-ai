import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
declare const RefreshTokenStrategy_base: new (...args: any[]) => Strategy;
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private readonly configService;
    private readonly supabaseService;
    constructor(configService: ConfigService, supabaseService: SupabaseService);
    validate(req: any): Promise<any>;
}
export {};
