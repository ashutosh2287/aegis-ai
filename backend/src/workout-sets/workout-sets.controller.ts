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
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkoutSetsService } from './workout-sets.service';
import { CreateWorkoutSetDto } from './dto/create-workout-set.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { ReorderWorkoutSetsDto } from './dto/reorder-workout-sets.dto';
import { WorkoutSet } from './interfaces/workout-set.interface';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller('workout-exercises/:id/sets')
@ApiTags('workout-sets')
export class WorkoutSetsController {
  constructor(private readonly workoutSetsService: WorkoutSetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a set for a workout exercise' })
  @ApiResponse({ status: 201, description: 'Set created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async createSet(
    @Param('id') workoutExerciseId: string,
    @Body() dto: CreateWorkoutSetDto,
    @Req() req: Request,
  ): Promise<WorkoutSet> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSetsService.createSet(workoutExerciseId, userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all sets for a workout exercise' })
  @ApiResponse({ status: 200, description: 'Return a list of workout sets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getWorkoutSets(
    @Param('id') workoutExerciseId: string,
    @Req() req: Request,
  ): Promise<WorkoutSet[]> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSetsService.getWorkoutSets(workoutExerciseId, userId);
  }

  @Patch(':setId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a set' })
  @ApiResponse({ status: 200, description: 'Set updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout exercise or set not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async updateSet(
    @Param('id') workoutExerciseId: string,
    @Param('setId') setId: string,
    @Body() dto: UpdateWorkoutSetDto,
    @Req() req: Request,
  ): Promise<WorkoutSet> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutSetsService.updateSet(workoutExerciseId, userId, setId, dto);
  }

  @Delete(':setId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a set' })
  @ApiResponse({ status: 200, description: 'Set deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout exercise or set not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async deleteSet(
    @Param('id') workoutExerciseId: string,
    @Param('setId') setId: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    await this.workoutSetsService.deleteSet(workoutExerciseId, userId, setId);
    return { message: 'Set deleted successfully' };
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reorder sets for a workout exercise' })
  @ApiResponse({ status: 200, description: 'Sets reordered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async reorderSets(
    @Param('id') workoutExerciseId: string,
    @Body() dto: ReorderWorkoutSetsDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    await this.workoutSetsService.reorderSets(workoutExerciseId, userId, dto);
    return { message: 'Sets reordered successfully' };
  }
}