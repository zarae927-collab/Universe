import React from 'react';
import { ArrowRight, Users, Heart } from 'lucide-react';
import { QuizCategory, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { PandaMascot } from '../mascots/PandaMascot';
import { WashiTape } from '../decorations/WashiTape';
import { BlockSticker } from '../decorations/BlockSticker';
import { DaisySticker } from '../decorations/DaisySticker';
import { ScoreboardSection } from './ScoreboardSection';
import { CategoryCollection } from './CategoryCollection';

interface HomeWelcomeViewProps {
  currentLang: LanguageCode;
  selectedCategory: QuizCategory;
  onSelectCategory: (category: QuizCategory) => void;
  onStartQuiz: () => void;
  onOpenCodeInput: () => void;
}

export const HomeWelcomeView: React.FC<HomeWelcomeViewProps> = ({
  currentLang,
  selectedCategory,
  onSelectCategory,
  onStartQuiz,
  onOpenCodeInput,
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <div className="w-full flex flex-col items-center pt-2 pb-12 px-4 max-w-[420px] mx-auto animate-in fade-in duration-300">
      {/* Top Character + Thought Bubble Section (Strict match to video at 00:00 - 00:01) */}
      <div className="w-full flex items-end justify-between px-1 -mb-4 z-20 pointer-events-auto">
        {/* Left: Cloud-Shaped White Thought Bubble */}
        <div className="relative mb-2 select-none animate-float-gentle max-w-[195px] sm:max-w-[210px]">
          {/* Cloud Bubble Container */}
          <div className="relative bg-white/95 backdrop-blur-xs rounded-[32px] px-4 py-3 sm:py-3.5 shadow-[0_8px_24px_rgba(56,165,255,0.18)] border-2 border-sky-100 flex flex-col items-center justify-center text-center">
            {/* Contrasting Multiline Text matching reference video */}
            <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-800 leading-tight">
              i will
            </span>
            <span className="font-heading font-extrabold text-sm sm:text-base text-[#f43f5e] leading-tight drop-shadow-xs">
              {selectedCategory === 'friendship' ? 'find & block' : 'test & find'}
            </span>
            <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-800 leading-tight">
              {selectedCategory === 'friendship' ? 'my fake' : 'my true'}
            </span>
            <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-800 leading-tight">
              {selectedCategory === 'friendship' ? 'friends 🚫' : 'soulmate 💖'}
            </span>
          </div>

          {/* Connection Trail Bubbles pointing to the character */}
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white border border-sky-100 rounded-full shadow-xs" />
          <div className="absolute -bottom-3.5 right-3 w-2.5 h-2.5 bg-white border border-sky-100 rounded-full shadow-xs" />
        </div>

        {/* Right: Round-Headed Chibi Panda Mascot resting paws on the paper card edge */}
        <div className="relative flex-shrink-0 -mr-2 mb-1">
          <PandaMascot
            size={124}
            pose="peek"
            showMotionAccents={true}
            interactive={true}
          />
        </div>
      </div>

      {/* Main Paper Quiz Card (Slightly rotated cream paper card matching video at 00:00 - 00:01) */}
      <div
        className="relative w-full bg-[#fffefc] rounded-3xl p-5 pt-7 pb-6 shadow-[0_12px_32px_rgba(56,165,255,0.16)] border-2 border-white flex flex-col items-center z-10 transition-transform select-none"
        style={{
          transform: 'rotate(-1.4deg)',
        }}
      >
        {/* Pink Polka Dot Washi Tape Strip near top edge */}
        <div className="absolute -top-3 left-6 z-20">
          <WashiTape color="polka" angle="-4deg" className="w-22" />
        </div>

        {/* Corner Stickers */}
        {/* Bottom Left: Light-Blue Daisy Flower matching reference */}
        <div className="absolute -bottom-3 -left-3 z-20">
          <DaisySticker size={36} />
        </div>

        {/* Bottom Right: Pastel Sparkle Star */}
        <div className="absolute -bottom-2 right-4 text-amber-400 text-lg select-none pointer-events-none">
          ⭐
        </div>

        {/* Category Switcher Tabs: Friendship vs Relationship */}
        <div className="w-full grid grid-cols-2 gap-1.5 p-1 bg-sky-50 rounded-2xl mb-4 border border-sky-100">
          <button
            onClick={() => onSelectCategory('friendship')}
            className={`py-1.5 px-2.5 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedCategory === 'friendship'
                ? 'bg-white text-sky-600 shadow-xs scale-[1.01]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-500" />
            <span>{t.friendshipTitle}</span>
          </button>

          <button
            onClick={() => onSelectCategory('relationship')}
            className={`py-1.5 px-2.5 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedCategory === 'relationship'
                ? 'bg-white text-pink-500 shadow-xs scale-[1.01]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>{t.relationshipTitle}</span>
          </button>
        </div>

        {/* Headline & Sticker Row */}
        <div className="w-full flex items-center justify-between gap-2 mt-1 mb-3">
          <div className="text-left flex-1">
            {/* Bold Headline with contrasting blue and pink lettering matching reference */}
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800 leading-snug tracking-tight">
              <span className="text-[#0284c7]">will your besties </span>
              <span className="text-[#f43f5e] underline decoration-pink-300 decoration-wavy decoration-2">
                {selectedCategory === 'friendship' ? 'block you?' : 'know your heart?'}
              </span>
            </h2>
          </div>

          {/* Right: Phone & Prohibition / Crown Sticker matching reference */}
          <div className="flex-shrink-0">
            <BlockSticker size={52} type={selectedCategory === 'friendship' ? 'block' : 'crown'} />
          </div>
        </div>

        {/* Dotted Divider Line with circle bullet matching reference recording */}
        <div className="w-full flex items-center gap-2 my-1 px-1 opacity-70">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-sky-400 bg-white flex-shrink-0" />
          <div className="flex-1 border-b-2 border-dashed border-sky-300/80" />
        </div>

        {/* Short Explanatory Sentence */}
        <div className="w-full text-left mt-2 px-1">
          <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
            {selectedCategory === 'friendship'
              ? "let's see how well your best friends really know you"
              : "let's see how well you two really know each other"}
          </p>
        </div>
      </div>

      {/* Primary Start Quiz Button (Directly beneath the card matching reference video) */}
      <div className="w-full mt-4 select-none">
        <button
          onClick={onStartQuiz}
          className="w-full py-3.5 px-6 rounded-full font-heading font-extrabold text-lg text-white shadow-[0_8px_24px_rgba(2,132,199,0.38)] hover:shadow-[0_10px_28px_rgba(2,132,199,0.48)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
          style={{
            background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
          }}
        >
          <span className="tracking-wide drop-shadow-xs">{t.startQuiz}</span>
          <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center transition-transform group-hover:translate-x-1">
            <ArrowRight className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </button>
      </div>

      {/* Enter Code Option */}
      <div className="mt-3 text-center">
        <button
          onClick={onOpenCodeInput}
          className="text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors underline decoration-dotted cursor-pointer"
        >
          Have a friend's quiz code? Enter it here 🔑
        </button>
      </div>

      {/* Explore All 8 Categories Collection */}
      <CategoryCollection
        onSelectCategory={(cat) => {
          onSelectCategory(cat);
          onStartQuiz();
        }}
      />

      {/* Scoreboard Section (Directly beneath Start Quiz button in the same vertical scroll flow) */}
      <ScoreboardSection />
    </div>
  );
};
