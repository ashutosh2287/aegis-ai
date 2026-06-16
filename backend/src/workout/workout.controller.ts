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
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutResponseDto } from './dto/workout-response.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller('workout')
@ApiTags('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workouts for the user' })
  @ApiResponse({ status: 200, description: 'Return a list of workouts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWorkouts(@Req() req: Request): Promise<WorkoutResponseDto[]> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    const workouts = await this.workoutService.findAll(userId);
    // Map to response DTO (without exercises and sets for list endpoint)
    return workouts.map(workout => ({
      id: workout.id,
      userId: workout.userId,
      name: workout.name,
      description: workout.description === null ? undefined : workout.description,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
      deletedAt: workout.deletedAt === null ? undefined : workout.deletedAt,
      exercises: [],
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workout by ID' })
  @ApiResponse({ status: 200, description: 'Return the workout details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWorkoutById(@Param('id') id: string, @Req() req: Request): Promise<WorkoutResponseDto> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    const workoutWithExercises = await this.workoutService.findOne(id, userId) as any;
    // Map to response DTO
    return {
      id: workoutWithExercises.id,
      userId: workoutWithExercises.userId,
      name: workoutWithExercises.name,
      description: workoutWithExercises.description === null ? undefined : workoutWithExercises.description,
      createdAt: workoutWithExercises.createdAt,
      updatedAt: workoutWithExercises.updatedAt,
      deletedAt: workoutWithExercises.deletedAt === null ? undefined : workoutWithExercises.deletedAt,
      exercises: workoutWithExercises.exercises.map((exercise: any) => ({
        id: exercise.id,
        workoutId: exercise.workoutId,
        exerciseId: exercise.exerciseId,
        createdAt: exercise.createdAt,
        sets: exercise.sets.map((set: any) => ({
  id: set.id,
  workoutExerciseId: set.workoutExerciseId,
  setNumber: set.setNumber,
  reps: set.reps,
  weight: set.weight === null ? undefined : set.weight,
  rpe: set.rpe === null ? undefined : set.rpe,
  notes: set.notes === null ? undefined : set.notes,
  createdAt: set.createdAt,
})),
      })),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new workout' })
  @ApiResponse({ status: 201, description: 'Workout created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createWorkout(
    @Body() createWorkoutDto: CreateWorkoutDto,
    @Req() req: Request,
  ): Promise<WorkoutResponseDto> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    const workoutWithExercises = await this.workoutService.create(userId, createWorkoutDto) as any;
    // Map to response DTO
    return {
      id: workoutWithExercises.id,
      userId: workoutWithExercises.userId,
      name: workoutWithExercises.name,
      description: workoutWithExercises.description === null ? undefined : workoutWithExercises.description,
      createdAt: workoutWithExercises.createdAt,
      updatedAt: workoutWithExercises.updatedAt,
      deletedAt: workoutWithExercises.deletedAt === null ? undefined : workoutWithExercises.deletedAt,
      exercises: workoutWithExercises.exercises.map((exercise: any) => ({
        id: exercise.id,
        workoutId: exercise.workoutId,
        exerciseId: exercise.exerciseId,
        createdAt: exercise.createdAt,
        sets: exercise.sets.map((set: any) => ({
          id: set.id,
          workoutExerciseId: set.workoutExerciseId,
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight === null ? undefined : set.weight,
          rpe: set.rpe === null ? undefined : set.rpe,
notes: set.notes === null ? undefined : set.notes,
          createdAt: set.createdAt,
        })),
      })),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an existing workout' })
  @ApiResponse({ status: 200, description: 'Workout updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateWorkout(
    @Param('id') id: string,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
    @Req() req: Request,
  ): Promise<WorkoutResponseDto> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    const workoutWithExercises = await this.workoutService.update(id, userId, updateWorkoutDto) as any;
    // Map to response DTO
    return {
      id: workoutWithExercises.id,
      userId: workoutWithExercises.userId,
      name: workoutWithExercises.name,
      description: workoutWithExercises.description === null ? undefined : workoutWithExercises.description,
      createdAt: workoutWithExercises.createdAt,
      updatedAt: workoutWithExercises.updatedAt,
      deletedAt: workoutWithExercises.deletedAt === null ? undefined : workoutWithExercises.deletedAt,
      exercises: workoutWithExercises.exercises.map((exercise: any) => ({
        id: exercise.id,
        workoutId: exercise.workoutId,
        exerciseId: exercise.exerciseId,
        createdAt: exercise.createdAt,
        sets: exercise.sets.map((set: any) => ({
          id: set.id,
          workoutExerciseId: set.workoutExerciseId,
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight === null ? undefined : set.weight,
          rpe: set.rpe === null ? undefined : set.rpe,
          notes: set.notes === null ? undefined : set.notes,
          createdAt: set.createdAt,
        })),
      })),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a workout' })
  @ApiResponse({ status: 200, description: 'Workout deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteWorkout(@Param('id') id: string, @Req() req: Request): Promise<{ message: string }> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    await this.workoutService.remove(id, userId);
    return { message: 'Workout deleted successfully' };
  }
}