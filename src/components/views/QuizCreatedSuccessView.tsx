import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { QuizCategory, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { BrandLogo } from '../mascots/BrandLogo';
import { PandaMascot } from '../mascots/PandaMascot';
import { BearMascot } from '../mascots/BearMascot';
import { WashiTape } from '../decorations/WashiTape';

interface QuizCreatedSuccessViewProps {
  currentLang: LanguageCode;
  quizId: string;
  creatorName: string;
  category: QuizCategory;
  onViewLeaderboard: () => void;
  onPlaySelf: () => void;
  onCreateAnother: () => void;
}

export const QuizCreatedSuccessView: React.FC<QuizCreatedSuccessViewProps> = ({
  currentLang,
  quizId,
  creatorName,
  category,
  onViewLeaderboard,
  onPlaySelf,
  onCreateAnother,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [copied, setCopied] = useState(false);

  // Generate full shareable URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/?quiz=${quizId}`;

  const shareText =
    category === 'friendship'
      ? `${creatorName} made a Friendship Quiz! 🐼✨\nHow well do you really know them? Will you get 10/10 or be exposed as a fake bestie? 😜\n👉 Take the quiz here:\n${shareUrl}`
      : `${creatorName} created a Relationship Test! 💖✨\nHow well do you two really know each other? Can you score 10/10? 🥰\n👉 Take the test here:\n${shareUrl}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers / iframe
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bestie Bonds - ${creatorName}'s Quiz`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-1 pb-12 px-4 max-w-[440px] mx-auto animate-in fade-in duration-300">
      {/* Brand Logo */}
      <div className="mb-2">
        <BrandLogo />
      </div>

      {/* Mascots Celebrating */}
      <div className="w-full flex items-end justify-between px-6 -mb-6 z-20 pointer-events-auto">
        <BearMascot size={85} pose="happy" interactive={false} />
        <PandaMascot
          size={110}
          pose="celebrate"
          speechText={t.speechQuizCreated}
        />
      </div>

      {/* Main Success Card */}
      <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-6 pt-7 shadow-[0_12px_32px_rgba(56,165,255,0.18)] border-2 border-white flex flex-col items-center z-10">
        <div className="absolute -top-2.5 -left-2 z-20">
          <WashiTape color="pink" angle="-6deg" className="w-20" />
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Quiz Saved Successfully!</span>
        </div>

        <h2 className="text-2xl font-bold font-heading text-slate-800 text-center mb-1">
          Your Quiz Is Live! 🎉
        </h2>

        <p className="text-xs text-slate-500 text-center mb-5 max-w-[280px]">
          Share your unique link with your {category === 'friendship' ? 'besties' : 'partner'} and watch their scores roll in!
        </p>

        {/* Shareable URL Box with Copy Button */}
        <div className="w-full bg-sky-50/80 rounded-2xl p-2.5 pl-4 border border-sky-200 flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-mono font-medium text-slate-600 truncate flex-1 select-all">
            {shareUrl}
          </span>
          <button
            onClick={handleCopy}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white text-sky-600 hover:bg-sky-100 border border-sky-200 shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied! 💕</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.copyLink}</span>
              </>
            )}
          </button>
        </div>

        {/* WhatsApp Share Button (prominent like in the video prompt) */}
        <button
          onClick={handleWhatsAppShare}
          className="w-full py-3 px-5 rounded-full font-heading font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 active:scale-98 shadow-[0_6px_16px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 mb-2.5 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Share on WhatsApp 💬</span>
        </button>

        {/* Native Web Share Button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-3 px-5 rounded-full font-heading font-bold text-sm text-sky-700 bg-sky-100/80 hover:bg-sky-200 active:scale-98 transition-all flex items-center justify-center gap-2 mb-2.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-sky-600" />
            <span>Share via Other Apps</span>
          </button>
        )}

        {/* Action: View Leaderboard */}
        <button
          onClick={onViewLeaderboard}
          className="w-full py-3 px-5 rounded-full font-heading font-bold text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 active:scale-98 transition-all flex items-center justify-center gap-2 mb-2 cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>{t.viewLeaderboard} (Check Scores)</span>
        </button>

        {/* Secondary options */}
        <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={onPlaySelf}
            className="font-semibold text-slate-500 hover:text-sky-600 transition-colors"
          >
            Test Quiz Myself 👀
          </button>
          <button
            onClick={onCreateAnother}
            className="font-semibold text-slate-500 hover:text-sky-600 transition-colors"
          >
            + Create Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
