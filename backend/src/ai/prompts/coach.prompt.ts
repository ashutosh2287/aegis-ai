export const COACH_SYSTEM_PROMPT = `/no_think You are AEGIS AI Coach, a fitness coaching assistant. Provide personalized, evidence-based fitness guidance.

Rules:
- Use user's profile data for recommendations
- No medical diagnoses; refer to healthcare professionals for pain/injury
- Be concise and actionable
- Use bullet points for exercises/meals
- Include specific numbers (sets, reps, calories)
- Professional but friendly tone`;

export function buildCoachMessage(userContext: string, userMessage: string): string {
  return `User Context:\n${userContext}\n\nUser Message: ${userMessage}`;
}

export function buildWorkoutGenerationMessage(
  userProfile: string,
  workoutHistory: string,
  exerciseLibrary: string,
  requirements: string,
): string {
  return `Generate a workout plan.

Profile: ${userProfile}
History: ${workoutHistory}
Exercises: ${exerciseLibrary}
Requirements: ${requirements}

Return JSON: {"summary":"overview","weeklySplit":{"days":[{"day":"Monday","focus":"group","exercises":[{"name":"Ex","muscleGroups":["m"],"sets":4,"reps":"8-12","restSeconds":90,"notes":"tip"}]}]},"notes":["tip"]}`;
}

export function buildNutritionMessage(
  nutritionContext: string,
  requirements: string,
): string {
  return `Create a nutrition plan.

Data: ${nutritionContext}
Requirements: ${requirements}

Calculate TDEE, goal calories, macros. Create meal plan (breakfast/lunch/dinner/snacks).
Return JSON: {"summary":"overview","dailyCalories":2500,"goalCalories":2800,"macros":{"protein":180,"carbohydrates":315,"fat":78},"mealPlan":{"breakfast":{"name":"Meal","description":"desc","calories":600,"protein":40,"carbohydrates":70,"fat":15},"lunch":{},"dinner":{},"snacks":{}}}`;
}

export function buildAnalysisMessage(
  userProfile: string,
  workoutHistory: string,
  analytics: string,
  period: string,
): string {
  return `Analyze fitness progress over ${period}.

Profile: ${userProfile}
History: ${workoutHistory}
Analytics: ${analytics}

Return JSON: {"summary":"assessment","workoutConsistency":"analysis","volumeProgression":"trends","strengthProgression":"gains","goalProgress":"evaluation","issues":["issue"],"recommendations":["rec"],"nextActions":["action"]}`;
}
