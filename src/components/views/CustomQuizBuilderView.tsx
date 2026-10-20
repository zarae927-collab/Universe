import React, { useState, useEffect } from 'react';
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
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  HelpCircle,
  X,
  ExternalLink,
  Copy,
} from 'lucide-react';
import {
  QuizQuestion,
  QuizQuestionOption,
  QuestionType,
  QuestionFormat,
  QuizCategory,
  LanguageCode,
} from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { CUSTOM_STARTER_QUESTIONS, getQuestionsByCategory, CATEGORY_LIST } from '../../data/questions';
import { BrandLogo } from '../mascots/BrandLogo';
import { PandaMascot, PandaPose } from '../mascots/PandaMascot';
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
  initialQuizId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialCreatorName?: string;
  initialCategory?: QuizCategory;
  initialQuestions?: QuizQuestion[];
  initialCreatorAnswers?: Record<string | number, any>;
  initialRecoveryCode?: string;
  onBack: () => void;
  onPublishQuiz: (quizData: {
    quizId?: string;
    title: string;
    description: string;
    creatorName: string;
    category: QuizCategory;
    questions: QuizQuestion[];
    creatorAnswers: Record<number, number | string>;
  }) => Promise<void>;
  onSaveDraft?: (quizData: {
    quizId?: string;
    title: string;
    description: string;
    creatorName: string;
    category: QuizCategory;
    questions: QuizQuestion[];
    creatorAnswers: Record<number, number | string>;
  }) => Promise<{ quizId: string; recoveryCode?: string } | void>;
}

