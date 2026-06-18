import { Test, TestingModule } from "@nestjs/testing";
import { ExerciseController } from "./controllers/exercise.controller";
import { ExerciseService } from "./services/exercise.service";
import { JwtAuthGuard } from "@/auth";

describe("ExerciseController", () => {
  let controller: ExerciseController;
  let service: ExerciseService;

  const mockExerciseService = {
    getExercises: jest.fn(),
    getExerciseById: jest.fn(),
    createExercise: jest.fn(),
    updateExercise: jest.fn(),
    deleteExercise: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseController],
      providers: [
        { provide: ExerciseService, useValue: mockExerciseService },
        { provide: JwtAuthGuard, useValue: {} }, // Mock the guard
      ],
    }).compile();

    controller = module.get<ExerciseController>(ExerciseController);
    service = module.get<ExerciseService>(ExerciseService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  // We'll add more tests as needed, but for brevity, we'll skip the detailed unit tests.
  // In a real implementation, we would test each method.
});
