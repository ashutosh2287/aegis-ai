import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../analytics.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { PersonalRecordType } from '../../../src/analytics/enums/personal-record-type.enum';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let supabaseService: SupabaseService;

  // Helper to create a mock supabase client that returns a promise-like object
  const createMockSupabaseClient = () => {
    let resolvedData: any = [];
    let resolvedError: any = null;
    let resolvedDataQueue: any[] = [];
    let resolvedErrorQueue: any[] = [];

    // Declare chain first to avoid TS2448
    const chain: any = {};

    // Now assign properties
    chain.from = jest.fn().mockReturnValue(chain);
chain.select = jest.fn().mockReturnValue(chain);
chain.eq = jest.fn().mockReturnValue(chain);
chain.is = jest.fn().mockReturnValue(chain);
chain.in = jest.fn().mockReturnValue(chain);
chain.gte = jest.fn().mockReturnValue(chain);
chain.lte = jest.fn().mockReturnValue(chain);
chain.order = jest.fn().mockReturnValue(chain);
chain.limit = jest.fn().mockReturnValue(chain);
chain.single = jest.fn().mockReturnValue(chain);
chain.not = jest.fn().mockReturnValue(chain);
chain.group = jest.fn().mockReturnValue(chain);

    // Method to set what the promise should resolve to
    chain.mockResolvedValue = (data: any, error: any = null) => {
      resolvedData = data;
      resolvedError = error;
      return chain;
    };

    // Method to set what the promise should resolve to once
    chain.mockResolvedValueOnce = (data: any, error: any = null) => {
      resolvedDataQueue.push(data);
      resolvedErrorQueue.push(error);
      return chain;
    };

    // Make the chain thenable so it can be awaited
    chain.then = jest.fn().mockImplementation((callback: (value: any) => any) => {
      const data = resolvedDataQueue.length > 0 ? resolvedDataQueue.shift() : resolvedData;
      const error = resolvedErrorQueue.length > 0 ? resolvedErrorQueue.shift() : resolvedError;
      return Promise.resolve(callback({ data, error }));
    });

    chain.catch = jest.fn().mockImplementation((callback: (error: any) => any) => {
      return Promise.resolve().catch(callback);
    });

    return chain;
  };

  beforeEach(async () => {
    const mockSupabaseClient = createMockSupabaseClient();
    const mockSupabaseService = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    console.log('CLIENT', supabaseService.getClient());
  });
  

  describe('getSessionVolume', () => {
    it('should return volume for a session with valid data', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Mock session query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient); // user_id
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        { id: 'session1', workout_id: 'workout1' },
        null
      );

      // Mock exercises query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [{ id: 'ex1' }, { id: 'ex2' }],
        null
      );

      // Mock sets query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.in.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [
          { reps: 10, weight: 20 },
          { reps: 5, weight: 30 },
          { reps: 8, weight: null }, // weight null should not contribute to volume
        ],
        null
      );

      const result = await service.getSessionVolume('session1', 'user1');

      expect(result).toEqual({
        totalVolume: (10 * 20) + (5 * 30), // 200 + 150 = 350
        totalSets: 3,
        totalReps: 10 + 5 + 8, // 23
      });
    });

    it('should throw NotFoundException if session does not exist', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(null, { code: 'PGRST116' });

      await expect(service.getSessionVolume('invalid-session', 'user1'))
        .rejects
        .toMatchObject({
          response: {
            statusCode: 404,
            message: 'Session with ID invalid-session not found',
          },
        });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(null, { message: 'Database connection failed' });

      await expect(service.getSessionVolume('session1', 'user1'))
        .rejects
        .toMatchObject({
          response: {
            statusCode: 500,
            message: 'Failed to fetch session: Database connection failed',
          },
        });
    });
  });

  describe('getExerciseVolume', () => {
    it('should return volume for an exercise belonging to the user', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Mock exercise query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        { id: 'ex1', workout_id: 'workout1' },
        null
      );

      // Mock workout ownership query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [{ id: 'workout1' }],
        null
      );

      // Mock user workouts query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [{ id: 'workout1' }],
        null
      );

      // Mock user exercises query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.in.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [{ id: 'ex1' }],
        null
      );

      // Mock sets query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.in.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [
          { reps: 10, weight: 20 },
          { reps: 5, weight: 30 },
        ],
        null
      );

      const result = await service.getExerciseVolume('user1', 'ex1');

      expect(result).toEqual({
        totalVolume: (10 * 20) + (5 * 30), // 200 + 150 = 350
        totalSets: 2,
        totalReps: 10 + 5, // 15
      });
    });

    it('should throw NotFoundException if exercise does not exist', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(null, { code: 'PGRST116' });

      await expect(service.getExerciseVolume('user1', 'invalid-exercise'))
        .rejects
        .toMatchObject({
          response: {
            statusCode: 404,
            message: 'Exercise with ID invalid-exercise not found',
          },
        });
    });
  });

  describe('getWeeklyVolume', () => {
    it('should return volume for the last 7 days', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Mock sessions query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.gte.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.lte.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [{ id: 'session1' }, { id: 'session2' }],
        null
      );

      // Mock session workouts query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.in.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [
          { workout_id: 'workout1' },
          { workout_id: 'workout2' },
        ],
        null
      );

      // Mock workout exercises query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.in.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [{ id: 'ex1' }, { id: 'ex2' }],
        null
      );

      // Mock sets query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.in.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [
          { reps: 10, weight: 20 },
          { reps: 5, weight: 30 },
          { reps: 8, weight: 15 },
        ],
        null
      );

      const result = await service.getWeeklyVolume('user1');

      expect(result).toEqual({
        totalVolume: (10 * 20) + (5 * 30) + (8 * 15), // 200 + 150 + 120 = 470
        totalSets: 3,
        totalReps: 10 + 5 + 8, // 23
      });
    });

    it('should return zero when no sessions in the date range', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.gte.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.lte.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue([], null);

      const result = await service.getWeeklyVolume('user1');

      expect(result).toEqual({
        totalVolume: 0,
        totalSets: 0,
        totalReps: 0,
      });
    });
  });

  describe('getMonthlyVolume', () => {
    it('should return volume for the last 30 days', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Mock sessions query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.gte.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.lte.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [{ id: 'session1' }],
        null
      );

      // Mock session workouts query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.in.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [{ workout_id: 'workout1' }],
        null
      );

      // Mock workout exercises query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.in.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [{ id: 'ex1' }],
        null
      );

      // Mock sets query
      mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.in.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.is.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.single.mockReturnValue(mockSupabaseClient);
      mockSupabaseClient.mockResolvedValue(
        [
          { reps: 10, weight: 10 },
          { reps: 5, weight: 20 },
        ],
        null
      );

      const result = await service.getMonthlyVolume('user1');

      expect(result).toEqual({
        totalVolume: (10 * 10) + (5 * 20), // 100 + 100 = 200
        totalSets: 2,
        totalReps: 10 + 5, // 15
      });
    });
  });

  // Tests for the placeholder methods to ensure they still exist and return expected types
  describe('getDashboard', () => {
    it('should return an object with expected properties', () => {
      const result = service.getDashboard();
      expect(result).toEqual({
        totalWorkouts: 0,
        totalVolume: 0,
        weeklyVolume: 0,
        monthlyVolume: 0,
        personalRecords: [],
      });
    });
  });

  describe('getExerciseProgression', () => {
    it('should return progression data when no sets found', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      mockSupabaseClient.mockResolvedValue([], null);

      const result = await service.getExerciseProgression('user-id', 'exercise-id');
      expect(result).toEqual({
        exerciseId: 'exercise-id',
        currentOneRepMax: 0,
        bestOneRepMax: 0,
        improvementPercentage: 0,
        trend: 'STABLE',
        totalWorkouts: 0,
      });
    });

    it('should calculate progression correctly with valid data', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      // Mock two sets: one with weight 100 reps 5 (1RM 116.67) and another with weight 110 reps 5 (1RM 128.33)
      const mockData = [
        {
          weight: 100,
          reps: 5,
          created_at: '2026-06-01T10:00:00Z',
          workout_exercises: {
            id: 'exercise-id',
            exercise_id: 'exercise-id',
            workout_sessions: {
              id: 'session-id',
              user_id: 'user-id',
              completed_at: '2026-06-01T11:00:00Z',
            },
          },
        },
        {
          weight: 110,
          reps: 5,
          created_at: '2026-06-15T10:00:00Z',
          workout_exercises: {
            id: 'exercise-id-2',
            exercise_id: 'exercise-id',
            workout_sessions: {
              id: 'session-id-2',
              user_id: 'user-id',
              completed_at: '2026-06-15T11:00:00Z',
            },
          },
        },
      ];
      mockSupabaseClient.mockResolvedValue(mockData, null);

      const result = await service.getExerciseProgression('user-id', 'exercise-id');

      // Expected calculations:
      // First set: 1RM = 100 * (1 + 5/30) = 100 * 1.16666... = 116.666... -> 116.67
      // Second set: 1RM = 110 * (1 + 5/30) = 110 * 1.16666... = 128.333... -> 128.33
      // currentOneRepMax (most recent) = 128.33
      // bestOneRepMax = 128.33
      // earliestOneRepMax = 116.67
      // improvementPercentage = ((128.33 - 116.67) / 116.67) * 100 = (11.66 / 116.67) * 100 ≈ 9.99 -> 9.99
      // Since improvement > 5%, trend should be UPWARD
      // totalWorkouts: 2 (different dates)

      expect(result.exerciseId).toBe('exercise-id');
      expect(result.currentOneRepMax).toBe(128.33);
      expect(result.bestOneRepMax).toBe(128.33);
      expect(result.improvementPercentage).toBeCloseTo(9.99, 2);
      expect(result.trend).toBe('UPWARD');
      expect(result.totalWorkouts).toBe(2);
    });
  });

  describe('getPersonalRecords', () => {
    it('should return an empty array', async () => {
      const result = await service.getPersonalRecords('test-user-id');
      expect(result).toEqual([]);
    });
  });

  describe('getBestOneRepMax', () => {
    it('should return 0 when no sets found', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      mockSupabaseClient.mockResolvedValue([], null);

      const result = await service.getBestOneRepMax('user-id', 'exercise-id');
      expect(result).toBe(0);
    });

    it('should return the correct best one rep max', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      const mockData = [
        {
          weight: 100,
          reps: 5, // 1RM 116.67
          created_at: '2026-06-01T10:00:00Z',
          workout_exercises: {
            id: 'exercise-id',
            exercise_id: 'exercise-id',
            workout_sessions: {
              id: 'session-id',
              user_id: 'user-id',
              completed_at: '2026-06-01T11:00:00Z',
            },
          },
        },
        {
          weight: 120,
          reps: 5, // 1RM 139.99
          created_at: '2026-06-15T10:00:00Z',
          workout_exercises: {
            id: 'exercise-id-2',
            exercise_id: 'exercise-id',
            workout_sessions: {
              id: 'session-id-2',
              user_id: 'user-id',
              completed_at: '2026-06-15T11:00:00Z',
            },
          },
        },
        {
          weight: 100,
          reps: 10, // 1RM 133.33
          created_at: '2026-06-20T10:00:00Z',
          workout_exercises: {
            id: 'exercise-id-3',
            exercise_id: 'exercise-id',
            workout_sessions: {
              id: 'session-id-3',
              user_id: 'user-id',
              completed_at: '2026-06-20T11:00:00Z',
            },
          },
        },
      ];
      mockSupabaseClient.mockResolvedValue(mockData, null);

      const result = await service.getBestOneRepMax('user-id', 'exercise-id');
      // Best should be 120 * (1 + 5/30) = 120 * 1.1666... = 139.999... -> 140.00
      expect(result).toBeCloseTo(140.00, 2);
    });
  });

  describe('getStrengthTrend', () => {
    it('should return empty history when no sets found', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      mockSupabaseClient.mockResolvedValue([], null);

      const result = await service.getStrengthTrend('user-id', 'exercise-id');
      expect(result).toEqual({
        exerciseId: 'exercise-id',
        history: [],
      });
    });

    it('should return trend history grouped by date', async () => {
      const mockSupabaseClient = supabaseService.getClient();
      const mockData = [
        // Two sets on the same day
        {
          weight: 100,
          reps: 5, // 1RM 116.67
          created_at: '2026-06-01T10:00:00Z',
          workout_exercises: {
            id: 'exercise-id',
            exercise_id: 'exercise-id',
            workout_sessions: {
              id: 'session-id',
              user_id: 'user-id',
              completed_at: '2026-06-01T11:00:00Z',
            },
          },
        },
        {
          weight: 105,
          reps: 5, // 1RM 122.5
          created_at: '2026-06-01T12:00:00Z',
          workout_exercises: {
            id: 'exercise-id-2',
            exercise_id: 'exercise-id',
            workout_sessions: {
              id: 'session-id-2',
              user_id: 'user-id',
              completed_at: '2026-06-01T13:00:00Z',
            },
          },
        },
        // One set on another day
        {
          weight: 110,
          reps: 5, // 1RM 128.33
          created_at: '2026-06-15T10:00:00Z',
          workout_exercises: {
            id: 'exercise-id-3',
            exercise_id: 'exercise-id',
            workout_sessions: {
              id: 'session-id-3',
              user_id: 'user-id',
              completed_at: '2026-06-15T11:00:00Z',
            },
          },
        },
      ];
      mockSupabaseClient.mockResolvedValue(mockData, null);

      const result = await service.getStrengthTrend('user-id', 'exercise-id');
      // Expect history:
      // 2026-06-01: max 1RM is 122.5
      // 2026-06-15: max 1RM is 128.33
      expect(result.exerciseId).toBe('exercise-id');
      expect(result.history).toHaveLength(2);
      expect(result.history[0]).toEqual({
        date: '2026-06-01',
        oneRepMax: 122.5,
      });
      expect(result.history[1]).toEqual({
        date: '2026-06-15',
        oneRepMax: 128.33,
      });
    });
  });

  describe('getWorkoutConsistency', () => {
    const fixedDate = new Date('2026-06-15');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return empty consistency when no workouts', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Mock all three queries to return empty arrays
      mockSupabaseClient.mockResolvedValueOnce([], null);
      mockSupabaseClient.mockResolvedValueOnce([], null);
      mockSupabaseClient.mockResolvedValueOnce([], null);

      const result = await service.getWorkoutConsistency('user-id');

      expect(result).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
        averageWorkoutsPerWeek: 0,
        adherencePercentage: 0,
        totalWorkoutDays: 0,
      });
    });

    it('should handle single workout session', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Mock allSessionsRes: one session on 2026-06-10
      mockSupabaseClient.mockResolvedValueOnce(
        [{ completed_at: '2026-06-10T10:00:00Z' }],
        null
      );
      // Mock recentSessionsRes: one session (within last 7 days)
      mockSupabaseClient.mockResolvedValueOnce(
        [{ completed_at: '2026-06-10T10:00:00Z' }],
        null
      );
      // Mock monthlySessionsRes: one session (within last 30 days)
      mockSupabaseClient.mockResolvedValueOnce(
        [{ completed_at: '2026-06-10T10:00:00Z' }],
        null
      );

      const result = await service.getWorkoutConsistency('user-id');

      expect(result).toEqual({
        currentStreak: 1,
        longestStreak: 1,
        workoutsThisWeek: 1,
        workoutsThisMonth: 1,
        averageWorkoutsPerWeek: 1,
        adherencePercentage: 4.67,
        totalWorkoutDays: 1,
      });
    });

    it('should calculate streaks correctly with consecutive days', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Workouts on 2026-06-10, 2026-06-11, 2026-06-12 (three consecutive days)
      const allSessions = [
        { completed_at: '2026-06-10T10:00:00Z' },
        { completed_at: '2026-06-11T10:00:00Z' },
        { completed_at: '2026-06-12T10:00:00Z' },
      ];
      // All are within the last 7 days and 30 days from 2026-06-15
      mockSupabaseClient.mockResolvedValueOnce(allSessions, null);
      mockSupabaseClient.mockResolvedValueOnce(allSessions, null);
      mockSupabaseClient.mockResolvedValueOnce(allSessions, null);

      const result = await service.getWorkoutConsistency('user-id');

      expect(result).toEqual({
        currentStreak: 3,
        longestStreak: 3,
        workoutsThisWeek: 3,
        workoutsThisMonth: 3,
        averageWorkoutsPerWeek: 3,
        adherencePercentage: 14.0,
        totalWorkoutDays: 3,
      });
    });

    it('should calculate streaks with gaps', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Workouts on 2026-06-01, 2026-06-02, 2026-06-05 (so streak of 2, then a gap, then a single)
      const allSessions = [
        { completed_at: '2026-06-01T10:00:00Z' },
        { completed_at: '2026-06-02T10:00:00Z' },
        { completed_at: '2026-06-05T10:00:00Z' },
      ];
      // Assume all are within the last 30 days but not necessarily in the last 7 days?
      // Let's set the fixed date to 2026-06-15, so:
      //   2026-06-01 is 14 days ago -> within 30 days
      //   2026-06-02 is 13 days ago
      //   2026-06-05 is 10 days ago
      //   All are within the last 30 days.
      //   For the last 7 days: only 2026-06-05 is within (10 days ago is not within 7 days? 10 days ago is 2026-06-05, and 7 days ago is 2026-06-08, so 2026-06-05 is not in the last 7 days).
      //   So:
      //     allSessions: 3 sessions
      //     recentSessions (last 7 days): 0 sessions (because 2026-06-05 is 10 days ago, which is more than 7 days)
      //     monthlySessions (last 30 days): 3 sessions
      mockSupabaseClient
        .mockResolvedValueOnce(allSessions, null) // allSessions
        .mockResolvedValueOnce([], null) // recentSessions: empty
        .mockResolvedValueOnce(allSessions, null); // monthlySessions

      const result = await service.getWorkoutConsistency('user-id');

      expect(result).toEqual({
        currentStreak: 1,
        longestStreak: 2,
        workoutsThisWeek: 0,
        workoutsThisMonth: 3,
        averageWorkoutsPerWeek: 1.5,
        adherencePercentage: 14.0,
        totalWorkoutDays: 3,
      });
    });
  });

  describe('getComparativeAnalytics', () => {
    const fixedDate = new Date('2026-06-15');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return comparative analytics data', async () => {
      // Mock all sessions for consistency calculation (workouts on 2026-06-10, 2026-06-11, 2026-06-12)
      const allSessions = [
        { completed_at: '2026-06-10T10:00:00Z' },
        { completed_at: '2026-06-11T10:00:00Z' },
        { completed_at: '2026-06-12T10:00:00Z' },
      ];

      // Mock current week sessions (last 7 days from 2026-06-15: 2026-06-09 to 2026-06-15)
      // All three workouts are in current week
      const currentWeekSessions = [...allSessions];

      // Mock previous week sessions (7 days before current week: 2026-06-02 to 2026-06-08)
      // No workouts in previous week
      const previousWeekSessions = [];

      // Mock current month sessions (last 30 days from 2026-06-15: 2026-05-16 to 2026-06-15)
      // All three workouts are in current month
      const currentMonthSessions = [...allSessions];

      // Mock previous month sessions (30 days before current month: 2026-04-17 to 2026-05-15)
      // No workouts in previous month
      const previousMonthSessions = [];

      // Mock volume data
      const currentWeekVolume = { totalVolume: 1000, totalSets: 50, totalReps: 200 };
      const previousWeekVolume = { totalVolume: 0, totalSets: 0, totalReps: 0 };
      const currentMonthVolume = { totalVolume: 1000, totalSets: 50, totalReps: 200 };
      const previousMonthVolume = { totalVolume: 0, totalSets: 0, totalReps: 0 };

      // Mock personal records
      const mockPersonalRecords = [
        {
          type: PersonalRecordType.HEAVIEST_WEIGHT,
          value: 100,
          achievedAt: '2026-06-11T10:00:00Z',
          exerciseId: 'ex1',
          sessionId: 'sess1'
        },
        {
          type: PersonalRecordType.MOST_REPS,
          value: 20,
          achievedAt: '2026-06-12T10:00:00Z',
          exerciseId: 'ex2',
          sessionId: 'sess2'
        }
      ];

      // Mock the helper methods directly
      // Mock getTotalVolumeInDateRange for the 4 calls
      jest.spyOn(service as any, 'getTotalVolumeInDateRange')
        .mockImplementationOnce(() => Promise.resolve(currentWeekVolume)) // current week
        .mockImplementationOnce(() => Promise.resolve(previousWeekVolume)) // previous week
        .mockImplementationOnce(() => Promise.resolve(currentMonthVolume)) // current month
        .mockImplementationOnce(() => Promise.resolve(previousMonthVolume)); // previous month

      // Mock getTotalWorkoutsInDateRange for the 4 calls
      jest.spyOn(service as any, 'getTotalWorkoutsInDateRange')
        .mockImplementationOnce(() => Promise.resolve(currentWeekSessions.length)) // current week
        .mockImplementationOnce(() => Promise.resolve(previousWeekSessions.length)) // previous week
        .mockImplementationOnce(() => Promise.resolve(currentMonthSessions.length)) // current month
        .mockImplementationOnce(() => Promise.resolve(previousMonthSessions.length)); // previous month

      // Mock getWorkoutConsistency
      jest.spyOn(service as any, 'getWorkoutConsistency')
        .mockImplementationOnce(() => Promise.resolve({
          currentStreak: 3,
          longestStreak: 3,
          workoutsThisWeek: 3,
          workoutsThisMonth: 3,
          averageWorkoutsPerWeek: 3.0,
          adherencePercentage: 14.0,
          totalWorkoutDays: 3
        }));

      // Mock getPersonalRecords
      jest.spyOn(service as any, 'getPersonalRecords')
        .mockImplementationOnce(() => Promise.resolve(mockPersonalRecords));

      const result = await service.getComparativeAnalytics('user-id');

      // Assertions
      expect(result).toBeDefined();
      expect(result.workoutVolume).toBeDefined();
      expect(result.workoutVolume.currentWeek).toEqual(currentWeekVolume);
      expect(result.workoutVolume.previousWeek).toEqual(previousWeekVolume);
      expect(result.workoutVolume.changePercentage).toBeCloseTo(100.0); // (1000-0)/0 -> 100% (handled as special case)

      expect(result.monthlyVolume).toBeDefined();
      expect(result.monthlyVolume.currentMonth).toEqual(currentMonthVolume);
      expect(result.monthlyVolume.previousMonth).toEqual(previousMonthVolume);
      expect(result.monthlyVolume.changePercentage).toBeCloseTo(100.0); // (1000-0)/0 -> 100%

      expect(result.workoutFrequencyWeekly).toBeDefined();
      expect(result.workoutFrequencyWeekly.currentWeek).toBe(3);
      expect(result.workoutFrequencyWeekly.previousWeek).toBe(0);
      expect(result.workoutFrequencyWeekly.changePercentage).toBeCloseTo(100.0); // (3-0)/0 -> 100%

      expect(result.workoutFrequencyMonthly).toBeDefined();
      expect(result.workoutFrequencyMonthly.currentMonth).toBe(3);
      expect(result.workoutFrequencyMonthly.previousMonth).toBe(0);
      expect(result.workoutFrequencyMonthly.changePercentage).toBeCloseTo(100.0); // (3-0)/0 -> 100%

      expect(result.personalRecordsWeekly).toBeDefined();
      // Only one PR in current week (2026-06-11 is in current week, 2026-06-12 is also in current week)
      // Actually both are in current week (2026-06-09 to 2026-06-15)
      expect(result.personalRecordsWeekly.currentWeek).toBe(2);
      expect(result.personalRecordsWeekly.previousWeek).toBe(0);
      expect(result.personalRecordsWeekly.changePercentage).toBeCloseTo(100.0); // (2-0)/0 -> 100%

      expect(result.personalRecordsMonthly).toBeDefined();
      // Both PRs are in current month (2026-05-16 to 2026-06-15)
      expect(result.personalRecordsMonthly.currentMonth).toBe(2);
      expect(result.personalRecordsMonthly.previousMonth).toBe(0);
      expect(result.personalRecordsMonthly.changePercentage).toBeCloseTo(100.0); // (2-0)/0 -> 100%

      expect(result.currentConsistency).toBeDefined();
      expect(result.currentConsistency.currentStreak).toBe(3);
      expect(result.currentConsistency.longestStreak).toBe(3);

      expect(result.recentPersonalRecords).toBeDefined();
      expect(result.recentPersonalRecords.length).toBe(2); // Limited to 10, we have 2
    });

    it('should handle no workout data', async () => {
      // Mock the helper methods directly for the no data case
      // Mock getTotalVolumeInDateRange for the 4 calls
      jest.spyOn(service as any, 'getTotalVolumeInDateRange')
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 0, totalSets: 0, totalReps: 0 })) // current week
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 0, totalSets: 0, totalReps: 0 })) // previous week
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 0, totalSets: 0, totalReps: 0 })) // current month
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 0, totalSets: 0, totalReps: 0 })); // previous month

      // Mock getTotalWorkoutsInDateRange for the 4 calls
      jest.spyOn(service as any, 'getTotalWorkoutsInDateRange')
        .mockImplementationOnce(() => Promise.resolve(0)) // current week
        .mockImplementationOnce(() => Promise.resolve(0)) // previous week
        .mockImplementationOnce(() => Promise.resolve(0)) // current month
        .mockImplementationOnce(() => Promise.resolve(0)); // previous month

      // Mock getWorkoutConsistency
      jest.spyOn(service as any, 'getWorkoutConsistency')
        .mockImplementationOnce(() => Promise.resolve({
          currentStreak: 0,
          longestStreak: 0,
          workoutsThisWeek: 0,
          workoutsThisMonth: 0,
          averageWorkoutsPerWeek: 0,
          adherencePercentage: 0,
          totalWorkoutDays: 0
        }));

      // Mock getPersonalRecords
      jest.spyOn(service as any, 'getPersonalRecords')
        .mockImplementationOnce(() => Promise.resolve([]));

      const result = await service.getComparativeAnalytics('user-id');

      expect(result).toBeDefined();
      expect(result.workoutVolume.changePercentage).toBe(0); // 0 vs 0
      expect(result.monthlyVolume.changePercentage).toBe(0); // 0 vs 0
      expect(result.workoutFrequencyWeekly.changePercentage).toBe(0); // 0 vs 0
      expect(result.workoutFrequencyMonthly.changePercentage).toBe(0); // 0 vs 0
      expect(result.personalRecordsWeekly.changePercentage).toBe(0); // 0 vs 0
      expect(result.personalRecordsMonthly.changePercentage).toBe(0); // 0 vs 0
      expect(result.recentPersonalRecords.length).toBe(0);
    });
  });
  describe('getPlateauDetection', () => {
    const fixedDate = new Date('2026-06-15');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return strength plateau when strength trend shows <1% improvement', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Mock getOverallStrengthTrend to return a strength trend with 0.5% improvement
      jest.spyOn(service as any, 'getOverallStrengthTrend')
        .mockResolvedValueOnce({
          exerciseId: 'overall',
          currentOneRepMax: 100.5,
          bestOneRepMax: 100,
          improvementPercentage: 0.5, // < 1% threshold
          trend: 'UPWARD',
          period: {
            startDate: '2026-05-25',
            endDate: '2026-06-15'
          },
          totalWorkouts: 10
        });

      // We don't need to mock the other detectors because we return on the first plateau (strength)
      const result = await service.getPlateauDetection('user-id');

      expect(result).toBeDefined();
      expect(result.plateauDetected).toBe(true);
      expect(result.plateauType).toBe('strength');
      // Confidence: 100 - (0.5 * 100) = 50
      expect(result.confidence).toBe(50);
      expect(result.explanation).toContain('No meaningful 1RM improvement (<1%) over the last 21 days');
    });

    it('should return volume plateau when strength is ok but volume shows <1% increase', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Mock getOverallStrengthTrend to return >1% improvement (so no strength plateau)
      jest.spyOn(service as any, 'getOverallStrengthTrend')
        .mockResolvedValueOnce({
          exerciseId: 'overall',
          currentOneRepMax: 105,
          bestOneRepMax: 100,
          improvementPercentage: 5, // > 1% -> no plateau
          trend: 'UPWARD',
          period: {
            startDate: '2026-05-25',
            endDate: '2026-06-15'
          },
          totalWorkouts: 10
        });

      // Mock getTotalVolume for the two periods (recent and previous)
      // We need to mock getTotalVolumeInDateRange because the private method uses it? Actually, detectVolumePlateau uses getTotalVolume.
      // But getTotalVolume is a public method that calls getTotalVolumeInDateRange.
      // We'll mock getTotalVolumeInDateRange to avoid hitting the database.
      jest.spyOn(service as any, 'getTotalVolumeInDateRange')
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 1000, totalSets: 50, totalReps: 200 })) // recent period (last 21 days)
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 1000, totalSets: 50, totalReps: 200 })); // previous period (21-42 days ago)

      // With same volume, changePercentage = 0% -> plateau
      const result = await service.getPlateauDetection('user-id');

      expect(result).toBeDefined();
      expect(result.plateauDetected).toBe(true);
      expect(result.plateauType).toBe('volume');
      expect(result.confidence).toBe(100); // 0% change -> 100% confidence
      expect(result.explanation).toContain('No meaningful volume increase (<1%) over the last 21 days');
    });

    it('should return consistency plateau when strength and volume are ok but consistency shows <1% increase', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Mock getOverallStrengthTrend to return >1% improvement
      jest.spyOn(service as any, 'getOverallStrengthTrend')
        .mockResolvedValueOnce({
          exerciseId: 'overall',
          currentOneRepMax: 105,
          bestOneRepMax: 100,
          improvementPercentage: 5,
          trend: 'UPWARD',
          period: {
            startDate: '2026-05-25',
            endDate: '2026-06-15'
          },
          totalWorkouts: 10
        });

      // Mock getTotalVolume to return a significant increase (so no volume plateau)
      jest.spyOn(service as any, 'getTotalVolumeInDateRange')
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 2000, totalSets: 100, totalReps: 400 })) // recent
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 1000, totalSets: 50, totalReps: 200 })); // previous

      // Now mock getTotalWorkoutsInDateRange for the consistency check
      // We need to mock getTotalWorkoutsInDateRange (used by detectConsistencyPlateau)
      jest.spyOn(service as any, 'getTotalWorkoutsInDateRange')
        .mockImplementationOnce(() => Promise.resolve(10)) // recent workouts (last 21 days)
        .mockImplementationOnce(() => Promise.resolve(10)); // previous workouts (21-42 days ago)

      // With same workout count, changePercentage = 0% -> plateau
      const result = await service.getPlateauDetection('user-id');

      expect(result).toBeDefined();
      expect(result.plateauDetected).toBe(true);
      expect(result.plateauType).toBe('consistency');
      expect(result.confidence).toBe(100);
      expect(result.explanation).toContain('No meaningful workout frequency increase (<1%) over the last 21 days');
    });

    it('should return no plateau when all metrics show sufficient improvement', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // Strength: >1% improvement
      jest.spyOn(service as any, 'getOverallStrengthTrend')
        .mockResolvedValueOnce({
          exerciseId: 'overall',
          currentOneRepMax: 105,
          bestOneRepMax: 100,
          improvementPercentage: 5,
          trend: 'UPWARD',
          period: {
            startDate: '2026-05-25',
            endDate: '2026-06-15'
          },
          totalWorkouts: 10
        });

      // Volume: >1% increase
      jest.spyOn(service as any, 'getTotalVolumeInDateRange')
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 2000, totalSets: 100, totalReps: 400 })) // recent
        .mockImplementationOnce(() => Promise.resolve({ totalVolume: 1000, totalSets: 50, totalReps: 200 })); // previous

      // Consistency: >1% increase
      jest.spyOn(service as any, 'getTotalWorkoutsInDateRange')
        .mockImplementationOnce(() => Promise.resolve(20)) // recent
        .mockImplementationOnce(() => Promise.resolve(10)); // previous

      const result = await service.getPlateauDetection('user-id');

      expect(result).toBeDefined();
      expect(result.plateauDetected).toBe(false);
      expect(result.plateauType).toBeUndefined();
      expect(result.confidence).toBeUndefined();
      expect(result.explanation).toBeUndefined();
    });

    it('should allow custom periodDays', async () => {
      const mockSupabaseClient = supabaseService.getClient();

      // We'll test with 7 days period
      jest.spyOn(service as any, 'getOverallStrengthTrend')
        .mockResolvedValueOnce({
          exerciseId: 'overall',
          currentOneRepMax: 100.5,
          bestOneRepMax: 100,
          improvementPercentage: 0.5,
          trend: 'UPWARD',
          period: {
            startDate: '2026-06-08', // 7 days before 2026-06-15
            endDate: '2026-06-15'
          },
          totalWorkouts: 10
        });

      // The other methods should not be called because we return on strength plateau
      const result = await service.getPlateauDetection('user-id', 7);

      expect(result).toBeDefined();
      expect(result.plateauDetected).toBe(true);
      expect(result.plateauType).toBe('strength');
      expect(result.explanation).toContain('No meaningful 1RM improvement (<1%) over the last 7 days');
    });
  });
});