import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("Exercise (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let exerciseId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    // Signup a user
    const signupRes = await request(app.getHttpServer())
      .post("/auth/signup")
      .send({
        email: `e2e_test_${Date.now()}@example.com`,
        password: "password123",
        fullName: "E2E Test User",
      })
      .expect(201);

    accessToken = signupRes.body.accessToken;

    // Login to get a fresh token (optional, but we'll use the same)
    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: `e2e_test_${Date.now()}@example.com`,
        password: "password123",
      })
      .expect(200);

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it("/exercises (POST) - should create a new exercise", () => {
    return request(app.getHttpServer())
      .post("/exercises")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Bench Press",
        description: "A classic chest exercise",
        movementPattern: "push",
        difficulty: "intermediate",
        videoUrl: "https://example.com/bench-press.mp4",
        instructions: "Lie on a bench and press the weight up.",
        muscleGroups: ["chest", "triceps", "shoulders"],
        equipmentNeeded: ["barbell", "bench"],
        tags: ["strength", "upper body"],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        exerciseId = res.body.id;
        expect(res.body.name).toBe("Bench Press");
        expect(res.body.muscleGroups).toEqual([
          "chest",
          "triceps",
          "shoulders",
        ]);
        expect(res.body.equipmentNeeded).toEqual(["barbell", "bench"]);
      });
  });

  it("/exercises (GET) - should list exercises", () => {
    return request(app.getHttpServer())
      .get("/exercises")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        // Check that our created exercise is in the list
        const found = res.body.find((ex: any) => ex.id === exerciseId);
        expect(found).toBeDefined();
        expect(found?.name).toBe("Bench Press");
      });
  });

  it("/exercises/:id (GET) - should get exercise by ID", () => {
    return request(app.getHttpServer())
      .get(`/exercises/${exerciseId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(exerciseId);
        expect(res.body.name).toBe("Bench Press");
      });
  });

  it("/exercises/:id (PATCH) - should update the exercise", () => {
    return request(app.getHttpServer())
      .patch(`/exercises/${exerciseId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Incline Bench Press",
        description: "An incline chest exercise",
        muscleGroups: ["upper chest", "shoulders"],
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(exerciseId);
        expect(res.body.name).toBe("Incline Bench Press");
        expect(res.body.description).toBe("An incline chest exercise");
        expect(res.body.muscleGroups).toEqual(["upper chest", "shoulders"]);
      });
  });

  it("/exercises/:id (DELETE) - should delete the exercise", () => {
    return request(app.getHttpServer())
      .delete(`/exercises/${exerciseId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe("Exercise deleted successfully");
      });
  });

  it("/exercises/:id (GET) - should return 404 after deletion", () => {
    return request(app.getHttpServer())
      .get(`/exercises/${exerciseId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404);
  });
});
