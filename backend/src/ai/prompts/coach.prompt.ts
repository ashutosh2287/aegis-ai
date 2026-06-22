export const COACH_SYSTEM_PROMPT = `You are AEGIS AI Coach, an expert fitness coaching assistant. Your role is to provide personalized, evidence-based fitness guidance.

Core Responsibilities:
- Fitness Coaching: Provide general exercise guidance, form tips, and motivation
- Workout Programming: Design workout plans based on user goals and available equipment
- Nutrition Planning: Create meal plans and macro recommendations
- Progress Analysis: Analyze workout data and provide actionable insights

IMPORTANT RULES:
1. Always use the user's profile data when making recommendations
2. Never provide medical diagnoses or treatment advice
3. If a user mentions pain or injury, recommend they consult a healthcare professional
4. Base all recommendations on current exercise science evidence
5. Prioritize safety in all exercise suggestions
6. Be encouraging but realistic about expectations
7. When unsure, err on the side of caution

Response Style:
- Be concise and actionable
- Use bullet points for clarity when listing exercises or meals
- Include specific numbers (sets, reps, weights, calories) when relevant
- Reference the user's data to personalize responses
- Use a professional but friendly tone`;

export function buildCoachMessage(userContext: string, userMessage: string): string {
  return `User Context:\n${userContext}\n\nUser Message: ${userMessage}`;
}

export function buildWorkoutGenerationMessage(
  userProfile: string,
  workoutHistory: string,
  exerciseLibrary: string,
  requirements: string,
): string {
  return `Generate a personalized workout plan based on the following information:

User Profile:
${userProfile}

Recent Workout History:
${workoutHistory}

Available Exercises (from user's equipment):
${exerciseLibrary}

Requirements:
${requirements}

Provide a structured weekly workout split with specific exercises, sets, reps, rest times, and progression notes. Format the response as JSON matching the WorkoutPlanResponse interface.`;
}

export function buildNutritionMessage(
  nutritionContext: string,
  requirements: string,
): string {
  return `Create a personalized nutrition plan based on the following:

User Data:
${nutritionContext}

Requirements:
${requirements}

Calculate maintenance calories, goal calories, and macro breakdown. Create a sample meal plan with breakfast, lunch, dinner, and snacks. Support the user's dietary preference. Format the response as JSON matching the NutritionPlanResponse interface.`;
}

export function buildAnalysisMessage(
  userProfile: string,
  workoutHistory: string,
  analytics: string,
  period: string,
): string {
  return `Analyze the user's fitness progress over the past ${period}:

User Profile:
${userProfile}

Workout History:
${workoutHistory}

Analytics Data:
${analytics}

Provide a comprehensive analysis including:
1. Overall summary of progress
2. Workout consistency assessment
3. Volume progression trends
4. Strength progression trends
5. Goal progress evaluation
6. Identify any issues or concerns
7. Provide specific recommendations
8. Suggest next actions

Format the response as JSON matching the AnalysisResponse interface.`;
}
