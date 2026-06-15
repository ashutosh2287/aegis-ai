import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
type SupabaseClient = any;
export declare class SupabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly supabaseClient;
    private readonly configService;
    private readonly logger;
    constructor(supabaseClient: SupabaseClient, configService: ConfigService, logger: Logger);
    onModuleInit(): void;
    onModuleDestroy(): void;
    getClient(): SupabaseClient;
    realtime(tableName: string, callback: (payload: {
        timestamp: string;
        eventType: string;
        schema: string;
        table: string;
        commit: {
            timestamp: string;
        };
        old: Record<string, any> | null;
        new: Record<string, any> | null;
    }) => void): any;
    getSupabaseUrl(): string;
    getSupabaseAnonKey(): string;
}
export {};
