import React, { useState } from 'react';
import { Globe, ChevronDown, Check, X, Menu, PlusCircle, Trophy, Heart } from 'lucide-react';
import { LanguageCode } from '../../types';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../../data/translations';
import { BrandLogo } from '../mascots/BrandLogo';

interface HeaderControlsProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  onCreateNewQuiz: () => void;
  onOpenLeaderboard?: () => void;
  showLogo?: boolean;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  currentLang,
  onSelectLang,
  onCreateNewQuiz,
  onOpenLeaderboard,
  showLogo = true,
}) => {
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = TRANSLATIONS[currentLang];
  const activeOption = LANGUAGE_OPTIONS.find((l) => l.code === currentLang) || LANGUAGE_OPTIONS[0];

  return (
    <>
      {/* Top Header Bar matching reference video at 00:00 */}
      <header className="w-full max-w-[430px] mx-auto pt-2 px-4 flex items-start justify-between z-40 relative select-none">
        {/* Left: Illustrated Brand Logo */}
        {showLogo ? (
          <div className="flex flex-col items-start pt-1">
            <BrandLogo compact={true} onClick={onCreateNewQuiz} />
            {/* Outlined heart decoration below logo matching video */}
            <div className="mt-3 ml-1 text-sky-400 opacity-70 pointer-events-none">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* Right: Hamburger button & Language selector pill */}
        <div className="flex flex-col items-end gap-2 pt-1">
          {/* Top row: Hamburger button (compact circular pink button matching video) */}
          <div className="flex items-center gap-2">
            {/* Language Selector Pill */}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-1.5 bg-white/95 hover:bg-white active:scale-95 transition-all text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-sky-100 shadow-[0_2px_8px_rgba(56,165,255,0.15)] cursor-pointer"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span className="truncate max-w-[65px]">{activeOption.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Circular Coral/Pink Hamburger Button matching video */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-9 h-9 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] active:scale-90 transition-all shadow-[0_3px_10px_rgba(244,63,94,0.35)] flex items-center justify-center text-white cursor-pointer"
              aria-label="Open Menu"
            >
              <Menu className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Yellow Sparkle Star decoration on top right */}
          <div className="mr-1 text-amber-300 text-base animate-twinkle pointer-events-none">
            ✨
          </div>
        </div>
      </header>

      {/* Language Selection Bottom Sheet / Modal (matching video) */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border-2 border-sky-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold font-heading text-lg">
                <Globe className="w-5 h-5 text-sky-500" />
                <span>{t.selectLanguage}</span>
              </div>
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Options List */}
            <div className="overflow-y-auto space-y-1 py-1 pr-1 flex-1">
              {LANGUAGE_OPTIONS.map((lang) => {
                const isSelected = lang.code === currentLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLang(lang.code);
                      setIsLangModalOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 text-sky-600 border border-sky-200 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>
                      {lang.name} <span className="text-slate-400 font-normal">({lang.nativeName})</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-sky-500" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsLangModalOpen(false)}
              className="mt-3 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Menu Drawer (matching video) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-[280px] h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="font-heading font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span>🐾</span>
                  <span>Bestie Bonds</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Menu Items */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLangModalOpen(true);
                  }}
                  className="w-full text-left p-3 rounded-2xl bg-sky-50 text-sky-800 flex items-center gap-3 font-semibold text-sm hover:bg-sky-100 transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-sky-600" />
                  <div>
                    <div className="text-[11px] text-sky-600 uppercase font-bold tracking-wide">
                      {t.selectLanguage}
                    </div>
                    <div className="text-slate-800">{activeOption.name}</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onCreateNewQuiz();
                  }}
                  className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 flex items-center gap-3 font-semibold text-slate-700 text-sm transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-pink-500" />
                  <span>{t.createMyQuiz}</span>
                </button>

                {onOpenLeaderboard && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenLeaderboard();
                    }}
                    className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 flex items-center gap-3 font-semibold text-slate-700 text-sm transition-colors cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>{t.viewLeaderboard}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1 font-medium">
                Made with <Heart className="w-3 h-3 text-pink-400 fill-pink-400 inline" /> for best friends
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
