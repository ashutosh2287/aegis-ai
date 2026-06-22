import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { aiProviderFactory, AI_PROVIDER } from './providers/provider.factory';
import { ProfileTool } from './tools/profile.tool';
import { WorkoutTool } from './tools/workout.tool';
import { ExerciseTool } from './tools/exercise.tool';
import { AnalyticsTool } from './tools/analytics.tool';
import { NutritionTool } from './tools/nutrition.tool';
import { ToolRegistry } from './tools/tool-registry.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AIController],
  providers: [
    OpenAIProvider,
    GeminiProvider,
    aiProviderFactory,
    AIService,
    ProfileTool,
    WorkoutTool,
    ExerciseTool,
    AnalyticsTool,
    NutritionTool,
    ToolRegistry,
  ],
  exports: [AIService],
})
export class AIModule {}
