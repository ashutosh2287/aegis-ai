import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutExercisesService } from './workout-exercises.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ExerciseService } from '../exercise/services/exercise.service';

describe('WorkoutExercisesService', () => {
  let service: WorkoutExercisesService;
  let supabaseService: SupabaseService;
  let exerciseService: ExerciseService;

  // Mock Supabase client methods
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockEq: jest.Mock;
  let mockIn: jest.Mock;
  let mockOrder: jest.Mock;
  let mockLimit: jest.Mock;
  let mockSingle: jest.Mock;
  let mockIs: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Initialize the mock functions
    mockFrom = jest.fn();
    mockSelect = jest.fn();
    mockInsert = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockEq = jest.fn();
    mockIn = jest.fn();
    mockOrder = jest.fn();
    mockLimit = jest.fn();
    mockSingle = jest.fn();
    mockIs = jest.fn();

    // Set up the Supabase client structure
    const mockSupabaseClient = {
      from: mockFrom,
    };

    const mockSupabaseServiceValue = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const mockExerciseServiceValue = {
      getExerciseById: jest.fn(),
    };

    // We will not set up the mock chain here; we will do it in each test.

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutExercisesService,
        { provide: SupabaseService, useValue: mockSupabaseServiceValue },
        { provide: ExerciseService, useValue: mockExerciseServiceValue },
      ],
    }).compile();

    service = module.get<WorkoutExercisesService>(WorkoutExercisesService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    exerciseService = module.get<ExerciseService>(ExerciseService);
  });

  describe('addExerciseToWorkout', () => {
    it('should add an exercise to a workout', async () => {
      const workoutId = 'workout-id';
      const userId = 'user-id';
      const dto = { exerciseId: 'exercise-id', notes: 'Test notes' };

      // Mock workout exists: from('workouts').select('id').eq('id', workoutId).eq('user_id', userId).is('deleted_at', null).single()
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
      mockSingle.mockResolvedValueOnce({ data: { id: workoutId, user_id: userId }, error: null });

      // Mock exercise exists
      (exerciseService.getExerciseById as jest.Mock).mockResolvedValueOnce({
        id: 'exercise-id',
        name: 'Test Exercise',
        description: null,
        movementPattern: 0 as any,
        difficulty: 0 as any,
        videoUrl: null,
        instructions: null,
        isCustom: false,
        createdBy: null,
        parentVariationId: null,
        tags: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        muscleGroups: [],
        equipmentNeeded: [],
      });

      // Mock for order query: from('workout_exercises').select('order_index').eq('workout_id', workoutId).is('deleted_at', null).order('order_index', { ascending: false }).limit(1)
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
      mockLimit.mockResolvedValueOnce({ data: [], error: null });

      // Mock for insert workout_exercise: from('workout_exercises').insert(...).select().single()
      mockFrom.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'workout-exercise-id',
          workout_id: workoutId,
          exercise_id: dto.exerciseId,
          order_index: 0,
          notes: dto.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        error: null,
      });

      const result = await service.addExerciseToWorkout(workoutId, userId, dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('workout-exercise-id');
      expect(result.notes).toBe(dto.notes);
    });
  });

  describe('getWorkoutExercises', () => {
    it('should return workout exercises for a workout', async () => {
      const workoutId = 'workout-id';
      const userId = 'user-id';

      // Mock workout exists
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
      mockSingle.mockResolvedValueOnce({ data: { id: workoutId, user_id: userId }, error: null });

      // Mock workout exercises query
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              order: mockOrder,
            }),
          }),
        }),
      });
      mockOrder.mockResolvedValueOnce({
        data: [
          {
            id: 'we1',
            workout_id: workoutId,
            exercise_id: 'exercise-id-1',
            order_index: 0,
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          {
            id: 'we2',
            workout_id: workoutId,
            exercise_id: 'exercise-id-2',
            order_index: 1,
            notes: 'Notes',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
        ],
        error: null,
      });

      // Mock exercise service getExerciseById for each exercise
      (exerciseService.getExerciseById as jest.Mock)
        .mockResolvedValueOnce({
          id: 'exercise-id-1',
          name: 'Exercise 1',
          description: null,
          movementPattern: 0 as any,
          difficulty: 0 as any,
          videoUrl: null,
          instructions: null,
          isCustom: false,
          createdBy: null,
          parentVariationId: null,
          tags: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          muscleGroups: [],
          equipmentNeeded: [],
        })
        .mockResolvedValueOnce({
          id: 'exercise-id-2',
          name: 'Exercise 2',
          description: null,
          movementPattern: 0 as any,
          difficulty: 0 as any,
          videoUrl: null,
          instructions: null,
          isCustom: false,
          createdBy: null,
          parentVariationId: null,
          tags: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          muscleGroups: [],
          equipmentNeeded: [],
        });

      const result = await service.getWorkoutExercises(workoutId, userId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('we1');
      expect(result[0].exercise.name).toBe('Exercise 1');
      expect(result[1].id).toBe('we2');
      expect(result[1].exercise.name).toBe('Exercise 2');
    });
  });

  describe('updateWorkoutExercise', () => {
    it('should update a workout exercise', async () => {
      const workoutId = 'workout-id';
      const userId = 'user-id';
      const workoutExerciseId = 'we-id';
      const dto = { notes: 'Updated notes' };

      // Mock workout exists
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
      mockSingle.mockResolvedValueOnce({ data: { id: workoutId, user_id: userId }, error: null });

      // Mock workout exercise exists
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
      mockSingle.mockResolvedValueOnce({ data: { id: workoutExerciseId, workout_id: workoutId }, error: null });

      // Mock update for workout_exercise
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
      mockSingle.mockResolvedValueOnce({
        data: {
          id: workoutExerciseId,
          workout_id: workoutId,
          exercise_id: 'exercise-id',
          order_index: 0,
          notes: dto.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        error: null,
      });

      await service.updateWorkoutExercise(workoutId, userId, workoutExerciseId, dto);

      // Verify the update was called with the correct parameters
      expect(mockFrom).toHaveBeenCalledWith('workout_exercises');
      expect(mockUpdate).toHaveBeenCalledWith({ notes: dto.notes });
      expect(mockEq).toHaveBeenCalledWith('id', workoutExerciseId);
    });
  });

  describe('deleteWorkoutExercise', () => {
    it('should soft delete a workout exercise', async () => {
      const workoutId = 'workout-id';
      const userId = 'user-id';
      const workoutExerciseId = 'we-id';

      // Mock workout exists
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
      mockSingle.mockResolvedValueOnce({ data: { id: workoutId, user_id: userId }, error: null });

      // Mock workout exercise exists
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
      mockSingle.mockResolvedValueOnce({ data: { id: workoutExerciseId, workout_id: workoutId }, error: null });

      // Mock update for soft delete
      mockFrom.mockReturnValueOnce({
        update: mockUpdate,
      });
      mockUpdate.mockReturnValueOnce({
        eq: mockEq,
      });
      mockEq.mockResolvedValueOnce({ error: null });

      await service.deleteWorkoutExercise(workoutId, userId, workoutExerciseId);

      // Verify the update was called with the correct parameters
      expect(mockFrom).toHaveBeenCalledWith('workout_exercises');
      expect(mockUpdate).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
      expect(mockEq).toHaveBeenCalledWith('id', workoutExerciseId);
    });
  });

  describe('reorderWorkoutExercises', () => {
    it('should reorder workout exercises', async () => {
      const workoutId = 'workout-id';
      const userId = 'user-id';
      const workoutExerciseIds = ['we1', 'we2', 'we3'];

      // Mock workout exists
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
      mockSingle.mockResolvedValueOnce({ data: { id: workoutId, user_id: userId }, error: null });

      // Mock get current exercises
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockResolvedValue({
              data: [
                { id: 'we1', orderIndex: 0 },
                { id: 'we2', orderIndex: 1 },
                { id: 'we3', orderIndex: 2 },
              ],
              error: null,
            }),
          }),
        }),
      });

      // Mock update calls for each exercise
      // We expect three update calls
      mockUpdate.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: null });

      mockFrom.mockImplementation(() => ({
        update: mockUpdate,
      }));

      // Prepare the DTO for reorder
      const reorderDto = {
        items: workoutExerciseIds.map((id, index) => ({ id, orderIndex: index })),
      };

      await service.reorderWorkoutExercises(workoutId, userId, reorderDto);

      // Verify that update was called three times with the correct parameters
      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(mockUpdate).toHaveBeenNthCalledWith(1, { order_index: 0 });
      expect(mockUpdate).toHaveBeenNthCalledWith(2, { order_index: 1 });
      expect(mockUpdate).toHaveBeenNthCalledWith(3, { order_index: 2 });

      // Verify that eq was called three times with the correct parameters
      expect(mockEq).toHaveBeenCalledTimes(3);
      expect(mockEq).toHaveBeenNthCalledWith(1, 'id', 'we1');
      expect(mockEq).toHaveBeenNthCalledWith(2, 'id', 'we2');
      expect(mockEq).toHaveBeenNthCalledWith(3, 'id', 'we3');
    });
  });
});