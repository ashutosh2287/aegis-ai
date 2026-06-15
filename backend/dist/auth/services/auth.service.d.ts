import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserProfile } from '../interfaces/auth.interface';
import { TokenService } from './token.service';
import { OAuthService } from './oauth.service';
import { ProfileService } from './profile.service';
import { PasswordService } from './password.service';
export declare class AuthService {
    private readonly tokenService;
    private readonly oauthService;
    private readonly profileService;
    private readonly passwordService;
    constructor(tokenService: TokenService, oauthService: OAuthService, profileService: ProfileService, passwordService: PasswordService);
    signup(signupDto: SignupDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    requestPasswordReset(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<UserProfile>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfile>;
    initiateGoogleLogin(): Promise<{
        url: string;
    }>;
    handleGoogleCallback(code: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
        };
    }>;
}
