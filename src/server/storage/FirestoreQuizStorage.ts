import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, Transaction } from 'firebase-admin/firestore';
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

export class FirestoreQuizStorage implements IQuizStorage {
  readonly name = 'firestore';
  private app: App | null = null;
  private db: Firestore | null = null;
  private projectId: string = '';
  private databaseId: string = '';
  private isConfigured = false;
  private initializationError: string | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.projectId = config.projectId || '';
        this.databaseId = config.firestoreDatabaseId || '';
      }
    } catch (err: any) {
      this.initializationError = `Failed to read firebase-applet-config.json: ${err.message}`;
    }
  }

  async init(): Promise<void> {
    if (!this.projectId) {
      this.initializationError = 'No projectId configured in firebase-applet-config.json';
      return;
    }

    try {
      // Determine credentials
      let credentialOption = undefined;
      const saKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const saKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (saKeyJson) {
        try {
          const parsed = JSON.parse(saKeyJson);
          credentialOption = cert(parsed);
        } catch (e: any) {
          console.warn('[FirestoreQuizStorage] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON:', e.message);
        }
      } else if (saKeyPath && fs.existsSync(saKeyPath)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(saKeyPath, 'utf8'));
          credentialOption = cert(parsed);
        } catch (e: any) {
          console.warn(`[FirestoreQuizStorage] Failed to read ${saKeyPath}:`, e.message);
        }
      }

      if (getApps().length === 0) {
        this.app = initializeApp(
          credentialOption
            ? { credential: credentialOption, projectId: this.projectId }
            : { projectId: this.projectId }
        );
      } else {
        this.app = getApp();
      }

      this.db = this.databaseId ? getFirestore(this.app, this.databaseId) : getFirestore(this.app);
      this.isConfigured = true;
      console.log(`[FirestoreQuizStorage] Initialized Firestore client for project=${this.projectId}, database=${this.databaseId}`);
    } catch (err: any) {
      this.initializationError = err.message || String(err);
      this.isConfigured = false;
      console.error('[FirestoreQuizStorage] Initialization failed:', err);
    }
  }

  async checkHealth(): Promise<StorageHealthStatus> {
    if (!this.isConfigured || !this.db) {
      return {
        engine: 'firestore',
        healthy: false,
        message: `Firestore not configured: ${this.initializationError || 'Client not initialized'}`,
        firestoreConfigured: false,
        details: {
          projectId: this.projectId,
          databaseId: this.databaseId,
          error: this.initializationError,
        },
      };
    }

    try {
      // Perform an actual lightweight read test on the database with 4s timeout
      const testRef = this.db.collection('quizzes').limit(1);
      const getPromise = testRef.get();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out after 4000ms')), 4000)
      );
      await Promise.race([getPromise, timeoutPromise]);

      return {
        engine: 'firestore',
        healthy: true,
        message: 'Firestore server connection verified and responsive',
        firestoreConfigured: true,
        details: {
          projectId: this.projectId,
          databaseId: this.databaseId,
        },
      };
    } catch (err: any) {
      const errMsg = err.message || String(err);
      return {
        engine: 'firestore',
        healthy: false,
        message: `Firestore connection check failed: ${errMsg}`,
        firestoreConfigured: true,
        details: {
          projectId: this.projectId,
          databaseId: this.databaseId,
          code: err.code,
          details: err.details,
        },
      };
    }
  }

  private ensureConnected(): Firestore {
    if (!this.db) {
      throw new Error(`Firestore is not ready: ${this.initializationError || 'Initialization incomplete'}`);
    }
    return this.db;
  }

  async getQuiz(id: string): Promise<StoredQuiz | null> {
    const db = this.ensureConnected();

    // 1. Fetch public document
    const quizDoc = await db.collection('quizzes').doc(id).get();
    if (!quizDoc.exists) {
      return null;
    }

    const publicData = quizDoc.data() || {};

    // 2. Fetch private credentials doc
    let privateData: Record<string, any> = {};
    try {
      const privateDoc = await db.collection('quizzes').doc(id).collection('private').doc('key').get();
      if (privateDoc.exists) {
        privateData = privateDoc.data() || {};
      }
    } catch (err) {
      console.warn(`[FirestoreQuizStorage] Could not fetch private key for quiz ${id}:`, err);
    }

    // 3. Fetch submissions subcollection
    const submissions: QuizSubmission[] = [];
    try {
      const subSnapshot = await db.collection('quizzes').doc(id).collection('submissions').get();
      subSnapshot.forEach((doc) => {
        submissions.push(doc.data() as QuizSubmission);
      });
    } catch (err) {
      console.warn(`[FirestoreQuizStorage] Could not fetch submissions for quiz ${id}:`, err);
    }

    return {
      id,
      category: publicData.category || 'friendship',
      title: publicData.title,
      description: publicData.description,
      creatorName: publicData.creatorName || '',
      totalQuestions: publicData.totalQuestions || 0,
      createdAt: publicData.createdAt || new Date().toISOString(),
      questionIds: publicData.questionIds,
      customQuestions: publicData.customQuestions,
      isTwoWay: publicData.isTwoWay,
      status: publicData.status || 'published',
      submissions,
      creatorAnswers: privateData.creatorAnswers || {},
      editTokenHash: privateData.editTokenHash,
      recoveryCodeHash: privateData.recoveryCodeHash,
      recoveryAttempts: privateData.recoveryAttempts || 0,
      lastRecoveryAttemptAt: privateData.lastRecoveryAttemptAt,
      updatedAt: privateData.updatedAt || publicData.updatedAt,
    };
  }

  async createQuiz(quiz: StoredQuiz): Promise<void> {
    const db = this.ensureConnected();
    const batch = db.batch();

    // 1. Public document
    const quizRef = db.collection('quizzes').doc(quiz.id);
    batch.set(quizRef, {
      id: quiz.id,
      category: quiz.category,
      title: quiz.title || null,
      description: quiz.description || null,
      creatorName: quiz.creatorName,
      totalQuestions: Object.keys(quiz.creatorAnswers || {}).length,
      createdAt: quiz.createdAt,
      submissionsCount: Array.isArray(quiz.submissions) ? quiz.submissions.length : 0,
      isTwoWay: Boolean(quiz.isTwoWay),
      questionIds: quiz.questionIds || null,
      customQuestions: quiz.customQuestions || null,
      status: quiz.status || 'published',
      updatedAt: quiz.updatedAt || quiz.createdAt,
    });

    // 2. Private subcollection document: /quizzes/{quizId}/private/key
    const privateRef = quizRef.collection('private').doc('key');
    batch.set(privateRef, {
      quizId: quiz.id,
      creatorAnswers: quiz.creatorAnswers || {},
      editTokenHash: quiz.editTokenHash || null,
      recoveryCodeHash: quiz.recoveryCodeHash || null,
      recoveryAttempts: quiz.recoveryAttempts || 0,
      lastRecoveryAttemptAt: quiz.lastRecoveryAttemptAt || null,
      updatedAt: quiz.updatedAt || quiz.createdAt,
    });

    // 3. Submissions if any (e.g. during migration)
    if (Array.isArray(quiz.submissions)) {
      for (const sub of quiz.submissions) {
        const subRef = quizRef.collection('submissions').doc(sub.id);
        batch.set(subRef, {
          id: sub.id,
          quizId: quiz.id,
          participantName: sub.participantName,
          score: sub.score,
          totalQuestions: sub.totalQuestions,
          percentage: sub.percentage,
          submittedAt: sub.submittedAt,
          sharedInterestsCount: sub.sharedInterestsCount ?? sub.score,
          answers: sub.answers || {},
          avatarType: sub.avatarType || null,
          sticker: sub.sticker || null,
        });
      }
    }

    await batch.commit();
  }

  async updateQuiz(id: string, updates: Partial<StoredQuiz>): Promise<void> {
    const db = this.ensureConnected();
    const batch = db.batch();
    const now = new Date().toISOString();

    const quizRef = db.collection('quizzes').doc(id);
    const publicUpdates: Record<string, any> = { updatedAt: now };

    if (updates.title !== undefined) publicUpdates.title = updates.title || null;
    if (updates.description !== undefined) publicUpdates.description = updates.description || null;
    if (updates.creatorName !== undefined) publicUpdates.creatorName = updates.creatorName;
    if (updates.status !== undefined) publicUpdates.status = updates.status;
    if (updates.questionIds !== undefined) publicUpdates.questionIds = updates.questionIds;
    if (updates.customQuestions !== undefined) publicUpdates.customQuestions = updates.customQuestions;
    if (updates.isTwoWay !== undefined) publicUpdates.isTwoWay = updates.isTwoWay;
    if (updates.creatorAnswers !== undefined) {
      publicUpdates.totalQuestions = Object.keys(updates.creatorAnswers).length;
    }

    batch.update(quizRef, publicUpdates);

    // Private updates
    const privateRef = quizRef.collection('private').doc('key');
    const privateUpdates: Record<string, any> = { updatedAt: now };
    if (updates.creatorAnswers !== undefined) privateUpdates.creatorAnswers = updates.creatorAnswers;
    if (updates.editTokenHash !== undefined) privateUpdates.editTokenHash = updates.editTokenHash;
    if (updates.recoveryCodeHash !== undefined) privateUpdates.recoveryCodeHash = updates.recoveryCodeHash;
    if (updates.recoveryAttempts !== undefined) privateUpdates.recoveryAttempts = updates.recoveryAttempts;
    if (updates.lastRecoveryAttemptAt !== undefined) privateUpdates.lastRecoveryAttemptAt = updates.lastRecoveryAttemptAt;

    batch.set(privateRef, privateUpdates, { merge: true });

    await batch.commit();
  }

  async deleteQuiz(id: string): Promise<void> {
    const db = this.ensureConnected();
    const quizRef = db.collection('quizzes').doc(id);

    // Delete subcollections
    const subSnapshot = await quizRef.collection('submissions').get();
    const batch = db.batch();
    subSnapshot.forEach((doc) => batch.delete(doc.ref));

    const privateRef = quizRef.collection('private').doc('key');
    batch.delete(privateRef);
    batch.delete(quizRef);

    await batch.commit();
  }

  async addSubmission(quizId: string, submission: QuizSubmission): Promise<{ success: boolean; isDuplicate?: boolean }> {
    const db = this.ensureConnected();
    const quizRef = db.collection('quizzes').doc(quizId);
    const subRef = quizRef.collection('submissions').doc(submission.id);

    return await db.runTransaction(async (transaction: Transaction) => {
      // 1. Check parent quiz exists
      const quizDoc = await transaction.get(quizRef);
      if (!quizDoc.exists) {
        throw new Error(`Quiz ${quizId} not found`);
      }

      // 2. Check for duplicate attempt ID
      const existingSub = await transaction.get(subRef);
      if (existingSub.exists) {
        return { success: true, isDuplicate: true };
      }

      // 3. Write submission
      transaction.set(subRef, {
        id: submission.id,
        quizId,
        participantName: submission.participantName,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        percentage: submission.percentage,
        submittedAt: submission.submittedAt,
        sharedInterestsCount: submission.sharedInterestsCount ?? submission.score,
        answers: submission.answers || {},
        avatarType: submission.avatarType || null,
        sticker: submission.sticker || null,
      });

      // 4. Atomically increment submissionsCount
      const currentCount = quizDoc.data()?.submissionsCount || 0;
      transaction.update(quizRef, {
        submissionsCount: currentCount + 1,
        updatedAt: new Date().toISOString(),
      });

      return { success: true, isDuplicate: false };
    });
  }

  async recordFailedRecoveryAttempt(quizId: string): Promise<{ attempts: number; remaining: number; lockedUntil?: number }> {
    const db = this.ensureConnected();
    const privateRef = db.collection('quizzes').doc(quizId).collection('private').doc('key');

    return await db.runTransaction(async (transaction: Transaction) => {
      const privateDoc = await transaction.get(privateRef);
      if (!privateDoc.exists) {
        throw new Error(`Quiz credentials for ${quizId} not found`);
      }

      const data = privateDoc.data() || {};
      const now = Date.now();
      const attempts = (data.recoveryAttempts || 0) + 1;

      transaction.update(privateRef, {
        recoveryAttempts: attempts,
        lastRecoveryAttemptAt: new Date(now).toISOString(),
      });

      const remaining = Math.max(0, 5 - attempts);
      const lockedUntil = attempts >= 5 ? now + 15 * 60 * 1000 : undefined;
      return { attempts, remaining, lockedUntil };
    });
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
    const db = this.ensureConnected();
    const quizRef = db.collection('quizzes').doc(quizId);
    const privateRef = quizRef.collection('private').doc('key');

    return await db.runTransaction(async (transaction: Transaction) => {
      const quizDoc = await transaction.get(quizRef);
      if (!quizDoc.exists) {
        return { success: false, status: 404, error: 'Quiz not found' };
      }

      const privateDoc = await transaction.get(privateRef);
      if (!privateDoc.exists) {
        return { success: false, status: 404, error: 'Quiz credentials not found' };
      }

      const privData = privateDoc.data() || {};
      if (!privData.recoveryCodeHash) {
        return { success: false, status: 400, error: 'This quiz does not have recovery enabled' };
      }

      const now = Date.now();
      const attempts = privData.recoveryAttempts || 0;
      const lastAttempt = privData.lastRecoveryAttemptAt ? new Date(privData.lastRecoveryAttemptAt).getTime() : 0;

      // Rate limit lockout check
      if (attempts >= 5 && now - lastAttempt < 15 * 60 * 1000) {
        const waitMinutes = Math.ceil((15 * 60 * 1000 - (now - lastAttempt)) / 60000);
        return {
          success: false,
          status: 429,
          error: `Too many recovery attempts. Access locked for ${waitMinutes} more minute(s) to protect creator security.`,
        };
      }

      // Check recovery hash
      const isValid = safeCompareHashes(expectedRecoveryHash, privData.recoveryCodeHash);
      if (!isValid) {
        const nextAttempts = (privData.recoveryAttempts || 0) + 1;
        transaction.update(privateRef, {
          recoveryAttempts: nextAttempts,
          lastRecoveryAttemptAt: new Date().toISOString(),
        });
        const remaining = Math.max(0, 5 - nextAttempts);
        return {
          success: false,
          status: 401,
          error: `Invalid recovery code. ${remaining} attempt(s) remaining before a 15-minute lockout.`,
        };
      }

      // Valid: rotate token and reset attempts atomically
      transaction.update(privateRef, {
        recoveryAttempts: 0,
        editTokenHash: newEditTokenHash,
        updatedAt: new Date().toISOString(),
      });

      transaction.update(quizRef, {
        updatedAt: new Date().toISOString(),
      });

      const publicData = quizDoc.data() || {};
      return {
        success: true,
        quiz: {
          id: quizId,
          category: publicData.category,
          title: publicData.title,
          description: publicData.description,
          creatorName: publicData.creatorName,
          status: publicData.status || 'published',
          createdAt: publicData.createdAt,
          creatorAnswers: privData.creatorAnswers || {},
          submissions: [],
          editTokenHash: newEditTokenHash,
          recoveryCodeHash: privData.recoveryCodeHash,
        },
      };
    });
  }

  async getQuizzesByIds(ids: string[]): Promise<StoredQuiz[]> {
    const results: StoredQuiz[] = [];
    for (const id of ids) {
      const q = await this.getQuiz(id);
      if (q) results.push(q);
    }
    return results;
  }

  async getAllQuizzes(): Promise<StoredQuiz[]> {
    const db = this.ensureConnected();
    const snapshot = await db.collection('quizzes').get();
    const results: StoredQuiz[] = [];

    for (const doc of snapshot.docs) {
      const q = await this.getQuiz(doc.id);
      if (q) results.push(q);
    }

    return results;
  }
}
