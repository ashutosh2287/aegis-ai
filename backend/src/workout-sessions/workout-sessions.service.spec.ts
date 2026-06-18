import { Test, TestingModule } from "@nestjs/testing";
import { WorkoutSessionsService } from "./workout-sessions.service";
import { SupabaseService } from "../supabase/supabase.service";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { SessionStatus } from "../common/enums/database.enums";
import { CreateWorkoutSessionDto } from "./dto/create-workout-session.dto";

describe("WorkoutSessionsService", () => {
  let service: WorkoutSessionsService;
  let supabaseService: SupabaseService;
  let mockClient: any;
  let updateChain: any;

  const mockUserId = "user-123";
  const mockWorkoutId = "workout-123";
  const mockSessionId = "session-123";

  beforeEach(async () => {
    updateChain = {
      select: jest.fn().mockReturnValue({
        single: jest.fn(),
      }),
    };

    mockClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: jest.fn(),
              }),
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn(),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue(updateChain),
        }),
      }),
    };

    const mockSupabaseService = {
      getClient: jest.fn().mockReturnValue(mockClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutSessionsService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<WorkoutSessionsService>(WorkoutSessionsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createSession", () => {
    it("should create a session successfully", async () => {
      // Mock workout exists and belongs to user
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: { id: mockWorkoutId },
          error: null,
        });
      // Mock no active session
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" }, // No rows found
        });
      // Mock session creation
      mockClient
        .from()
        .insert()
        .select()
        .single.mockResolvedValueOnce({
          data: {
            id: mockSessionId,
            user_id: mockUserId,
            workout_id: mockWorkoutId,
            status: SessionStatus.ACTIVE,
            started_at: new Date().toISOString(),
            completed_at: null,
            duration_seconds: null,
            notes: "Test notes",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

      const dto = new CreateWorkoutSessionDto();
      dto.notes = "Test notes";

      const result = await service.createSession(
        mockUserId,
        mockWorkoutId,
        dto,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(mockSessionId);
      expect(result.notes).toBe("Test notes");
    });

    it("should throw NotFoundException if workout not found", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" },
        });

      const dto = new CreateWorkoutSessionDto();
      await expect(
        service.createSession(mockUserId, mockWorkoutId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if user already has an active session", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: { id: mockWorkoutId },
          error: null,
        });
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: { id: "existing-session-id" },
          error: null,
        });

      const dto = new CreateWorkoutSessionDto();
      await expect(
        service.createSession(mockUserId, mockWorkoutId, dto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("getSessionById", () => {
    it("should return a session if found", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: {
            id: mockSessionId,
            user_id: mockUserId,
            workout_id: mockWorkoutId,
            status: SessionStatus.ACTIVE,
            started_at: new Date().toISOString(),
            completed_at: null,
            duration_seconds: null,
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

      const result = await service.getSessionById(mockUserId, mockSessionId);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(mockSessionId);
    });

    it("should throw NotFoundException if session not found", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" },
        });

      await expect(
        service.getSessionById(mockUserId, mockSessionId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getActiveSession", () => {
    it("should return the active session if exists", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: {
            id: mockSessionId,
            user_id: mockUserId,
            workout_id: mockWorkoutId,
            status: SessionStatus.ACTIVE,
            started_at: new Date().toISOString(),
            completed_at: null,
            duration_seconds: null,
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

      const result = await service.getActiveSession(mockUserId);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(mockSessionId);
    });

    it("should return null if no active session exists", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" },
        });

      const result = await service.getActiveSession(mockUserId);
      expect(result).toBeNull();
    });
  });

  describe("completeSession", () => {
    it("should complete an active session", async () => {
      const startedAt = new Date();
      startedAt.setSeconds(startedAt.getSeconds() - 10); // 10 seconds ago

      // Fetch session
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: {
            id: mockSessionId,
            user_id: mockUserId,
            workout_id: mockWorkoutId,
            status: SessionStatus.ACTIVE,
            started_at: startedAt.toISOString(),
            completed_at: null,
            duration_seconds: null,
            notes: null,
            created_at: startedAt.toISOString(),
            updated_at: startedAt.toISOString(),
            deleted_at: null,
          },
          error: null,
        });
      // Update session
      updateChain.select().single.mockResolvedValueOnce({
        data: {
          id: mockSessionId,
          user_id: mockUserId,
          workout_id: mockWorkoutId,
          status: SessionStatus.COMPLETED,
          started_at: startedAt.toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: 10,
          notes: null,
          created_at: startedAt.toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        error: null,
      });

      const result = await service.completeSession(mockUserId, mockSessionId);
      expect(result.status).toBe(SessionStatus.COMPLETED);
      expect(result.durationSeconds).toBe(10);
    });

    it("should throw ConflictException if session is not active", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: {
            id: mockSessionId,
            user_id: mockUserId,
            workout_id: mockWorkoutId,
            status: SessionStatus.COMPLETED,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            duration_seconds: 60,
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

      await expect(
        service.completeSession(mockUserId, mockSessionId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("abandonSession", () => {
    it("should abandon an active session", async () => {
      const startedAt = new Date();
      startedAt.setSeconds(startedAt.getSeconds() - 10); // 10 seconds ago

      // Fetch session
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: {
            id: mockSessionId,
            user_id: mockUserId,
            workout_id: mockWorkoutId,
            status: SessionStatus.ACTIVE,
            started_at: startedAt.toISOString(),
            completed_at: null,
            duration_seconds: null,
            notes: null,
            created_at: startedAt.toISOString(),
            updated_at: startedAt.toISOString(),
            deleted_at: null,
          },
          error: null,
        });
      // Update session
      updateChain.select().single.mockResolvedValueOnce({
        data: {
          id: mockSessionId,
          user_id: mockUserId,
          workout_id: mockWorkoutId,
          status: SessionStatus.ABANDONED,
          started_at: startedAt.toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: 10,
          notes: null,
          created_at: startedAt.toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        error: null,
      });

      const result = await service.abandonSession(mockUserId, mockSessionId);
      expect(result.status).toBe(SessionStatus.ABANDONED);
      expect(result.durationSeconds).toBe(10);
    });

    it("should throw ConflictException if session is not active", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: {
            id: mockSessionId,
            user_id: mockUserId,
            workout_id: mockWorkoutId,
            status: SessionStatus.COMPLETED,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            duration_seconds: 60,
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

      await expect(
        service.abandonSession(mockUserId, mockSessionId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("deleteSession", () => {
    it("should soft delete a session", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: { id: mockSessionId },
          error: null,
        });
      const updateEqMock = jest.fn().mockResolvedValue({ error: null });
      mockClient.from().update().eq = updateEqMock;

      await expect(
        service.deleteSession(mockUserId, mockSessionId),
      ).resolves.toBeUndefined();
    });

    it("should throw NotFoundException if session not found", async () => {
      mockClient
        .from()
        .select()
        .eq()
        .eq()
        .is()
        .single.mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" },
        });

      await expect(
        service.deleteSession(mockUserId, mockSessionId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
