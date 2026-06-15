import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
export declare class PasswordService {
    private readonly configService;
    private readonly supabaseService;
    constructor(configService: ConfigService, supabaseService: SupabaseService);
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
}
