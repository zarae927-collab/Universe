import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface QuizSubmission {
  id: string;
  participantName: string;
  answers: Record<string | number, any>;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  sharedInterestsCount?: number;
}

interface StoredQuiz {
  id: string;
  category: string;
  title?: string;
  description?: string;
  creatorName: string;
  creatorAnswers: Record<string | number, any>; // hidden from participants
  questionIds?: number[];
  customQuestions?: any[];
  isTwoWay?: boolean;
  createdAt: string;
  submissions: QuizSubmission[];
}

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'quizzes.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + file sync
let quizzesStore: Record<string, StoredQuiz> = {};

function loadQuizzes(): void {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      quizzesStore = JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load quizzes from disk:', err);
    quizzesStore = {};
  }
}

function saveQuizzes(): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(quizzesStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save quizzes to disk:', err);
  }
}

loadQuizzes();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // API Routes
  // 1. Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 2. Create new quiz
  app.post('/api/quizzes', (req: Request, res: Response) => {
    const { category, title, description, creatorName, creatorAnswers, questionIds, customQuestions, isTwoWay } = req.body;

    if (!category || !creatorName || !creatorAnswers) {
      return res.status(400).json({ error: 'Missing required quiz fields' });
    }

    // Generate cute unique alphanumeric ID
    const randomId = Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);
    const quizId = `bb_${randomId}`;

    const newQuiz: StoredQuiz = {
      id: quizId,
      category,
      title: title || undefined,
      description: description || undefined,
      creatorName: String(creatorName).trim().slice(0, 30),
      creatorAnswers,
      questionIds: Array.isArray(questionIds) ? questionIds : Object.keys(creatorAnswers).map(Number),
      customQuestions: Array.isArray(customQuestions) ? customQuestions : undefined,
      isTwoWay: Boolean(isTwoWay),
      createdAt: new Date().toISOString(),
      submissions: [],
    };

    quizzesStore[quizId] = newQuiz;
    saveQuizzes();

    // Return the quiz ID and link
    return res.status(201).json({
      success: true,
      quizId,
      quiz: {
        id: quizId,
        category: newQuiz.category,
        title: newQuiz.title,
        description: newQuiz.description,
        creatorName: newQuiz.creatorName,
        questionIds: newQuiz.questionIds,
        customQuestions: newQuiz.customQuestions,
        isTwoWay: newQuiz.isTwoWay,
        createdAt: newQuiz.createdAt,
      },
    });
  });

  // 3. Get quiz for participant (CRITICAL: NEVER expose creatorAnswers)
  app.get('/api/quizzes/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const quiz = quizzesStore[id];

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or expired' });
    }

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
      createdAt: quiz.createdAt,
      totalQuestions: Object.keys(quiz.creatorAnswers).length,
      submissionsCount: quiz.submissions.length,
    });
  });

  // 4. Submit participant answers & calculate score on the server
  app.post('/api/quizzes/:id/submit', (req: Request, res: Response) => {
    const { id } = req.params;
    const { participantName, answers, attemptId } = req.body;

    const quiz = quizzesStore[id];
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!participantName || !answers) {
      return res.status(400).json({ error: 'Missing participant name or answers' });
    }

    const cleanName = String(participantName).trim().slice(0, 30);
    const uniqueAttemptId = String(attemptId || '').trim() || Math.random().toString(36).substring(2, 10);

    // Idempotency: Prevent duplicate records caused by accidental double taps
    const existingSubmission = quiz.submissions.find(
      (s) => s.id === uniqueAttemptId || (s.participantName.toLowerCase() === cleanName.toLowerCase() && Date.now() - new Date(s.submittedAt).getTime() < 3000)
    );

    if (existingSubmission) {
      return res.json({
        success: true,
        submissionId: existingSubmission.id,
        score: existingSubmission.score,
        totalQuestions: existingSubmission.totalQuestions,
        percentage: existingSubmission.percentage,
        creatorName: quiz.creatorName,
        category: quiz.category,
        isTwoWay: quiz.isTwoWay,
        isDuplicate: true,
        breakdown: {},
      });
    }

    const creatorAnswers = quiz.creatorAnswers;
    const questionKeys = Object.keys(creatorAnswers);
    const totalQuestions = questionKeys.length;

    let score = 0;
    const breakdown: Record<string | number, { correct: boolean; participantAnswer: any; creatorAnswer: any; isSharedInterest?: boolean }> = {};
    const sharedInterests: { question: string; answer: string }[] = [];

    for (const qKey of questionKeys) {
      const creatorChoice = creatorAnswers[qKey];
      const participantChoice = answers[qKey];
      // Compare values
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
    const avatarType = avatarTypes[quiz.submissions.length % avatarTypes.length];
    const sticker = stickers[quiz.submissions.length % stickers.length];

    const submission: QuizSubmission = {
      id: uniqueAttemptId,
      participantName: cleanName,
      answers,
      score,
      totalQuestions,
      percentage,
      sharedInterestsCount: score,
      submittedAt: new Date().toISOString(),
    };

    // Store custom fields on submission
    (submission as any).avatarType = avatarType;
    (submission as any).sticker = sticker;

    quiz.submissions.push(submission);
    saveQuizzes();

    return res.json({
      success: true,
      submissionId: submission.id,
      score,
      totalQuestions,
      percentage,
      creatorName: quiz.creatorName,
      category: quiz.category,
      isTwoWay: quiz.isTwoWay,
      breakdown,
      sharedInterests,
    });
  });

  // 5. Get leaderboard / submissions for this specific quiz only
  app.get('/api/quizzes/:id/leaderboard', (req: Request, res: Response) => {
    const { id } = req.params;
    const quiz = quizzesStore[id];

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Sort strictly by:
    // 1. Score descending
    // 2. Earlier submittedAt timestamp as deterministic tie-breaker
    const sortedSubmissions = [...quiz.submissions].sort((a, b) => {
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
      avatarType: (s as any).avatarType || ['bunny', 'deer', 'cheetah', 'husky', 'fox', 'panda'][idx % 6],
      sticker: (s as any).sticker || ['bear', 'flower', 'heart', 'star'][idx % 4],
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
  app.get('/api/leaderboard/home', (_req: Request, res: Response) => {
    // Gather all real submissions across quizzes
    const allSubs: (QuizSubmission & { quizCreator?: string })[] = [];
    for (const q of Object.values(quizzesStore)) {
      if (Array.isArray(q.submissions)) {
        for (const sub of q.submissions) {
          allSubs.push({ ...sub, quizCreator: q.creatorName });
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
      id: s.id,
      rank: idx + 1,
      participantName: s.participantName,
      score: s.score,
      totalQuestions: s.totalQuestions,
      percentage: s.percentage,
      avatarType: (s as any).avatarType || ['bunny', 'deer', 'cheetah', 'husky', 'fox', 'panda'][idx % 6],
      sticker: (s as any).sticker || ['bear', 'flower', 'heart', 'star'][idx % 4],
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
