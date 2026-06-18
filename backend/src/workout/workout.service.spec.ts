import { Test, TestingModule } from "@nestjs/testing";
import { WorkoutService } from "./workout.service";
import { SupabaseService } from "../supabase/supabase.service";

describe("WorkoutService", () => {
  let service: WorkoutService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    getClient: () => ({
      from: () => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        // We might need to mock the actual return values for data and error in tests, but for now we just need the service to be defined.
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<WorkoutService>(WorkoutService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
