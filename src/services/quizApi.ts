import {
  StoredQuizData,
  SubmissionResponse,
  QuizSubmission,
  QuizQuestion,
  CreatorQuizDetails,
  CreatorQuizSummary,
  RecoveryResponse,
} from '../types';

const STORAGE_KEYS = {
  QUIZZES: 'bb_local_quizzes',
  SUBMISSIONS: 'bb_local_submissions',
  SCOREBOARD_CACHE_PREFIX: 'bb_scoreboard_cache_',
  CREATOR_TOKENS: 'bb_creator_tokens',
};

export interface StoredCreatorTokenRecord {
  editToken: string;
  recoveryCode?: string;
  savedAt: string;
}

export function getAllCreatorTokens(): Record<string, StoredCreatorTokenRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CREATOR_TOKENS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCreatorToken(quizId: string): string | null {
  const all = getAllCreatorTokens();
  return all[quizId]?.editToken || null;
}

export function getCreatorRecoveryCode(quizId: string): string | null {
  const all = getAllCreatorTokens();
  return all[quizId]?.recoveryCode || null;
}

export function saveCreatorToken(quizId: string, editToken: string, recoveryCode?: string): void {
  try {
    const all = getAllCreatorTokens();
    all[quizId] = {
      editToken,
      recoveryCode: recoveryCode || all[quizId]?.recoveryCode,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CREATOR_TOKENS, JSON.stringify(all));
  } catch (e) {
    // ignore
  }
}

export function removeCreatorToken(quizId: string): void {
  try {
    const all = getAllCreatorTokens();
    delete all[quizId];
    localStorage.setItem(STORAGE_KEYS.CREATOR_TOKENS, JSON.stringify(all));
  } catch (e) {
    // ignore
  }
}

function getLocalQuizzes(): Record<string, any> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalQuiz(quiz: any) {
  try {
    const quizzes = getLocalQuizzes();
    quizzes[quiz.id] = quiz;
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  } catch (e) {
    // ignore localStorage quota errors
  }
}

function getLocalSubmissions(): Record<string, any[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalSubmission(quizId: string, submission: any) {
  try {
    const all = getLocalSubmissions();
    if (!all[quizId]) all[quizId] = [];
    // Avoid duplicate IDs
    const exists = all[quizId].some((s) => s.id === submission.id);
    if (!exists) {
      all[quizId].push(submission);
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(all));
    }
  } catch (e) {
    // ignore
  }
}

export interface ScoreboardDataResult {
  totalCount: number;
  entries: any[];
  fromCache?: boolean;
}

/**
 * Fetch leaderboard or scoreboard with Stale-While-Revalidate caching and safe offline fallback.
 * Never throws an uncaught error that breaks the UI.
 */
export async function getScoreboardData(quizId?: string): Promise<ScoreboardDataResult> {
  const cacheKey = `${STORAGE_KEYS.SCOREBOARD_CACHE_PREFIX}${quizId || 'home'}`;
  
  // 1. Read existing cache if available
  let cachedResult: ScoreboardDataResult | null = null;
  try {
    const rawCache = localStorage.getItem(cacheKey);
    if (rawCache) {
      const parsed = JSON.parse(rawCache);
      if (parsed && Array.isArray(parsed.entries)) {
        cachedResult = {
          totalCount: parsed.totalCount ?? parsed.entries.length,
          entries: parsed.entries,
          fromCache: true,
        };
      }
    }
  } catch {
    // ignore json error
  }

  // 2. Fetch from backend with timeout
  const endpoint = quizId
    ? `/api/quizzes/${quizId}/leaderboard`
    : '/api/leaderboard/home';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawList = data.submissions || data.entries || [];
      const totalCount = data.totalCount !== undefined ? data.totalCount : rawList.length;

      const result: ScoreboardDataResult = {
        totalCount,
        entries: rawList,
        fromCache: false,
      };

      // Save to localStorage for instant subsequent loads
      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch {
        // ignore
      }

      return result;
    }
  } catch (err) {
    // Network error, server warming up, or aborted
    // Silently fall back to cached or local submissions without throwing
  }

  // 3. Fallback: Return cached data if present
  if (cachedResult) {
    return cachedResult;
  }

  // 4. Fallback: Aggregate from local submissions if no network & no cache
  const localSubs = getLocalSubmissions();
  let fallbackEntries: any[] = [];

  if (quizId && localSubs[quizId]) {
    fallbackEntries = [...localSubs[quizId]];
  } else if (!quizId) {
    for (const list of Object.values(localSubs)) {
      if (Array.isArray(list)) {
        fallbackEntries.push(...list);
      }
    }
  }

  fallbackEntries.sort((a, b) => (b.score || 0) - (a.score || 0));

  const finalFallback: ScoreboardDataResult = {
    totalCount: fallbackEntries.length,
    entries: fallbackEntries.slice(0, 10).map((s, idx) => ({
      id: s.id ? `${s.id}_${idx}` : `local_${idx}`,
      rank: idx + 1,
      participantName: s.participantName || 'Friend',
      score: s.score || 0,
      totalQuestions: s.totalQuestions || 10,
      percentage: s.percentage || 0,
      avatarType: s.avatarType || 'bunny',
      sticker: s.sticker || 'bear',
      submittedAt: s.submittedAt || new Date().toISOString(),
    })),
    fromCache: true,
  };

  return finalFallback;
}