export const CustomQuizBuilderView: React.FC<CustomQuizBuilderViewProps> = ({
  currentLang,
  initialQuizId,
  initialTitle,
  initialDescription,
  initialCreatorName,
  initialCategory = 'custom',
  initialQuestions,
  initialCreatorAnswers,
  initialRecoveryCode,
  onBack,
  onPublishQuiz,
  onSaveDraft,
}) => {
  const t = TRANSLATIONS[currentLang];

  // Active Draft ID (preserves the same quiz across multiple saves)
  const [activeQuizId, setActiveQuizId] = useState<string | undefined>(initialQuizId);
  const [activeRecoveryCode, setActiveRecoveryCode] = useState<string | undefined>(initialRecoveryCode);

  // Quiz metadata
  const [category, setCategory] = useState<QuizCategory>(initialCategory);
  const [title, setTitle] = useState(initialTitle || "Expose The Lore: How Well Do You Know Me? 😭");
  const [description, setDescription] = useState(
    initialDescription || "100% real answers only. Let's see who is in the tutorial era vs has the director's cut! 👀"
  );
  const [creatorName, setCreatorName] = useState(initialCreatorName || "");

  // Questions and Answer Key
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return initialQuestions.map((q) => ({
        ...q,
        options: q.options.map((opt) => ({ ...opt })),
      }));
    }
    return CUSTOM_STARTER_QUESTIONS.map((q) => ({
      ...q,
      options: q.options.map((opt) => ({ ...opt })),
    }));
  });

  const [creatorAnswers, setCreatorAnswers] = useState<Record<number, number | string>>(() => {
    if (initialCreatorAnswers && Object.keys(initialCreatorAnswers).length > 0) {
      const parsed: Record<number, number | string> = {};
      for (const [k, v] of Object.entries(initialCreatorAnswers)) {
        parsed[Number(k)] = v;
      }
      return parsed;
    }
    return { 901: 0, 902: 1, 903: 0, 904: 1, 905: 0 };
  });

  // Editor interaction states
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewCurrentIndex, setPreviewCurrentIndex] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<number, any>>({});
  const [previewMascotPose, setPreviewMascotPose] = useState<PandaPose>('curious');

  // Confirmation dialogs
  const [questionToDelete, setQuestionToDelete] = useState<{ id: number; question: string } | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Save states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  // Update state when initial props change
  useEffect(() => {
    if (initialQuizId) setActiveQuizId(initialQuizId);
    if (initialTitle) setTitle(initialTitle);
    if (initialDescription) setDescription(initialDescription);
    if (initialCreatorName) setCreatorName(initialCreatorName);
    if (initialCategory) setCategory(initialCategory);
    if (initialRecoveryCode) setActiveRecoveryCode(initialRecoveryCode);
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions.map((q) => ({ ...q, options: q.options.map((opt) => ({ ...opt })) })));
    }
    if (initialCreatorAnswers && Object.keys(initialCreatorAnswers).length > 0) {
      const parsed: Record<number, number | string> = {};
      for (const [k, v] of Object.entries(initialCreatorAnswers)) {
        parsed[Number(k)] = v;
      }
      setCreatorAnswers(parsed);
    }
  }, [initialQuizId, initialTitle, initialDescription, initialCreatorName, initialCategory, initialQuestions, initialCreatorAnswers, initialRecoveryCode]);

  // Validation function
  const validateForm = (): boolean => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("Please enter a quiz title.");
    if (!creatorName.trim()) errs.push("Please enter your display name.");
    if (questions.length === 0) errs.push("Please include at least one question.");

    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      if (!q.question.trim()) {
        errs.push(`Question #${qNum} text cannot be empty.`);
      }
      if (q.type !== 'text') {
        if (!q.options || q.options.length < 2) {
          errs.push(`Question #${qNum} must have at least 2 answer choices.`);
        } else {
          q.options.forEach((opt, oIdx) => {
            if (!opt.label.trim()) {
              errs.push(`Question #${qNum}, Choice #${oIdx + 1} cannot be empty.`);
            }
          });
        }
        if (q.type !== 'preference' && creatorAnswers[q.id] === undefined) {
          errs.push(`Please select the correct answer for Question #${qNum}.`);
        }
      }
    });

    setErrors(errs);
    return errs.length === 0;
  };

  // Add a new question from scratch
  const handleAddNewQuestion = () => {
    const newId = Date.now();
    const newQ: QuizQuestion = {
      id: newId,
      category,
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

  // Add question from starter Gen Z templates
  const handleAddFromTemplate = (template: typeof GEN_Z_TEMPLATES[0]) => {
    const newId = Date.now();
    const newQ: QuizQuestion = {
      id: newId,
      category,
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

  // Safe Template Import (Copy Protection: Clones cleanly with zero modification to original)
  const handleImportCategoryTemplate = (cat: QuizCategory) => {
    const templateQuestions = getQuestionsByCategory(cat).slice(0, 10);
    const baseTimestamp = Date.now();

    // Deep clone each question with clean unique IDs
    const clonedQuestions: QuizQuestion[] = templateQuestions.map((tq, i) => {
      const clonedId = baseTimestamp + i + 1;
      return {
        ...tq,
        id: clonedId,
        category: cat,
        options: tq.options.map((opt) => ({ ...opt })),
      };
    });

    const newAnswers: Record<number, number | string> = {};
    clonedQuestions.forEach((q) => {
      newAnswers[q.id] = 0; // Default to first option
    });

    setCategory(cat);
    setQuestions(clonedQuestions);
    setCreatorAnswers(newAnswers);
    setIsTemplateModalOpen(false);
    setEditingQuestionId(null);
  };

  // Request Question Deletion (with safety check)
  const handleRequestDelete = (q: QuizQuestion) => {
    if (questions.length <= 1) {
      alert("A quiz must have at least one question!");
      return;
    }
    setQuestionToDelete({ id: q.id, question: q.question });
  };

  const confirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    const id = questionToDelete.id;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setCreatorAnswers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (editingQuestionId === id) {
      setEditingQuestionId(null);
    }
    setQuestionToDelete(null);
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

  // Duplicate question (clones question, options and answer key)
  const handleDuplicateQuestion = (q: QuizQuestion, index: number) => {
    const newId = Date.now() + Math.floor(Math.random() * 100);
    const duplicated: QuizQuestion = {
      ...q,
      id: newId,
      question: `${q.question} (Copy)`,
      options: q.options.map((opt) => ({ ...opt })),
    };

    setQuestions((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicated);
      return copy;
    });

    if (creatorAnswers[q.id] !== undefined) {
      setCreatorAnswers((prev) => ({
        ...prev,
        [newId]: creatorAnswers[q.id],
      }));
    }

    setEditingQuestionId(newId);
  };

  // Option operations: Add option (max 6)
  const handleAddOption = (qId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        if (q.options.length >= 6) return q;

        const nextOptId = q.options.length > 0 ? Math.max(...q.options.map((o) => o.id)) + 1 : 0;
        const emojis = ['✨', '💖', '⭐', '🔥', '🎉', '🍀'];
        const emoji = emojis[q.options.length % emojis.length];

        const newOption: QuizQuestionOption = {
          id: nextOptId,
          label: `New Choice ${q.options.length + 1}`,
          emoji,
        };

        return {
          ...q,
          options: [...q.options, newOption],
        };
      })
    );
  };

  // Option operations: Remove option (min 2)
  const handleRemoveOption = (qId: number, optId: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        if (q.options.length <= 2) {
          alert('Every question must have at least 2 answer choices.');
          return q;
        }

        const remainingOptions = q.options.filter((o) => o.id !== optId);

        // If the removed option was the selected correct answer, reset to first available
        if (creatorAnswers[qId] === optId && remainingOptions.length > 0) {
          setCreatorAnswers((cPrev) => ({
            ...cPrev,
            [qId]: remainingOptions[0].id,
          }));
        }

        return {
          ...q,
          options: remainingOptions,
        };
      })
    );
  };

  // Change question format
  const handleFormatChange = (id: number, format: QuestionFormat, badge: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, format, formatBadge: badge } : q))
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
        } else if ((type === 'multiple_choice' || type === 'preference') && options.length < 2) {
          options = [
            { id: 0, label: "Option 1", emoji: "⭐" },
            { id: 1, label: "Option 2", emoji: "💖" },
            { id: 2, label: "Option 3", emoji: "🍕" },
            { id: 3, label: "Option 4", emoji: "🎉" },
          ];
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
            opt.id === optId ? { ...opt, label, ...(emoji !== undefined ? { emoji } : {}) } : opt
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

  // Save as private draft (preserves draft ID and authorized creator access)
  const handleSaveDraft = async () => {
    if (!creatorName.trim()) {
      setErrors(['Please enter your display name before saving a draft.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaveStatus('saving');
    setSaveMessage('Saving draft...');

    try {
      if (onSaveDraft) {
        const result = await onSaveDraft({
          quizId: activeQuizId,
          title: title.trim() || 'Untitled Bestie Quiz',
          description: description.trim(),
          creatorName: creatorName.trim(),
          category,
          questions,
          creatorAnswers,
        });

        if (result && result.quizId) {
          setActiveQuizId(result.quizId);
          if (result.recoveryCode) {
            setActiveRecoveryCode(result.recoveryCode);
          }
        }
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSaveStatus('saved');
      setSaveMessage(`Draft saved at ${timeStr}`);
      setErrors([]);
      setTimeout(() => setSaveStatus('idle'), 3500);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveMessage(err.message || 'Failed to save draft. Your work is preserved locally.');
    }
  };

  // Validate and publish
  const handlePublish = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    setSaveStatus('saving');
    setSaveMessage('Publishing quiz...');

    try {
      await onPublishQuiz({
        quizId: activeQuizId,
        title: title.trim(),
        description: description.trim(),
        creatorName: creatorName.trim(),
        category,
        questions,
        creatorAnswers,
      });
    } catch (err: any) {
      setSaveStatus('error');
      setSaveMessage(err.message || 'Failed to publish quiz. Please try again.');
    }
  };

  // Toggle into Participant Preview Mode
  const handleTogglePreview = () => {
    if (!previewMode) {
      setPreviewCurrentIndex(0);
      setPreviewAnswers({});
      setPreviewMode(true);
    } else {
      setPreviewMode(false);
    }
  };

  // Preview interactive option click
  const handlePreviewAnswerSelect = (qId: number, optId: number) => {
    setPreviewAnswers((prev) => ({
      ...prev,
      [qId]: optId,
    }));
    setPreviewMascotPose('happy');
    setTimeout(() => setPreviewMascotPose('curious'), 1200);
  };

  return (
    <div className="w-full flex flex-col items-center pt-1 pb-16 px-4 max-w-[480px] mx-auto animate-in fade-in duration-300">
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
          {/* Template Copy Selector Button */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
            title="Import Ready-Made Template"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>Templates</span>
          </button>

          {/* Interactive Preview Mode Toggle */}
          <button
            onClick={handleTogglePreview}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              previewMode
                ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                : 'bg-white/90 text-sky-700 border-sky-100 hover:bg-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
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
          pose={previewMode ? previewMascotPose : 'celebrate'}
          speechText={
            previewMode
              ? 'testing your quiz flow! ✨'
              : activeQuizId
              ? 'editing your draft 📝'
              : 'create your quiz! 🎨'
          }
        />
      </div>

      {/* Main Container Card */}
      <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-5 pt-7 shadow-[0_12px_32px_rgba(56,165,255,0.18)] border-2 border-white flex flex-col items-center z-10">
        <div className="absolute -top-2.5 -left-2 z-20">
          <WashiTape color="pink" angle="-6deg" className="w-20" />
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>{previewMode ? 'Participant Preview' : 'Quiz Creator & Editor'}</span>
          </span>
          {activeQuizId && (
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              ID: {activeQuizId}
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold font-heading text-slate-800 text-center mb-1">
          {previewMode ? 'Interactive Preview' : 'Customize Your Quiz'}
        </h2>

        <p className="text-xs text-slate-500 text-center mb-3">
          {previewMode
            ? 'Test taking your quiz just like your friends will experience it. No real records are created.'
            : 'Add questions, edit answer choices, mark correct answers, and save your private draft!'}
        </p>

        {/* Visible Draft Save Status Notification */}
        {saveMessage && (
          <div
            className={`w-full mb-3 p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between ${
              saveStatus === 'saved'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : saveStatus === 'saving'
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {saveStatus === 'saved' && <Check className="w-4 h-4 text-emerald-600" />}
              {saveStatus === 'saving' && <RotateCcw className="w-4 h-4 text-sky-600 animate-spin" />}
              {saveStatus === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
              <span>{saveMessage}</span>
            </div>
            {saveStatus === 'error' && (
              <button
                onClick={handleSaveDraft}
                className="px-2 py-0.5 rounded bg-rose-200 hover:bg-rose-300 text-rose-900 text-[11px] font-bold cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Validation Errors Notice */}
        {errors.length > 0 && !previewMode && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-1">
            <div className="font-bold flex items-center gap-1 text-rose-800">
              <AlertTriangle className="w-4 h-4" />
              <span>Please check before saving or publishing:</span>
            </div>
            {errors.map((err, i) => (
              <div key={i} className="flex items-start gap-1 pl-1">
                <span>•</span>
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* --- EDIT MODE --- */}
        {!previewMode ? (
          <div className="w-full space-y-3.5 mb-5">
            {/* Category Indicator & Switcher */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Category:</span>
                <span className="font-bold text-sky-800 capitalize">
                  {category.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 underline decoration-dotted cursor-pointer"
              >
                Change Template 🔄
              </button>
            </div>

            {/* Creator Name Field (Required) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Your Display Name <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Required</span>
              </div>
              <input
                type="text"
                maxLength={30}
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g. Alex"
                className={`w-full py-2.5 px-4 rounded-xl border text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.some((e) => e.includes('display name'))
                    ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-200'
                    : 'border-sky-200 bg-sky-50/50 focus:ring-sky-300'
                }`}
              />
            </div>

            {/* Quiz Title Field (Required) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Quiz Title <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">{title.length}/60</span>
              </div>
              <input
                type="text"
                maxLength={60}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How Well Do You Know Sara?"
                className={`w-full py-2.5 px-4 rounded-xl border text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.some((e) => e.includes('quiz title'))
                    ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-200'
                    : 'border-sky-200 bg-sky-50/50 focus:ring-sky-300'
                }`}
              />
            </div>

            {/* Short Description Field (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Short Description <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] text-slate-400">{description.length}/120</span>
              </div>
              <input
                type="text"
                maxLength={120}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A fun test to see who knows me best..."
                className="w-full py-2.5 px-4 rounded-xl border border-sky-200 bg-sky-50/50 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            {/* QUICK STARTER TEMPLATES TRAY */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/90 to-purple-50/90 border border-pink-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-900">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instant Lore Starters (Tap to Add)</span>
                </div>
                <span className="text-[10px] font-semibold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-full">
                  Quick Add
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
                  type="button"
                  onClick={handleAddNewQuestion}
                  className="px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Question Cards */}
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const isEditing = editingQuestionId === q.id;
                  const correctAnswerId = creatorAnswers[q.id];
                  const qNum = idx + 1;

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl border-2 border-sky-100 bg-sky-50/30 transition-all hover:border-sky-200"
                    >
                      {/* Question Header: Counter, Badge, Reorder, Delete */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[11px] font-bold flex items-center justify-center">
                            {qNum}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            of {questions.length}
                          </span>
                          {q.formatBadge && (
                            <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold border border-pink-200 shadow-2xs">
                              {q.formatBadge}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-600 capitalize">
                            {q.type === 'preference' ? 'Preference (No Wrong Answer)' : q.type?.replace('_', ' ') || 'Multiple Choice'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            title="Move Question Up"
                            aria-label={`Move Question ${qNum} Up`}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'down')}
                            disabled={idx === questions.length - 1}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            title="Move Question Down"
                            aria-label={`Move Question ${qNum} Down`}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateQuestion(q, idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 cursor-pointer"
                            title="Duplicate Question"
                            aria-label={`Duplicate Question ${qNum}`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                            className={`p-1 rounded-lg cursor-pointer transition-colors ${
                              isEditing ? 'text-sky-700 bg-sky-100' : 'text-sky-600 hover:bg-sky-50'
                            }`}
                            title={isEditing ? "Done Editing" : "Edit Question"}
                            aria-label={`Edit Question ${qNum}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestDelete(q)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 cursor-pointer"
                            title="Delete Question"
                            aria-label={`Delete Question ${qNum}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text Field */}
                      {isEditing ? (
                        <div className="space-y-3 mb-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-600">
                                Question Text <span className="text-rose-500">*</span>
                              </label>
                              <span className="text-[10px] text-slate-400">{q.question.length}/100</span>
                            </div>
                            <input
                              type="text"
                              maxLength={100}
                              value={q.question}
                              onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                              placeholder="Write your question..."
                              className="w-full py-2 px-3 rounded-xl border border-sky-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            />
                          </div>

                          {/* Format and Type Configuration */}
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
                                onChange={(e) => handleTypeChange(q.id, e.target.value as QuestionType)}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-semibold cursor-pointer"
                              >
                                <option value="multiple_choice">Scored (Right / Wrong)</option>
                                <option value="true_false">True / False</option>
                                <option value="preference">Preference (Bonding / No Wrong Answer)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingQuestionId(q.id)}
                          className="group/q cursor-pointer flex items-center justify-between mb-2.5 rounded-xl hover:bg-sky-100/40 p-1 -m-1 transition-colors"
                          title="Click to edit question text and type"
                        >
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug group-hover/q:text-sky-700">
                            {q.question || <span className="text-rose-500 italic">Empty question text</span>}
                          </h4>
                          <span className="text-[10px] text-sky-500 opacity-0 group-hover/q:opacity-100 transition-opacity font-semibold ml-2 flex-shrink-0">
                            Click to edit ✏️
                          </span>
                        </div>
                      )}

                      {/* Answer Choices List */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                          <span>
                            {q.type === 'preference'
                              ? 'Choices (Any choice is valid)'
                              : 'Answer Choices (Click "Mark Correct" for your answer)'}
                          </span>
                          {isEditing && q.type !== 'true_false' && q.options.length < 6 && (
                            <button
                              type="button"
                              onClick={() => handleAddOption(q.id)}
                              className="text-sky-600 hover:text-sky-800 flex items-center gap-0.5 cursor-pointer font-bold"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Choice</span>
                            </button>
                          )}
                        </div>

                        {q.options.map((opt, optIndex) => {
                          const isCorrect = correctAnswerId === opt.id;

                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isCorrect && q.type !== 'preference'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="flex-shrink-0 text-sm">{opt.emoji || '✨'}</span>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={opt.label}
                                    maxLength={60}
                                    onChange={(e) => handleOptionChange(q.id, opt.id, e.target.value)}
                                    placeholder={`Choice #${optIndex + 1}...`}
                                    className="py-1 px-2 rounded-lg border border-slate-200 text-xs w-full font-medium focus:bg-sky-50/30 focus:outline-none"
                                  />
                                ) : (
                                  <span className="leading-tight truncate">{opt.label}</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                {/* Scored quiz: mark correct answer */}
                                {q.type !== 'preference' && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCorrectAnswer(q.id, opt.id)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
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
                                )}

                                {/* Remove choice button (only when editing and > 2 choices) */}
                                {isEditing && q.type !== 'true_false' && q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(q.id, opt.id)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
                                    title="Remove this choice"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
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
          /* --- PARTICIPANT PREVIEW MODE --- */
          <div className="w-full flex flex-col items-center mb-6 animate-in fade-in duration-200">
            {/* Preview Banner */}
            <div className="w-full p-3 rounded-2xl bg-sky-50 border border-sky-200 text-center mb-4">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
                Interactive Participant Preview
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                {title || 'Untitled Quiz'} — By {creatorName || 'You'}
              </p>
              {description && <p className="text-[11px] text-slate-500 italic mt-0.5">{description}</p>}
            </div>

            {/* Step-by-Step Question Preview Card */}
            {questions.length > 0 && (
              <div className="w-full bg-[#fffefc] rounded-2xl p-4 border border-sky-100 shadow-sm flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                    Question {previewCurrentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Simulating Participant View
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-base font-bold text-slate-800 text-center my-3">
                  {questions[previewCurrentIndex]?.question || 'Empty Question'}
                </h3>

                {/* Options List */}
                <div className="w-full space-y-2 mb-4">
                  {questions[previewCurrentIndex]?.options.map((opt) => {
                    const isSelected = previewAnswers[questions[previewCurrentIndex].id] === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handlePreviewAnswerSelect(questions[previewCurrentIndex].id, opt.id)}
                        className={`w-full p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-500 text-white border-sky-600 shadow-sm scale-[1.01]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-sky-200 hover:bg-sky-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{opt.emoji || '✨'}</span>
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {/* Preview Navigation */}
                <div className="w-full flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    disabled={previewCurrentIndex === 0}
                    onClick={() => setPreviewCurrentIndex((p) => Math.max(0, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 disabled:opacity-30 cursor-pointer hover:bg-slate-50"
                  >
                    Previous
                  </button>

                  <span className="text-xs text-slate-400 font-semibold">
                    {previewAnswers[questions[previewCurrentIndex]?.id] !== undefined ? 'Answered' : 'Tap an option'}
                  </span>

                  <button
                    type="button"
                    disabled={previewCurrentIndex === questions.length - 1}
                    onClick={() => setPreviewCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 disabled:opacity-30 cursor-pointer hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ACTION BUTTONS --- */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          {previewMode ? (
            <button
              type="button"
              onClick={handleTogglePreview}
              className="w-full py-3.5 px-6 rounded-full font-heading font-bold text-sm text-white bg-sky-500 hover:bg-sky-600 active:scale-98 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Back to Quiz Editor</span>
            </button>
          ) : (
            <>
              {/* Primary: Save & Publish */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={saveStatus === 'saving'}
                className="w-full py-3.5 px-6 rounded-full font-heading font-bold text-base text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.45)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                style={{
                  background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                }}
              >
                <Save className="w-4 h-4" />
                <span className="tracking-wide text-base drop-shadow-xs">
                  {saveStatus === 'saving' ? 'Publishing...' : 'Save & Publish Live ✨'}
                </span>
              </button>

              {/* Secondary: Save as Private Draft */}
              {onSaveDraft && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saveStatus === 'saving'}
                  className="w-full py-2.5 px-4 rounded-full font-heading font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {activeQuizId ? 'Update Private Draft 💾' : 'Save as Private Draft 💾'}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* CONFIRM QUESTION DELETION MODAL */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-[360px] rounded-3xl p-5 shadow-2xl border-2 border-rose-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-slate-800 text-base mb-1">
              Delete This Question?
            </h3>
            <p className="text-xs text-slate-500 mb-4 px-2 line-clamp-2">
              "{questionToDelete.question}"
            </p>
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuestion}
                className="py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY TEMPLATE SELECTION MODAL */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[420px] rounded-3xl p-5 shadow-2xl border-2 border-sky-100 flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <h3 className="font-heading font-bold text-slate-800 text-sm">
                  Start from a Template
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Choose a starter question bank. A fresh, independent copy will be created without modifying the original template.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {CATEGORY_LIST.filter((c) => c.id !== 'custom').map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleImportCategoryTemplate(cat.id)}
                  className="p-3 rounded-2xl border border-sky-100 hover:border-sky-300 bg-sky-50/30 hover:bg-sky-50 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-slate-800">{cat.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{cat.tagline}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-600 bg-white px-2.5 py-1 rounded-full border border-sky-100 shadow-2xs">
                    Load
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
