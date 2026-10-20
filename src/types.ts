export type QuizCategory =
  | 'friendship'
  | 'relationship'
  | 'child_to_parents'
  | 'parents_to_child'
  | 'teacher_to_students'
  | 'students_to_teacher'
  | 'new_friendship'
  | 'custom';

export type LanguageCode =
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'ms' // Malay
  | 'th' // Thai
  | 'pt' // Portuguese
  | 'ar' // Arabic
  | 'id' // Indonesian
  | 'tl' // Filipino
  | 'ja' // Japanese
  | 'it' // Italian
  | 'tr'; // Turkish

export type QuestionType = 'multiple_choice' | 'true_false' | 'preference' | 'text';

export type QuestionFormat =
  | 'guess_answer'
  | 'pick_fighter'
  | 'finish_sentence'
  | 'this_or_that'
  | 'lore_test'
  | 'bonus_round'
  | 'two_way';

export interface QuizQuestionOption {
  id: number;
  label: string;
  emoji?: string;
}

export interface QuizQuestion {
  id: number;
  category: QuizCategory;
  question: string;
  questionPersonalized?: (name: string) => string;
  speechBubble?: string;
  options: QuizQuestionOption[];
  type?: QuestionType;
  format?: QuestionFormat;
  formatBadge?: string;
  isOpinion?: boolean;
  funFact?: string;
}

export interface QuizCategoryInfo {
  id: QuizCategory;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  badge: string;
  badgeColor: string;
  characterPose: 'peek' | 'wave' | 'happy' | 'curious' | 'celebrate' | 'idle';
  speechBubble: string;
}

export interface QuizSubmission {
  id: string;
  participantName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  sharedInterestsCount?: number;
}

export type QuizStatus = 'published' | 'draft';

export interface StoredQuizData {
  id: string;
  category: QuizCategory;
  title?: string;
  description?: string;
  creatorName: string;
  questionIds?: number[];
  customQuestions?: QuizQuestion[];
  isTwoWay?: boolean;
  createdAt: string;
  totalQuestions: number;
  submissionsCount?: number;
  status?: QuizStatus;
  canEdit?: boolean;
}

export interface CreatorQuizDetails extends StoredQuizData {
  creatorAnswers: Record<string | number, any>;
  status: QuizStatus;
  canEdit: boolean;
}

export interface CreatorQuizSummary {
  id: string;
  category: QuizCategory;
  title?: string;
  creatorName: string;
  status: QuizStatus;
  createdAt: string;
  submissionsCount: number;
  canEdit: boolean;
}

export interface RecoveryResponse {
  success: boolean;
  quizId: string;
  editToken: string;
  quiz: StoredQuizData;
}

export interface QuestionBreakdownItem {
  correct: boolean;
  participantAnswer: number | string;
  creatorAnswer: number | string;
  isSharedInterest?: boolean;
}

export interface SubmissionResponse {
  success: boolean;
  submissionId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  creatorName: string;
  category: QuizCategory;
  breakdown: Record<number, QuestionBreakdownItem>;
  sharedInterests?: { question: string; answer: string }[];
}
