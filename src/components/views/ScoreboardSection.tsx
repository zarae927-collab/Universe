import React, { useEffect, useState, useCallback } from 'react';
import { Share2, Sparkles, Trophy, Users, RefreshCw, Copy, Check } from 'lucide-react';
import { AnimalAvatar, AnimalType } from '../common/AnimalAvatar';
import { WashiTape } from '../decorations/WashiTape';
import { PandaMascot } from '../mascots/PandaMascot';

import { getScoreboardData } from '../../services/quizApi';

export interface ScoreboardEntry {
  id: string;
  rank?: number;
  participantName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  avatarType: AnimalType | string;
  sticker?: 'bear' | 'flower' | 'heart' | 'star';
  submittedAt?: string;
}

interface ScoreboardSectionProps {
  quizId?: string;
  creatorName?: string;
  isCreatorView?: boolean;
  onShareQuiz?: () => void;
  onPlayQuiz?: () => void;
}

export const ScoreboardSection: React.FC<ScoreboardSectionProps> = ({
  quizId,
  creatorName = '',
  isCreatorView = false,
  onShareQuiz,
  onPlayQuiz,
}) => {
  const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchScores = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);

      const data = await getScoreboardData(quizId);
      setTotalCount(data.totalCount);
      setEntries(data.entries);
      setLastRefreshed(new Date());
    } catch {
      // Handled internally by getScoreboardData
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [quizId]);

  // Initial fetch and auto-refresh interval for real-time updates
  useEffect(() => {
    fetchScores();

    // Auto refresh every 7 seconds when active tab is visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'hidden') {
        fetchScores(true);
      }
    }, 7000);

    // Refresh on tab focus
    const onFocus = () => fetchScores(true);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchScores]);

  const handleShare = () => {
    if (onShareQuiz) {
      onShareQuiz();
      return;
    }
    const currentUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-7 pt-1 pb-14 z-10 select-none">
      {/* Yellow/Cream Scoreboard Header Banner (matching reference screenshot) */}
      <div className="relative w-full max-w-[340px] flex flex-col items-center select-none">
        {/* Pink Polka Dot Washi Tape on top center */}
        <div className="absolute -top-3 z-20">
          <WashiTape color="polka" angle="1deg" className="w-20" />
        </div>

        {/* Banner container */}
        <div className="w-full py-3 px-6 rounded-2xl bg-amber-100/90 border-2 border-white shadow-[0_6px_20px_rgba(251,191,36,0.22)] backdrop-blur-xs flex items-center justify-between">
          <span className="text-2xl filter drop-shadow-xs">🏆</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 tracking-tight">
            Scoreboard
          </h3>
          <span className="text-2xl filter drop-shadow-xs">🏆</span>
        </div>
      </div>

      {/* Pill Badge: "X friends played" directly below banner */}
      <div className="mt-3.5 mb-3 flex items-center gap-2">
        <div className="px-4 py-1.5 rounded-full bg-white/95 border border-sky-100 shadow-[0_2px_8px_rgba(56,165,255,0.15)] text-xs font-bold text-slate-600 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-sky-500" />
          <span>
            {totalCount === 1 ? '1 friend played' : `${totalCount} friends played`}
          </span>
        </div>

        <button
          onClick={() => fetchScores(false)}
          className="p-1.5 rounded-full bg-white/90 text-slate-400 hover:text-sky-600 hover:bg-white transition-all shadow-xs"
          title="Refresh Scores"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-500' : ''}`} />
        </button>
      </div>

      {/* Tie-breaker footnote */}
      {entries.length > 1 && (
        <p className="text-[10px] text-slate-400 font-medium mb-3 text-center">
          Sorted by highest score • Earlier finish time breaks ties
        </p>
      )}

      {/* EMPTY STATE: Shown when no attempts have been made yet (Strictly NO fake entries!) */}
      {entries.length === 0 && !loading ? (
        <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-6 shadow-[0_8px_24px_rgba(56,165,255,0.12)] border-2 border-white flex flex-col items-center text-center animate-in fade-in">
          <div className="mb-2">
            <PandaMascot size={86} pose="curious" interactive={false} />
          </div>

          <h4 className="font-heading font-extrabold text-base text-slate-800 mb-1">
            {isCreatorView || quizId
              ? "Your friends haven't played yet!"
              : "No quiz scores recorded yet!"}
          </h4>

          <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed mb-4">
            {quizId
              ? "Be the very first one to test your knowledge and claim rank #1 on this scoreboard! 💌"
              : "Create a quiz or share your link with besties to start ranking! 💌"}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-[260px]">
            {onPlayQuiz && (
              <button
                onClick={onPlayQuiz}
                className="w-full py-2.5 px-4 rounded-full font-heading font-bold text-xs text-white bg-sky-500 hover:bg-sky-600 active:scale-95 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Be First to Play!</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="w-full py-2.5 px-4 rounded-full font-heading font-bold text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied Link! 💕</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Quiz 💌</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* REAL DYNAMIC LEADERBOARD CARDS LIST */
        <div className="w-full space-y-3 animate-in fade-in">
          {entries.map((entry, index) => {
            const rank = entry.rank || index + 1;
            const percentage =
              entry.percentage !== undefined
                ? entry.percentage
                : Math.round((entry.score / entry.totalQuestions) * 100);

            return (
              <div
                key={entry.id ? `${entry.id}-${index}` : `entry-${index}`}
                className="relative w-full bg-white/95 backdrop-blur-xs rounded-2xl p-3.5 px-4 shadow-[0_8px_20px_rgba(56,165,255,0.12)] border-2 border-white flex items-center justify-between transition-all hover:scale-[1.01]"
              >
                {/* Corner Decorative Sticker */}
                <div className="absolute -top-2 -right-1 text-base select-none pointer-events-none filter drop-shadow-xs">
                  {entry.sticker === 'flower' && '🌸'}
                  {entry.sticker === 'heart' && '💖'}
                  {entry.sticker === 'star' && '⭐'}
                  {(!entry.sticker || entry.sticker === 'bear') && '🐻'}
                </div>

                {/* Left: Rank Badge + Avatar */}
                <div className="flex items-center gap-3">
                  {/* Gold Star Rank Badge */}
                  <div className="relative w-7 h-7 flex items-center justify-center flex-shrink-0 select-none">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-7 h-7 fill-amber-400 stroke-amber-500 stroke-[1.5]"
                    >
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-amber-950">
                      {rank}
                    </span>
                  </div>

                  {/* Animal Avatar */}
                  <AnimalAvatar type={entry.avatarType || 'bunny'} size={48} />

                  {/* Name & Progress Bar */}
                  <div className="flex flex-col justify-center min-w-[130px] sm:min-w-[170px]">
                    <div className="flex items-baseline justify-between mb-1.5 pr-2">
                      <span className="font-heading font-bold text-base text-slate-800 tracking-tight truncate max-w-[140px]">
                        {entry.participantName}
                      </span>
                    </div>

                    {/* Pink Progress Bar matching reference screenshot */}
                    <div className="w-full bg-pink-100/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-pink-200/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percentage, 6)}%`,
                          background: 'linear-gradient(90deg, #f43f5e 0%, #ec4899 100%)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Score (e.g. "9/10" in pink/coral font) */}
                <div className="pl-2 flex-shrink-0 text-right">
                  <span className="text-lg sm:text-xl font-heading font-extrabold text-[#f43f5e]">
                    {entry.score}
                    <span className="text-slate-400 font-bold text-xs">
                      /{entry.totalQuestions}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
