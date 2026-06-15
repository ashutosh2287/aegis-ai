import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Request } from 'express';
import { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    logout(refreshTokenDto: RefreshTokenDto): Promise<void>;
    requestPasswordReset(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    googleLogin(res: Response): Promise<void>;
    googleCallback(req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
        };
    }>;
    getProfile(req: Request): Promise<import("..").UserProfile>;
    updateProfile(updateProfileDto: UpdateProfileDto, req: Request): Promise<import("..").UserProfile>;
}
