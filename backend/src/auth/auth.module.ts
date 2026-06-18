import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import { SupabaseModule } from "../supabase/supabase.module";
import { TokenService } from "./services/token.service";
import { OAuthService } from "./services/oauth.service";
import { ProfileService } from "./services/profile.service";
import { PasswordService } from "./services/password.service";

@Module({
  imports: [
    SupabaseModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: config.get<string>("JWT_EXPIRES_IN"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    JwtAuthGuard,
    RefreshTokenGuard,
    TokenService,
    OAuthService,
    ProfileService,
    PasswordService,
  ],
  exports: [AuthService], // In case other modules need it
})
export class AuthModule {}
