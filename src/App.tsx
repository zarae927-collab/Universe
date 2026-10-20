import React, { useState, useEffect } from 'react';
import { QuizCategory, LanguageCode, StoredQuizData, SubmissionResponse, QuizQuestion } from './types';
import { getQuestionsByCategory } from './data/questions';
import { SkyBackground } from './components/decorations/SkyBackground';
import { HeaderControls } from './components/common/LanguageSelector';
import { LoadingCard } from './components/common/LoadingCard';
import { HomeWelcomeView } from './components/views/HomeWelcomeView';
import { QuizSetupView } from './components/views/QuizSetupView';
import { QuestionFlowView } from './components/views/QuestionFlowView';
import { QuizCreatedSuccessView } from './components/views/QuizCreatedSuccessView';
import { QuizResultView } from './components/views/QuizResultView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { CodeInputModal } from './components/views/CodeInputModal';
import { CustomQuizBuilderView } from './components/views/CustomQuizBuilderView';
import { CreatorRecoveryModal } from './components/views/CreatorRecoveryModal';

import {
  fetchQuiz,
  createQuiz,
  submitQuizAnswers,
  getCreatorRecoveryCode,
  fetchCreatorQuiz,
  updateCreatorQuiz,
  publishCreatorQuiz,
  getCreatorToken,
} from './services/quizApi';

type AppStep =
  | 'home'
  | 'creator-setup'
  | 'creator-questions'
  | 'custom-builder'
  | 'created-success'
  | 'participant-setup'
  | 'participant-questions'
  | 'result'
  | 'leaderboard';