/**
 * Create or save a quiz (published or draft) with server sync and local storage backup.
 */
export async function createQuiz(
  payload: {
    category: string;
    title?: string;
    description?: string;
    creatorName: string;
    creatorAnswers: Record<string | number, any>;
    questionIds?: number[];
    customQuestions?: QuizQuestion[];
    isTwoWay?: boolean;
    status?: 'published' | 'draft';
  },
  asDraft = false
): Promise<{ quizId: string; quiz: StoredQuizData; editToken?: string; recoveryCode?: string }> {
  // Generate optimistic ID in case server is unreachable
  const randomId = Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);
  const fallbackId = `bb_${randomId}`;
  const quizStatus: 'published' | 'draft' = asDraft || payload.status === 'draft' ? 'draft' : 'published';

  const optimisticQuiz: StoredQuizData & { creatorAnswers: any } = {
    id: fallbackId,
    category: payload.category as any,
    title: payload.title,
    description: payload.description,
    creatorName: payload.creatorName,
    questionIds: payload.questionIds,
    customQuestions: payload.customQuestions,
    isTwoWay: payload.isTwoWay,
    status: quizStatus,
    createdAt: new Date().toISOString(),
    totalQuestions: Object.keys(payload.creatorAnswers || {}).length,
    creatorAnswers: payload.creatorAnswers,
    canEdit: true,
  };

  // Always save locally first
  saveLocalQuiz(optimisticQuiz);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(asDraft ? '/api/quizzes/draft' : '/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, status: quizStatus }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const serverQuiz: StoredQuizData = data.quiz || optimisticQuiz;
      serverQuiz.id = data.quizId;
      serverQuiz.status = quizStatus;
      serverQuiz.canEdit = true;

      // Save token & recovery code to local creator storage
      if (data.editToken) {
        saveCreatorToken(data.quizId, data.editToken, data.recoveryCode);
      }

      // Also update local storage with the exact server ID
      saveLocalQuiz({ ...serverQuiz, creatorAnswers: payload.creatorAnswers });
      return {
        quizId: data.quizId,
        quiz: serverQuiz,
        editToken: data.editToken,
        recoveryCode: data.recoveryCode,
      };
    }
  } catch (err) {
    // Server unreachable: proceed with optimistic local quiz
  }

  return { quizId: fallbackId, quiz: optimisticQuiz };
}

/**
 * Fetch a quiz by ID with server lookup and local storage fallback.
 * Sends bearer token if available so creator can preview unpublished drafts.
 */
export async function fetchQuiz(quizId: string): Promise<StoredQuizData> {
  const token = getCreatorToken(quizId);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 1. Try server fetch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`/api/quizzes/${quizId}`, {
      signal: controller.signal,
      headers,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      saveLocalQuiz(data);
      return data;
    }
  } catch (err) {
    // Fall back to local
  }

  // 2. Try local cache
  const local = getLocalQuizzes()[quizId];
  if (local) {
    return {
      id: local.id,
      category: local.category,
      title: local.title,
      description: local.description,
      creatorName: local.creatorName,
      questionIds: local.questionIds,
      customQuestions: local.customQuestions,
      isTwoWay: local.isTwoWay,
      status: local.status || 'published',
      createdAt: local.createdAt,
      totalQuestions: local.totalQuestions || (local.creatorAnswers ? Object.keys(local.creatorAnswers).length : 10),
      submissionsCount: local.submissionsCount || 0,
      canEdit: Boolean(token),
    };
  }

  throw new Error('Quiz not found or unpublished draft');
}

/**
 * Fetch private creator details including question answers.
 * Requires valid creator token.
 */
