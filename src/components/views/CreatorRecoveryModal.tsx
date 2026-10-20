import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
  Trophy,
  Share2,
  FileEdit,
  UploadCloud,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CreatorQuizSummary, LanguageCode } from '../../types';
import {
  getMyCreatedQuizzes,
  recoverCreatorAccess,
  getCreatorRecoveryCode,
  publishCreatorQuiz,
  getCreatorToken,
} from '../../services/quizApi';

interface CreatorRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuiz: (quizId: string) => void;
  onEditDraft?: (quizId: string) => void;
  initialTab?: 'my-quizzes' | 'recover';
}

export const CreatorRecoveryModal: React.FC<CreatorRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSelectQuiz,
  onEditDraft,
  initialTab = 'my-quizzes',
}) => {
  const [tab, setTab] = useState<'my-quizzes' | 'recover'>(initialTab);
  const [quizzes, setQuizzes] = useState<CreatorQuizSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Recovery Form State
  const [recoveryQuizId, setRecoveryQuizId] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

  // Fetch creator's quizzes when opening modal
  useEffect(() => {
    if (isOpen) {
      loadCreatorQuizzes();
      setRecoveryError('');
      setRecoverySuccess('');
    }
  }, [isOpen]);

  const loadCreatorQuizzes = async () => {
    setLoading(true);
    try {
      const data = await getMyCreatedQuizzes();
      setQuizzes(data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryQuizId.trim() || !recoveryCode.trim()) {
      setRecoveryError('Please provide both your Quiz ID and Recovery Key');
      return;
    }

    setRecovering(true);
    setRecoveryError('');
    setRecoverySuccess('');

    // Extract ID if full URL pasted
    let cleanId = recoveryQuizId.trim();
    if (cleanId.includes('quiz=')) {
      const match = cleanId.match(/quiz=([a-zA-Z0-9_\-]+)/);
      if (match) cleanId = match[1];
    } else if (cleanId.includes('/')) {
      cleanId = cleanId.split('/').pop() || cleanId;
    }

    try {
      const res = await recoverCreatorAccess(cleanId, recoveryCode.trim());
      setRecoverySuccess(`Access restored for "${res.quiz.title || res.quiz.category}"! 🎉`);
      setRecoveryQuizId('');
      setRecoveryCode('');
      await loadCreatorQuizzes();
      setTimeout(() => {
        setTab('my-quizzes');
      }, 1500);
    } catch (err: any) {
      setRecoveryError(err.message || 'Recovery failed. Please check your key.');
    } finally {
      setRecovering(false);
    }
  };

  const handlePublishDraft = async (quizId: string) => {
    try {
      await publishCreatorQuiz(quizId);
      await loadCreatorQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to publish draft');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[420px] rounded-3xl p-5 shadow-2xl border-2 border-sky-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-lg">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <span>Creator Access & Recovery</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-sky-50/80 rounded-2xl my-3 border border-sky-100">
          <button
            onClick={() => setTab('my-quizzes')}
            className={`py-2 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'my-quizzes'
                ? 'bg-white text-sky-700 shadow-xs scale-[1.01]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>My Quizzes ({quizzes.length})</span>
          </button>

          <button
            onClick={() => setTab('recover')}
            className={`py-2 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'recover'
                ? 'bg-white text-rose-600 shadow-xs scale-[1.01]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>Recover Control</span>
          </button>
        </div>

        {/* Tab 1: My Quizzes */}
        {tab === 'my-quizzes' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {loading ? (
              <div className="py-12 text-center text-xs font-semibold text-slate-400">
                Checking your quizzes...
              </div>
            ) : quizzes.length === 0 ? (
              <div className="py-8 px-4 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-slate-300" />
                </div>
                <h4 className="font-heading font-bold text-slate-700 text-sm mb-1">
                  No Quizzes Found On This Browser
                </h4>
                <p className="text-xs text-slate-400 mb-4 max-w-[260px]">
                  Created a quiz on another phone or cleared your browser data? You can restore ownership using your Secret Recovery Key!
                </p>
                <button
                  onClick={() => setTab('recover')}
                  className="px-4 py-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 text-xs font-bold font-heading hover:bg-sky-100 transition-colors"
                >
                  Enter Secret Recovery Key 🔑
                </button>
              </div>
            ) : (
              quizzes.map((q) => {
                const recCode = getCreatorRecoveryCode(q.id);
                const isDraft = q.status === 'draft';
                const shareUrl = `${window.location.origin}/?quiz=${q.id}`;

                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-2xl border border-sky-100 bg-white hover:border-sky-300 transition-all shadow-xs flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isDraft
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isDraft ? 'Draft' : 'Live'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase">
                            {q.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold font-heading text-slate-800 truncate">
                          {q.title || `${q.creatorName}'s Quiz`}
                        </h4>
                        <p className="text-xs text-slate-500">
                          By <span className="font-semibold text-slate-700">{q.creatorName}</span> •{' '}
                          {q.submissionsCount} response{q.submissionsCount === 1 ? '' : 's'}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={() => {
                          onClose();
                          onSelectQuiz(q.id);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Open Quiz"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </button>
                    </div>

                    {/* Quick Controls row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      {isDraft ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePublishDraft(q.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <UploadCloud className="w-3 h-3" />
                            <span>Publish Live</span>
                          </button>
                          {onEditDraft && (
                            <button
                              onClick={() => {
                                onClose();
                                onEditDraft(q.id);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-[11px] flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <FileEdit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCopy(shareUrl, `share_${q.id}`)}
                          className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `share_${q.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied Link!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3" />
                              <span>Copy Share Link</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Recovery Code Display */}
                      {recCode && (
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-mono">Key: {recCode}</span>
                          <button
                            onClick={() => handleCopy(recCode, `key_${q.id}`)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Copy Recovery Key"
                          >
                            {copiedId === `key_${q.id}` ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Recover Control */}
        {tab === 'recover' && (
          <form onSubmit={handleRecover} className="flex-1 flex flex-col justify-between py-2 space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-sky-50/90 rounded-2xl border border-sky-200 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-sky-800 leading-relaxed">
                  Lost access to your quiz after switching devices or clearing cookies? Enter your <strong>Quiz ID</strong> and the <strong>Secret Recovery Key</strong> shown when you created it.
                </p>
              </div>

              {recoveryError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoverySuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{recoverySuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quiz Code or Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. bb_zxwljogfta"
                  value={recoveryQuizId}
                  onChange={(e) => setRecoveryQuizId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Secret Recovery Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. BB-A1B2-C3D4-E5F6"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-xs font-mono uppercase font-bold tracking-wider rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={recovering}
              className={`w-full py-3 rounded-full font-heading font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                recovering
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-600 active:scale-98'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${recovering ? 'animate-spin' : ''}`} />
              <span>{recovering ? 'Verifying Key...' : 'Restore Quiz Access 🔐'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
