import { HealthCheckService } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { Logger } from 'nestjs-pino';
export declare class HealthController {
    private readonly health;
    private readonly configService;
    private readonly supabaseService;
    private readonly logger;
    constructor(health: HealthCheckService, configService: ConfigService, supabaseService: SupabaseService, logger: Logger);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
