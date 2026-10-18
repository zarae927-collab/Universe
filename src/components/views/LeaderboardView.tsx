import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Sparkles, RefreshCw } from 'lucide-react';
import { QuizSubmission, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { BrandLogo } from '../mascots/BrandLogo';
import { PandaMascot } from '../mascots/PandaMascot';
import { WashiTape } from '../decorations/WashiTape';
import { LoadingCard } from '../common/LoadingCard';

import { getScoreboardData } from '../../services/quizApi';

interface LeaderboardViewProps {
  currentLang: LanguageCode;
  quizId: string;
  creatorName: string;
  onBack: () => void;
  onCreateNew: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentLang,
  quizId,
  creatorName,
  onBack,
  onCreateNew,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getScoreboardData(quizId);
      const sorted = (data.entries || []).sort(
        (a: any, b: any) => (b.score || 0) - (a.score || 0)
      );
      setSubmissions(sorted);
    } catch {
      // Handled inside getScoreboardData
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [quizId]);

  return (
    <div className="w-full flex flex-col items-center pt-1 pb-12 px-4 max-w-[440px] mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-sky-600 shadow-md border border-sky-100 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>

        <button
          onClick={fetchLeaderboard}
          className="p-2 rounded-full bg-white/90 text-sky-600 shadow-xs border border-sky-100 hover:bg-white active:scale-90 transition-transform"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Brand Logo */}
      <div className="mb-2">
        <BrandLogo />
      </div>

      {/* Mascot */}
      <div className="w-full relative flex justify-end pr-2 -mb-7 z-20 pointer-events-auto">
        <PandaMascot
          size={105}
          pose="happy"
          speechText={`who knows ${creatorName} best? 🏆`}
        />
      </div>

      {/* Card */}
      <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-5 pt-7 shadow-[0_12px_32px_rgba(56,165,255,0.18)] border-2 border-white flex flex-col items-center z-10">
        <div className="absolute -top-2.5 -left-2 z-20">
          <WashiTape color="pink" angle="-6deg" className="w-20" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Hall of Besties</span>
        </div>

        <h2 className="text-xl font-bold font-heading text-slate-800 text-center mb-1">
          {creatorName}'s Leaderboard
        </h2>

        <p className="text-xs text-slate-500 text-center mb-4">
          Rankings updated in real-time as friends submit!
        </p>

        {loading ? (
          <div className="py-8">
            <LoadingCard message="fetching scores..." />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <div className="text-4xl mb-2">💌</div>
            <p className="text-sm font-semibold text-slate-600">No submissions yet!</p>
            <p className="text-xs mt-1 text-slate-400">Share your link so friends can take your quiz.</p>
          </div>
        ) : (
          <div className="w-full space-y-2 mb-4 max-h-[360px] overflow-y-auto pr-1">
            {submissions.map((sub, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              let rankBadge = `${index + 1}`;
              let rankStyle = 'bg-slate-100 text-slate-600';

              if (isFirst) {
                rankBadge = '🥇';
                rankStyle = 'bg-amber-100 text-amber-800 border-amber-300';
              } else if (isSecond) {
                rankBadge = '🥈';
                rankStyle = 'bg-slate-200 text-slate-700 border-slate-300';
              } else if (isThird) {
                rankBadge = '🥉';
                rankStyle = 'bg-amber-50 text-amber-900 border-amber-200';
              }

              return (
                <div
                  key={sub.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    isFirst
                      ? 'bg-amber-50/70 border-amber-200 shadow-xs'
                      : 'bg-slate-50/70 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${rankStyle}`}
                    >
                      {rankBadge}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-slate-800 leading-tight">
                        {sub.participantName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold font-heading text-sky-600">
                      {sub.score}/{sub.totalQuestions}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">
                      {sub.percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onCreateNew}
          className="w-full mt-2 py-3 px-6 rounded-full font-heading font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
          }}
        >
          <span>Create My Own Quiz ✨</span>
        </button>
      </div>
    </div>
  );
};
