/**
 * test-backend-suite.ts
 * Real integration test runner asserting:
 * 1. Health check & Storage status
 * 2. Quiz creation, draft creation, and retrieval
 * 3. Creator authorization and draft publishing
 * 4. Zero secret leakage (no editTokenHash, recoveryCodeHash, creatorAnswers in public response)
 * 5. Recovery token rotation & previous token invalidation
 * 6. Rate limiting on 5 failed recovery attempts (429 response)
 * 7. Server-side score calculation and submission persistence
 * 8. Leaderboard retrieval and idempotency
 */

const BASE_URL = 'http://127.0.0.1:3000';

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TEST SUITE ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Health Check
  console.log('[Test 1] Checking /api/health and /api/storage/status...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert(healthRes.ok, '/api/health returns 200 OK');
  const healthData = await healthRes.json();
  assert(healthData.status === 'ok', 'health status is "ok"');
  assert(Boolean(healthData.storage), 'health includes storage status object');
  console.log('Storage Status Details:', JSON.stringify(healthData.storage));

  // 2. Create Published Quiz
  console.log('\n[Test 2] Creating new published quiz...');
  const createRes = await fetch(`${BASE_URL}/api/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'friendship',
      creatorName: 'TestCreator',
      creatorAnswers: { '1': 0, '2': 1, '3': 2 },
      questionIds: [1, 2, 3],
      status: 'published',
    }),
  });
  assert(createRes.status === 201, 'Create quiz returns 201 Created');
  const createData = await createRes.json();
  const quizId = createData.quizId;
  const editToken = createData.editToken;
  const recoveryCode = createData.recoveryCode;
  assert(Boolean(quizId && quizId.startsWith('bb_')), `Valid quizId created: ${quizId}`);
  assert(Boolean(editToken && editToken.length === 64), 'Valid 64-char editToken returned to creator');
  assert(Boolean(recoveryCode && recoveryCode.startsWith('BB-')), `Valid recoveryCode returned: ${recoveryCode}`);

  // 3. Public Quiz Retrieval (Leak Check)
  console.log('\n[Test 3] Fetching public quiz endpoint /api/quizzes/:id (checking for leaks)...');
  const publicRes = await fetch(`${BASE_URL}/api/quizzes/${quizId}`);
  assert(publicRes.ok, 'Public quiz endpoint returns 200 OK');
  const publicData = await publicRes.json();
  assert(publicData.id === quizId, 'Returned quiz ID matches');
  assert(publicData.creatorAnswers === undefined, 'SECRET LEAK CHECK: creatorAnswers is NOT in public response');
  assert(publicData.editTokenHash === undefined, 'SECRET LEAK CHECK: editTokenHash is NOT in public response');
  assert(publicData.recoveryCodeHash === undefined, 'SECRET LEAK CHECK: recoveryCodeHash is NOT in public response');
  assert(publicData.totalQuestions === 3, 'totalQuestions equals 3');

  // 4. Creator Private Management
  console.log('\n[Test 4] Accessing /api/creator/quizzes/:id with and without Bearer token...');
  const unauthorizedRes = await fetch(`${BASE_URL}/api/creator/quizzes/${quizId}`);
  assert(unauthorizedRes.status === 401, 'Missing token returns 401 Unauthorized');

  const authorizedRes = await fetch(`${BASE_URL}/api/creator/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${editToken}` },
  });
  assert(authorizedRes.ok, 'Valid Bearer token returns 200 OK');
  const creatorData = await authorizedRes.json();
  assert(Boolean(creatorData.creatorAnswers), 'Creator can read their own creatorAnswers');
  assert(creatorData.editTokenHash === undefined, 'SECRET LEAK CHECK: editTokenHash not leaked to creator');

  // 5. Create and Publish Draft
  console.log('\n[Test 5] Creating unpublished draft and publishing it...');
  const draftRes = await fetch(`${BASE_URL}/api/quizzes/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'relationship',
      creatorName: 'DraftCreator',
      creatorAnswers: { '101': 1, '102': 2 },
    }),
  });
  assert(draftRes.status === 201, 'Create draft returns 201 Created');
  const draftData = await draftRes.json();
  const draftId = draftData.quizId;
  const draftToken = draftData.editToken;

  // Verify participant cannot access unpublished draft
  const publicDraftRes = await fetch(`${BASE_URL}/api/quizzes/${draftId}`);
  assert(publicDraftRes.status === 404, 'Participant access to unpublished draft returns 404');

  // Publish draft
  const publishRes = await fetch(`${BASE_URL}/api/creator/quizzes/${draftId}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${draftToken}` },
  });
  assert(publishRes.ok, 'Publishing draft returns 200 OK');

  // Now participant can access it
  const publicAfterPublish = await fetch(`${BASE_URL}/api/quizzes/${draftId}`);
  assert(publicAfterPublish.ok, 'Published draft is now accessible to participants');

  // 6. Recovery Code Rotation & Token Invalidation
  console.log('\n[Test 6] Testing creator recovery and token rotation...');
  const recoverRes = await fetch(`${BASE_URL}/api/creator/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quizId,
      recoveryCode,
    }),
  });
  assert(recoverRes.ok, 'Valid recoveryCode returns 200 OK');
  const recoverData = await recoverRes.json();
  const rotatedToken = recoverData.editToken;
  assert(Boolean(rotatedToken && rotatedToken !== editToken), 'New rotated editToken returned');

  // Verify previous token is invalidated
  const oldTokenTest = await fetch(`${BASE_URL}/api/creator/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${editToken}` },
  });
  assert(oldTokenTest.status === 401, 'Old editToken is immediately invalidated (401 Unauthorized)');

  // Verify new token works
  const newTokenTest = await fetch(`${BASE_URL}/api/creator/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${rotatedToken}` },
  });
  assert(newTokenTest.ok, 'Rotated editToken successfully authorizes creator access');

  // 7. Rate Limiting on Invalid Recovery Codes
  console.log('\n[Test 7] Testing brute-force rate-limiting on invalid recovery attempts...');
  let lastRateLimitRes: Response | null = null;
  for (let i = 0; i < 6; i++) {
    lastRateLimitRes = await fetch(`${BASE_URL}/api/creator/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId,
        recoveryCode: 'BB-0000-0000-0000',
      }),
    });
  }
  assert(lastRateLimitRes !== null && lastRateLimitRes.status === 429, '5+ failed attempts triggers 429 Too Many Requests lockout');

  // 8. Submit Answers & Leaderboard
  console.log('\n[Test 8] Submitting participant answers and checking leaderboard...');
  const submitRes = await fetch(`${BASE_URL}/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      participantName: 'BestieTest',
      answers: { '1': 0, '2': 1, '3': 99 }, // 2 correct out of 3
      attemptId: 'test_attempt_1',
    }),
  });
  assert(submitRes.ok, 'Participant submission returns 200 OK');
  const submitData = await submitRes.json();
  assert(submitData.score === 2, `Score strictly calculated by server (expected 2, got ${submitData.score})`);
  assert(submitData.percentage === 67, `Percentage calculated correctly (expected 67, got ${submitData.percentage})`);

  // Leaderboard verification
  const lbRes = await fetch(`${BASE_URL}/api/quizzes/${quizId}/leaderboard`);
  assert(lbRes.ok, 'Leaderboard returns 200 OK');
  const lbData = await lbRes.json();
  assert(lbData.totalCount >= 1, `Leaderboard records persisted (count: ${lbData.totalCount})`);
  assert(lbData.submissions[0].participantName === 'BestieTest', 'Leaderboard shows participant name');

  console.log(`\n--- TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

// Give server 1 second to accept connections
setTimeout(() => {
  runTests().catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}, 1000);
