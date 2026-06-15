"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const exercise_controller_1 = require("./controllers/exercise.controller");
const exercise_service_1 = require("./services/exercise.service");
const auth_1 = require("../auth");
describe('ExerciseController', () => {
    let controller;
    let service;
    const mockExerciseService = {
        getExercises: jest.fn(),
        getExerciseById: jest.fn(),
        createExercise: jest.fn(),
        updateExercise: jest.fn(),
        deleteExercise: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [exercise_controller_1.ExerciseController],
            providers: [
                { provide: exercise_service_1.ExerciseService, useValue: mockExerciseService },
                { provide: auth_1.JwtAuthGuard, useValue: {} },
            ],
        }).compile();
        controller = module.get(exercise_controller_1.ExerciseController);
        service = module.get(exercise_service_1.ExerciseService);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=exercise.controller.spec.js.map