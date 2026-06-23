#!/usr/bin/env node

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const CHAT_MODEL = process.env.AI_MODEL || process.env.OLLAMA_CHAT_MODEL || 'qwen3:8b';
const STRUCT_MODEL = process.env.AI_MODEL || process.env.OLLAMA_CHAT_MODEL || 'qwen3:8b';

const CHAT_MAX_TOKENS = 2048;
const WORKOUT_MAX_TOKENS = 512;
const NUTRITION_MAX_TOKENS = 512;
const ANALYSIS_MAX_TOKENS = 768;

async function ollamaComplete(model, messages, maxTokens, temperature = 0.7) {
  const t0 = Date.now();
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        think: false,
        options: { temperature, num_predict: maxTokens },
      }),
    });
    const data = await response.json();
    const latencyMs = Date.now() - t0;
    return {
      latencyMs,
      promptTokens: data.prompt_eval_count || 0,
      completionTokens: data.eval_count || 0,
      contentLength: (data.message?.content || '').length,
      tokensPerSec: data.eval_duration ? (data.eval_count / (data.eval_duration / 1e9)).toFixed(1) : 'N/A',
      model: data.model,
    };
  } catch (err) {
    return { latencyMs: Date.now() - t0, error: err.message };
  }
}

const TEST_PROMPTS = {
  chat: [
    { role: 'system', content: 'You are AEGIS AI Coach, a fitness coaching assistant. Be concise.' },
    { role: 'user', content: 'What exercises should I do for chest?' },
  ],
  workout: [
    { role: 'system', content: 'Expert workout programmer. Return JSON only: {"summary":"plan","weeklySplit":{"days":[{"day":"Mon","focus":"Chest","exercises":[{"name":"Bench","muscleGroups":["chest"],"sets":4,"reps":"8-12","restSeconds":90,"notes":"tip"}]}]},"notes":["tip"]}' },
    { role: 'user', content: 'Generate 3-day workout for muscle gain. Profile: male, 25, 75kg, intermediate, has barbell. Return JSON only.' },
  ],
  nutrition: [
    { role: 'system', content: 'Expert nutritionist. Return JSON only: {"summary":"plan","dailyCalories":2500,"goalCalories":2800,"macros":{"protein":180,"carbs":315,"fat":78},"mealPlan":{"breakfast":{"name":"Oats","desc":"Oats with berries","cal":500,"protein":20,"carbs":70,"fat":12},"lunch":{},"dinner":{},"snacks":{}}}' },
    { role: 'user', content: 'Create nutrition plan. Male, 75kg, 180cm, 25yo, moderate activity, muscle gain, non-veg. Return JSON only.' },
  ],
  analysis: [
    { role: 'system', content: 'Expert fitness analyst. Return JSON only: {"summary":"assessment","workoutConsistency":"analysis","volumeProgression":"trends","strengthProgression":"gains","goalProgress":"eval","issues":["issue"],"recommendations":["rec"],"nextActions":["action"]}' },
    { role: 'user', content: 'Analyze progress: trained 12 times this month, volume up 15%, strength stable, goal muscle gain. Return JSON only.' },
  ],
};

async function runBenchmarks() {
  console.log('=== AEGIS AI Performance Benchmark ===');
  console.log(`Chat Model: ${CHAT_MODEL}`);
  console.log(`Struct Model: ${STRUCT_MODEL}`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);
  console.log('');

  const results = {};

  for (const [endpoint, messages] of Object.entries(TEST_PROMPTS)) {
    const maxTokens = endpoint === 'chat' ? CHAT_MAX_TOKENS
      : endpoint === 'workout' ? WORKOUT_MAX_TOKENS
      : endpoint === 'nutrition' ? NUTRITION_MAX_TOKENS
      : ANALYSIS_MAX_TOKENS;
    const model = endpoint === 'chat' ? CHAT_MODEL : STRUCT_MODEL;
    const temp = endpoint === 'analysis' ? 0.6 : endpoint === 'workout' ? 0.8 : 0.7;

    console.log(`--- ${endpoint.toUpperCase()} (${model}, maxTokens=${maxTokens}) ---`);

    const runs = [];
    for (let i = 0; i < 3; i++) {
      const result = await ollamaComplete(model, messages, maxTokens, temp);
      runs.push(result);
      console.log(`  Run ${i + 1}: ${result.latencyMs}ms | tokens=${result.promptTokens}+${result.completionTokens} | output=${result.contentLength} chars | tok/s=${result.tokensPerSec}`);
    }

    const avgLatency = Math.round(runs.reduce((s, r) => s + r.latencyMs, 0) / runs.length);
    const avgTokensPerSec = runs.filter(r => r.tokensPerSec !== 'N/A').length > 0
      ? (runs.filter(r => r.tokensPerSec !== 'N/A').reduce((s, r) => s + parseFloat(r.tokensPerSec), 0) / runs.filter(r => r.tokensPerSec !== 'N/A').length).toFixed(1)
      : 'N/A';

    results[endpoint] = {
      model,
      maxTokens,
      avgLatencyMs: avgLatency,
      avgTokensPerSec,
      runs: runs.map(r => ({ latencyMs: r.latencyMs, promptTokens: r.promptTokens, completionTokens: r.completionTokens, contentLength: r.contentLength })),
    };

    console.log(`  AVG: ${avgLatency}ms | tok/s: ${avgTokensPerSec}`);
    console.log('');
  }

  console.log('=== Summary Table ===');
  console.log('Endpoint  | Model       | MaxTokens | Avg Latency | Tok/s | Output Chars');
  console.log('----------|-------------|-----------|-------------|-------|-------------');
  for (const [endpoint, data] of Object.entries(results)) {
    const avgChars = Math.round(data.runs.reduce((s, r) => s + r.contentLength, 0) / data.runs.length);
    console.log(`${endpoint.padEnd(10)}| ${data.model.padEnd(12)}| ${String(data.maxTokens).padEnd(10)}| ${String(data.avgLatencyMs + 'ms').padEnd(12)}| ${String(data.avgTokensPerSec).padEnd(6)}| ${avgChars}`);
  }

  return results;
}

