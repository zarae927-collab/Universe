import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { initializeStorage, getStorage, getStorageStatus, type StoredQuiz, type QuizSubmission } from './src/server/storage/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cryptographic token & recovery helpers
function generateEditToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64 hex characters (256 bits entropy)
}

function generateRecoveryCode(): string {
  // Format: BB-XXXX-XXXX-XXXX
  const raw = crypto.randomBytes(6).toString('hex').toUpperCase();
  const chunk1 = raw.slice(0, 4);
  const chunk2 = raw.slice(4, 8);
  const chunk3 = raw.slice(8, 12);
  return `BB-${chunk1}-${chunk2}-${chunk3}`;
}

function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function normalizeRecoveryCode(code: string): string {
  return String(code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function hashRecoveryCode(code: string): string {
  return hashSecret(normalizeRecoveryCode(code));
}

function safeCompareHashes(a?: string, b?: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

function extractBearerToken(req: Request): string {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const xToken = req.headers['x-edit-token'];
  if (typeof xToken === 'string') {
    return xToken.trim();
  }
  return '';
}

function verifyCreatorOwnership(req: Request, quiz: StoredQuiz): boolean {
  const token = extractBearerToken(req);
  if (!token) return false;
  if (!quiz.editTokenHash) return false;
  const tokenHash = hashSecret(token);
  return safeCompareHashes(tokenHash, quiz.editTokenHash);
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Initialize storage layer (JSON or Firestore based on environment and health check)
  const { active: storage, status: initialStatus } = await initializeStorage();
  console.log(`[Bestie Bonds] Active persistence engine: "${storage.name}" (Healthy: ${initialStatus.healthy})`);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-edit-token');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // API Routes
  // 1. Health check & storage status
  app.get('/api/health', async (_req: Request, res: Response) => {
    const status = await getStorageStatus();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      storage: {
        engine: status.engine,
        healthy: status.healthy,
        firestoreConfigured: status.firestoreConfigured,
        message: status.message,
      },
    });
  });

  app.get('/api/storage/status', async (_req: Request, res: Response) => {
    const status = await getStorageStatus();
    res.json(status);
  });

  // 2. Create new quiz or draft
  app.post('/api/quizzes', async (req: Request, res: Response) => {
    const { category, title, description, creatorName, creatorAnswers, questionIds, customQuestions, isTwoWay, status } = req.body;

    const quizStatus: 'published' | 'draft' = status === 'draft' ? 'draft' : 'published';

    if (!category || !creatorName) {
      return res.status(400).json({ error: 'Missing required quiz fields (category and creatorName)' });
    }

    if (quizStatus === 'published' && (!creatorAnswers || Object.keys(creatorAnswers).length === 0)) {
      return res.status(400).json({ error: 'Cannot publish quiz without answered questions' });
    }

    // Generate cute unique alphanumeric ID
    const randomId = Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);
    const quizId = `bb_${randomId}`;

    // Generate cryptographically secure creator edit token and human-readable recovery code
    const editToken = generateEditToken();
    const recoveryCode = generateRecoveryCode();

    const newQuiz: StoredQuiz = {
      id: quizId,
      category,
      title: title || undefined,
      description: description || undefined,
      creatorName: String(creatorName).trim().slice(0, 30),
      creatorAnswers: creatorAnswers || {},
      questionIds: Array.isArray(questionIds) ? questionIds : Object.keys(creatorAnswers || {}).map(Number),
      customQuestions: Array.isArray(customQuestions) ? customQuestions : undefined,
      isTwoWay: Boolean(isTwoWay),
      status: quizStatus,
      editTokenHash: hashSecret(editToken),
      recoveryCodeHash: hashRecoveryCode(recoveryCode),
      recoveryAttempts: 0,
      createdAt: new Date().toISOString(),
      submissions: [],
    };

    try {
      await storage.createQuiz(newQuiz);
    } catch (err: any) {
      console.error('[Create Quiz Error]:', err);
      return res.status(500).json({ error: 'Failed to persist quiz record: ' + (err.message || 'Storage error') });
    }

    // Return the quiz ID, secret edit token, recovery code, and safe public metadata (no answer keys or hashes)
    return res.status(201).json({
      success: true,
      quizId,
      editToken,
      recoveryCode,
      quiz: {
        id: quizId,
        category: newQuiz.category,
        title: newQuiz.title,
        description: newQuiz.description,
        creatorName: newQuiz.creatorName,
        questionIds: newQuiz.questionIds,
        customQuestions: newQuiz.customQuestions,
        isTwoWay: newQuiz.isTwoWay,
        status: newQuiz.status,
        createdAt: newQuiz.createdAt,
        totalQuestions: Object.keys(newQuiz.creatorAnswers).length,
        submissionsCount: 0,
        canEdit: true,
      },
    });
  });

  // 2b. Helper route: Save as unpublished draft
  app.post('/api/quizzes/draft', async (req: Request, res: Response) => {
    req.body.status = 'draft';
    const { category, title, description, creatorName, creatorAnswers, questionIds, customQuestions, isTwoWay } = req.body;

    if (!category || !creatorName) {
      return res.status(400).json({ error: 'Missing category or creatorName for draft' });
    }

    const randomId = Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);
    const quizId = `bb_${randomId}`;
    const editToken = generateEditToken();
    const recoveryCode = generateRecoveryCode();

    const newQuiz: StoredQuiz = {
      id: quizId,
      category,
      title: title || undefined,
      description: description || undefined,
      creatorName: String(creatorName).trim().slice(0, 30),
      creatorAnswers: creatorAnswers || {},
      questionIds: Array.isArray(questionIds) ? questionIds : Object.keys(creatorAnswers || {}).map(Number),
      customQuestions: Array.isArray(customQuestions) ? customQuestions : undefined,
      isTwoWay: Boolean(isTwoWay),
      status: 'draft',
      editTokenHash: hashSecret(editToken),
      recoveryCodeHash: hashRecoveryCode(recoveryCode),
      recoveryAttempts: 0,
      createdAt: new Date().toISOString(),
      submissions: [],
    };

    try {
      await storage.createQuiz(newQuiz);
    } catch (err: any) {
      console.error('[Create Draft Error]:', err);
      return res.status(500).json({ error: 'Failed to persist draft record: ' + (err.message || 'Storage error') });
    }

    return res.status(201).json({
      success: true,
      quizId,
      editToken,
      recoveryCode,
      quiz: {
        id: quizId,
        category: newQuiz.category,
        title: newQuiz.title,
        description: newQuiz.description,
        creatorName: newQuiz.creatorName,
        questionIds: newQuiz.questionIds,
        customQuestions: newQuiz.customQuestions,
        isTwoWay: newQuiz.isTwoWay,
        status: 'draft',
        createdAt: newQuiz.createdAt,
        totalQuestions: Object.keys(newQuiz.creatorAnswers).length,
        submissionsCount: 0,
        canEdit: true,
      },
    });
  });

  // 3. Get quiz for participant (CRITICAL: NEVER expose creatorAnswers, tokens, or hashes)
  app.get('/api/quizzes/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    let quiz: StoredQuiz | null = null;
    try {
      quiz = await storage.getQuiz(id);
    } catch (err: any) {
      return res.status(500).json({ error: 'Storage error fetching quiz: ' + err.message });
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or expired' });
    }

    const isOwner = verifyCreatorOwnership(req, quiz);

    // Unpublished drafts are private to creator!
    if (quiz.status === 'draft') {
      if (!isOwner) {
        return res.status(404).json({ error: 'Quiz is currently an unpublished draft and not yet available to participants' });
      }
    }

    const submissionsCount = Array.isArray(quiz.submissions) ? quiz.submissions.length : 0;

    // Public view for participant: creatorAnswers omitted!
    return res.json({
      id: quiz.id,
      category: quiz.category,
      title: quiz.title,
      description: quiz.description,
      creatorName: quiz.creatorName,
      questionIds: quiz.questionIds,
      customQuestions: quiz.customQuestions,
      isTwoWay: quiz.isTwoWay,
      status: quiz.status || 'published',
      createdAt: quiz.createdAt,
      totalQuestions: Object.keys(quiz.creatorAnswers || {}).length,
      submissionsCount,
      canEdit: isOwner && (quiz.status === 'draft' || submissionsCount === 0),
    });
  });

  // 3b. Creator Private Management: Get full quiz including creatorAnswers
  app.get('/api/creator/quizzes/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    let quiz: StoredQuiz | null = null;
    try {
      quiz = await storage.getQuiz(id);
    } catch (err: any) {
      return res.status(500).json({ error: 'Storage error: ' + err.message });
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!verifyCreatorOwnership(req, quiz)) {
      return res.status(401).json({ error: 'Unauthorized: valid creator edit token required' });
    }

    const submissionsCount = Array.isArray(quiz.submissions) ? quiz.submissions.length : 0;

    // Return full creator view (never exposing token/recovery hashes)
    return res.json({
      id: quiz.id,
      category: quiz.category,
      title: quiz.title,
      description: quiz.description,
      creatorName: quiz.creatorName,
      creatorAnswers: quiz.creatorAnswers,
      questionIds: quiz.questionIds,
      customQuestions: quiz.customQuestions,
      isTwoWay: quiz.isTwoWay,
      status: quiz.status || 'published',
      createdAt: quiz.createdAt,
      totalQuestions: Object.keys(quiz.creatorAnswers || {}).length,
      submissionsCount,
      canEdit: quiz.status === 'draft' || submissionsCount === 0,
    });
  });

  // 3c. Creator Private Management: Update quiz or draft
  app.put('/api/creator/quizzes/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    let quiz: StoredQuiz | null = null;
    try {
      quiz = await storage.getQuiz(id);
    } catch (err: any) {
      return res.status(500).json({ error: 'Storage error: ' + err.message });
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!verifyCreatorOwnership(req, quiz)) {
      return res.status(401).json({ error: 'Unauthorized: valid creator edit token required' });
    }

    const { title, description, creatorName, category, creatorAnswers, questionIds, customQuestions, isTwoWay } = req.body;
    const hasSubmissions = quiz.submissions && quiz.submissions.length > 0;

    // Guard: Do not allow altering questions/answers once participants have submitted
    if (hasSubmissions && (creatorAnswers !== undefined || questionIds !== undefined || customQuestions !== undefined)) {
      return res.status(400).json({
        error: 'Questions and answer keys cannot be modified after participants have taken the quiz to protect leaderboard scores',
      });
    }

    const updates: Partial<StoredQuiz> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (creatorName !== undefined) updates.creatorName = String(creatorName).trim().slice(0, 30);
    if (!hasSubmissions) {
      if (category !== undefined) updates.category = category;
      if (creatorAnswers !== undefined) updates.creatorAnswers = creatorAnswers;
      if (questionIds !== undefined) updates.questionIds = questionIds;
      if (customQuestions !== undefined) updates.customQuestions = customQuestions;
      if (isTwoWay !== undefined) updates.isTwoWay = Boolean(isTwoWay);
    }

    try {
      await storage.updateQuiz(id, updates);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update quiz in storage: ' + err.message });
    }

    return res.json({
      success: true,
      quizId: quiz.id,
      status: quiz.status || 'published',
      message: 'Quiz updated successfully',
    });
  });

  // 3d. Creator Private Management: Publish an unpublished draft
  app.post('/api/creator/quizzes/:id/publish', async (req: Request, res: Response) => {
    const { id } = req.params;
    let quiz: StoredQuiz | null = null;
    try {
      quiz = await storage.getQuiz(id);
    } catch (err: any) {
      return res.status(500).json({ error: 'Storage error: ' + err.message });
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!verifyCreatorOwnership(req, quiz)) {
      return res.status(401).json({ error: 'Unauthorized: valid creator edit token required' });
    }

    if (!quiz.creatorAnswers || Object.keys(quiz.creatorAnswers).length === 0) {
      return res.status(400).json({ error: 'Cannot publish draft without answered questions' });
    }

    try {
      await storage.updateQuiz(id, { status: 'published' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to publish quiz: ' + err.message });
    }

    return res.json({
      success: true,
      quizId: quiz.id,
      status: 'published',
      message: 'Quiz published and live for participants!',
    });
  });

  // 3e. Creator Private Management: Delete quiz
  app.delete('/api/creator/quizzes/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    let quiz: StoredQuiz | null = null;
    try {
      quiz = await storage.getQuiz(id);
    } catch (err: any) {
      return res.status(500).json({ error: 'Storage error: ' + err.message });
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!verifyCreatorOwnership(req, quiz)) {
      return res.status(401).json({ error: 'Unauthorized: valid creator edit token required' });
    }

    try {
      await storage.deleteQuiz(id);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete quiz: ' + err.message });
    }

    return res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  });

  // 3f. Creator Recovery Endpoint: Restore access with recoveryCode
  app.post('/api/creator/recover', async (req: Request, res: Response) => {
    const { quizId, recoveryCode } = req.body;

    if (!quizId || !recoveryCode) {
      return res.status(400).json({ error: 'Both quizId and recoveryCode are required' });
    }

    const cleanQuizId = String(quizId).trim();
    const inputHash = hashRecoveryCode(recoveryCode);
    const newEditToken = generateEditToken();
    const newEditTokenHash = hashSecret(newEditToken);

    try {
      const result = await storage.atomicRotateRecoveryToken(cleanQuizId, inputHash, newEditTokenHash);

      if (!result.success) {
        return res.status(result.status || 400).json({ error: result.error });
      }

      const updatedQuiz = result.quiz!;
      const totalQuestions = Object.keys(updatedQuiz.creatorAnswers || {}).length;
      const submissionsCount = Array.isArray(updatedQuiz.submissions) ? updatedQuiz.submissions.length : 0;

      return res.json({
        success: true,
        quizId: updatedQuiz.id,
        editToken: newEditToken,
        quiz: {
          id: updatedQuiz.id,
          category: updatedQuiz.category,
          title: updatedQuiz.title,
          description: updatedQuiz.description,
          creatorName: updatedQuiz.creatorName,
          status: updatedQuiz.status || 'published',
          createdAt: updatedQuiz.createdAt,
          totalQuestions,
          submissionsCount,
          canEdit: updatedQuiz.status === 'draft' || submissionsCount === 0,
        },
      });
    } catch (err: any) {
      console.error('[Recovery Error]:', err);
      return res.status(500).json({ error: 'Recovery operation failed: ' + err.message });
    }
  });

  // 3g. Creator Token Verification / Batch Quiz Listing for Creator Device
  app.post('/api/creator/my-quizzes', async (req: Request, res: Response) => {
    const { tokens } = req.body;
    const verified: any[] = [];

    if (tokens && typeof tokens === 'object') {
      const qids = Object.keys(tokens);
      try {
        const quizzes = await storage.getQuizzesByIds(qids);
        for (const q of quizzes) {
          const clientToken = tokens[q.id];
          if (clientToken && q.editTokenHash && safeCompareHashes(hashSecret(String(clientToken)), q.editTokenHash)) {
            const submissionsCount = Array.isArray(q.submissions) ? q.submissions.length : 0;
            verified.push({
              id: q.id,
              category: q.category,
              title: q.title,
              description: q.description,
              creatorName: q.creatorName,
              status: q.status || 'published',
              createdAt: q.createdAt,
              totalQuestions: Object.keys(q.creatorAnswers || {}).length,
              submissionsCount,
              canEdit: q.status === 'draft' || submissionsCount === 0,
            });
          }
        }
      } catch (err: any) {
        console.error('[My Quizzes Error]:', err);
      }
    }

    return res.json({ quizzes: verified });
  });

  // 4. Submit participant answers & calculate score on the server
  app.post('/api/quizzes/:id/submit', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { participantName, answers, attemptId } = req.body;

    let quiz: StoredQuiz | null = null;
    try {
      quiz = await storage.getQuiz(id);
    } catch (err: any) {
      return res.status(500).json({ error: 'Storage error: ' + err.message });
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!participantName || !answers) {
      return res.status(400).json({ error: 'Missing participant name or answers' });
    }

    const cleanName = String(participantName).trim().slice(0, 30);
    const uniqueAttemptId = String(attemptId || '').trim() || Math.random().toString(36).substring(2, 10);

    const creatorAnswers = quiz.creatorAnswers || {};
    const questionKeys = Object.keys(creatorAnswers);
    const totalQuestions = questionKeys.length;

    let score = 0;
    const breakdown: Record<string | number, { correct: boolean; participantAnswer: any; creatorAnswer: any; isSharedInterest?: boolean }> = {};
    const sharedInterests: { question: string; answer: string }[] = [];

    for (const qKey of questionKeys) {
      const creatorChoice = creatorAnswers[qKey];
      const participantChoice = answers[qKey];
      const isCorrect = String(participantChoice).trim().toLowerCase() === String(creatorChoice).trim().toLowerCase();

      if (isCorrect) {
        score += 1;
      }

      breakdown[qKey] = {
        correct: isCorrect,
        participantAnswer: participantChoice,
        creatorAnswer: creatorChoice,
        isSharedInterest: isCorrect,
      };
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const avatarTypes = ['bunny', 'deer', 'cheetah', 'husky', 'fox', 'panda'];
    const stickers = ['bear', 'flower', 'heart', 'star'];
    const existingSubCount = Array.isArray(quiz.submissions) ? quiz.submissions.length : 0;
    const avatarType = avatarTypes[existingSubCount % avatarTypes.length];
    const sticker = stickers[existingSubCount % stickers.length];

    const submission: QuizSubmission = {
      id: uniqueAttemptId,
      participantName: cleanName,
      answers,
      score,
      totalQuestions,
      percentage,
      sharedInterestsCount: score,
      submittedAt: new Date().toISOString(),
      avatarType,
      sticker,
    };

    try {
      const submitResult = await storage.addSubmission(id, submission);
      return res.json({
        success: true,
        submissionId: submission.id,
        score,
        totalQuestions,
        percentage,
        creatorName: quiz.creatorName,
        category: quiz.category,
        isTwoWay: quiz.isTwoWay,
        isDuplicate: submitResult.isDuplicate || false,
        breakdown,
        sharedInterests,
      });
    } catch (err: any) {
      console.error('[Submit Error]:', err);
      return res.status(500).json({ error: 'Failed to record submission: ' + err.message });
    }
  });

  // 5. Get leaderboard / submissions for this specific quiz only
  app.get('/api/quizzes/:id/leaderboard', async (req: Request, res: Response) => {
    const { id } = req.params;
    let quiz: StoredQuiz | null = null;
    try {
      quiz = await storage.getQuiz(id);
    } catch (err: any) {
      return res.status(500).json({ error: 'Storage error: ' + err.message });
    }

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const submissions = Array.isArray(quiz.submissions) ? quiz.submissions : [];

    // Sort strictly by:
    // 1. Score descending
    // 2. Earlier submittedAt timestamp as deterministic tie-breaker
    const sortedSubmissions = [...submissions].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });

    const leaderboard = sortedSubmissions.map((s, idx) => ({
      id: s.id,
      rank: idx + 1,
      participantName: s.participantName,
      score: s.score,
      totalQuestions: s.totalQuestions,
      percentage: s.percentage,
      avatarType: s.avatarType || ['bunny', 'deer', 'cheetah', 'husky', 'fox', 'panda'][idx % 6],
      sticker: s.sticker || ['bear', 'flower', 'heart', 'star'][idx % 4],
      submittedAt: s.submittedAt,
    }));

    return res.json({
      quizId: quiz.id,
      creatorName: quiz.creatorName,
      category: quiz.category,
      totalCount: leaderboard.length,
      submissions: leaderboard,
    });
  });

  // 6. Get homepage global scoreboard entries (NO fake entries: real attempts only!)
  app.get('/api/leaderboard/home', async (_req: Request, res: Response) => {
    let allQuizzes: StoredQuiz[] = [];
    try {
      allQuizzes = await storage.getAllQuizzes();
    } catch (err: any) {
      console.error('[Home Leaderboard Error]:', err);
      return res.status(500).json({ error: 'Storage error: ' + err.message });
    }

    // Gather all real submissions across quizzes
    const allSubs: (QuizSubmission & { quizCreator?: string; quizId: string })[] = [];
    for (const q of allQuizzes) {
      if (Array.isArray(q.submissions)) {
        for (const sub of q.submissions) {
          allSubs.push({ ...sub, quizCreator: q.creatorName, quizId: q.id });
        }
      }
    }

    // Sort strictly by score desc, then by date asc
    allSubs.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });

    const entries = allSubs.map((s, idx) => ({
      id: `${s.quizId}_${s.id || idx}`,
      rank: idx + 1,
      participantName: s.participantName,
      score: s.score,
      totalQuestions: s.totalQuestions,
      percentage: s.percentage,
      avatarType: s.avatarType || ['bunny', 'deer', 'cheetah', 'husky', 'fox', 'panda'][idx % 6],
      sticker: s.sticker || ['bear', 'flower', 'heart', 'star'][idx % 4],
      submittedAt: s.submittedAt,
    }));

    return res.json({
      totalCount: entries.length,
      entries: entries.slice(0, 10),
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bestie Bonds] Server is listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
