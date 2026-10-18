import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { QuizCategory } from '../../types';
import { CATEGORY_LIST } from '../../data/questions';
import { WashiTape } from '../decorations/WashiTape';

interface CategoryCollectionProps {
  onSelectCategory: (category: QuizCategory) => void;
}

export const CategoryCollection: React.FC<CategoryCollectionProps> = ({
  onSelectCategory,
}) => {
  return (
    <div className="w-full flex flex-col items-center mt-8 mb-4 z-10 select-none">
      {/* Cute Section Header Banner */}
      <div className="relative w-full max-w-[340px] flex flex-col items-center select-none mb-4">
        {/* Washi Tape */}
        <div className="absolute -top-3 z-20">
          <WashiTape color="polka" angle="-2deg" className="w-20" />
        </div>

        {/* Banner container */}
        <div className="w-full py-2.5 px-6 rounded-2xl bg-sky-100/90 border-2 border-white shadow-[0_6px_20px_rgba(56,165,255,0.18)] backdrop-blur-xs flex items-center justify-between">
          <span className="text-xl">✨</span>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800 tracking-tight">
            Explore All Quizzes
          </h3>
          <span className="text-xl">🐾</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center mb-4 max-w-[300px]">
        Pick a quiz category to test your besties, partner, family, or students!
      </p>

      {/* Grid of 8 Illustrated Category Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORY_LIST.map((cat) => {
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative bg-white/95 backdrop-blur-xs rounded-2xl p-4 shadow-[0_6px_18px_rgba(56,165,255,0.1)] border-2 border-white hover:border-sky-300 hover:shadow-[0_8px_24px_rgba(56,165,255,0.2)] transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98]"
            >
              {/* Top row: Icon + Badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.badgeColor}`}
                >
                  {cat.badge}
                </span>
              </div>

              {/* Title & Description */}
              <div className="mb-3 text-left">
                <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-800 group-hover:text-sky-600 transition-colors">
                  {cat.title}
                </h4>
                <div className="text-[11px] font-semibold text-sky-600 mb-1">
                  {cat.tagline}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-sky-500 transition-colors">
                  {cat.id === 'custom' ? 'Create Custom' : '10 Questions'}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold font-heading text-sky-600 group-hover:translate-x-1 transition-transform">
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
