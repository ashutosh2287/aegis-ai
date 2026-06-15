import {
  Controller,
  Get,
  Inject,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { Logger } from 'nestjs-pino';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check Supabase connection by attempting a simple query
      async () => {
        try {
          // We'll try to fetch one row from a table that exists (like profiles)
          // But we don't want to rely on a specific table existing in the foundation.
          // Instead, we can check if the client is initialized and then do a simple query.
          // Since we don't have a specific table for health, we can use the Supabase
          // client to fetch from a table that we know exists in the schema (like profiles).
          // However, in foundation, we don't want to assume business tables exist.
          // We'll instead check if we can connect by making a lightweight request.
          // Supabase JS client doesn't have a ping method, so we'll do a select on a table
          // that we know exists in the public schema (like the profiles table) but limit 0.
          // Alternatively, we can use the Supabase REST endpoint to check the server.
          // Let's do a simple query on the profiles table (which should exist after migration).
          const { data, error } = await this.supabaseService
            .getClient()
            .from('profiles')
            .select('count')
            .limit(1);

          if (error) {
            throw error;
          }
          return { supabase: { status: 'up' } };
        } catch (err) {
          this.logger.error(err, 'Supabase health check failed');
          return { supabase: { status: 'down' } };
        }
      },
      // You can add more health checks here (e.g., disk, memory, etc.)
      // For example, using Terminus' built-in indicators:
      //   ... (if we had TypeORM, but we are using Supabase directly)
      // Since we are not using TypeORM, we skip TypeOrmHealthIndicator
    ]);
  }
}