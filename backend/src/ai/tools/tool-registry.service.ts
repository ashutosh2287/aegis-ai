import { Injectable, Logger } from '@nestjs/common';
import { ProfileTool } from './profile.tool';
import { WorkoutTool } from './workout.tool';
import { ExerciseTool } from './exercise.tool';
import { AnalyticsTool } from './analytics.tool';
import { NutritionTool } from './nutrition.tool';
import { AIToolDefinition } from '../interfaces/ai-provider.interface';

export interface ToolExecutionResult {
  toolCallId: string;
  name: string;
  content: string;
  latencyMs: number;
}

@Injectable()
export class ToolRegistry {
  private readonly logger = new Logger(ToolRegistry.name);

  constructor(
    private readonly profileTool: ProfileTool,
    private readonly workoutTool: WorkoutTool,
    private readonly exerciseTool: ExerciseTool,
    private readonly analyticsTool: AnalyticsTool,
    private readonly nutritionTool: NutritionTool,
  ) {}

  getToolDefinitions(): AIToolDefinition[] {
    return [
      {
        type: 'function',
        function: {
          name: 'getUserProfile',
          description: 'Retrieve the user fitness profile including age, gender, height, weight, goals, experience level, and available equipment.',
          parameters: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'The unique user ID',
              },
            },
            required: ['userId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getWorkoutHistory',
          description: 'Retrieve the user workout history including recent sessions, training frequency, and volume metrics from the past 30 days.',
          parameters: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'The unique user ID',
              },
            },
            required: ['userId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getExerciseLibrary',
          description: 'Retrieve the full exercise library with muscle groups, equipment needed, movement patterns, and difficulty levels.',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getAnalytics',
          description: 'Retrieve user analytics including strength trends, volume trends, and consistency metrics.',
          parameters: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'The unique user ID',
              },
            },
            required: ['userId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getNutritionContext',
          description: 'Retrieve nutrition context including BMR, TDEE, goal calories, and macro breakdown based on user profile.',
          parameters: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'The unique user ID',
              },
              activityLevel: {
                type: 'string',
                description: 'Activity level override (sedentary, light, moderate, active, very_active)',
                enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
              },
              dietaryPreference: {
                type: 'string',
                description: 'Dietary preference (vegetarian, non_vegetarian)',
                enum: ['vegetarian', 'non_vegetarian'],
              },
            },
            required: ['userId'],
          },
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    let content: string;

    try {
      console.log(`[TOOL-EXEC] Dispatching tool=${toolName}, args.userId=${args.userId}`);
      content = await this.dispatchTool(toolName, args);
      console.log(`[TOOL-EXEC] tool=${toolName} completed, contentLength=${content.length}`);
    } catch (error) {
      this.logger.error(`Tool ${toolName} execution failed: ${(error as Error).message}`);
      content = JSON.stringify({ error: (error as Error).message });
    }

    const latencyMs = Date.now() - startTime;
    this.logger.debug(`Tool ${toolName} executed in ${latencyMs}ms`);

    return {
      toolCallId: '',
      name: toolName,
      content,
      latencyMs,
    };
  }

  private async dispatchTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    switch (toolName) {
      case 'getUserProfile': {
        const result = await this.profileTool.getUserProfile(args.userId as string);
        return JSON.stringify(result);
      }
      case 'getWorkoutHistory': {
        const result = await this.workoutTool.getWorkoutHistory(args.userId as string);
        return JSON.stringify(result);
      }
      case 'getExerciseLibrary': {
        const result = await this.exerciseTool.getExerciseLibrary();
        return JSON.stringify(result);
      }
      case 'getAnalytics': {
        const result = await this.analyticsTool.getAnalytics(args.userId as string);
        return JSON.stringify(result);
      }
      case 'getNutritionContext': {
        const result = await this.nutritionTool.getNutritionContext(
          args.userId as string,
          args.activityLevel as string | undefined,
          args.dietaryPreference as string | undefined,
        );
        return JSON.stringify(result);
      }
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
