"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const exercise_service_1 = require("./services/exercise.service");
const supabase_service_1 = require("../supabase/supabase.service");
describe('ExerciseService', () => {
    let service;
    let supabaseService;
    const mockSupabaseService = {
        getClient: () => ({
            from: () => ({
                select: jest.fn().mockReturnThis(),
                ilike: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                cs: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                offset: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                update: jest.fn().mockReturnThis(),
                delete: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
            }),
        }),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                exercise_service_1.ExerciseService,
                { provide: supabase_service_1.SupabaseService, useValue: mockSupabaseService },
            ],
        }).compile();
        service = module.get(exercise_service_1.ExerciseService);
        supabaseService = module.get(supabase_service_1.SupabaseService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=exercise.service.spec.js.map