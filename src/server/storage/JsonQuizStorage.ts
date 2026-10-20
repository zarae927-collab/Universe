import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IQuizStorage, StoredQuiz, QuizSubmission, StorageHealthStatus } from './types';

function safeCompareHashes(a?: string, b?: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export class JsonQuizStorage implements IQuizStorage {
  readonly name = 'json';
  private filePath: string;
  private quizzesStore: Record<string, StoredQuiz> = {};
  private initialized = false;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'quizzes.json');
  }

  async init(): Promise<void> {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.loadFromDisk();
    this.initialized = true;
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.quizzesStore = JSON.parse(data);
      } else {
        this.quizzesStore = {};
      }
    } catch (err) {
      console.error('[JsonQuizStorage] Failed to load quizzes from disk:', err);
      this.quizzesStore = {};
    }
  }

  private saveToDisk(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.quizzesStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('[JsonQuizStorage] Failed to save quizzes to disk:', err);
    }
  }

  async checkHealth(): Promise<StorageHealthStatus> {
    return {
      engine: 'json',
      healthy: this.initialized && fs.existsSync(path.dirname(this.filePath)),
      message: `Active on local JSON persistence (${Object.keys(this.quizzesStore).length} quizzes loaded)`,
      firestoreConfigured: false,
      details: {
        totalQuizzes: Object.keys(this.quizzesStore).length,
        filePath: this.filePath,
      },
    };
  }

  async getQuiz(id: string): Promise<StoredQuiz | null> {
    return this.quizzesStore[id] || null;
  }

  async createQuiz(quiz: StoredQuiz): Promise<void> {
    this.quizzesStore[quiz.id] = { ...quiz };
    this.saveToDisk();
  }

  async updateQuiz(id: string, updates: Partial<StoredQuiz>): Promise<void> {
    const existing = this.quizzesStore[id];
    if (!existing) {
      throw new Error(`Quiz with ID ${id} not found`);
    }
    this.quizzesStore[id] = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
  }

  async deleteQuiz(id: string): Promise<void> {
    delete this.quizzesStore[id];
    this.saveToDisk();
  }

  async addSubmission(quizId: string, submission: QuizSubmission): Promise<{ success: boolean; isDuplicate?: boolean }> {
    const quiz = this.quizzesStore[quizId];
    if (!quiz) {
      throw new Error(`Quiz ${quizId} not found`);
    }

    if (!Array.isArray(quiz.submissions)) {
      quiz.submissions = [];
    }

    // Check for idempotency
    const cleanName = submission.participantName.trim().toLowerCase();
    const existingSubmission = quiz.submissions.find(
      (s) =>
        s.id === submission.id ||
        (s.participantName.trim().toLowerCase() === cleanName &&
          Math.abs(Date.now() - new Date(s.submittedAt).getTime()) < 3000)
    );

    if (existingSubmission) {
      return { success: true, isDuplicate: true };
    }

    quiz.submissions.push(submission);
    this.saveToDisk();
    return { success: true, isDuplicate: false };
  }

  async recordFailedRecoveryAttempt(quizId: string): Promise<{ attempts: number; remaining: number; lockedUntil?: number }> {
    const quiz = this.quizzesStore[quizId];
    if (!quiz) {
      throw new Error(`Quiz ${quizId} not found`);
    }

    const now = Date.now();
    const attempts = (quiz.recoveryAttempts || 0) + 1;
    quiz.recoveryAttempts = attempts;
    quiz.lastRecoveryAttemptAt = new Date(now).toISOString();
    this.saveToDisk();

    const remaining = Math.max(0, 5 - attempts);
    const lockedUntil = attempts >= 5 ? now + 15 * 60 * 1000 : undefined;
    return { attempts, remaining, lockedUntil };
  }

  async atomicRotateRecoveryToken(
    quizId: string,
    expectedRecoveryHash: string,
    newEditTokenHash: string
  ): Promise<{
    success: boolean;
    error?: string;
    status?: number;
    quiz?: StoredQuiz;
  }> {
    const quiz = this.quizzesStore[quizId];
    if (!quiz) {
      return { success: false, status: 404, error: 'Quiz not found' };
    }

    if (!quiz.recoveryCodeHash) {
      return { success: false, status: 400, error: 'This quiz does not have recovery enabled' };
    }

    const now = Date.now();
    const attempts = quiz.recoveryAttempts || 0;
    const lastAttempt = quiz.lastRecoveryAttemptAt ? new Date(quiz.lastRecoveryAttemptAt).getTime() : 0;

    // Check lockout
    if (attempts >= 5 && now - lastAttempt < 15 * 60 * 1000) {
      const waitMinutes = Math.ceil((15 * 60 * 1000 - (now - lastAttempt)) / 60000);
      return {
        success: false,
        status: 429,
        error: `Too many recovery attempts. Access locked for ${waitMinutes} more minute(s) to protect creator security.`,
      };
    }

    if (attempts >= 5 && now - lastAttempt >= 15 * 60 * 1000) {
      quiz.recoveryAttempts = 0;
    }

    // Validate hash
    const isValid = safeCompareHashes(expectedRecoveryHash, quiz.recoveryCodeHash);
    if (!isValid) {
      quiz.recoveryAttempts = (quiz.recoveryAttempts || 0) + 1;
      quiz.lastRecoveryAttemptAt = new Date().toISOString();
      this.saveToDisk();
      const remaining = Math.max(0, 5 - quiz.recoveryAttempts);
      return {
        success: false,
        status: 401,
        error: `Invalid recovery code. ${remaining} attempt(s) remaining before a 15-minute lockout.`,
      };
    }

    // Success: rotate atomically
    quiz.recoveryAttempts = 0;
    quiz.editTokenHash = newEditTokenHash;
    quiz.updatedAt = new Date().toISOString();
    this.saveToDisk();

    return {
      success: true,
      quiz: { ...quiz },
    };
  }

  async getQuizzesByIds(ids: string[]): Promise<StoredQuiz[]> {
    const result: StoredQuiz[] = [];
    for (const id of ids) {
      if (this.quizzesStore[id]) {
        result.push(this.quizzesStore[id]);
      }
    }
    return result;
  }

  async getAllQuizzes(): Promise<StoredQuiz[]> {
    return Object.values(this.quizzesStore);
  }
}
