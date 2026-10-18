import React, { useState } from 'react';
import { Trophy, Share2, MessageCircle, RotateCcw, ChevronDown, ChevronUp, Check, X, Sparkles, PlusCircle } from 'lucide-react';
import { SubmissionResponse, LanguageCode, QuizQuestion } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { BrandLogo } from '../mascots/BrandLogo';
import { PandaMascot } from '../mascots/PandaMascot';
import { BearMascot } from '../mascots/BearMascot';
import { WashiTape } from '../decorations/WashiTape';

interface QuizResultViewProps {
  currentLang: LanguageCode;
  result: SubmissionResponse;
  questions: QuizQuestion[];
  participantName: string;
  onRetake: () => void;
  onCreateOwn: () => void;
  onViewLeaderboard: () => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  currentLang,
  result,
  questions,
  participantName,
  onRetake,
  onCreateOwn,
  onViewLeaderboard,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const { score, totalQuestions, percentage, creatorName, category, breakdown } = result;

  // Title and message based on score and category
  const getScoreDetails = () => {
    if (category === 'child_to_parents' || category === 'parents_to_child') {
      if (percentage === 100) {
        return {
          title: 'FAMILY MASTERMINDS 🏆🏡',
          desc: `Legendary family lore! You know every signature phrase, snack habit, and inside joke in the house!`,
          mascotPose: 'celebrate' as const,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      }
      if (percentage >= 80) {
        return {
          title: 'MASTER OF FAMILY LORE 👑',
          desc: `Incredible! Attuned to every kitchen routine, chore delay excuse, and household moment.`,
          mascotPose: 'celebrate' as const,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      }
      if (percentage >= 60) {
        return {
          title: 'FAMILY HALL OF FAME 🧸',
          desc: `Super warm bond! You pay close attention to daily habits and what brings smiles to each other.`,
          mascotPose: 'happy' as const,
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
        };
      }
      if (percentage >= 40) {
        return {
          title: 'WHOLESOME HOUSEHOLD BOND 🌟',
          desc: `You know the main family catchphrases and quirks! Lots of shared inside jokes.`,
          mascotPose: 'happy' as const,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      }
      if (percentage >= 20) {
        return {
          title: 'UNLOCKING FAMILY LORE 🎈',
          desc: `Every weekend is a chance for a new kitchen mission, board game rematch, and fun stories!`,
          mascotPose: 'curious' as const,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      }
      return {
        title: 'NEW FAMILY ADVENTURES LOADING 🚗',
        desc: `A great fun excuse to spend quality time together, make a comfort meal, and share laughs!`,
        mascotPose: 'curious' as const,
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      };
    }

    if (category === 'teacher_to_students' || category === 'students_to_teacher') {
      if (percentage === 100) {
        return {
          title: 'STRAIGHT CLASSROOM CINEMA 🏆📚',
          desc: `Absolute master of classroom cinema! You know every catchphrase, tradition, and routine!`,
          mascotPose: 'celebrate' as const,
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        };
      }
      if (percentage >= 80) {
        return {
          title: 'CLASSROOM LEGEND 🍎',
          desc: `Honor roll bestie! You pay supreme attention to classroom lore and daily moments.`,
          mascotPose: 'celebrate' as const,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        };
      }
      if (percentage >= 60) {
        return {
          title: 'HONOR ROLL BESTIE 🌟',
          desc: `Great score! You know the daily routines, favorite activities, and classroom inside jokes.`,
          mascotPose: 'happy' as const,
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        };
      }
      if (percentage >= 40) {
        return {
          title: 'CLASSROOM REGULAR ✏️',
          desc: `Solid knowledge! You catch onto the teacher's catchphrases and school-day habits.`,
          mascotPose: 'happy' as const,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        };
      }
      if (percentage >= 20) {
        return {
          title: 'CLASSROOM OBSERVER 💡',
          desc: `A fun school icebreaker! Plenty of cool facts and memories being made this term.`,
          mascotPose: 'curious' as const,
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
        };
      }
      return {
        title: 'FIRST DAY OF TERM VIBE 🎒',
        desc: `Ready to make classroom history! Lots of fun lessons, activities, and memories ahead.`,
        mascotPose: 'curious' as const,
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      };
    }

    if (category === 'new_friendship') {
      if (percentage === 100) {
        return {
          title: 'COSMIC TWINS UNLOCKED 👯✨',
          desc: `Our brains are running the exact same software! Immediate ride-or-die bestie status.`,
          mascotPose: 'celebrate' as const,
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        };
      }
      if (percentage >= 80) {
        return {
          title: 'INSTANT BESTIES ARC 🔥',
          desc: `How have we not known each other forever?! Major green flags and identical humor.`,
          mascotPose: 'celebrate' as const,
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        };
      }
      if (percentage >= 60) {
        return {
          title: 'FUTURE BESTIE MATERIAL 💌',
          desc: `Vibe check passed with flying colors! We need a 2 AM debrief with snacks immediately.`,
          mascotPose: 'happy' as const,
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        };
      }
      if (percentage >= 40) {
        return {
          title: 'SOLID VIBE CHECK ✨',
          desc: `Great common ground! Looking forward to sharing playlists, music, and funny memes.`,
          mascotPose: 'happy' as const,
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
        };
      }
      if (percentage >= 20) {
        return {
          title: 'MUTUAL RESPECT UNLOCKED 🤝',
          desc: `Different tastes make hangouts so fun! Lots of cool new things to introduce to each other.`,
          mascotPose: 'curious' as const,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      }
      return {
        title: 'FIRST COFFEE ARC ☕',
        desc: `The lore is just beginning! The best friendships start with an initial hello.`,
        mascotPose: 'curious' as const,
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      };
    }

    if (category === 'relationship') {
      if (percentage === 100) {
        return {
          title: 'LEGENDARY SOULMATES 💍💖',
          desc: `Pure couple goals! Caught in 4K knowing every single little detail and mood fix about each other!`,
          mascotPose: 'celebrate' as const,
          badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
        };
      }
      if (percentage >= 80) {
        return {
          title: 'TOP-TIER CHEMISTRY 🔥',
          desc: `Super attuned! You notice every tiny signal, mood shift, and favorite comfort thing about ${creatorName}.`,
          mascotPose: 'celebrate' as const,
          badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
        };
      }
      if (percentage >= 60) {
        return {
          title: 'ATTUNED POWER COUPLE 🥰',
          desc: `You know the good chapters of the rom-com and understand each other's vibe so well!`,
          mascotPose: 'happy' as const,
          badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
        };
      }
      if (percentage >= 40) {
        return {
          title: 'OFFICIAL SWEETHEARTS 💖',
          desc: `Sweet couple lore unlocked! Plenty of cute dates and new memories waiting to happen.`,
          mascotPose: 'happy' as const,
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
        };
      }
      if (percentage >= 20) {
        return {
          title: 'TALKING STAGE ENERGY ☕',
          desc: `Cute energy! Every week brings funny new discoveries and conversations with ${creatorName}.`,
          mascotPose: 'curious' as const,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      }
      return {
        title: 'CHAPTER 1 OF THE ROM-COM 📖',
        desc: `The story is just getting started! Perfect excuse to plan a cozy date night and ask questions.`,
        mascotPose: 'curious' as const,
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      };
    }

    // Default Friendship / Custom
    if (percentage === 100) {
      return {
        title: "BRO HAS THE DIRECTOR'S CUT 😭🏆",
        desc: `Unbelievable! You know every piece of lore, every crash-out trigger, and every secret about ${creatorName}!`,
        mascotPose: 'celebrate' as const,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    }
    if (percentage >= 80) {
      return {
        title: 'CERTIFIED LORE KEEPER 🏆',
        desc: `Top-tier bestie energy! You've been paying serious attention in the group chat and in real life.`,
        mascotPose: 'celebrate' as const,
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    }
    if (percentage >= 60) {
      return {
        title: "WAIT, YOU'VE BEEN PAYING ATTENTION 🫶",
        desc: `Huge green flag! You know the core lore and practically finish ${creatorName}'s sentences.`,
        mascotPose: 'happy' as const,
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      };
    }
    if (percentage >= 40) {
      return {
        title: 'Okayyy, you know a few chapters of the lore 👀',
        desc: `Not bad at all! Just need a 3-hour late-night debrief with snacks to unlock the rest.`,
        mascotPose: 'happy' as const,
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      };
    }
    if (percentage >= 20) {
      return {
        title: "You're still in the tutorial era 💀",
        desc: `A respectable start! Time for a proper iced coffee debrief to get caught up on all the tea.`,
        mascotPose: 'curious' as const,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    }
    return {
      title: 'THE LORE IS CLASSIFIED 😭',
      desc: `Zero worries—the files are still encrypted! Time for a proper catch-up hangout with snacks.`,
      mascotPose: 'curious' as const,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    };
  };

  const details = getScoreDetails();

  const handleShareResult = async () => {
    const text = `I just took ${creatorName}'s quiz on Bestie Bonds and scored ${score}/${totalQuestions} (${percentage}%)! 🐾✨ Can you beat my score?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bestie Bonds Quiz Result',
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    const text = `I just scored ${score}/${totalQuestions} (${percentage}%) on ${creatorName}'s Bestie Bonds quiz! 🐾✨ Try it here: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full flex flex-col items-center pt-1 pb-14 px-4 max-w-[440px] mx-auto animate-in fade-in duration-300">
      {/* Brand Logo */}
      <div className="mb-2">
        <BrandLogo />
      </div>

      {/* Mascot Reaction */}
      <div className="w-full flex items-end justify-between px-6 -mb-6 z-20 pointer-events-auto">
        <BearMascot size={85} pose="happy" interactive={false} />
        <PandaMascot
          size={110}
          pose={details.mascotPose}
          speechText={`${participantName} scored ${percentage}%! 🎉`}
        />
      </div>

      {/* Main Results Card */}
      <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-6 pt-7 shadow-[0_12px_32px_rgba(56,165,255,0.18)] border-2 border-white flex flex-col items-center z-10">
        <div className="absolute -top-2.5 -left-2 z-20">
          <WashiTape color="pink" angle="-6deg" className="w-20" />
        </div>

        {/* Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border mb-3 flex items-center gap-1.5 shadow-xs ${details.badgeColor}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{details.title}</span>
        </div>

        {/* Score Ring / Number */}
        <div className="my-2 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold font-heading text-sky-600 tracking-tight">
              {score}
            </span>
            <span className="text-2xl font-bold font-heading text-slate-400">
              /{totalQuestions}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {percentage}% {t.correctAnswers}
          </div>
        </div>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-600 text-center mt-2 mb-5 px-3 leading-relaxed">
          {details.desc}
        </p>

        {/* Action: Create My Own Quiz (Highest Priority CTA) */}
        <button
          onClick={onCreateOwn}
          className="w-full py-3.5 px-6 rounded-full font-heading font-bold text-base text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-2.5 cursor-pointer"
          style={{
            background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
          }}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-lg">Create My Own Quiz ✨</span>
        </button>

        {/* Secondary Buttons: WhatsApp & Leaderboard */}
        <div className="w-full grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleWhatsApp}
            className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={onViewLeaderboard}
            className="py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-200 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Share Button with copy feedback */}
        <button
          onClick={handleShareResult}
          className="w-full py-2.5 px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center gap-2 border border-sky-200 transition-colors mb-4"
        >
          <Share2 className="w-3.5 h-3.5 text-sky-600" />
          <span>{copied ? 'Result Copied! 💕' : 'Share My Score with Friends'}</span>
        </button>

        {/* Answers Breakdown Accordion */}
        <div className="w-full border-t border-slate-100 pt-3">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-1.5 hover:text-sky-600 transition-colors"
          >
            <span>{t.answersBreakdown}</span>
            {showBreakdown ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showBreakdown && (
            <div className="mt-3 space-y-2.5 max-h-[300px] overflow-y-auto pr-1 animate-in fade-in">
              {questions.map((q, idx) => {
                const item = breakdown[q.id];
                if (!item) return null;

                const creatorOpt = q.options.find((o) => o.id === item.creatorAnswer);
                const participantOpt = q.options.find((o) => o.id === item.participantAnswer);

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-2xl border text-xs ${
                      item.correct
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5 font-bold">
                      <span className="text-slate-800">
                        {idx + 1}. {q.question}
                      </span>
                      {item.correct ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-extrabold flex-shrink-0">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>+1</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-500 font-bold flex-shrink-0">
                          <X className="w-4 h-4 stroke-[3]" />
                          <span>0</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-800">{creatorName}'s choice: </span>
                        {creatorOpt?.emoji} {creatorOpt?.label}
                      </div>
                      {!item.correct && (
                        <div className="text-rose-600">
                          <span className="font-semibold">You guessed: </span>
                          {participantOpt?.emoji} {participantOpt?.label}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Retake button */}
        <div className="mt-4 pt-3 border-t border-slate-100 w-full text-center">
          <button
            onClick={onRetake}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retake this Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
