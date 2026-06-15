import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
export declare class OAuthService {
    private readonly configService;
    private readonly supabaseService;
    constructor(configService: ConfigService, supabaseService: SupabaseService);
    initiateGoogleLogin(): Promise<{
        url: string;
    }>;
    handleGoogleCallback(code: string): Promise<{
        user: any;
    }>;
}
