import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { DashboardService } from './dashboard.service';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { OverviewQueryDto } from './dto/overview-query.dto';
import { ComparativeQueryDto } from './dto/comparative-query.dto';
import { ComparativeAnalyticsResponseDto } from './dto/comparative-analytics-response.dto';
import { PlateauDetectionResponseDto } from './dto/plateau-detection-response.dto';
import { GoalProjectionService } from './services/goal-projection.service';
import { GoalRecommendationEngine } from './services/goal-recommendation-engine';
import { StrengthProjectionDto } from './dto/strength-projection.dto';
import { VolumeProjectionDto } from './dto/volume-projection.dto';
import { FrequencyProjectionDto } from './dto/frequency-projection.dto';
import { GoalAchievementEstimateDto } from './dto/goal-achievement-estimate.dto';
import { ForecastRecommendationDto } from './dto/forecast-recommendation.dto';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';

@Controller('analytics')
@ApiTags('Analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly dashboardService: DashboardService,
    private readonly recommendationService: RecommendationService,
    private readonly goalProjectionService: GoalProjectionService,
    private readonly goalRecommendationEngine: GoalRecommendationEngine,
  ) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get analytics dashboard' })
  @ApiResponse({ status: 200, description: 'Return analytics dashboard data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.dashboardService.getDashboardData(user.id);
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get analytics overview' })
  @ApiResponse({ status: 200, description: 'Return analytics overview data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getOverview(@Req() req: AuthenticatedRequest, @Query() query: OverviewQueryDto) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getOverview(user.id, query);
  }

  @Get('volume/week')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get weekly volume analytics' })
  @ApiResponse({ status: 200, description: 'Return weekly volume data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getWeeklyVolume(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getWeeklyVolume(user.id);
  }

  @Get('volume/month')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get monthly volume analytics' })
  @ApiResponse({ status: 200, description: 'Return monthly volume data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getMonthlyVolume(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getMonthlyVolume(user.id);
  }

  @Get('exercise/:id/volume')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get volume analytics for specific exercise' })
  @ApiResponse({ status: 200, description: 'Return exercise volume data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getExerciseVolume(@Param('id') exerciseId: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getExerciseVolume(user.id, exerciseId);
  }

  @Get('session/:id/volume')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get volume analytics for specific session' })
  @ApiResponse({ status: 200, description: 'Return session volume data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getSessionVolume(@Param('id') sessionId: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getSessionVolume(sessionId, user.id);
  }

  @Get('exercise/:id/progression')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get progression analytics for specific exercise' })
  @ApiResponse({ status: 200, description: 'Return exercise progression data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getExerciseProgression(@Param('id') exerciseId: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getExerciseProgression(user.id, exerciseId);
  }

  @Get('exercise/:id/trend')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get strength trend history for specific exercise' })
  @ApiResponse({ status: 200, description: 'Return strength trend history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getExerciseTrend(@Param('id') exerciseId: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getStrengthTrend(user.id, exerciseId);
  }

  @Get('exercise/:id/prs')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get personal records for specific exercise' })
  @ApiResponse({ status: 200, description: 'Return personal records for the exercise' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getExercisePersonalRecords(@Param('id') exerciseId: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getExercisePersonalRecords(user.id, exerciseId);
  }

  @Get('prs')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get personal records' })
  @ApiResponse({ status: 200, description: 'Return personal records data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getPersonalRecords(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getPersonalRecords(user.id);
  }

  @Get('consistency')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get workout consistency analytics' })
  @ApiResponse({ status: 200, description: 'Return workout consistency data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getWorkoutConsistency(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getWorkoutConsistency(user.id);
  }

  @Get('comparative')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get comparative analytics' })
  @ApiResponse({ status: 200, description: 'Return comparative analytics data', type: ComparativeAnalyticsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getComparativeAnalytics(@Req() req: AuthenticatedRequest): Promise<ComparativeAnalyticsResponseDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getComparativeAnalytics(user.id);
  }

  @Get('plateau-detection')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get plateau detection analytics' })
  @ApiResponse({ status: 200, description: 'Return plateau detection data', type: PlateauDetectionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getPlateauDetection(@Req() req: AuthenticatedRequest, @Query('periodDays') periodDays?: number) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.analyticsService.getPlateauDetection(user.id, periodDays);
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get personalized recommendations' })
  @ApiResponse({ status: 200, description: 'Return personalized recommendations', type: [RecommendationResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getRecommendations(@Req() req: AuthenticatedRequest): Promise<RecommendationResponseDto[]> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.recommendationService.generateRecommendations(user.id);
  };

  // NEW METHODS START
  @Get('projection/strength')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get strength projection' })
  @ApiResponse({ status: 200, description: 'Return strength projection', type: StrengthProjectionDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getStrengthProjection(@Req() req: AuthenticatedRequest): Promise<StrengthProjectionDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.goalProjectionService.getStrengthProjection(user.id);
  }

  @Get('projection/volume')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get volume projection' })
  @ApiResponse({ status: 200, description: 'Return volume projection', type: VolumeProjectionDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getVolumeProjection(@Req() req: AuthenticatedRequest): Promise<VolumeProjectionDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.goalProjectionService.getVolumeProjection(user.id);
  }

  @Get('projection/frequency')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get frequency projection' })
  @ApiResponse({ status: 200, description: 'Return frequency projection', type: FrequencyProjectionDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getFrequencyProjection(@Req() req: AuthenticatedRequest): Promise<FrequencyProjectionDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.goalProjectionService.getFrequencyProjection(user.id);
  }

  @Get('projection/goal-achievement')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Estimate goal achievement date' })
  @ApiResponse({ status: 200, description: 'Return goal achievement estimate', type: GoalAchievementEstimateDto })
  @ApiResponse({ status: 400, description: 'Bad request - missing or invalid parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getGoalAchievementEstimate(
    @Req() req: AuthenticatedRequest,
    @Query('goalType') goalType: 'strength' | 'volume' | 'frequency',
    @Query('targetValue') targetValue: number,
    @Query('currentValue') currentValue: number,
    @Query('weeklyProgress') weeklyProgress: number,
  ): Promise<GoalAchievementEstimateDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate parameters
    if (!goalType || targetValue === undefined || currentValue === undefined || weeklyProgress === undefined) {
      throw new BadRequestException('Missing required parameters: goalType, targetValue, currentValue, weeklyProgress');
    }

    // Validate goalType
    if (!['strength', 'volume', 'frequency'].includes(goalType)) {
      throw new BadRequestException('Invalid goalType. Must be one of: strength, volume, frequency');
    }

    return this.goalProjectionService.estimateGoalAchievement(
      user.id,
      goalType,
      targetValue,
      currentValue,
      weeklyProgress,
    );
  }

  @Get('projection/recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get goal-based recommendations' })
  @ApiResponse({ status: 200, description: 'Return goal-based recommendations', type: [ForecastRecommendationDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getProjectionRecommendations(@Req() req: AuthenticatedRequest): Promise<ForecastRecommendationDto[]> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.goalRecommendationEngine.generateRecommendations(user.id);
  }
  // NEW METHODS END
}