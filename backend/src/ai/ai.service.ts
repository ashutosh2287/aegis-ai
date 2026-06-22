import { Injectable, Logger, Inject } from '@nestjs/common';
import { ToolRegistry } from './tools/tool-registry.service';
import {
  AIProvider,
  AIChatMessage,
  AIToolDefinition,
} from './interfaces/ai-provider.interface';
import { AI_PROVIDER } from './providers/provider.factory';
import {
  COACH_SYSTEM_PROMPT,
  buildCoachMessage,
  buildWorkoutGenerationMessage,
  buildNutritionMessage,
  buildAnalysisMessage,
} from './prompts/coach.prompt';
import { WORKOUT_GENERATION_PROMPT } from './prompts/workout.prompt';
import { NUTRITION_GENERATION_PROMPT } from './prompts/nutrition.prompt';
import { ANALYSIS_PROMPT } from './prompts/analytics.prompt';
import {
  ChatResponse,
  WorkoutPlanResponse,
  NutritionPlanResponse,
  AnalysisResponse,
} from './interfaces/ai-response.interface';
import { AiChatDto } from './dto/ai-chat.dto';
import { WorkoutRequestDto } from './dto/workout-request.dto';
import { NutritionRequestDto } from './dto/nutrition-request.dto';
import { AnalysisRequestDto } from './dto/analysis-request.dto';

const MAX_AGENT_ITERATIONS = 5;

