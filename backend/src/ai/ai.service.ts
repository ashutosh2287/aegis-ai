import { Injectable, Logger, Inject } from '@nestjs/common';
import { ToolRegistry } from './tools/tool-registry.service';
import {
  AIProvider,
  AIChatMessage,
  AIToolDefinition,
} from './interfaces/ai-provider.interface';
import { AI_PROVIDER } from './providers/provider.factory';
import { ModelRouter, EndpointType } from './providers/model-router';
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
import { ProfileTool } from './tools/profile.tool';
import { WorkoutTool } from './tools/workout.tool';
import { ExerciseTool } from './tools/exercise.tool';
import { AnalyticsTool } from './tools/analytics.tool';
import { NutritionTool } from './tools/nutrition.tool';

const MAX_AGENT_ITERATIONS = 5;

function stripJsonMarkdown(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return s.trim();
}

const ENDPOINT_MAX_TOKENS: Record<EndpointType, number> = {
  chat: 2048,
  workout: 512,
  nutrition: 512,
  analysis: 768,
};

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
    private readonly modelRouter: ModelRouter,
    private readonly toolRegistry: ToolRegistry,
    private readonly profileTool: ProfileTool,
    private readonly workoutTool: WorkoutTool,
    private readonly exerciseTool: ExerciseTool,
    private readonly analyticsTool: AnalyticsTool,
    private readonly nutritionTool: NutritionTool,
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

    const finalContent = await this.runAgentLoop(messages, tools, userId, iterationLogs, 0.7, 'chat');

    return {
      message: finalContent,
      metadata: {
        provider: this.provider.getName(),
        model: this.modelRouter.getModelForEndpoint('chat'),
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
    const t0 = Date.now();

    const [profile, workoutHistory, exercises] = await Promise.all([
      this.profileTool.getUserProfile(userId),
      this.workoutTool.getWorkoutHistory(userId),
      this.exerciseTool.getExerciseLibrary(),
    ]);

    const dataFetchMs = Date.now() - t0;

    const filteredExercises = dto.focusAreas?.length
      ? exercises.filter(ex =>
          ex.muscleGroups.some(mg => dto.focusAreas!.some(fa => mg.toLowerCase().includes(fa.toLowerCase())))
        )
      : exercises;

    const userProfileStr = JSON.stringify({
      age: profile.age, gender: profile.gender, weight: profile.weight,
      height: profile.height, goals: profile.goals, experienceLevel: profile.experienceLevel,
      equipment: profile.equipment, primaryGoal: profile.primaryGoal,
    });
    const recentWorkouts = workoutHistory.recentWorkouts.slice(0, 5).map(w => ({
      name: w.name, exercises: w.exercises?.slice(0, 5).map(e => ({
        name: e.exerciseName, sets: e.sets?.length,
      })),
    }));
    const workoutHistoryStr = JSON.stringify({
      trainingFrequency: workoutHistory.trainingFrequency,
      recentWorkouts,
    });
    const exercisesStr = JSON.stringify(filteredExercises.slice(0, 30).map(e => ({
      name: e.name, muscleGroups: e.muscleGroups, equipmentNeeded: e.equipmentNeeded,
      difficulty: e.difficulty,
    })));
    const requirementsStr = this.buildWorkoutRequirements(dto, userId);

    const messages: AIChatMessage[] = [
      { role: 'system', content: WORKOUT_GENERATION_PROMPT },
      {
        role: 'user',
        content: buildWorkoutGenerationMessage(userProfileStr, workoutHistoryStr, exercisesStr, requirementsStr),
      },
    ];

    const promptBuildMs = Date.now() - t0 - dataFetchMs;
    const fullPrompt = messages.map(m => m.content || '').join('\n');
    const promptCharCount = fullPrompt.length;
    const estimatedTokens = Math.ceil(promptCharCount / 4);

    const llmStart = Date.now();
    const response = await this.provider.complete({
      messages,
      temperature: 0.8,
      maxTokens: ENDPOINT_MAX_TOKENS.workout,
      model: this.modelRouter.getModelForEndpoint('workout'),
      tools: [],
      toolChoice: 'none',
    });
    const llmMs = Date.now() - llmStart;
    const totalMs = Date.now() - t0;

    const outputTokens = response.usage?.completionTokens || 0;
    const inputTokens = response.usage?.promptTokens || 0;

    console.log(`[WORKOUT-BENCHMARK] total=${totalMs}ms | dataFetch=${dataFetchMs}ms | promptBuild=${promptBuildMs}ms | llm=${llmMs}ms | promptChars=${promptCharCount} | estTokens=${estimatedTokens} | inputTokens=${inputTokens} | outputTokens=${outputTokens} | profile=${!!profile} | workouts=${workoutHistory.recentWorkouts.length} | exercises=${filteredExercises.length}`);

    const finalContent = response.content || '';
    try {
      const parsed = JSON.parse(stripJsonMarkdown(finalContent));
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
    const t0 = Date.now();

    const [profile, nutritionContext] = await Promise.all([
      this.profileTool.getUserProfile(userId),
      this.nutritionTool.getNutritionContext(userId, dto.activityLevel, dto.dietaryPreference),
    ]);

    const dataFetchMs = Date.now() - t0;

    const userDataStr = JSON.stringify({
      weight: nutritionContext.weight, height: nutritionContext.height,
      age: nutritionContext.age, gender: nutritionContext.gender,
      activityLevel: nutritionContext.activityLevel, goal: nutritionContext.goal,
      dietaryPreference: nutritionContext.dietaryPreference,
    });
    const requirementsStr = this.buildNutritionRequirements(dto);

    const messages: AIChatMessage[] = [
      { role: 'system', content: NUTRITION_GENERATION_PROMPT },
      {
        role: 'user',
        content: buildNutritionMessage(userDataStr, requirementsStr),
      },
    ];

    const promptBuildMs = Date.now() - t0 - dataFetchMs;
    const fullPrompt = messages.map(m => m.content || '').join('\n');
    const promptCharCount = fullPrompt.length;
    const estimatedTokens = Math.ceil(promptCharCount / 4);

    const llmStart = Date.now();
    const response = await this.provider.complete({
      messages,
      temperature: 0.7,
      maxTokens: ENDPOINT_MAX_TOKENS.nutrition,
      model: this.modelRouter.getModelForEndpoint('nutrition'),
      tools: [],
      toolChoice: 'none',
    });
    const llmMs = Date.now() - llmStart;
    const totalMs = Date.now() - t0;

    const outputTokens = response.usage?.completionTokens || 0;
    const inputTokens = response.usage?.promptTokens || 0;

    console.log(`[NUTRITION-BENCHMARK] total=${totalMs}ms | dataFetch=${dataFetchMs}ms | promptBuild=${promptBuildMs}ms | llm=${llmMs}ms | promptChars=${promptCharCount} | estTokens=${estimatedTokens} | inputTokens=${inputTokens} | outputTokens=${outputTokens}`);

    const finalContent = response.content || '';
    try {
      const parsed = JSON.parse(stripJsonMarkdown(finalContent));
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
    const t0 = Date.now();
    const period = dto.period || 'month';

    const [profile, workoutHistory, analytics] = await Promise.all([
      this.profileTool.getUserProfile(userId),
      this.workoutTool.getWorkoutHistory(userId),
      this.analyticsTool.getAnalytics(userId),
    ]);

    const dataFetchMs = Date.now() - t0;

    const profileStr = JSON.stringify({
      age: profile.age, gender: profile.gender, weight: profile.weight,
      goals: profile.goals, experienceLevel: profile.experienceLevel,
      primaryGoal: profile.primaryGoal,
    });
    const workoutHistoryStr = JSON.stringify({
      trainingFrequency: workoutHistory.trainingFrequency,
      totalWorkouts: workoutHistory.volumeMetrics.totalWorkouts,
      weeklyVolume: workoutHistory.volumeMetrics.weeklyVolume,
      recentWorkouts: workoutHistory.recentWorkouts.slice(0, 3).map(w => ({
        name: w.name, totalVolume: w.totalVolume,
      })),
    });
    const analyticsStr = JSON.stringify(analytics);

    const messages: AIChatMessage[] = [
      { role: 'system', content: ANALYSIS_PROMPT },
      {
        role: 'user',
        content: buildAnalysisMessage(profileStr, workoutHistoryStr, analyticsStr, period),
      },
    ];

    const promptBuildMs = Date.now() - t0 - dataFetchMs;
    const fullPrompt = messages.map(m => m.content || '').join('\n');
    const promptCharCount = fullPrompt.length;
    const estimatedTokens = Math.ceil(promptCharCount / 4);

    const llmStart = Date.now();
    const response = await this.provider.complete({
      messages,
      temperature: 0.6,
      maxTokens: ENDPOINT_MAX_TOKENS.analysis,
      model: this.modelRouter.getModelForEndpoint('analysis'),
      tools: [],
      toolChoice: 'none',
    });
    const llmMs = Date.now() - llmStart;
    const totalMs = Date.now() - t0;

    const outputTokens = response.usage?.completionTokens || 0;
    const inputTokens = response.usage?.promptTokens || 0;

    console.log(`[ANALYZE-BENCHMARK] total=${totalMs}ms | dataFetch=${dataFetchMs}ms | promptBuild=${promptBuildMs}ms | llm=${llmMs}ms | promptChars=${promptCharCount} | estTokens=${estimatedTokens} | inputTokens=${inputTokens} | outputTokens=${outputTokens}`);

    const finalContent = response.content || '';
    try {
      const parsed = JSON.parse(stripJsonMarkdown(finalContent));
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
        model: this.modelRouter.getModelForEndpoint('chat'),
      });

      return {
        status: 'healthy',
        provider: this.provider.getName(),
        model: this.modelRouter.getModelForEndpoint('chat'),
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
        model: this.modelRouter.getModelForEndpoint('chat'),
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
    endpoint: EndpointType = 'chat',
  ): Promise<string> {
    for (let iteration = 0; iteration < MAX_AGENT_ITERATIONS; iteration++) {
      const startTime = Date.now();
      const log: AgentIterationLog = {
        iteration: iteration + 1,
        toolCalls: [],
      };

      console.log(`[AGENT-LOOP] iteration=${iteration + 1}, messages=${messages.length}, userId=${userId}`);
      const response = await this.provider.complete({
        messages,
        temperature,
        maxTokens: ENDPOINT_MAX_TOKENS[endpoint],
        model: this.modelRouter.getModelForEndpoint(endpoint),
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
      maxTokens: ENDPOINT_MAX_TOKENS[endpoint],
      model: this.modelRouter.getModelForEndpoint(endpoint),
      tools,
      toolChoice: 'none',
    });

    return finalResponse.content || '';
  }

  async runBenchmark(): Promise<any> {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.AI_MODEL || 'qwen3:8b';

    const testPrompt = 'Generate a simple 3-day workout plan for a beginner. Return JSON.';

    const results: any[] = [];

    for (const think of [false, true]) {
      const t0 = Date.now();
      try {
        const response = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You are a fitness coach. Return JSON only.' },
              { role: 'user', content: testPrompt },
            ],
            stream: false,
            think,
            options: { temperature: 0.7, num_predict: 2048 },
          }),
        });

        const data = await response.json() as any;
        const elapsed = Date.now() - t0;

        results.push({
          thinking: think,
          latencyMs: elapsed,
          promptTokens: data.prompt_eval_count || 0,
          outputTokens: data.eval_count || 0,
          contentLength: (data.message?.content || '').length,
          thinkingLength: (data.message?.thinking || '').length,
          totalDuration: data.total_duration ? Math.round(data.total_duration / 1e6) : null,
          loadDuration: data.load_duration ? Math.round(data.load_duration / 1e6) : null,
          promptEvalDuration: data.prompt_eval_duration ? Math.round(data.prompt_eval_duration / 1e6) : null,
          evalDuration: data.eval_duration ? Math.round(data.eval_duration / 1e6) : null,
        });
      } catch (err) {
        results.push({ thinking: think, error: (err as Error).message });
      }
    }

    return {
      model,
      ollamaUrl,
      testPrompt,
      results,
      recommendation: results.length === 2 && results[0].latencyMs && results[1].latencyMs
        ? results[0].latencyMs < results[1].latencyMs
          ? `Thinking OFF is ${(results[1].latencyMs / results[0].latencyMs).toFixed(1)}x faster. Recommend keeping think: false.`
          : `Thinking ON is ${(results[0].latencyMs / results[1].latencyMs).toFixed(1)}x faster.`
        : 'Insufficient data for recommendation',
    };
  }

  private buildWorkoutRequirements(dto: WorkoutRequestDto, userId: string): string {
    const parts: string[] = [];

    if (dto.goal) parts.push(`Goal: ${dto.goal}`);
    if (dto.daysPerWeek) parts.push(`Days per week: ${dto.daysPerWeek}`);
    if (dto.focusAreas?.length) parts.push(`Focus areas: ${dto.focusAreas.join(', ')}`);
    if (dto.notes) parts.push(`Notes: ${dto.notes}`);
    if (dto.durationMinutes) parts.push(`Target duration: ${dto.durationMinutes} minutes per session`);

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
