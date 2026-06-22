import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';
import { AiChatDto } from './dto/ai-chat.dto';
import { WorkoutRequestDto } from './dto/workout-request.dto';
import { NutritionRequestDto } from './dto/nutrition-request.dto';
import { AnalysisRequestDto } from './dto/analysis-request.dto';

@ApiTags('ai')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chat with AI fitness coach' })
  @ApiResponse({
    status: 200,
    description: 'AI response generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Based on your profile...' },
        metadata: {
          type: 'object',
          properties: {
            provider: { type: 'string' },
            usage: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async chat(@Req() req: Request, @Body() dto: AiChatDto) {
    const user = req.user as any;
    return this.aiService.chat(user.id, dto);
  }

  @Post('workout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate personalized workout plan' })
  @ApiResponse({
    status: 200,
    description: 'Workout plan generated successfully',
    schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        weeklySplit: { type: 'object' },
        notes: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateWorkout(@Req() req: Request, @Body() dto: WorkoutRequestDto) {
    const user = req.user as any;
    return this.aiService.generateWorkout(user.id, dto);
  }

  @Post('nutrition')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate personalized nutrition plan' })
  @ApiResponse({
    status: 200,
    description: 'Nutrition plan generated successfully',
    schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        dailyCalories: { type: 'number' },
        goalCalories: { type: 'number' },
        macros: { type: 'object' },
        mealPlan: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateNutrition(@Req() req: Request, @Body() dto: NutritionRequestDto) {
    const user = req.user as any;
    return this.aiService.generateNutrition(user.id, dto);
  }

  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze fitness progress' })
  @ApiResponse({
    status: 200,
    description: 'Progress analysis generated successfully',
    schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        workoutConsistency: { type: 'string' },
        volumeProgression: { type: 'string' },
        strengthProgression: { type: 'string' },
        goalProgress: { type: 'string' },
        issues: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
        nextActions: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async analyzeProgress(@Req() req: Request, @Body() dto: AnalysisRequestDto) {
    const user = req.user as any;
    return this.aiService.analyzeProgress(user.id, dto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Check AI service health' })
  @ApiResponse({
    status: 200,
    description: 'Health status returned',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        provider: { type: 'string', example: 'openai' },
        model: { type: 'string', example: 'gpt-4o-mini' },
      },
    },
  })
  async healthCheck() {
    return this.aiService.healthCheck();
  }
}