interface AgentIterationLog {
  iteration: number;
  toolCalls: { name: string; latencyMs: number }[];
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  async chat(userId: string, dto: AiChatDto): Promise<ChatResponse> {
    const tools = this.toolRegistry.getToolDefinitions();
    const iterationLogs: AgentIterationLog[] = [];

    const messages: AIChatMessage[] = [
      { role: 'system', content: COACH_SYSTEM_PROMPT },
    ];

    if (dto.history && dto.history.length > 0) {
      for (const msg of dto.history.slice(-10)) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({
      role: 'user',
      content: buildCoachMessage(`User ID: ${userId}`, dto.message),
    });

    const finalContent = await this.runAgentLoop(messages, tools, userId, iterationLogs, 0.7);

    return {
      message: finalContent,
      metadata: {
        provider: this.provider.getName(),
        model: this.provider.getModel(),
        iterations: iterationLogs.length,
        toolCalls: iterationLogs.reduce((sum, log) => sum + log.toolCalls.length, 0),
        totalLatencyMs: iterationLogs.reduce(
          (sum, log) => sum + log.toolCalls.reduce((s, tc) => s + tc.latencyMs, 0),
          0,
        ),
      },
    };
  }

  async generateWorkout(userId: string, dto: WorkoutRequestDto): Promise<WorkoutPlanResponse> {
    const tools = this.toolRegistry.getToolDefinitions();
    const iterationLogs: AgentIterationLog[] = [];

    const messages: AIChatMessage[] = [
      { role: 'system', content: WORKOUT_GENERATION_PROMPT },
      {
        role: 'user',
        content: buildWorkoutGenerationMessage(
          `User ID: ${userId}`,
          '',
          '',
          this.buildWorkoutRequirements(dto, userId),
        ),
      },
    ];

    const finalContent = await this.runAgentLoop(messages, tools, userId, iterationLogs, 0.8);

    try {
      const parsed = JSON.parse(finalContent);
      return {
        summary: parsed.summary || 'Workout plan generated',
        weeklySplit: parsed.weeklySplit || { days: [] },
        notes: parsed.notes || [],
      };
    } catch {
      return {
        summary: finalContent,
        weeklySplit: { days: [] },
        notes: ['AI returned unstructured response. Please try again.'],
      };
    }
  }

  async generateNutrition(userId: string, dto: NutritionRequestDto): Promise<NutritionPlanResponse> {
    const tools = this.toolRegistry.getToolDefinitions();
    const iterationLogs: AgentIterationLog[] = [];

    const messages: AIChatMessage[] = [
      { role: 'system', content: NUTRITION_GENERATION_PROMPT },
      {
        role: 'user',
        content: buildNutritionMessage(
          `User ID: ${userId}`,
          this.buildNutritionRequirements(dto),
        ),
      },
    ];

    const finalContent = await this.runAgentLoop(messages, tools, userId, iterationLogs, 0.7);

    try {
      const parsed = JSON.parse(finalContent);
      return {
        summary: parsed.summary || 'Nutrition plan generated',
        dailyCalories: parsed.dailyCalories || 0,
        goalCalories: parsed.goalCalories || 0,
        macros: parsed.macros || { protein: 0, carbohydrates: 0, fat: 0 },
        mealPlan: parsed.mealPlan || {
          breakfast: { name: '', description: '', calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          lunch: { name: '', description: '', calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          dinner: { name: '', description: '', calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          snacks: { name: '', description: '', calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
        },
      };
    } catch {
      return {
        summary: finalContent,
        dailyCalories: 0,
        goalCalories: 0,
        macros: { protein: 0, carbohydrates: 0, fat: 0 },
        mealPlan: {
          breakfast: { name: '', description: '', calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          lunch: { name: '', description: '', calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          dinner: { name: '', description: '', calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          snacks: { name: '', description: '', calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
        },
      };
    }
  }

  async analyzeProgress(userId: string, dto: AnalysisRequestDto): Promise<AnalysisResponse> {
    const tools = this.toolRegistry.getToolDefinitions();
    const iterationLogs: AgentIterationLog[] = [];
    const period = dto.period || 'month';

    const messages: AIChatMessage[] = [
      { role: 'system', content: ANALYSIS_PROMPT },
      {
        role: 'user',
        content: buildAnalysisMessage(
          `User ID: ${userId}`,
          '',
          '',
          period,
        ),
      },
    ];

    const finalContent = await this.runAgentLoop(messages, tools, userId, iterationLogs, 0.6);

    try {
      const parsed = JSON.parse(finalContent);
      return {
        summary: parsed.summary || 'Analysis complete',
        workoutConsistency: parsed.workoutConsistency || 'No data available',
        volumeProgression: parsed.volumeProgression || 'No data available',
        strengthProgression: parsed.strengthProgression || 'No data available',
        goalProgress: parsed.goalProgress || 'No data available',
        issues: parsed.issues || [],
        recommendations: parsed.recommendations || [],
        nextActions: parsed.nextActions || [],
      };
    } catch {
      return {
        summary: finalContent,
        workoutConsistency: 'Analysis complete',
        volumeProgression: 'Analysis complete',
        strengthProgression: 'Analysis complete',
        goalProgress: 'Analysis complete',
        issues: [],
        recommendations: [],
        nextActions: [],
      };
    }
  }

  async healthCheck(): Promise<{ status: string; provider: string; model: string; error?: string; availableModels?: string[] }> {
    try {
      await this.provider.complete({
        messages: [{ role: 'user', content: 'Say "OK" if you are working.' }],
        maxTokens: 10,
      });

      return {
        status: 'healthy',
        provider: this.provider.getName(),
        model: this.provider.getModel(),
      };
    } catch (error) {
      this.logger.error('AI Health Check Failed', error);

      const isDev = process.env.NODE_ENV !== 'production';
      const availableModels = isDev && this.provider.listModels
        ? await this.provider.listModels()
        : undefined;

      return {
        status: 'unhealthy',
        provider: this.provider.getName(),
        model: this.provider.getModel(),
        ...(isDev && { error: (error as Error).message }),
        ...(availableModels && availableModels.length > 0 && { availableModels }),
      };
    }
  }

  private async runAgentLoop(
    messages: AIChatMessage[],
    tools: AIToolDefinition[],
    userId: string,
    iterationLogs: AgentIterationLog[],
    temperature: number,
  ): Promise<string> {
    for (let iteration = 0; iteration < MAX_AGENT_ITERATIONS; iteration++) {
      const startTime = Date.now();
      const log: AgentIterationLog = {
        iteration: iteration + 1,
        toolCalls: [],
      };

      const response = await this.provider.complete({
        messages,
        temperature,
        tools,
        toolChoice: 'auto',
      });

      if (response.usage) {
        log.tokenUsage = response.usage;
      }

      if (!response.toolCalls || response.toolCalls.length === 0) {
        this.logger.debug(
          `Agent loop completed after ${iteration + 1} iteration(s)`,
        );
        iterationLogs.push(log);
        return response.content || '';
      }

      messages.push({
        role: 'assistant',
        content: response.content,
        tool_calls: response.toolCalls,
      });

      for (const toolCall of response.toolCalls) {
        const args = JSON.parse(toolCall.function.arguments);
        if (!args.userId) args.userId = userId;

        const result = await this.toolRegistry.executeTool(
          toolCall.function.name,
          args,
        );

        log.toolCalls.push({
          name: toolCall.function.name,
          latencyMs: result.latencyMs,
        });

        messages.push({
          role: 'tool',
          content: result.content,
          tool_call_id: toolCall.id,
        });
      }

      iterationLogs.push(log);

      this.logger.debug(
        `Agent iteration ${iteration + 1}: ${log.toolCalls.length} tool call(s), ${log.tokenUsage?.totalTokens || 0} tokens`,
      );
    }

    this.logger.warn(
      `Agent loop hit max iterations (${MAX_AGENT_ITERATIONS}). Forcing final completion.`,
    );

    messages.push({
      role: 'user',
      content: 'Please provide your final answer now based on the information you have gathered.',
    });

    const finalResponse = await this.provider.complete({
      messages,
      temperature,
      tools,
      toolChoice: 'none',
    });

    return finalResponse.content || '';
  }

  private buildWorkoutRequirements(dto: WorkoutRequestDto, userId: string): string {
    const parts: string[] = [];

    if (dto.goal) parts.push(`Goal: ${dto.goal}`);
    if (dto.daysPerWeek) parts.push(`Days per week: ${dto.daysPerWeek}`);
    if (dto.focusAreas?.length) parts.push(`Focus areas: ${dto.focusAreas.join(', ')}`);
    if (dto.notes) parts.push(`Notes: ${dto.notes}`);
    if (dto.durationMinutes) parts.push(`Target duration: ${dto.durationMinutes} minutes per session`);
    parts.push(`User ID: ${userId}`);

    return parts.join('\n') || 'No specific requirements';
  }

  private buildNutritionRequirements(dto: NutritionRequestDto): string {
    const parts: string[] = [];

    if (dto.dietaryPreference) parts.push(`Dietary preference: ${dto.dietaryPreference}`);
    if (dto.activityLevel) parts.push(`Activity level: ${dto.activityLevel}`);
    if (dto.restrictions) parts.push(`Restrictions: ${dto.restrictions}`);
    if (dto.mealsPerDay) parts.push(`Meals per day: ${dto.mealsPerDay}`);

    return parts.join('\n') || 'No specific requirements';
  }
}
