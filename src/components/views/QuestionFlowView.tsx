import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { QuizQuestion, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { BrandLogo } from '../mascots/BrandLogo';
import { PandaMascot, PandaPose } from '../mascots/PandaMascot';
import { WashiTape } from '../decorations/WashiTape';

interface QuestionFlowViewProps {
  currentLang: LanguageCode;
  questions: QuizQuestion[];
  creatorName?: string;
  isCreatorMode: boolean; // true = setting answers, false = answering friend's quiz
  isTwoWay?: boolean;
  onBack: () => void;
  onFinish: (answers: Record<string | number, any>) => void;
  onSaveDraft?: (answers: Record<string | number, any>) => void;
  onOpenEditor?: (answers: Record<string | number, any>) => void;
}

export const QuestionFlowView: React.FC<QuestionFlowViewProps> = ({
  currentLang,
  questions,
  creatorName = '',
  isCreatorMode,
  isTwoWay = false,
  onBack,
  onFinish,
  onSaveDraft,
  onOpenEditor,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string | number, any>>({});
  const [textInput, setTextInput] = useState('');
  const [mascotPose, setMascotPose] = useState<PandaPose>('curious');

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const currentAnswer = selectedAnswers[currentQ?.id];
  const isLastQuestion = currentIndex === total - 1;

  const handleSelectOption = (optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
    // Cheerful reaction
    setMascotPose('happy');
    setTimeout(() => setMascotPose('curious'), 1200);
  };

  const handleTextAnswer = (text: string) => {
    setTextInput(text);
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: text,
    }));
  };

  const handleNext = () => {
    if (currentAnswer === undefined) return;

    if (isLastQuestion) {
      onFinish(selectedAnswers);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setMascotPose('curious');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const questionTitle =
    !isCreatorMode && currentQ.questionPersonalized && creatorName
      ? currentQ.questionPersonalized(creatorName)
      : currentQ.question;

  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="w-full flex flex-col items-center pt-1 pb-12 px-4 max-w-[440px] mx-auto animate-in fade-in duration-300">
      {/* Top Header: Back Button & Progress Indicator */}
      <div className="w-full flex items-center justify-between mb-2">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-sky-600 shadow-md border border-sky-100 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-sky-800 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-sky-100 shadow-xs">
            {t.question} {currentIndex + 1} {t.of} {total}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/80 h-3 rounded-full p-0.5 border border-sky-100 shadow-inner mb-3">
        <div
          className="h-full rounded-full transition-all duration-300 shadow-xs"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)',
          }}
        />
      </div>

      {/* Brand Logo */}
      <div className="mb-2">
        <BrandLogo />
      </div>

      {/* Mascot Peeking with Question Speech Bubble */}
      <div className="w-full relative flex justify-end pr-2 -mb-7 z-20 pointer-events-auto">
        <PandaMascot
          size={105}
          pose={mascotPose}
          speechText={
            currentQ.speechBubble ||
            (isCreatorMode ? "what's your real answer? ✨" : "can you guess right? 💭")
          }
        />
      </div>

      {/* Question Card */}
      <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-5 pt-7 shadow-[0_12px_32px_rgba(56,165,255,0.18)] border-2 border-white flex flex-col items-center z-10">
        {/* Washi Tape */}
        <div className="absolute -top-2.5 -left-2 z-20">
          <WashiTape color="pink" angle="-5deg" className="w-18" />
        </div>

        {/* Question Counter & Format Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
          {currentQ.formatBadge && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 text-xs font-bold border border-pink-200 shadow-xs">
              <span>{currentQ.formatBadge}</span>
            </span>
          )}
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>
              {isCreatorMode ? 'Set Your Answer' : `Answering for ${creatorName}`}
            </span>
          </div>
        </div>

        {/* Question Heading */}
        <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-800 text-center leading-snug mb-5 min-h-[50px] flex items-center justify-center">
          {questionTitle}
        </h2>

        {/* Answer Options or Text Input */}
        <div className="w-full space-y-2.5 mb-5">
          {currentQ.type === 'text' ? (
            <div className="w-full">
              <input
                type="text"
                value={textInput}
                onChange={(e) => handleTextAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-sky-300 bg-sky-50/50 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
            </div>
          ) : (
            (currentQ.options || []).map((opt) => {
              const isSelected = currentAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/90 shadow-[0_4px_16px_rgba(56,165,255,0.2)] scale-[1.01]'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-sky-50/50 hover:border-sky-200 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {opt.emoji && (
                      <span className="text-2xl filter drop-shadow-xs">{opt.emoji}</span>
                    )}
                    <span
                      className={`text-sm font-semibold leading-tight ${
                        isSelected ? 'text-sky-950 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>

                  <div className="ml-2 flex-shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-sky-500 fill-sky-100" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Continue / Next Button */}
        <button
          onClick={handleNext}
          disabled={currentAnswer === undefined}
          className={`w-full py-3.5 px-6 rounded-full font-heading font-bold text-base text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-2 group cursor-pointer ${
            currentAnswer !== undefined
              ? 'hover:shadow-[0_10px_25px_rgba(37,99,235,0.45)] hover:scale-[1.02] active:scale-[0.98]'
              : 'opacity-50 cursor-not-allowed'
          }`}
          style={{
            background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
          }}
        >
          <span className="tracking-wide text-lg drop-shadow-xs">
            {isLastQuestion ? (isCreatorMode ? 'Finish & Get Link ✨' : 'See My Results 🎉') : t.continueBtn}
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
            <ArrowRight className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </button>

        {/* Options for Creator Mode */}
        {isCreatorMode && (
          <div className="w-full mt-3 flex flex-col items-center gap-1.5 text-center">
            {onOpenEditor && (
              <button
                type="button"
                onClick={() => onOpenEditor(selectedAnswers)}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Customize Questions & Choices in Editor 🎨</span>
              </button>
            )}
            {onSaveDraft && (
              <button
                type="button"
                onClick={() => onSaveDraft(selectedAnswers)}
                className="text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
              >
                Save as Private Draft & Finish Later 💾
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
