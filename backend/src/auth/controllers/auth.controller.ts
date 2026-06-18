import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Patch,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  Res,
} from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { SignupDto } from "../dto/signup.dto";
import { LoginDto } from "../dto/login.dto";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RefreshTokenGuard } from "../guards/refresh-token.guard";
import { Request } from "express";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "User signup" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "User logged in successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "New access token issued" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "User logout" })
  @ApiResponse({ status: 200, description: "User logged out successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({ status: 200, description: "Reset email sent" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async requestPasswordReset(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.requestPasswordReset(resetPasswordDto);
  }

  @Get("google")
  @ApiOperation({ summary: "Initiate Google OAuth" })
  @ApiResponse({ status: 302, description: "Redirect to Google" })
  async googleLogin(@Res() res: Response) {
    const { url } = await this.authService.initiateGoogleLogin();
    // Redirect the user to the Google OAuth URL
    return res.redirect(url);
  }

  @Get("google/callback")
  @ApiOperation({ summary: "Google OAuth callback" })
  @ApiResponse({ status: 200, description: "Google login successful" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async googleCallback(@Req() req: Request) {
    const { code } = req.query;
    if (!code) {
      throw new NotFoundException("Code not found");
    }

    const result = await this.authService.handleGoogleCallback(String(code));

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getProfile(@Req() req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.authService.getProfile(user.id);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({ status: 200, description: "User profile updated" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.authService.updateProfile(user.id, updateProfileDto);
  }
}