export async function fetchCreatorQuiz(quizId: string): Promise<CreatorQuizDetails> {
  const token = getCreatorToken(quizId);
  if (!token) {
    throw new Error('No creator access token found for this quiz');
  }

  try {
    const res = await fetch(`/api/creator/quizzes/${quizId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      saveLocalQuiz(data);
      return data;
    }
  } catch (err) {
    // Fall back to local storage if offline or server temporarily unavailable
  }

  // Fallback to local storage if available
  const local = getLocalQuizzes()[quizId];
  if (local) {
    return {
      id: local.id,
      category: local.category,
      title: local.title,
      description: local.description,
      creatorName: local.creatorName,
      creatorAnswers: local.creatorAnswers || {},
      questionIds: local.questionIds,
      customQuestions: local.customQuestions,
      isTwoWay: local.isTwoWay,
      status: local.status || 'draft',
      createdAt: local.createdAt,
      totalQuestions: Object.keys(local.creatorAnswers || {}).length || 5,
      submissionsCount: local.submissionsCount || 0,
      canEdit: true,
    };
  }

  throw new Error('Failed to authenticate creator access');
}

/**
 * Update an existing quiz or unpublished draft.
 */
export async function updateCreatorQuiz(
  quizId: string,
  updates: {
    title?: string;
    description?: string;
    creatorName?: string;
    category?: string;
    creatorAnswers?: Record<string | number, any>;
    questionIds?: number[];
    customQuestions?: QuizQuestion[];
    isTwoWay?: boolean;
  }
): Promise<{ success: boolean; quizId: string; status: string }> {
  const token = getCreatorToken(quizId);
  if (!token) {
    throw new Error('Unauthorized: missing creator token');
  }

  const res = await fetch(`/api/creator/quizzes/${quizId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update quiz');
  }

  // Update local cache
  const local = getLocalQuizzes()[quizId];
  if (local) {
    saveLocalQuiz({ ...local, ...updates });
  }

  return await res.json();
}

/**
 * Publish an unpublished draft so participants can play it.
 */
export async function publishCreatorQuiz(quizId: string): Promise<{ success: boolean; quizId: string; status: string }> {
  const token = getCreatorToken(quizId);
  if (!token) {
    throw new Error('Unauthorized: missing creator token');
  }

  const res = await fetch(`/api/creator/quizzes/${quizId}/publish`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to publish draft');
  }

  // Update local cache
  const local = getLocalQuizzes()[quizId];
  if (local) {
    saveLocalQuiz({ ...local, status: 'published' });
  }

  return await res.json();
}

/**
 * Recover creator ownership using the private recovery code.
 */
export async function recoverCreatorAccess(quizId: string, recoveryCode: string): Promise<RecoveryResponse> {
  const res = await fetch('/api/creator/recover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizId: quizId.trim(), recoveryCode: recoveryCode.trim() }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid recovery code');
  }

  // Save recovered editToken and recoveryCode
  saveCreatorToken(data.quizId, data.editToken, recoveryCode.trim());
  return data;
}

/**
 * Fetch verified creator quizzes associated with tokens stored on this device.
 */
export async function getMyCreatedQuizzes(): Promise<CreatorQuizSummary[]> {
  const allTokens = getAllCreatorTokens();
  const tokenMap: Record<string, string> = {};
  for (const [qid, record] of Object.entries(allTokens)) {
    if (record?.editToken) {
      tokenMap[qid] = record.editToken;
    }
  }

  if (Object.keys(tokenMap).length === 0) {
    return [];
  }

  try {
    const res = await fetch('/api/creator/my-quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens: tokenMap }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.quizzes || [];
    }
  } catch {
    // Offline fallback
  }

  // Fallback from local quizzes
  const localQuizzes = getLocalQuizzes();
  const results: CreatorQuizSummary[] = [];
  for (const qid of Object.keys(tokenMap)) {
    const q = localQuizzes[qid];
    if (q) {
      results.push({
        id: q.id,
        category: q.category,
        title: q.title,
        creatorName: q.creatorName,
        status: q.status || 'published',
        createdAt: q.createdAt,
        submissionsCount: q.submissionsCount || 0,
        canEdit: true,
      });
    }
  }
  return results;
}

/**
 * Submit answers with server scoring and local offline fallback.
 */
export async function submitQuizAnswers(
  quizId: string,
  payload: {
    participantName: string;
    answers: Record<string | number, any>;
    attemptId?: string;
  }
): Promise<SubmissionResponse> {
  const attemptId = payload.attemptId || Math.random().toString(36).substring(2, 10);

  // 1. Try server submit
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, attemptId }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: SubmissionResponse = await res.json();
      // Record locally
      saveLocalSubmission(quizId, {
        id: data.submissionId,
        participantName: payload.participantName,
        score: data.score,
        totalQuestions: data.totalQuestions,
        percentage: data.percentage,
        submittedAt: new Date().toISOString(),
      });
      return data;
    }
  } catch (err) {
    // Fall back to local calculation
  }

  // 2. Local fallback calculation
  const localQuiz = getLocalQuizzes()[quizId];
  const creatorAnswers = localQuiz?.creatorAnswers || {};
  const questionKeys = Object.keys(creatorAnswers);
  const totalQuestions = questionKeys.length || Object.keys(payload.answers).length || 10;

  let score = 0;
  const breakdown: Record<number, any> = {};

  for (const qKey of questionKeys) {
    const qNum = Number(qKey);
    const cChoice = creatorAnswers[qKey];
    const pChoice = payload.answers[qKey];
    const isCorrect = String(pChoice).trim().toLowerCase() === String(cChoice).trim().toLowerCase();
    if (isCorrect) score += 1;
    breakdown[qNum] = {
      correct: isCorrect,
      participantAnswer: pChoice,
      creatorAnswer: cChoice,
      isSharedInterest: isCorrect,
    };
  }

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const localResult: SubmissionResponse = {
    success: true,
    submissionId: attemptId,
    score,
    totalQuestions,
    percentage,
    creatorName: localQuiz?.creatorName || 'Your Friend',
    category: localQuiz?.category || 'friendship',
    breakdown,
  };

  saveLocalSubmission(quizId, {
    id: attemptId,
    participantName: payload.participantName,
    score,
    totalQuestions,
    percentage,
    submittedAt: new Date().toISOString(),
  });

  return localResult;
}