async function runLoadTest() {
  console.log('\n=== Load Test: Sequential (20 requests) ===');
  const sequential = [];
  const t0 = Date.now();

  for (let i = 0; i < 20; i++) {
    const result = await ollamaComplete(CHAT_MODEL, [
      { role: 'system', content: 'You are a fitness coach. Be concise.' },
      { role: 'user', content: 'Give me a quick tip for chest day.' },
    ], 256, 0.7);
    sequential.push(result);
    process.stdout.write(`  ${i + 1}: ${result.latencyMs}ms ${result.error ? 'ERROR: ' + result.error : ''}\n`);
  }

  const seqTotal = Date.now() - t0;
  const seqSuccess = sequential.filter(r => !r.error).length;
  const seqLatencies = sequential.filter(r => !r.error).map(r => r.latencyMs).sort((a, b) => a - b);
  const seqP95 = seqLatencies[Math.floor(seqLatencies.length * 0.95)] || 0;
  const seqAvg = Math.round(seqLatencies.reduce((s, l) => s + l, 0) / seqLatencies.length);

  console.log(`  Total: ${seqTotal}ms | Success: ${seqSuccess}/20 | Avg: ${seqAvg}ms | P95: ${seqP95}ms`);

  console.log('\n=== Load Test: Concurrent (10 requests) ===');
  const t1 = Date.now();
  const concurrentPromises = Array.from({ length: 10 }, (_, i) =>
    ollamaComplete(CHAT_MODEL, [
      { role: 'system', content: 'You are a fitness coach. Be concise.' },
      { role: 'user', content: `Quick tip ${i + 1} for training.` },
    ], 256, 0.7)
  );
  const concurrent = await Promise.all(concurrentPromises);
  const conTotal = Date.now() - t1;
  const conSuccess = concurrent.filter(r => !r.error).length;
  const conLatencies = concurrent.filter(r => !r.error).map(r => r.latencyMs).sort((a, b) => a - b);
  const conP95 = conLatencies[Math.floor(conLatencies.length * 0.95)] || 0;
  const conAvg = Math.round(conLatencies.reduce((s, l) => s + l, 0) / conLatencies.length);

  console.log(`  Total: ${conTotal}ms | Success: conSuccess/10 | Avg: ${conAvg}ms | P95: ${conP95}ms`);

  return {
    sequential: { totalMs: seqTotal, successRate: `${seqSuccess}/20`, avgMs: seqAvg, p95Ms: seqP95 },
    concurrent: { totalMs: conTotal, successRate: `${conSuccess}/10`, avgMs: conAvg, p95Ms: conP95 },
  };
}

async function main() {
  try {
    const benchResults = await runBenchmarks();
    const loadResults = await runLoadTest();

    console.log('\n=== Load Test Summary ===');
    console.log(`Sequential: ${loadResults.sequential.totalMs}ms total, ${loadResults.sequential.avgMs}ms avg, P95=${loadResults.sequential.p95Ms}ms, ${loadResults.sequential.successRate} success`);
    console.log(`Concurrent: ${loadResults.concurrent.totalMs}ms total, ${loadResults.concurrent.avgMs}ms avg, P95=${loadResults.concurrent.p95Ms}ms, ${loadResults.concurrent.successRate} success`);

    const report = {
      timestamp: new Date().toISOString(),
      models: { chat: CHAT_MODEL, struct: STRUCT_MODEL },
      benchmarks: benchResults,
      loadTest: loadResults,
    };

    const fs = require('fs');
    fs.writeFileSync('benchmark-results.json', JSON.stringify(report, null, 2));
    console.log('\nResults saved to benchmark-results.json');
  } catch (err) {
    console.error('Benchmark failed:', err.message);
  }
}

main();
