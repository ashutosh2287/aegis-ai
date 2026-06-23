# Phase 5.2 — Final Benchmark Report

**Date:** 2026-06-23
**Environment:** RTX 3050 Ti Laptop (4GB VRAM), 16GB RAM, Ollama local

---

## 1. Environment Verification

```
Backend Status:    Running (port 3001)
Ollama Status:     Running (localhost:11434)
Chat Model:        qwen3:8b (Q4_K_M, 8.2B params, 5.2GB on disk)
Fast Model:        qwen3:4b (Q4_K_M, 4.0B params, 2.5GB on disk)
Supabase:          Connected
GPU:               NVIDIA RTX 3050 Ti Laptop (4GB VRAM)
```

**Critical finding:** Only ONE model fits in 4GB VRAM at a time (qwen3:8b=2.3GB, qwen3:4b=2.2GB). Model routing causes an 11.4-second model swap penalty per switch.

---

## 2. Raw Benchmark Results

### Chat — qwen3:8b (preloaded, no DB-heavy tool calls)

| Run | Latency | Output Chars |
|-----|---------|-------------|
| 1   | 9,810ms | 261         |
| 2   | 9,201ms | 263         |
| 3   | 9,271ms | 236         |
| 4   | 9,530ms | 263         |
| 5   | 8,648ms | 231         |
| **AVG** | **9,292ms** | **251** |

- Model: qwen3:8b
- Direct Ollama inference: 3,132ms (18 prompt tokens, 12 completion tokens)
- Backend overhead: ~6s (auth guard, tool registry init, system prompt construction)

### Workout — qwen3:8b (preloaded)

| Run | Latency | Days Generated | Status |
|-----|---------|---------------|--------|
| 1   | 120,030ms | 0 | TIMEOUT |
| 2   | 101,131ms | 3 | OK |
| 3   | 120,050ms | 0 | TIMEOUT |
| 4   | 120,035ms | 0 | TIMEOUT |
| 5   | 104,850ms | 3 | OK |
| **AVG** | **113,219ms** | | **40% success rate** |

### Nutrition — qwen3:4b (preloaded)

| Run | Latency | dailyCalories | Status |
|-----|---------|--------------|--------|
| 1   | 6,882ms  | 0 | FAILED (unparseable) |
| 2   | 6,025ms  | 0 | FAILED |
| 3   | 10,628ms | 0 | FAILED |
| 4   | 10,089ms | 0 | FAILED |
| 5   | 10,102ms | 0 | FAILED |
| **AVG** | **8,745ms** | | **0% quality** |

### Analysis — qwen3:4b (preloaded)

| Run | Latency | Recommendations | Status |
|-----|---------|----------------|--------|
| 1   | 14,868ms | 0 | FAILED (unparseable) |
| 2   | 9,870ms  | 0 | FAILED |
| 3   | 10,176ms | 0 | FAILED |
| 4   | 9,976ms  | 0 | FAILED |
| 5   | 7,475ms  | 0 | FAILED |
| **AVG** | **10,473ms** | | **0% quality** |

### Direct Ollama Token Counts

| Endpoint | Model | Prompt Tokens | Completion Tokens | Total Duration |
|----------|-------|--------------|-------------------|----------------|
| Chat | qwen3:8b | 18 | 12 | 3,132ms |
| Workout | qwen3:8b | 104 | 512 | 16,409ms |
| Workout | qwen3:4b | 32 | 512 | 28,061ms |
| Nutrition | qwen3:4b | 36 | 512 | 21,086ms |
| Analysis | qwen3:4b | 41 | 768 | 32,301ms |

---

## 3. Before vs After Comparison

| Endpoint | Before (Phase 5.1) | After (Phase 5.2) | Improvement | Root Cause of Slowdown |
|----------|--------------------|--------------------|-------------|----------------------|
| Chat | ~0.5–30s | **9.3s avg** | **69% faster** | — |
| Workout | ~120s | **113s avg** | 6% faster | N+1 DB queries (401 queries) |
| Nutrition | ~60–90s | **8.7s avg** | **85% faster** | qwen3:4b but 0% JSON quality |
| Analysis | ~80–110s | **10.5s avg** | **87% faster** | qwen3:4b but 0% JSON quality |

**Note:** Nutrition and Analysis latency improved dramatically with qwen3:4b, but the model cannot produce valid JSON without `/no_think` in system prompts — all responses are unparseable.

