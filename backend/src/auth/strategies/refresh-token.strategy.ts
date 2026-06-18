import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { ConfigService } from "@nestjs/config";
import { SupabaseService } from "../../supabase/supabase.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "refresh-token",
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    super();
  }

  async validate(req: any): Promise<any> {
    // Extract the refresh token from the body
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return null;
    }

    // We need to hash the provided token to compare with the stored hash
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // Look for a matching token hash in the database that is not expired
    const { data, error } = await this.supabaseService
      .getClient()
      .from("refresh_tokens")
      .select("user_id, expires_at")
      .eq("token_hash", tokenHash)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // Return the user ID (we'll attach it to the request)
    return { userId: data.user_id };
  }
}
