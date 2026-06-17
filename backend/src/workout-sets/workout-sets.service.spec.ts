import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutSetsService } from './workout-sets.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WorkoutSetsService', () => {
  let service: WorkoutSetsService;
  let supabaseService: SupabaseService;

  // Mock Supabase client methods
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;
  let mockIs: jest.Mock;
  let mockOrder: jest.Mock;
  let mockLimit: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Initialize the mock functions
    mockFrom = jest.fn();
    mockSelect = jest.fn();
    mockInsert = jest.fn();
    mockUpdate = jest.fn();
    mockEq = jest.fn();
    mockIs = jest.fn();
    mockOrder = jest.fn();
    mockLimit = jest.fn();
    mockSingle = jest.fn();

    // Set up the Supabase client structure
    const mockSupabaseClient = {
      from: mockFrom,
    };

    const mockSupabaseServiceValue = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    // We will not set up the mock chain here; we will do it in each test.

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutSetsService,
        { provide: SupabaseService, useValue: mockSupabaseServiceValue },
      ],
    }).compile();

    service = module.get<WorkoutSetsService>(WorkoutSetsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSet', () => {
    it('should create a set successfully', async () => {
      // Mock the workout exercise lookup
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };
      // Mock the workout lookup
      const mockWorkoutData = { id: 'w-1' };
      // Mock the set lookup for max set_number (returns empty, so set_number = 1)
      const mockSetData: any[] = [];
      // Mock the insert result
      const mockInsertResult = {
        id: 's-1',
        workout_exercise_id: 'we-1',
        set_number: 1,
        reps: 10,
        weight: 80,
        rpe: 8,
        notes: 'Felt strong',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };

      // 1) from('workout_exercises').select().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      // 2) from('workouts').select().eq().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutData, error: null });

      // 3) from('workout_sets').select().eq().is().order().limit()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: mockLimit,
              }),
            }),
          }),
        }),
      });
      mockLimit.mockResolvedValueOnce({ data: mockSetData, error: null });

      // 4) from('workout_sets').insert().select().single()
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockInsertResult, error: null });

      const result = await service.createSet(
        'we-1',
        'user-1',
        { reps: 10, weight: 80, rpe: 8, notes: 'Felt strong' },
      );

      expect(result).toEqual({
        id: 's-1',
        workoutExerciseId: 'we-1',
        setNumber: 1,
        reps: 10,
        weight: 80,
        rpe: 8,
        notes: 'Felt strong',
        createdAt: mockInsertResult.created_at,
        updatedAt: mockInsertResult.updated_at,
        deletedAt: mockInsertResult.deleted_at,
      });
    });

    it('should throw NotFoundException when workout exercise not found', async () => {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.createSet('we-1', 'user-1', { reps: 10 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when workout not found (ownership violation)', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.createSet('we-1', 'user-1', { reps: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWorkoutSets', () => {
    it('should get workout sets successfully', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };
      const mockWorkoutData = { id: 'w-1' };
      const mockSetsData = [
        {
          id: 's-1',
          workout_exercise_id: 'we-1',
          set_number: 1,
          reps: 10,
          weight: 80,
          rpe: 8,
          notes: 'Felt strong',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      ];

      // 1) from('workout_exercises').select().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      // 2) from('workouts').select().eq().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutData, error: null });

      // 3) from('workout_sets').select().eq().is().order()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              order: mockOrder,
            }),
          }),
        }),
      });
      mockOrder.mockResolvedValueOnce({ data: mockSetsData, error: null });

      const result = await service.getWorkoutSets('we-1', 'user-1');

      expect(result).toEqual([
        {
          id: 's-1',
          workoutExerciseId: 'we-1',
          setNumber: 1,
          reps: 10,
          weight: 80,
          rpe: 8,
          notes: 'Felt strong',
          createdAt: mockSetsData[0].created_at,
          updatedAt: mockSetsData[0].updated_at,
          deletedAt: mockSetsData[0].deleted_at,
        },
      ]);
    });

    it('should throw NotFoundException when workout exercise not found', async () => {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.getWorkoutSets('we-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when workout not found (ownership violation)', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.getWorkoutSets('we-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSet', () => {
    it('should update a set successfully', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };
      const mockWorkoutData = { id: 'w-1' };
      const mockSetData = {
        id: 's-1',
        workout_exercise_id: 'we-1',
        set_number: 1,
        reps: 10,
        weight: 80,
        rpe: 8,
        notes: 'Felt strong',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      const mockUpdatedSetData = {
        ...mockSetData,
        reps: 12,
        weight: 82.5,
        rpe: 7,
        notes: 'Improved',
        updated_at: new Date().toISOString(),
      };

      // 1) from('workout_exercises').select().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      // 2) from('workouts').select().eq().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutData, error: null });

      // 3) from('workout_sets').select().eq().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockSetData, error: null });

      // 4) from('workout_sets').update().eq().select().single()
      mockFrom.mockReturnValueOnce({
        update: mockUpdate,
      });
      mockUpdate.mockReturnValueOnce({
        eq: mockEq,
      });
      mockEq.mockReturnValueOnce({
        select: mockSelect,
      });
      mockSelect.mockReturnValueOnce({
        single: mockSingle,
      });
      mockSingle.mockResolvedValueOnce({ data: mockUpdatedSetData, error: null });

      const result = await service.updateSet(
        'we-1',
        'user-1',
        's-1',
        { reps: 12, weight: 82.5, rpe: 7, notes: 'Improved' },
      );

      expect(result).toEqual({
        id: 's-1',
        workoutExerciseId: 'we-1',
        setNumber: 1,
        reps: 12,
        weight: 82.5,
        rpe: 7,
        notes: 'Improved',
        createdAt: mockUpdatedSetData.created_at,
        updatedAt: mockUpdatedSetData.updated_at,
        deletedAt: mockUpdatedSetData.deleted_at,
      });
    });

    it('should throw NotFoundException when workout exercise not found', async () => {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.updateSet('we-1', 'user-1', 's-1', { reps: 12 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when workout not found (ownership violation)', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.updateSet('we-1', 'user-1', 's-1', { reps: 12 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when set not found', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };
      const mockWorkoutData = { id: 'w-1' };

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.updateSet('we-1', 'user-1', 's-1', { reps: 12 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSet', () => {
    it('should delete a set successfully', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };
      const mockWorkoutData = { id: 'w-1' };
      const mockSetData = { id: 's-1' };

      // 1) from('workout_exercises').select().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      // 2) from('workouts').select().eq().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutData, error: null });

      // 3) from('workout_sets').select().eq().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockSetData, error: null });

      // 4) from('workout_sets').update().eq()  -- soft delete, resolves directly
      mockFrom.mockReturnValueOnce({
        update: mockUpdate,
      });
      mockUpdate.mockReturnValueOnce({
        eq: mockEq,
      });
      mockEq.mockResolvedValueOnce({ error: null });

      await expect(
        service.deleteSet('we-1', 'user-1', 's-1'),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException when workout exercise not found', async () => {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.deleteSet('we-1', 'user-1', 's-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when workout not found (ownership violation)', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.deleteSet('we-1', 'user-1', 's-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when set not found', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };
      const mockWorkoutData = { id: 'w-1' };

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.deleteSet('we-1', 'user-1', 's-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorderSets', () => {
    it('should reorder sets successfully', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };
      const mockWorkoutData = { id: 'w-1' };
      const mockExistingSetsData = [{ id: 's-1' }, { id: 's-2' }];

      // 1) from('workout_exercises').select().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      // 2) from('workouts').select().eq().eq().is().single()
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutData, error: null });

      // 3) from('workout_sets').select().eq().is() -- existing sets, resolves directly
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: mockIs,
          }),
        }),
      });
      mockIs.mockResolvedValueOnce({ data: mockExistingSetsData, error: null });

      // 4) from('workout_sets').update().eq() -- one call per item in dto.items
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: null });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const dto = {
        items: [
          { id: 's-1', setNumber: 2 },
          { id: 's-2', setNumber: 1 },
        ],
      };

      await expect(
        service.reorderSets('we-1', 'user-1', dto),
      ).resolves.not.toThrow();

      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockEq).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when workout exercise not found', async () => {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const dto = { items: [{ id: 's-1', setNumber: 1 }] };

      await expect(
        service.reorderSets('we-1', 'user-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when workout not found (ownership violation)', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const dto = { items: [{ id: 's-1', setNumber: 1 }] };

      await expect(
        service.reorderSets('we-1', 'user-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when one or more set IDs not found', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };
      const mockWorkoutData = { id: 'w-1' };
      const mockExistingSetsData = [{ id: 's-1' }];

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: mockIs,
          }),
        }),
      });
      mockIs.mockResolvedValueOnce({ data: mockExistingSetsData, error: null });

      const dto = {
        items: [
          { id: 's-1', setNumber: 1 },
          { id: 's-2', setNumber: 2 }, // s-2 does not exist
        ],
      };

      await expect(
        service.reorderSets('we-1', 'user-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when number of IDs does not match', async () => {
      const mockWorkoutExerciseData = { id: 'we-1', workout_id: 'w-1' };
      const mockWorkoutData = { id: 'w-1' };
      const mockExistingSetsData = [{ id: 's-1' }, { id: 's-2' }];

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutExerciseData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              is: jest.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({ data: mockWorkoutData, error: null });

      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: mockIs,
          }),
        }),
      });
      mockIs.mockResolvedValueOnce({ data: mockExistingSetsData, error: null });

      const dto = {
        items: [{ id: 's-1', setNumber: 1 }], // Only one item, but there are two sets
      };

      await expect(
        service.reorderSets('we-1', 'user-1', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});