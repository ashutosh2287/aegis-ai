import { Test, TestingModule } from "@nestjs/testing";
import { WorkoutController } from "./workout.controller";
import { WorkoutService } from "./workout.service";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";

describe("WorkoutController", () => {
  let controller: WorkoutController;
  let service: WorkoutService;

  const mockWorkoutService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutController],
      providers: [
        { provide: WorkoutService, useValue: mockWorkoutService },
        { provide: JwtAuthGuard, useValue: {} }, // Mock the guard
      ],
    }).compile();

    controller = module.get<WorkoutController>(WorkoutController);
    service = module.get<WorkoutService>(WorkoutService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
