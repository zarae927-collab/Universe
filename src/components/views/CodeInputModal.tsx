import React, { useState } from 'react';
import { X, ArrowRight, KeyRound } from 'lucide-react';
import { HangingBanner } from '../decorations/HangingBanner';
import { WashiTape } from '../decorations/WashiTape';

interface CodeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCode: (code: string) => void;
}

export const CodeInputModal: React.FC<CodeInputModalProps> = ({
  isOpen,
  onClose,
  onSubmitCode,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim();
    if (!clean) {
      setError('Please enter a quiz code or link');
      return;
    }

    // Extract ID if full URL pasted
    let quizId = clean;
    if (clean.includes('quiz=')) {
      const match = clean.match(/quiz=([^&]+)/);
      if (match) quizId = match[1];
    } else if (clean.includes('/')) {
      const parts = clean.split('/');
      quizId = parts[parts.length - 1];
    }

    onSubmitCode(quizId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-white flex flex-col items-center">
        {/* Pink Washi Tape */}
        <div className="absolute -top-2.5 -left-2 z-10">
          <WashiTape color="pink" angle="-6deg" className="w-18" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hanging Banner */}
        <div className="mt-1 mb-2">
          <HangingBanner />
        </div>

        <h3 className="font-heading font-bold text-xl text-slate-800 text-center mb-1">
          Enter Friend's Quiz Code
        </h3>

        <p className="text-xs text-slate-500 text-center mb-4">
          Paste the quiz code (e.g. bb_abc123) or the full shared link!
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="relative w-full">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              placeholder="Paste link or code..."
              className="w-full py-3 pl-4 pr-10 text-sm font-semibold text-slate-800 bg-sky-50/60 rounded-2xl border-2 border-sky-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>

          {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-full font-heading font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
            }}
          >
            <span>Open Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
