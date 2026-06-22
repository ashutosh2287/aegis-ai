import { Test, TestingModule } from '@nestjs/testing';
import { ProfileTool } from '../tools/profile.tool';
import { SupabaseService } from '../../supabase/supabase.service';

describe('ProfileTool', () => {
  let tool: ProfileTool;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'user-1',
          date_of_birth: '2000-01-01',
          gender: 'male',
          height: 175,
          weight: 75,
          goals: ['muscle_gain'],
          experience_level: 'intermediate',
          equipment: ['barbell', 'dumbbells'],
          target_days_per_week: 4,
          training_years: 2,
          primary_goal: 'muscle_gain',
          preferred_units: 'metric',
        },
        error: null,
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileTool,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    tool = module.get<ProfileTool>(ProfileTool);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      const result = await tool.getUserProfile('user-1');

      expect(result).toHaveProperty('id', 'user-1');
      expect(result).toHaveProperty('gender', 'male');
      expect(result).toHaveProperty('height', 175);
      expect(result).toHaveProperty('weight', 75);
      expect(result).toHaveProperty('experienceLevel', 'intermediate');
      expect(result).toHaveProperty('goals');
      expect(result).toHaveProperty('equipment');
    });

    it('should calculate age from date of birth', async () => {
      const result = await tool.getUserProfile('user-1');
      expect(result.age).toBeGreaterThanOrEqual(25);
      expect(result.age).toBeLessThanOrEqual(27);
    });

    it('should return default values on error', async () => {
      mockSupabaseService.getClient().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await tool.getUserProfile('user-1');
      expect(result.experienceLevel).toBe('beginner');
      expect(result.goals).toEqual([]);
    });
  });
});
