import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseService } from "./supabase.service";

@Global()
@Module({
  providers: [
    {
      provide: "SUPABASE_CLIENT",
      useFactory: (configService: ConfigService) => {
        const { createClient } = require("@supabase/supabase-js");
        const supabaseUrl = configService.get<string>("SUPABASE_URL");
        const supabaseServiceRoleKey = configService.get<string>(
          "SUPABASE_SERVICE_ROLE_KEY",
        );
        return createClient(supabaseUrl, supabaseServiceRoleKey);
      },
      inject: [ConfigService],
    },
    SupabaseService,
  ],
  exports: ["SUPABASE_CLIENT", SupabaseService],
})
export class SupabaseModule {}
