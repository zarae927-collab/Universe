import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { QuizCategory, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { getCategoryInfo } from '../../data/questions';
import { BrandLogo } from '../mascots/BrandLogo';
import { PandaMascot } from '../mascots/PandaMascot';
import { HangingBanner } from '../decorations/HangingBanner';
import { WashiTape } from '../decorations/WashiTape';

interface QuizSetupViewProps {
  currentLang: LanguageCode;
  category: QuizCategory;
  initialName?: string;
  isParticipant?: boolean;
  creatorName?: string;
  onBack: () => void;
  onContinue: (name: string, isTwoWay?: boolean) => void;
}

export const QuizSetupView: React.FC<QuizSetupViewProps> = ({
  currentLang,
  category,
  initialName = '',
  isParticipant = false,
  creatorName = '',
  onBack,
  onContinue,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const [isTwoWay, setIsTwoWay] = useState(false);

  const catInfo = getCategoryInfo(category);
  const MAX_LENGTH = 15;

  const isChildOrSchool =
    category === 'child_to_parents' ||
    category === 'parents_to_child' ||
    category === 'teacher_to_students' ||
    category === 'students_to_teacher';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.nameRequired);
      return;
    }
    setError('');
    onContinue(trimmed, isTwoWay);
  };

  return (
    <div className="w-full flex flex-col items-center pt-1 pb-12 px-4 max-w-[440px] mx-auto animate-in fade-in duration-300">
      {/* Top Bar with Back Button & Category Badge */}
      <div className="w-full flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-sky-600 shadow-md border border-sky-100 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <span className="text-xs font-bold px-3 py-1 bg-white/80 backdrop-blur-xs text-sky-800 rounded-full border border-white shadow-xs flex items-center gap-1.5">
          <span>{catInfo.icon}</span>
          <span>{catInfo.title}</span>
        </span>
      </div>

      {/* Brand Logo */}
      <div className="mb-4">
        <BrandLogo />
      </div>

      {/* Mascot Peeking from Left */}
      <div className="w-full relative flex justify-start pl-2 -mb-7 z-20 pointer-events-auto">
        <PandaMascot
          size={105}
          pose={catInfo.characterPose}
          speechText={
            isParticipant
              ? `ready for ${creatorName}'s quiz?`
              : catInfo.speechBubble || "what's your name? 🐾"
          }
        />
      </div>

      {/* Main Setup Card */}
      <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-6 pt-6 shadow-[0_12px_32px_rgba(56,165,255,0.18)] border-2 border-white flex flex-col items-center z-10">
        {/* Washi tape on top right */}
        <div className="absolute -top-2.5 -right-2 z-20">
          <WashiTape color="polka" angle="5deg" className="w-20" />
        </div>

        {/* Hanging Gingham Banner with Pink Heart */}
        <div className="mb-3">
          <HangingBanner />
        </div>

        {/* Personalized prompt when taking a friend's quiz */}
        {isParticipant && creatorName && (
          <div className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full mb-3 border border-sky-100">
            Playing {creatorName}'s {catInfo.title}
          </div>
        )}

        {/* Heading: "what's your name?" */}
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 text-center tracking-tight mb-2">
          {t.whatsYourName}
        </h2>

        {/* Icebreaker mode toggle if new_friendship */}
        {category === 'new_friendship' && !isParticipant && (
          <div className="w-full bg-teal-50/70 rounded-2xl p-2 border border-teal-100 mb-4">
            <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider text-center mb-1.5">
              Choose Quiz Mode
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setIsTwoWay(false)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  !isTwoWay
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Guess My Tastes
              </button>
              <button
                type="button"
                onClick={() => setIsTwoWay(true)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  isTwoWay
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Get to Know Each Other 🤝
              </button>
            </div>
            <p className="text-[10px] text-teal-700 text-center mt-1.5">
              {!isTwoWay
                ? "Your friend guesses your answers to score points!"
                : "Both of you answer and compare shared interests!"}
            </p>
          </div>
        )}

        {/* Privacy Note for child/school quizzes */}
        {isChildOrSchool && (
          <div className="w-full bg-emerald-50 rounded-xl p-2 px-3 mb-3 border border-emerald-100 flex items-center gap-2 text-emerald-800 text-[11px] font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Family & School Safe: First names or nicknames only.</span>
          </div>
        )}

        {/* Name Input Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={name}
              maxLength={MAX_LENGTH}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder={t.namePlaceholder}
              autoFocus
              className="w-full py-3.5 pl-5 pr-14 text-base font-semibold text-slate-800 bg-sky-50/60 rounded-full border-2 border-sky-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all placeholder:text-slate-400"
            />
            {/* Real-time Character Counter */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
              {name.length}/{MAX_LENGTH}
            </div>
          </div>

          {/* Validation Error Message */}
          {error && (
            <p className="text-xs text-rose-500 font-semibold mt-2 self-start pl-4 animate-in fade-in">
              {error}
            </p>
          )}

          {/* Big Bright-Blue Continue Button */}
          <button
            type="submit"
            disabled={!name.trim()}
            className={`w-full mt-5 py-3.5 px-6 rounded-full font-heading font-bold text-base text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-2 group cursor-pointer ${
              name.trim()
                ? 'hover:shadow-[0_10px_25px_rgba(37,99,235,0.45)] hover:scale-[1.02] active:scale-[0.98]'
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{
              background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
            }}
          >
            <span className="tracking-wide text-lg drop-shadow-xs">{t.continueBtn}</span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
              <ArrowRight className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          </button>
        </form>

        {/* Decorative stickers */}
        <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            10 questions
          </span>
          <span>Takes ~1 min</span>
        </div>
      </div>
    </div>
  );
};
