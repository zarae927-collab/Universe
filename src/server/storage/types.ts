export interface QuizSubmission {
  id: string;
  participantName: string;
  answers: Record<string | number, any>;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  sharedInterestsCount?: number;
  avatarType?: string;
  sticker?: string;
}

export interface StoredQuiz {
  id: string;
  category: string;
  title?: string;
  description?: string;
  creatorName: string;
  creatorAnswers: Record<string | number, any>; // Hidden from participants
  questionIds?: number[];
  customQuestions?: any[];
  totalQuestions?: number;
  isTwoWay?: boolean;
  createdAt: string;
  submissions: QuizSubmission[];
  status?: 'published' | 'draft';
  editTokenHash?: string;
  recoveryCodeHash?: string;
  recoveryAttempts?: number;
  lastRecoveryAttemptAt?: string;
  updatedAt?: string;
}

export interface StorageHealthStatus {
  engine: 'firestore' | 'json';
  healthy: boolean;
  message: string;
  firestoreConfigured: boolean;
  details?: Record<string, any>;
}

export interface IQuizStorage {
  readonly name: string;
  
  /**
   * Initializes storage (e.g. loads data, tests connections)
   */
  init(): Promise<void>;

  /**
   * Health check verifying read/write capabilities
   */
  checkHealth(): Promise<StorageHealthStatus>;

  /**
   * Retrieve a quiz by ID (including private fields for internal server use)
   */
  getQuiz(id: string): Promise<StoredQuiz | null>;

  /**
   * Create a new quiz record
   */
  createQuiz(quiz: StoredQuiz): Promise<void>;

  /**
   * Update existing quiz fields
   */
  updateQuiz(id: string, updates: Partial<StoredQuiz>): Promise<void>;

  /**
   * Delete a quiz record
   */
  deleteQuiz(id: string): Promise<void>;

  /**
   * Add a submission to a quiz with atomic counter increment
   */
  addSubmission(quizId: string, submission: QuizSubmission): Promise<{ success: boolean; isDuplicate?: boolean }>;

  /**
   * Atomically verify recovery code and rotate to new edit token
   */
  atomicRotateRecoveryToken(
    quizId: string,
    expectedRecoveryHash: string,
    newEditTokenHash: string
  ): Promise<{
    success: boolean;
    error?: string;
    status?: number;
    quiz?: StoredQuiz;
  }>;

  /**
   * Record a failed recovery attempt (with rate-limiting)
   */
  recordFailedRecoveryAttempt(quizId: string): Promise<{ attempts: number; remaining: number; lockedUntil?: number }>;

  /**
   * List verified quizzes for a batch of IDs
   */
  getQuizzesByIds(ids: string[]): Promise<StoredQuiz[]>;

  /**
   * List all quizzes for global scoreboard aggregation
   */
  getAllQuizzes(): Promise<StoredQuiz[]>;
}
