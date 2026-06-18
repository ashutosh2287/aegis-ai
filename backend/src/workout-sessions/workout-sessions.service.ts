import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateWorkoutSessionDto } from "./dto/create-workout-session.dto";
import { GetWorkoutSessionsDto } from "./dto/get-workout-sessions.dto";
import {
  WorkoutSession,
  WorkoutSessionResponse,
} from "./interfaces/workout-session.interface";
import { SessionStatus } from "../common/enums/database.enums";

@Injectable()
export class WorkoutSessionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getClient() {
    return this.supabaseService.getClient();
  }

  /**
   * Create a new workout session.
   * @param userId - The ID of the user
   * @param workoutId - The ID of the workout to start a session for
   * @param dto - The session data (notes)
   * @returns Promise of the created session
   */
  async createSession(
    userId: string,
    workoutId: string,
    dto: CreateWorkoutSessionDto,
  ): Promise<WorkoutSessionResponse> {
    const client = this.getClient();

    // Check if the workout exists and belongs to the user
    const { data: workoutData, error: workoutError } = await client
      .from("workouts")
      .select("id")
      .eq("id", workoutId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (workoutError) {
      if (workoutError.code === "PGRST116") {
        throw new NotFoundException(`Workout with ID ${workoutId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch workout: ${workoutError.message}`,
      );
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutId} not found`);
    }

    // Check if the user already has an active session
    const { data: activeSessionData, error: activeSessionError } = await client
      .from("workout_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", SessionStatus.ACTIVE)
      .is("deleted_at", null)
      .single();

    if (activeSessionError && activeSessionError.code !== "PGRST116") {
      throw new InternalServerErrorException(
        `Failed to check for active session: ${activeSessionError.message}`,
      );
    }

    if (activeSessionData) {
      throw new ConflictException(
        "User already has an active session. Please complete or abandon it before starting a new one.",
      );
    }

    // Create the session
    const sessionData = {
      user_id: userId,
      workout_id: workoutId,
      status: SessionStatus.ACTIVE,
      started_at: new Date().toISOString(),
      notes: dto.notes ?? null,
    };

    const { data: sessionDataResult, error: sessionError } = await client
      .from("workout_sessions")
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      throw new InternalServerErrorException(
        `Failed to create session: ${sessionError.message}`,
      );
    }

    if (!sessionDataResult) {
      throw new InternalServerErrorException(
        "Session created but no data returned",
      );
    }

    return this.mapToResponse(sessionDataResult);
  }

  /**
   * Get sessions for a user with filtering, pagination, and sorting.
   * @param userId - The ID of the user
   * @param dto - The query parameters
   * @returns Promise of array of sessions and pagination metadata
   */
  async getSessions(
    userId: string,
    dto: GetWorkoutSessionsDto,
  ): Promise<{
    sessions: WorkoutSessionResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const client = this.getClient();

    // Build the query
    let query = client.from("workout_sessions").select("*", { count: "exact" });

    // Filter by user and exclude soft-deleted
    query = query.eq("user_id", userId).is("deleted_at", null);

    // Apply filters
    if (dto.status) {
      query = query.eq("status", dto.status);
    }
    if (dto.workoutId) {
      query = query.eq("workout_id", dto.workoutId);
    }
    if (dto.startDate) {
      query = query.gte("started_at", dto.startDate);
    }
    if (dto.endDate) {
      query = query.lte("started_at", dto.endDate);
    }

    // Apply sorting
    const sortBy = dto.sortBy ?? "started_at";
    const sortOrder = dto.sortOrder ?? "DESC";
    query = query.order(sortBy, {
      ascending: sortOrder.toUpperCase() === "ASC",
    });

    // Apply pagination
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data: sessionsData, error: sessionsError, count } = await query;

    if (sessionsError) {
      throw new InternalServerErrorException(
        `Failed to fetch sessions: ${sessionsError.message}`,
      );
    }

    const sessions = sessionsData.map((session: any) =>
      this.mapToResponse(session),
    );

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get a session by ID for a user.
   * @param userId - The ID of the user
   * @param sessionId - The ID of the session
   * @returns Promise of the session
   */
  async getSessionById(
    userId: string,
    sessionId: string,
  ): Promise<WorkoutSessionResponse> {
    const client = this.getClient();

    const { data: sessionData, error: sessionError } = await client
      .from("workout_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") {
        throw new NotFoundException(`Session with ID ${sessionId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch session: ${sessionError.message}`,
      );
    }

    if (!sessionData) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    return this.mapToResponse(sessionData);
  }

  /**
   * Get the active session for a user.
   * @param userId - The ID of the user
   * @returns Promise of the session or null if none exists
   */
  async getActiveSession(
    userId: string,
  ): Promise<WorkoutSessionResponse | null> {
    const client = this.getClient();

    const { data: sessionData, error: sessionError } = await client
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", SessionStatus.ACTIVE)
      .is("deleted_at", null)
      .single();

    if (sessionError && sessionError.code !== "PGRST116") {
      throw new InternalServerErrorException(
        `Failed to fetch active session: ${sessionError.message}`,
      );
    }

    if (!sessionData) {
      return null;
    }

    return this.mapToResponse(sessionData);
  }

  /**
   * Get historical sessions for a user (completed sessions by default).
   * @param userId - The ID of the user
   * @param dto - The query parameters (defaults to status completed)
   * @returns Promise of array of sessions and pagination metadata
   */
  async getHistorySessions(
    userId: string,
    dto: GetWorkoutSessionsDto,
  ): Promise<{
    sessions: WorkoutSessionResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    // Set default status to completed if not provided
    const historyDto = { ...dto };
    if (!historyDto.status) {
      historyDto.status = SessionStatus.COMPLETED;
    }
    return this.getSessions(userId, historyDto);
  }

  /**
   * Complete a session.
   * @param userId - The ID of the user
   * @param sessionId - The ID of the session to complete
   * @returns Promise of the updated session
   */
  async completeSession(
    userId: string,
    sessionId: string,
  ): Promise<WorkoutSessionResponse> {
    const client = this.getClient();

    // First, get the session to ensure it exists and belongs to the user and is active
    const { data: sessionData, error: sessionError } = await client
      .from("workout_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") {
        throw new NotFoundException(`Session with ID ${sessionId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch session: ${sessionError.message}`,
      );
    }

    if (!sessionData) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (sessionData.status !== SessionStatus.ACTIVE) {
      throw new ConflictException(
        `Cannot complete session with status ${sessionData.status}. Only active sessions can be completed.`,
      );
    }

    // Calculate duration
    const startedAt = new Date(sessionData.started_at);
    const completedAt = new Date();
    const durationSeconds = Math.floor(
      (completedAt.getTime() - startedAt.getTime()) / 1000,
    );

    // Update the session
    const updateData = {
      status: SessionStatus.COMPLETED,
      completed_at: completedAt.toISOString(),
      duration_seconds: durationSeconds,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedSessionData, error: updateError } = await client
      .from("workout_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError) {
      throw new InternalServerErrorException(
        `Failed to complete session: ${updateError.message}`,
      );
    }

    if (!updatedSessionData) {
      throw new InternalServerErrorException(
        "Session completed but no data returned",
      );
    }

    return this.mapToResponse(updatedSessionData);
  }

  /**
   * Abandon a session.
   * @param userId - The ID of the user
   * @param sessionId - The ID of the session to abandon
   * @returns Promise of the updated session
   */
  async abandonSession(
    userId: string,
    sessionId: string,
  ): Promise<WorkoutSessionResponse> {
    const client = this.getClient();

    // First, get the session to ensure it exists and belongs to the user and is active
    const { data: sessionData, error: sessionError } = await client
      .from("workout_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") {
        throw new NotFoundException(`Session with ID ${sessionId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch session: ${sessionError.message}`,
      );
    }

    if (!sessionData) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (sessionData.status !== SessionStatus.ACTIVE) {
      throw new ConflictException(
        `Cannot abandon session with status ${sessionData.status}. Only active sessions can be abandoned.`,
      );
    }

    // Calculate duration (optional, but we'll set completed_at and duration for consistency)
    const startedAt = new Date(sessionData.started_at);
    const completedAt = new Date();
    const durationSeconds = Math.floor(
      (completedAt.getTime() - startedAt.getTime()) / 1000,
    );

    // Update the session
    const updateData = {
      status: SessionStatus.ABANDONED,
      completed_at: completedAt.toISOString(),
      duration_seconds: durationSeconds,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedSessionData, error: updateError } = await client
      .from("workout_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError) {
      throw new InternalServerErrorException(
        `Failed to abandon session: ${updateError.message}`,
      );
    }

    if (!updatedSessionData) {
      throw new InternalServerErrorException(
        "Session abandoned but no data returned",
      );
    }

    return this.mapToResponse(updatedSessionData);
  }

  /**
   * Soft delete a session.
   * @param userId - The ID of the user
   * @param sessionId - The ID of the session to delete
   */
  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const client = this.getClient();

    // First, check if the session exists and belongs to the user and is not already deleted
    const { data: sessionData, error: sessionError } = await client
      .from("workout_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") {
        throw new NotFoundException(`Session with ID ${sessionId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch session: ${sessionError.message}`,
      );
    }

    if (!sessionData) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    // Soft delete
    const { error: deleteError } = await client
      .from("workout_sessions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Failed to delete session: ${deleteError.message}`,
      );
    }
  }

  /**
   * Map a session record from the database to the response DTO.
   * @param session - The session record from the database
   * @returns WorkoutSessionResponse
   */
  private mapToResponse(session: any): WorkoutSessionResponse {
    return {
      id: session.id,
      userId: session.user_id,
      workoutId: session.workout_id,
      status: session.status,
      startedAt: session.started_at,
      completedAt: session.completed_at ?? undefined,
      durationSeconds: session.duration_seconds ?? undefined,
      notes: session.notes ?? undefined,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      deletedAt: session.deleted_at ?? undefined,
    };
  }
}
