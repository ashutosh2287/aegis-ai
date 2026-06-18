import {
  Controller,
  UnauthorizedException,
  Get,
  Param,
  UseGuards,
  Req,
  Request,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from "@nestjs/swagger";
import { DashboardResponseDto } from "./dto/dashboard-response.dto";

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

@Controller("analytics")
@ApiTags("Analytics")
export class AnalyticsController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get("dashboard")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get analytics dashboard" })
  @ApiOkResponse({ type: DashboardResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getDashboard(@Req() req: Request): Promise<DashboardResponseDto> {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.dashboardService.getDashboard(user.id);
  }

  @Get("volume/week")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get weekly volume analytics" })
  @ApiResponse({ status: 200, description: "Return weekly volume data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getWeeklyVolume(@Req() req: Request) {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.analyticsService.getWeeklyVolume(user.id);
  }

  @Get("volume/month")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get monthly volume analytics" })
  @ApiResponse({ status: 200, description: "Return monthly volume data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getMonthlyVolume(@Req() req: Request) {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.analyticsService.getMonthlyVolume(user.id);
  }

  @Get("exercise/:id/volume")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get volume analytics for specific exercise" })
  @ApiResponse({ status: 200, description: "Return exercise volume data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Exercise not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getExerciseVolume(
    @Param("id") exerciseId: string,
    @Req() req: Request,
  ) {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.analyticsService.getExerciseVolume(user.id, exerciseId);
  }

  @Get("session/:id/volume")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get volume analytics for specific session" })
  @ApiResponse({ status: 200, description: "Return session volume data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Session not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getSessionVolume(@Param("id") sessionId: string, @Req() req: Request) {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.analyticsService.getSessionVolume(sessionId, user.id);
  }

  @Get("exercise/:id/progression")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get progression analytics for specific exercise" })
  @ApiResponse({ status: 200, description: "Return exercise progression data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Exercise not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getExerciseProgression(
    @Param("id") exerciseId: string,
    @Req() req: Request,
  ) {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.analyticsService.getExerciseProgression(user.id, exerciseId);
  }

  @Get("exercise/:id/trend")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get strength trend history for specific exercise" })
  @ApiResponse({ status: 200, description: "Return strength trend history" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Exercise not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getExerciseTrend(@Param("id") exerciseId: string, @Req() req: Request) {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.analyticsService.getStrengthTrend(user.id, exerciseId);
  }

  @Get("exercise/:id/prs")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get personal records for specific exercise" })
  @ApiResponse({
    status: 200,
    description: "Return personal records for the exercise",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Exercise not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getExercisePersonalRecords(
    @Param("id") exerciseId: string,
    @Req() req: Request,
  ) {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.analyticsService.getExercisePersonalRecords(
      user.id,
      exerciseId,
    );
  }

  @Get("prs")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get personal records" })
  @ApiResponse({ status: 200, description: "Return personal records data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getPersonalRecords(@Req() req: Request) {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.analyticsService.getPersonalRecords(user.id);
  }

  @Get("consistency")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get workout consistency analytics" })
  @ApiResponse({ status: 200, description: "Return workout consistency data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiBearerAuth()
  async getWorkoutConsistency(@Req() req: Request) {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return this.analyticsService.getWorkoutConsistency(user.id);
  }
}
