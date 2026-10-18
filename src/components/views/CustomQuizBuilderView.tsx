import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  Eye,
  Edit3,
  HelpCircle,
  Save,
} from 'lucide-react';
import { QuizQuestion, QuizQuestionOption, QuestionType, QuestionFormat, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { CUSTOM_STARTER_QUESTIONS } from '../../data/questions';
import { BrandLogo } from '../mascots/BrandLogo';
import { PandaMascot } from '../mascots/PandaMascot';
import { WashiTape } from '../decorations/WashiTape';

export const GEN_Z_TEMPLATES: {
  title: string;
  badge: string;
  format: QuestionFormat;
  question: string;
  speechBubble: string;
  type: QuestionType;
  options: QuizQuestionOption[];
}[] = [
  {
    title: "Delusional Take",
    badge: "The Lore Test",
    format: "lore_test",
    question: "What's my most delusional take that I defend with my whole chest? 🦄",
    speechBubble: "delulu is the solulu ✨",
    type: "multiple_choice",
    options: [
      { id: 0, label: "I can wake up at 6 AM tomorrow and be productive", emoji: "⏰" },
      { id: 1, label: "If I don't look at my bank app, money isn't really spent", emoji: "💳" },
      { id: 2, label: "I could easily survive a zombie apocalypse or Hunger Games", emoji: "🏹" },
      { id: 3, label: "I'll just watch one more episode and sleep immediately", emoji: "📺" },
    ],
  },
  {
    title: "BRO I HAVE TEA",
    badge: "Guess My Answer",
    format: "guess_answer",
    question: "If I text you 'BRO I HAVE TEA,' what's your immediate reaction? 📱",
    speechBubble: "drop everything rn ☕",
    type: "multiple_choice",
    options: [
      { id: 0, label: "Call immediately with zero hesitation", emoji: "📞" },
      { id: 1, label: "Spam 15 question marks in 2 seconds", emoji: "❓" },
      { id: 2, label: "Grab snacks for a 45-min voice memo session", emoji: "🍿" },
      { id: 3, label: "Pray I'm not the topic of the tea", emoji: "🙏" },
    ],
  },
  {
    title: "Crash-Out Trigger",
    badge: "Pick Your Fighter",
    format: "pick_fighter",
    question: "What's my signature crash-out trigger that ruins my vibe instantly? 💥",
    speechBubble: "deep breaths only 😤",
    type: "multiple_choice",
    options: [
      { id: 0, label: "Slow walkers taking up the entire walkway", emoji: "🚶" },
      { id: 1, label: "Headphones dying right when I step outside", emoji: "🎧" },
      { id: 2, label: "Plans cancelled after I already got completely ready", emoji: "👗" },
      { id: 3, label: "Food arriving cold or the order completely wrong", emoji: "🍟" },
    ],
  },
  {
    title: "Disappeared for 6h",
    badge: "Guess My Answer",
    format: "guess_answer",
    question: "If I disappear for six hours with zero response, what actually happened? 🕵️",
    speechBubble: "where did I go? 🕒",
    type: "multiple_choice",
    options: [
      { id: 0, label: "A 'quick 20-min nap' turned into a deep sleep coma", emoji: "😴" },
      { id: 1, label: "Lost in a 4-hour video scroll rabbit hole", emoji: "📱" },
      { id: 2, label: "Phone died on 2% and the charger was across the room", emoji: "🪫" },
      { id: 3, label: "Reorganizing my entire room at 2 AM for no reason", emoji: "🧹" },
    ],
  },
  {
    title: "Late Night vs Morning",
    badge: "This or That",
    format: "this_or_that",
    question: "This or That: 2 AM unhinged deep talk VS Morning silent coffee ⚖️",
    speechBubble: "pick your vibe! ⚡",
    type: "multiple_choice",
    options: [
      { id: 0, label: "2 AM unhinged deep talk & gossip session", emoji: "🌙" },
      { id: 1, label: "Silent peaceful morning with iced coffee & no speaking", emoji: "🌅" },
    ],
  },
  {
    title: "Toxic Spending",
    badge: "Bonus Round",
    format: "bonus_round",
    question: "What would I buy right after promising to save money? 💸",
    speechBubble: "it was an investment! 🛍️",
    type: "multiple_choice",
    options: [
      { id: 0, label: "A $7 aesthetic iced beverage with oat milk", emoji: "🧋" },
      { id: 1, label: "A sweet treat because 'I survived today'", emoji: "🧁" },
      { id: 2, label: "Online shopping cart item sitting there for weeks", emoji: "🛒" },
      { id: 3, label: "Clothing identical to 4 items in my closet", emoji: "👕" },
    ],
  },
];

interface CustomQuizBuilderViewProps {
  currentLang: LanguageCode;
  onBack: () => void;
  onPublishQuiz: (quizData: {
    title: string;
    description: string;
    creatorName: string;
    questions: QuizQuestion[];
    creatorAnswers: Record<number, number | string>;
  }) => void;
}

export const CustomQuizBuilderView: React.FC<CustomQuizBuilderViewProps> = ({
  currentLang,
  onBack,
  onPublishQuiz,
}) => {
  const t = TRANSLATIONS[currentLang];

  // Quiz metadata
  const [title, setTitle] = useState("Expose The Lore: How Well Do You Know Me? 😭");
  const [description, setDescription] = useState("100% real answers only. Let's see who is in the tutorial era vs has the director's cut! 👀");
  const [creatorName, setCreatorName] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>(CUSTOM_STARTER_QUESTIONS);
  const [creatorAnswers, setCreatorAnswers] = useState<Record<number, number | string>>({
    901: 0,
    902: 1,
    903: 0,
    904: 1,
    905: 0,
  });

  // Editor states
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Add a new question from scratch
  const handleAddNewQuestion = () => {
    const newId = Date.now();
    const newQ: QuizQuestion = {
      id: newId,
      category: 'custom',
      format: 'lore_test',
      formatBadge: 'The Lore Test',
      question: "What's my signature catchphrase or toxic trait? 😭",
      type: 'multiple_choice',
      speechBubble: "expose the lore! 😭",
      options: [
        { id: 0, label: "Saying 'I am literally so tired' 20 times a day", emoji: "🥱" },
        { id: 1, label: "Buying iced drinks right after promising to save", emoji: "🧋" },
        { id: 2, label: "Overthinking a 3-word text for three business days", emoji: "🧠" },
        { id: 3, label: "Saying 'I'm 5 minutes away' when I haven't got dressed", emoji: "👟" },
      ],
    };

    setQuestions((prev) => [...prev, newQ]);
    setCreatorAnswers((prev) => ({ ...prev, [newId]: 0 }));
    setEditingQuestionId(newId);
  };

  // Add question from template
  const handleAddFromTemplate = (template: typeof GEN_Z_TEMPLATES[0]) => {
    const newId = Date.now();
    const newQ: QuizQuestion = {
      id: newId,
      category: 'custom',
      format: template.format,
      formatBadge: template.badge,
      question: template.question,
      type: template.type,
      speechBubble: template.speechBubble,
      options: template.options.map((opt) => ({ ...opt })),
    };

    setQuestions((prev) => [...prev, newQ]);
    setCreatorAnswers((prev) => ({ ...prev, [newId]: 0 }));
    setEditingQuestionId(newId);
  };

  // Delete question
  const handleDeleteQuestion = (id: number) => {
    if (questions.length <= 1) {
      alert("A quiz must have at least one question!");
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setCreatorAnswers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (editingQuestionId === id) {
      setEditingQuestionId(null);
    }
  };

  // Reorder questions
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Change question format
  const handleFormatChange = (id: number, format: QuestionFormat, badge: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        return { ...q, format, formatBadge: badge };
      })
    );
  };

  // Change question type
  const handleTypeChange = (id: number, type: QuestionType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;

        let options: QuizQuestionOption[] = q.options;
        if (type === 'true_false') {
          options = [
            { id: 0, label: "True", emoji: "✅" },
            { id: 1, label: "False", emoji: "❌" },
          ];
        } else if (type === 'multiple_choice' || type === 'preference') {
          if (options.length < 2) {
            options = [
              { id: 0, label: "Option 1", emoji: "⭐" },
              { id: 1, label: "Option 2", emoji: "💖" },
              { id: 2, label: "Option 3", emoji: "🍕" },
              { id: 3, label: "Option 4", emoji: "🎉" },
            ];
          }
        }

        return { ...q, type, options };
      })
    );

    setCreatorAnswers((prev) => ({ ...prev, [id]: 0 }));
  };

  // Update question text
  const handleQuestionTextChange = (id: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question: text } : q))
    );
  };

  // Update option label
  const handleOptionChange = (qId: number, optId: number, label: string, emoji?: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: q.options.map((opt) =>
            opt.id === optId ? { ...opt, label, ...(emoji ? { emoji } : {}) } : opt
          ),
        };
      })
    );
  };

  // Select creator's correct answer
  const handleSetCorrectAnswer = (qId: number, optId: number) => {
    setCreatorAnswers((prev) => ({
      ...prev,
      [qId]: optId,
    }));
  };

  // Validate and submit
  const handlePublish = () => {
    const errs: string[] = [];

    if (!title.trim()) errs.push("Please enter a quiz title.");
    if (!creatorName.trim()) errs.push("Please enter your display name.");
    if (questions.length === 0) errs.push("Please include at least one question.");

    // Validate each question
    questions.forEach((q, idx) => {
      if (!q.question.trim()) {
        errs.push(`Question #${idx + 1} cannot be empty.`);
      }
      if (q.type !== 'text') {
        q.options.forEach((opt, oIdx) => {
          if (!opt.label.trim()) {
            errs.push(`Question #${idx + 1}, Choice #${oIdx + 1} cannot be empty.`);
          }
        });
        if (creatorAnswers[q.id] === undefined && q.type !== 'preference') {
          errs.push(`Please mark the correct answer for Question #${idx + 1}.`);
        }
      }
    });

    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    onPublishQuiz({
      title: title.trim(),
      description: description.trim(),
      creatorName: creatorName.trim(),
      questions,
      creatorAnswers,
    });
  };

  return (
    <div className="w-full flex flex-col items-center pt-1 pb-16 px-4 max-w-[440px] mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-sky-600 shadow-md border border-sky-100 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              previewMode
                ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                : 'bg-white/80 text-sky-700 border-sky-100 hover:bg-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
          </button>
        </div>
      </div>

      {/* Brand Logo */}
      <div className="mb-2">
        <BrandLogo />
      </div>

      {/* Mascot header */}
      <div className="w-full relative flex justify-end pr-2 -mb-7 z-20 pointer-events-auto">
        <PandaMascot
          size={105}
          pose="celebrate"
          speechText="make your custom quiz! 🎨"
        />
      </div>

      {/* Main Container Card */}
      <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-5 pt-7 shadow-[0_12px_32px_rgba(56,165,255,0.18)] border-2 border-white flex flex-col items-center z-10">
        <div className="absolute -top-2.5 -left-2 z-20">
          <WashiTape color="pink" angle="-6deg" className="w-20" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Custom Quiz Creator</span>
        </div>

        <h2 className="text-2xl font-bold font-heading text-slate-800 text-center mb-1">
          {previewMode ? 'Quiz Preview' : 'Build Your Own Quiz'}
        </h2>

        <p className="text-xs text-slate-500 text-center mb-4">
          Add your own questions, set answers, and get a unique link to share!
        </p>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-1">
            <div className="font-bold">Please check before publishing:</div>
            {errors.map((err, i) => (
              <div key={i} className="flex items-start gap-1">
                <span>•</span>
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* QUIZ DETAILS FORM */}
        {!previewMode ? (
          <div className="w-full space-y-3.5 mb-5">
            {/* Creator Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Display Name *
              </label>
              <input
                type="text"
                maxLength={20}
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full py-2.5 px-4 rounded-xl border border-sky-200 bg-sky-50/50 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            {/* Quiz Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                maxLength={45}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How Well Do You Know Sara?"
                className="w-full py-2.5 px-4 rounded-xl border border-sky-200 bg-sky-50/50 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Short Description
              </label>
              <input
                type="text"
                maxLength={80}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A fun test about my favorite things..."
                className="w-full py-2.5 px-4 rounded-xl border border-sky-200 bg-sky-50/50 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            {/* QUICK GEN Z LORE TEMPLATES TRAY */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/90 to-purple-50/90 border border-pink-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-900">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Gen Z Lore Templates (Tap to Add)</span>
                </div>
                <span className="text-[10px] font-semibold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-full">
                  Instant Starters
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GEN_Z_TEMPLATES.map((tmpl, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => handleAddFromTemplate(tmpl)}
                    className="px-2.5 py-1 rounded-full bg-white text-[11px] font-bold text-pink-700 border border-pink-200 hover:border-pink-300 hover:bg-pink-50/80 shadow-2xs hover:scale-102 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span className="text-pink-500 font-extrabold">+</span>
                    <span>{tmpl.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* QUESTIONS LIST */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-bold text-sm text-slate-800">
                  Questions ({questions.length})
                </span>
                <button
                  onClick={handleAddNewQuestion}
                  className="px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Questions Cards */}
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const isEditing = editingQuestionId === q.id;
                  const correctAnswerId = creatorAnswers[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl border-2 border-sky-100 bg-sky-50/30 transition-all hover:border-sky-200"
                    >
                      {/* Top bar: Question #, Type pill, Reorder, Delete */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {q.formatBadge && (
                            <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold border border-pink-200 shadow-2xs">
                              {q.formatBadge}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-600 capitalize">
                            {q.type?.replace('_', ' ') || 'Multiple Choice'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMove(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMove(idx, 'down')}
                            disabled={idx === questions.length - 1}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setEditingQuestionId(isEditing ? null : q.id)
                            }
                            className="p-1 rounded-lg text-sky-600 hover:bg-sky-100 cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      {isEditing ? (
                        <div className="space-y-3 mb-3">
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) =>
                              handleQuestionTextChange(q.id, e.target.value)
                            }
                            placeholder="Write your question..."
                            className="w-full py-2 px-3 rounded-xl border border-sky-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          />

                          {/* Question Format & Type Selector */}
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 text-[11px]">Format:</span>
                              <select
                                value={q.format || 'lore_test'}
                                onChange={(e) => {
                                  const fmt = e.target.value as QuestionFormat;
                                  const badgeMap: Record<QuestionFormat, string> = {
                                    lore_test: 'The Lore Test',
                                    guess_answer: 'Guess My Answer',
                                    pick_fighter: 'Pick Your Fighter',
                                    this_or_that: 'This or That',
                                    finish_sentence: 'Finish the Sentence',
                                    bonus_round: 'Bonus Round',
                                    two_way: 'Two-Way Mode',
                                  };
                                  handleFormatChange(q.id, fmt, badgeMap[fmt]);
                                }}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-semibold cursor-pointer"
                              >
                                <option value="lore_test">The Lore Test</option>
                                <option value="guess_answer">Guess My Answer</option>
                                <option value="pick_fighter">Pick Your Fighter</option>
                                <option value="this_or_that">This or That</option>
                                <option value="finish_sentence">Finish the Sentence</option>
                                <option value="bonus_round">Bonus Round</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 text-[11px]">Type:</span>
                              <select
                                value={q.type || 'multiple_choice'}
                                onChange={(e) =>
                                  handleTypeChange(q.id, e.target.value as QuestionType)
                                }
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-semibold cursor-pointer"
                              >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="true_false">True / False</option>
                                <option value="preference">Preference (No Wrong Answer)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-2.5 leading-snug">
                          {q.question}
                        </h4>
                      )}

                      {/* Options / Answers with Correct Answer selector */}
                      <div className="space-y-1.5">
                        {q.options.map((opt) => {
                          const isCorrect = correctAnswerId === opt.id;

                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span>{opt.emoji || '✨'}</span>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={opt.label}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        q.id,
                                        opt.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Option label..."
                                    className="py-1 px-2 rounded-lg border border-slate-200 text-xs w-full font-medium"
                                  />
                                ) : (
                                  <span className="leading-tight">{opt.label}</span>
                                )}
                              </div>

                              {/* Mark correct answer button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetCorrectAnswer(q.id, opt.id)
                                }
                                className={`ml-2 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-500 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isCorrect ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Correct</span>
                                  </>
                                ) : (
                                  <span>Mark Correct</span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW MODE */
          <div className="w-full space-y-4 mb-6">
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-center">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Previewing: {title}
              </span>
              <p className="text-xs text-slate-600 mt-1">{description}</p>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border-2 border-slate-100 bg-white shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {q.question}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2"
                      >
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PUBLISH BUTTON */}
        <button
          onClick={handlePublish}
          className="w-full py-3.5 px-6 rounded-full font-heading font-bold text-base text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          style={{
            background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
          }}
        >
          <Save className="w-4 h-4" />
          <span className="tracking-wide text-lg drop-shadow-xs">
            Save & Publish Quiz ✨
          </span>
        </button>
      </div>
    </div>
  );
};