export default function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [step, setStep] = useState<AppStep>('home');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('loading...');
  const [errorMessage, setErrorMessage] = useState('');

  // Quiz state
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('friendship');
  const [creatorName, setCreatorName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [activeQuizId, setActiveQuizId] = useState<string>('');
  const [activeQuizTitle, setActiveQuizTitle] = useState<string>('');
  const [activeQuizDescription, setActiveQuizDescription] = useState<string>('');
  const [activeQuizData, setActiveQuizData] = useState<StoredQuizData | null>(null);
  const [customQuestions, setCustomQuestions] = useState<QuizQuestion[] | null>(null);
  const [activeCreatorAnswers, setActiveCreatorAnswers] = useState<Record<string | number, any> | null>(null);
  const [isTwoWayMode, setIsTwoWayMode] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [activeRecoveryCode, setActiveRecoveryCode] = useState<string>('');
  const [isQuizDraft, setIsQuizDraft] = useState<boolean>(false);

  // Modals
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isCreatorRecoveryModalOpen, setIsCreatorRecoveryModalOpen] = useState(false);

  // Check URL params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quizIdParam = params.get('quiz');
    if (quizIdParam) {
      loadQuizById(quizIdParam);
    }
  }, []);

  const loadQuizById = async (id: string) => {
    try {
      setLoading(true);
      setLoadingMessage('loading quiz...');
      setErrorMessage('');

      const data = await fetchQuiz(id);
      setActiveQuizId(id);
      setActiveQuizData(data);
      setSelectedCategory(data.category);
      setCreatorName(data.creatorName);
      if (Array.isArray(data.customQuestions) && data.customQuestions.length > 0) {
        setCustomQuestions(data.customQuestions);
      } else {
        setCustomQuestions(null);
      }
      setIsTwoWayMode(Boolean(data.isTwoWay));

      const savedRec = getCreatorRecoveryCode(id);
      if (savedRec) setActiveRecoveryCode(savedRec);

      if (data.status === 'draft') {
        setIsQuizDraft(true);
        setStep('created-success');
      } else {
        setIsQuizDraft(false);
        setStep('participant-setup');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load quiz');
      setStep('home');
    } finally {
      setLoading(false);
    }
  };

  // Flow Handlers
  const handleStartCreatorFlow = (catOverride?: QuizCategory) => {
    const cat = catOverride || selectedCategory;
    if (cat === 'custom') {
      setStep('custom-builder');
    } else {
      setStep('creator-setup');
    }
  };

  const handleCreatorNameSubmit = (name: string, isTwoWay?: boolean) => {
    setCreatorName(name);
    setIsTwoWayMode(Boolean(isTwoWay));
    setStep('creator-questions');
  };

  const handleCreatorFinishQuestions = async (answers: Record<string | number, any>) => {
    try {
      setLoading(true);
      setLoadingMessage('saving your quiz...');

      const questionsToUse = customQuestions || getQuestionsByCategory(selectedCategory);
      const questionIds = questionsToUse.map((q) => q.id);

      const { quizId, recoveryCode } = await createQuiz({
        category: selectedCategory,
        creatorName,
        creatorAnswers: answers,
        questionIds,
        customQuestions: selectedCategory === 'custom' ? questionsToUse : undefined,
        isTwoWay: isTwoWayMode,
        status: 'published',
      });

      setActiveQuizId(quizId);
      if (recoveryCode) setActiveRecoveryCode(recoveryCode);
      setIsQuizDraft(false);

      // Update URL query param without page reload so user can copy directly
      if (typeof window !== 'undefined' && window.history.pushState) {
        const newUrl = `${window.location.pathname}?quiz=${quizId}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }

      setStep('created-success');
    } catch (err: any) {
      alert('Could not save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorSaveDraft = async (answers: Record<string | number, any>) => {
    try {
      setLoading(true);
      setLoadingMessage('saving private draft...');

      const questionsToUse = customQuestions || getQuestionsByCategory(selectedCategory);
      const questionIds = questionsToUse.map((q) => q.id);

      const { quizId, recoveryCode } = await createQuiz(
        {
          category: selectedCategory,
          creatorName,
          creatorAnswers: answers,
          questionIds,
          customQuestions: selectedCategory === 'custom' ? questionsToUse : undefined,
          isTwoWay: isTwoWayMode,
          status: 'draft',
        },
        true
      );

      setActiveQuizId(quizId);
      if (recoveryCode) setActiveRecoveryCode(recoveryCode);
      setIsQuizDraft(true);

      if (typeof window !== 'undefined' && window.history.pushState) {
        const newUrl = `${window.location.pathname}?quiz=${quizId}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }

      setStep('created-success');
    } catch (err: any) {
      alert('Could not save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomQuizPublish = async (quizData: {
    quizId?: string;
    title: string;
    description: string;
    creatorName: string;
    category?: QuizCategory;
    questions: QuizQuestion[];
    creatorAnswers: Record<string | number, any>;
  }) => {
    try {
      setLoading(true);
      setLoadingMessage('publishing your quiz...');

      const targetCategory = quizData.category || selectedCategory || 'custom';
      setSelectedCategory(targetCategory);
      setCreatorName(quizData.creatorName);
      setCustomQuestions(quizData.questions);
      setActiveQuizTitle(quizData.title);
      setActiveQuizDescription(quizData.description);
      setActiveCreatorAnswers(quizData.creatorAnswers);

      let quizId = quizData.quizId || activeQuizId;
      let recoveryCode = activeRecoveryCode;

      if (quizId && getCreatorToken(quizId)) {
        await updateCreatorQuiz(quizId, {
          title: quizData.title,
          description: quizData.description,
          creatorName: quizData.creatorName,
          category: targetCategory,
          creatorAnswers: quizData.creatorAnswers,
          customQuestions: quizData.questions,
          questionIds: quizData.questions.map((q) => q.id),
        });
        await publishCreatorQuiz(quizId);
      } else {
        const res = await createQuiz({
          category: targetCategory,
          title: quizData.title,
          description: quizData.description,
          creatorName: quizData.creatorName,
          creatorAnswers: quizData.creatorAnswers,
          customQuestions: quizData.questions,
          questionIds: quizData.questions.map((q) => q.id),
          status: 'published',
        });
        quizId = res.quizId;
        if (res.recoveryCode) recoveryCode = res.recoveryCode;
      }

      setActiveQuizId(quizId);
      if (recoveryCode) setActiveRecoveryCode(recoveryCode);
      setIsQuizDraft(false);

      if (typeof window !== 'undefined' && window.history.pushState) {
        const newUrl = `${window.location.pathname}?quiz=${quizId}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }

      setStep('created-success');
    } catch (err: any) {
      alert('Could not publish quiz: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomQuizDraft = async (quizData: {
    quizId?: string;
    title: string;
    description: string;
    creatorName: string;
    category?: QuizCategory;
    questions: QuizQuestion[];
    creatorAnswers: Record<string | number, any>;
  }): Promise<{ quizId: string; recoveryCode?: string }> => {
    try {
      const targetCategory = quizData.category || selectedCategory || 'custom';
      setSelectedCategory(targetCategory);
      setCreatorName(quizData.creatorName);
      setCustomQuestions(quizData.questions);
      setActiveQuizTitle(quizData.title);
      setActiveQuizDescription(quizData.description);
      setActiveCreatorAnswers(quizData.creatorAnswers);

      let quizId = quizData.quizId || activeQuizId;
      let recoveryCode = activeRecoveryCode;

      if (quizId && getCreatorToken(quizId)) {
        await updateCreatorQuiz(quizId, {
          title: quizData.title,
          description: quizData.description,
          creatorName: quizData.creatorName,
          category: targetCategory,
          creatorAnswers: quizData.creatorAnswers,
          customQuestions: quizData.questions,
          questionIds: quizData.questions.map((q) => q.id),
        });
      } else {
        const res = await createQuiz(
          {
            category: targetCategory,
            title: quizData.title,
            description: quizData.description,
            creatorName: quizData.creatorName,
            creatorAnswers: quizData.creatorAnswers,
            customQuestions: quizData.questions,
            questionIds: quizData.questions.map((q) => q.id),
            status: 'draft',
          },
          true
        );
        quizId = res.quizId;
        if (res.recoveryCode) recoveryCode = res.recoveryCode;
      }

      setActiveQuizId(quizId);
      if (recoveryCode) setActiveRecoveryCode(recoveryCode);
      setIsQuizDraft(true);

      if (typeof window !== 'undefined' && window.history.pushState) {
        const newUrl = `${window.location.pathname}?quiz=${quizId}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }

      return { quizId, recoveryCode };
    } catch (err: any) {
      throw new Error(err.message || 'Could not save draft');
    }
  };

  const handleEditQuizDraft = async (id: string) => {
    try {
      setLoading(true);
      setLoadingMessage('loading your quiz into editor...');
      setErrorMessage('');

      let creatorDetails: any = null;
      try {
        creatorDetails = await fetchCreatorQuiz(id);
      } catch (e) {
        const publicQuiz = await fetchQuiz(id);
        creatorDetails = {
          ...publicQuiz,
          creatorAnswers: {},
          canEdit: Boolean(publicQuiz.canEdit),
          status: publicQuiz.status || 'draft',
        };
      }

      setActiveQuizId(id);
      setActiveQuizData(creatorDetails);
      setSelectedCategory(creatorDetails.category);
      setCreatorName(creatorDetails.creatorName);
      setActiveQuizTitle(creatorDetails.title || '');
      setActiveQuizDescription(creatorDetails.description || '');
      setActiveCreatorAnswers(creatorDetails.creatorAnswers || {});

      // Determine questions
      let loadedQuestions: QuizQuestion[] = [];
      if (Array.isArray(creatorDetails.customQuestions) && creatorDetails.customQuestions.length > 0) {
        loadedQuestions = creatorDetails.customQuestions;
      } else {
        const catQuestions = getQuestionsByCategory(creatorDetails.category);
        if (creatorDetails.questionIds && creatorDetails.questionIds.length > 0) {
          loadedQuestions = creatorDetails.questionIds
            .map((qid: number) => catQuestions.find((q) => q.id === qid))
            .filter(Boolean) as QuizQuestion[];
          if (loadedQuestions.length === 0) {
            loadedQuestions = catQuestions.slice(0, 10);
          }
        } else {
          loadedQuestions = catQuestions.slice(0, 10);
        }
      }

      setCustomQuestions(loadedQuestions);
      setIsTwoWayMode(Boolean(creatorDetails.isTwoWay));

      const savedRec = getCreatorRecoveryCode(id);
      if (savedRec) setActiveRecoveryCode(savedRec);

      setIsQuizDraft(creatorDetails.status === 'draft');
      setStep('custom-builder');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load quiz for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantNameSubmit = (name: string) => {
    setParticipantName(name);
    setStep('participant-questions');
  };

  const handleParticipantFinishQuestions = async (answers: Record<string | number, any>) => {
    if (!activeQuizId) return;

    try {
      setLoading(true);
      setLoadingMessage('calculating your results...');

      const resultData = await submitQuizAnswers(activeQuizId, {
        participantName,
        answers,
      });

      setSubmissionResult(resultData);
      setStep('result');
    } catch (err: any) {
      alert('Failed to submit answers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToHome = () => {
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', window.location.pathname);
    }
    setActiveQuizId('');
    setActiveQuizData(null);
    setCustomQuestions(null);
    setSubmissionResult(null);
    setParticipantName('');
    setIsTwoWayMode(false);
    setStep('home');
  };

  // Determine active questions: if custom quiz has questions, use them, otherwise use category default (first 10 of 15)
  const currentQuestions = customQuestions
    ? customQuestions
    : getQuestionsByCategory(selectedCategory).slice(0, 10);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between font-sans overflow-x-hidden">
      {/* Animated Sky Background with Drifting Clouds & Sparkles */}
      <SkyBackground />

      {/* Fixed/Relative Header with Language Selector & Menu */}
      <HeaderControls
        currentLang={currentLang}
        onSelectLang={(lang) => setCurrentLang(lang)}
        onCreateNewQuiz={handleResetToHome}
        onOpenLeaderboard={
          activeQuizId ? () => setStep('leaderboard') : undefined
        }
        onOpenCreatorModal={() => setIsCreatorRecoveryModalOpen(true)}
      />

      {/* Main Interactive Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center py-2 px-2">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="w-full max-w-[380px] mb-4 p-3 rounded-2xl bg-rose-100/90 text-rose-800 text-xs font-bold border border-rose-200 text-center shadow-md animate-in fade-in flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              className="ml-2 px-2 py-0.5 rounded-lg bg-rose-200 text-rose-900 cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-12">
            <LoadingCard message={loadingMessage} showMascot={true} />
          </div>
        ) : (
          <>
            {/* 1. Homepage */}
            {step === 'home' && (
              <HomeWelcomeView
                currentLang={currentLang}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  if (cat === 'custom') {
                    setStep('custom-builder');
                  }
                }}
                onStartQuiz={() => handleStartCreatorFlow()}
                onOpenCodeInput={() => setIsCodeModalOpen(true)}
                onOpenCreatorModal={() => setIsCreatorRecoveryModalOpen(true)}
              />
            )}

            {/* 2. Custom Quiz Builder View */}
            {step === 'custom-builder' && (
              <CustomQuizBuilderView
                currentLang={currentLang}
                initialQuizId={activeQuizId || undefined}
                initialTitle={activeQuizTitle || activeQuizData?.title || undefined}
                initialDescription={activeQuizDescription || activeQuizData?.description || undefined}
                initialCreatorName={creatorName || undefined}
                initialCategory={selectedCategory || 'custom'}
                initialQuestions={customQuestions || undefined}
                initialCreatorAnswers={activeCreatorAnswers || undefined}
                initialRecoveryCode={activeRecoveryCode || undefined}
                onBack={() => setStep('home')}
                onPublishQuiz={handleCustomQuizPublish}
                onSaveDraft={handleCustomQuizDraft}
              />
            )}

            {/* 3. Creator Setup (Name Entry) */}
            {step === 'creator-setup' && (
              <QuizSetupView
                currentLang={currentLang}
                category={selectedCategory}
                initialName={creatorName}
                onBack={() => setStep('home')}
                onContinue={handleCreatorNameSubmit}
                onCustomize={(name, isTwoWay) => {
                  setCreatorName(name);
                  setIsTwoWayMode(Boolean(isTwoWay));
                  const initialQs = getQuestionsByCategory(selectedCategory).slice(0, 10);
                  setCustomQuestions(initialQs);
                  setStep('custom-builder');
                }}
              />
            )}

            {/* 4. Creator Setting Answers */}
            {step === 'creator-questions' && (
              <QuestionFlowView
                currentLang={currentLang}
                questions={currentQuestions}
                isCreatorMode={true}
                isTwoWay={isTwoWayMode}
                onBack={() => setStep('creator-setup')}
                onFinish={handleCreatorFinishQuestions}
                onSaveDraft={handleCreatorSaveDraft}
                onOpenEditor={(answers) => {
                  setActiveCreatorAnswers(answers);
                  setCustomQuestions(currentQuestions);
                  setStep('custom-builder');
                }}
              />
            )}

            {/* 5. Quiz Created Success (Share Link & WhatsApp) */}
            {step === 'created-success' && (
              <QuizCreatedSuccessView
                currentLang={currentLang}
                quizId={activeQuizId}
                creatorName={creatorName}
                category={selectedCategory}
                recoveryCode={activeRecoveryCode}
                isDraft={isQuizDraft}
                onEditDraft={() => handleEditQuizDraft(activeQuizId)}
                onViewLeaderboard={() => setStep('leaderboard')}
                onPlaySelf={() => {
                  setParticipantName(`${creatorName} (Self Test)`);
                  setStep('participant-questions');
                }}
                onCreateAnother={handleResetToHome}
              />
            )}

            {/* 6. Participant Setup (When visiting shared link) */}
            {step === 'participant-setup' && (
              <QuizSetupView
                currentLang={currentLang}
                category={selectedCategory}
                initialName={participantName}
                isParticipant={true}
                creatorName={creatorName}
                onBack={handleResetToHome}
                onContinue={handleParticipantNameSubmit}
              />
            )}

            {/* 7. Participant Answering Questions */}
            {step === 'participant-questions' && (
              <QuestionFlowView
                currentLang={currentLang}
                questions={currentQuestions}
                creatorName={creatorName}
                isCreatorMode={false}
                isTwoWay={isTwoWayMode}
                onBack={() => setStep('participant-setup')}
                onFinish={handleParticipantFinishQuestions}
              />
            )}

            {/* 8. Quiz Results */}
            {step === 'result' && submissionResult && (
              <QuizResultView
                currentLang={currentLang}
                result={submissionResult}
                questions={currentQuestions}
                participantName={participantName}
                onRetake={() => setStep('participant-questions')}
                onCreateOwn={handleResetToHome}
                onViewLeaderboard={() => setStep('leaderboard')}
              />
            )}

            {/* 9. Leaderboard View */}
            {step === 'leaderboard' && (
              <LeaderboardView
                currentLang={currentLang}
                quizId={activeQuizId}
                creatorName={creatorName}
                onBack={() => {
                  if (submissionResult) {
                    setStep('result');
                  } else if (activeQuizId) {
                    setStep('created-success');
                  } else {
                    setStep('home');
                  }
                }}
                onCreateNew={handleResetToHome}
              />
            )}
          </>
        )}
      </main>

      {/* Code Input Modal */}
      <CodeInputModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSubmitCode={(code) => {
          setIsCodeModalOpen(false);
          loadQuizById(code);
        }}
      />

      {/* Creator Access & Recovery Modal */}
      <CreatorRecoveryModal
        isOpen={isCreatorRecoveryModalOpen}
        onClose={() => setIsCreatorRecoveryModalOpen(false)}
        onSelectQuiz={(id) => {
          setIsCreatorRecoveryModalOpen(false);
          loadQuizById(id);
        }}
        onEditDraft={(id) => {
          setIsCreatorRecoveryModalOpen(false);
          handleEditQuizDraft(id);
        }}
      />
    </div>
  );
}
