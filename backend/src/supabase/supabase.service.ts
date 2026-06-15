import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

// Supabase client type - using any to avoid importing heavy types in foundation
// In implementation, you can create a more specific type if needed
type SupabaseClient = any;

@Injectable()
export class SupabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabaseClient: SupabaseClient,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  onModuleInit() {
    this.logger.log('Supabase client initialized');
  }

  onModuleDestroy() {
    this.logger.log('Supabase client destroyed');
  }

  /**
   * Get the Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  /**
   * Set up a real-time subscription for a table
   * @param tableName - Name of the table to listen to
   * @param callback - Function to call when changes occur
   * @returns Subscription object that can be used to unsubscribe
   */
  realtime(tableName: string, callback: (payload: { timestamp: string; eventType: string; schema: string; table: string; commit: { timestamp: string }; old: Record<string, any> | null; new: Record<string, any> | null }) => void) {
    return this.supabaseClient
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        callback,
      )
      .subscribe();
  }

  /**
   * Get the Supabase URL (for client-side usage if needed)
   */
  getSupabaseUrl(): string {
    const url = this.configService.get<string>('SUPABASE_URL');
    if (!url) {
      throw new Error('SUPABASE_URL is not defined');
    }
    return url;
  }

  /**
   * Get the Supabase anon key (for client-side usage if needed)
   */
  getSupabaseAnonKey(): string {
    const key = this.configService.get<string>('SUPABASE_ANON_KEY');
    if (!key) {
      throw new Error('SUPABASE_ANON_KEY is not defined');
    }
    return key;
  }
}