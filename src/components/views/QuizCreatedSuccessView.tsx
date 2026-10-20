import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Trophy, Sparkles, ArrowRight, Key, ShieldCheck } from 'lucide-react';
import { QuizCategory, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { BrandLogo } from '../mascots/BrandLogo';
import { PandaMascot } from '../mascots/PandaMascot';
import { BearMascot } from '../mascots/BearMascot';
import { WashiTape } from '../decorations/WashiTape';
import { getCreatorRecoveryCode } from '../../services/quizApi';

interface QuizCreatedSuccessViewProps {
  currentLang: LanguageCode;
  quizId: string;
  creatorName: string;
  category: QuizCategory;
  recoveryCode?: string;
  isDraft?: boolean;
  onEditDraft?: () => void;
  onViewLeaderboard: () => void;
  onPlaySelf: () => void;
  onCreateAnother: () => void;
}

export const QuizCreatedSuccessView: React.FC<QuizCreatedSuccessViewProps> = ({
  currentLang,
  quizId,
  creatorName,
  category,
  recoveryCode: initialRecoveryCode,
  isDraft = false,
  onEditDraft,
  onViewLeaderboard,
  onPlaySelf,
  onCreateAnother,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [copied, setCopied] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const recoveryCode = initialRecoveryCode || getCreatorRecoveryCode(quizId);

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

  const handleCopyRecovery = async () => {
    if (!recoveryCode) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(recoveryCode);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = recoveryCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedRecovery(true);
      setTimeout(() => setCopiedRecovery(false), 2500);
    } catch (err) {
      console.error('Failed to copy recovery code', err);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    try {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    } catch {
      handleCopy();
    }
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
          speechText={isDraft ? "draft saved! take your time ✨" : t.speechQuizCreated}
        />
      </div>

      {/* Main Success Card */}
      <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-6 pt-7 shadow-[0_12px_32px_rgba(56,165,255,0.18)] border-2 border-white flex flex-col items-center z-10">
        <div className="absolute -top-2.5 -left-2 z-20">
          <WashiTape color="pink" angle="-6deg" className="w-20" />
        </div>

        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${
          isDraft ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        }`}>
          {isDraft ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Draft Saved Privately! 💾</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Quiz Saved & Live! 🎉</span>
            </>
          )}
        </div>

        <h2 className="text-2xl font-bold font-heading text-slate-800 text-center mb-1">
          {isDraft ? 'Your Draft Is Ready! 📝' : 'Your Quiz Is Live! 🎉'}
        </h2>

        <p className="text-xs text-slate-500 text-center mb-4 max-w-[280px]">
          {isDraft
            ? 'Only you can view or edit this draft until you choose to publish it.'
            : `Share your unique link with your ${category === 'friendship' ? 'besties' : 'partner'} and watch their scores roll in!`}
        </p>

        {/* Creator Secret Recovery Code Box (Account-Free Ownership & Recovery) */}
        {recoveryCode && (
          <div className="w-full bg-amber-50/80 rounded-2xl p-3 border border-amber-200/80 mb-4 flex flex-col gap-1.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                <span>🔐</span> Secret Recovery Key
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full font-bold">
                Private To You
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-amber-200 shadow-2xs">
              <span className="font-mono text-xs font-bold text-slate-700 tracking-wider select-all">
                {recoveryCode}
              </span>
              <button
                onClick={handleCopyRecovery}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  copiedRecovery ? 'bg-emerald-500 text-white shadow-2xs' : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                }`}
              >
                {copiedRecovery ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRecovery ? 'Copied Key!' : 'Copy Key'}</span>
              </button>
            </div>
            <p className="text-[10px] text-amber-800 leading-tight">
              Save this key! If you clear your browser data or switch devices, enter this key to restore editing access.
            </p>
          </div>
        )}

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

        {/* If Draft: Prominent Continue Editing Draft Button */}
        {isDraft && onEditDraft && (
          <button
            onClick={onEditDraft}
            className="w-full py-3 px-5 rounded-full font-heading font-bold text-sm text-white bg-sky-500 hover:bg-sky-600 active:scale-98 shadow-[0_6px_16px_rgba(2,132,199,0.3)] transition-all flex items-center justify-center gap-2 mb-2.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Continue Editing Questions ✏️</span>
          </button>
        )}

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
