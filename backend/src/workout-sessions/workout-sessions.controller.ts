import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Request,
  Query,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkoutSessionsService } from './workout-sessions.service';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { GetWorkoutSessionsDto } from './dto/get-workout-sessions.dto';
import { WorkoutSessionResponse } from './interfaces/workout-session.interface';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller('sessions')
@ApiTags('workout-sessions')
export class WorkoutSessionsController {
  constructor(private readonly workoutSessionsService: WorkoutSessionsService) {}

  // POST /sessions
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new workout session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout not found' })
  @ApiResponse({ status: 409, description: 'Conflict - user already has an active session' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async createSession(
    @Body() dto: CreateWorkoutSessionDto,
    @Req() req: Request,
  ): Promise<WorkoutSessionResponse> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSessionsService.createSession(userId, dto.workoutId, dto);
  }

  // GET /sessions
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user sessions with filtering, pagination, and sorting' })
  @ApiResponse({ status: 200, description: 'Return a list of sessions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getSessions(
    @Req() req: Request,
    @Query() dto: GetWorkoutSessionsDto,
  ): Promise<{ sessions: WorkoutSessionResponse[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSessionsService.getSessions(userId, dto);
  }

  // GET /sessions/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiResponse({ status: 200, description: 'Return the session details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getSessionById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<WorkoutSessionResponse> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSessionsService.getSessionById(userId, id);
  }

  // GET /sessions/active
  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the active session for the user' })
  @ApiResponse({ status: 200, description: 'Return the active session or null' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getActiveSession(
    @Req() req: Request,
  ): Promise<WorkoutSessionResponse | null> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSessionsService.getActiveSession(userId);
  }

  // GET /sessions/history
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get historical sessions for the user' })
  @ApiResponse({ status: 200, description: 'Return a list of historical sessions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getHistorySessions(
    @Req() req: Request,
    @Query() dto: GetWorkoutSessionsDto,
  ): Promise<{ sessions: WorkoutSessionResponse[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSessionsService.getHistorySessions(userId, dto);
  }

  // PATCH /sessions/:id/complete
  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Complete a session' })
  @ApiResponse({ status: 200, description: 'Session completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 409, description: 'Conflict - session is not active' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async completeSession(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<WorkoutSessionResponse> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSessionsService.completeSession(userId, id);
  }

  // PATCH /sessions/:id/abandon
  @Patch(':id/abandon')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Abandon a session' })
  @ApiResponse({ status: 200, description: 'Session abandoned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 409, description: 'Conflict - session is not active' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async abandonSession(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<WorkoutSessionResponse> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSessionsService.abandonSession(userId, id);
  }

  // DELETE /sessions/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a session' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async deleteSession(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    await this.workoutSessionsService.deleteSession(userId, id);
    return { message: 'Session deleted successfully' };
  }
}