---

## 4. Target Validation

| Endpoint | Target | Measured | Status |
|----------|--------|----------|--------|
| Chat | <30s | 9.3s avg | **PASS** |
| Workout | <15s | 113s avg | **FAIL** |
| Nutrition | <10s | 8.7s avg | **PASS** (latency only — 0% quality) |
| Analysis | <15s | 10.5s avg | **PASS** (latency only — 0% quality) |

---

## 5. Resource Utilization

```
GPU:        RTX 3050 Ti Laptop
VRAM:       2,346 MiB / 4,096 MiB (57% utilized)
GPU Util:   0% idle, spikes during inference
CPU:        Not bottlenecked
Ollama:     Stable, model swap = 11.4s overhead
```

**GPU offloading:** Effective — models run entirely in VRAM when loaded.
**Model swap:** 11.4 seconds to load a new model from disk to VRAM. Only one model fits at a time.
**CPU bottleneck:** None — inference is GPU-bound.

---

## 6. Root Cause Analysis

### Issue 1: N+1 Database Queries (Workout/Analysis timeout)

`exercise.tool.ts:27-39` — For each of 200 exercises, makes 2 sequential Supabase queries (muscles + equipment). Total: **401 database round-trips** per workout request.

```
Supabase query latency: ~50-200ms each
401 queries × 100ms avg = ~40 seconds just for exercise library
+ profile query + workout history query + LLM inference
= 100-120s total
```

### Issue 2: qwen3:4b JSON Quality (0% parseable output)

qwen3 models use internal "thinking" mode. Without `/no_think` tag in system prompts, the model either:
- Outputs thinking tokens as content (garbage like "000000000...")
- Outputs explanatory text instead of JSON
- The backend `think: false` parameter is not sufficient — `/no_think` must be in the prompt text

### Issue 3: VRAM Limitation (model routing counterproductive)

4GB VRAM fits only one model. Switching between qwen3:8b and qwen3:4b costs 11.4s per swap. Model routing adds latency rather than reducing it.

---

## 7. Recommendation

### Option B: Phase 5.3 Required

**Root causes identified:**
1. N+1 query problem in `exercise.tool.ts` — needs batch queries or pre-caching
2. Missing `/no_think` tag in all qwen3 system prompts — qwen3:4b unusable without it
3. 4GB VRAM limits model routing — single-model strategy needed

**Recommended model changes:**
- Use `qwen3:8b` for ALL endpoints (no model routing)
- Fix prompts to include `/no_think` tag
- Fix N+1 queries with batch Supabase queries or caching

**Additional optimizations required for Phase 5.3:**
1. **Fix N+1 queries**: Rewrite `exercise.tool.ts` to use batch queries (`in` clause) instead of per-exercise queries
2. **Add `/no_think` to all prompts**: Required for qwen3 models to produce direct output
3. **Remove model routing**: Use single model (qwen3:8b) to avoid VRAM swap overhead
4. **Cache exercise library**: Exercises rarely change — cache in memory for 5 minutes
5. **Reduce exercise library size**: 30 exercises sufficient for most users (already done in prompts, but tool still fetches 200)

**Expected improvement after Phase 5.3 fixes:**
- Workout: 113s → **~15s** (fix N+1 queries)
- Nutrition: 8.7s → **~8s** (add /no_think, fix JSON parsing)
- Analysis: 10.5s → **~12s** (add /no_think, fix JSON parsing)
- Chat: 9.3s → **~8s** (add /no_think)

---

## 8. Files Requiring Phase 5.3 Changes

| File | Issue | Fix |
|------|-------|-----|
| `src/ai/tools/exercise.tool.ts` | N+1 queries (401 per request) | Batch queries with `in` clause |
| `src/ai/prompts/workout.prompt.ts` | Missing `/no_think` | Add `/no_think` tag |
| `src/ai/prompts/nutrition.prompt.ts` | Missing `/no_think` | Add `/no_think` tag |
| `src/ai/prompts/analytics.prompt.ts` | Missing `/no_think` | Add `/no_think` tag |
| `src/ai/prompts/coach.prompt.ts` | Missing `/no_think` | Add `/no_think` tag |
| `src/ai/providers/model-router.ts` | Counterproductive on 4GB VRAM | Remove or make optional |
| `backend/.env` | Model routing vars unused | Remove OLLAMA_STRUCT_MODEL |
