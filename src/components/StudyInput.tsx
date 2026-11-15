import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  ArrowRight,
  Flame,
  Check,
  Zap,
} from 'lucide-react';
import { ContentType, DifficultyLevel, GenerationParams } from '../types/study';

interface StudyInputProps {
  onGenerate: (params: GenerationParams) => void;
  isLoading: boolean;
  initialContent?: string;
  initialType?: ContentType;
}

const EXAMPLE_TOPICS = [
  'Operating Systems',
  'Database Management Systems',
  'Machine Learning',
  'Computer Networks',
  'Data Structures and Algorithms',
];

export const StudyInput: React.FC<StudyInputProps> = ({
  onGenerate,
  isLoading,
  initialContent = '',
  initialType = 'both',
}) => {
  const [content, setContent] = useState(initialContent);
  const [contentType, setContentType] = useState<ContentType>(initialType);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [count, setCount] = useState<number>(5);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isLoading) return;

    onGenerate({
      content: content.trim(),
      contentType,
      difficulty,
      count,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectExample = (topic: string) => {
    setContent(topic);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-soft hover:shadow-soft-lg transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Text Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="study-content-input"
              className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center space-x-1.5"
            >
              <span>Paste Notes or Enter Topic</span>
            </label>
            <span className="text-[11px] font-mono text-navy-400">
              {content.length} characters
            </span>
          </div>

          <div className="relative">
            <textarea
              id="study-content-input"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="e.g. Paste lecture notes on TCP/IP protocol stack, or enter 'Operating Systems: Virtual Memory and Paging'..."
              className="w-full px-4 py-3.5 text-sm sm:text-base text-navy-900 placeholder-navy-400 bg-navy-50/50 border border-navy-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all resize-y min-h-[110px]"
            />
          </div>
        </div>

        {/* Example Suggested Topics Pills */}
        <div>
          <div className="text-xs font-semibold text-navy-500 mb-2 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Quick Suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleSelectExample(topic)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-navy-200 bg-navy-50/60 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 text-navy-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type Selector */}
        <div>
          <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block mb-2">
            Select Output Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'flashcards' as ContentType,
                title: 'Flashcards',
                desc: 'Bite-sized cards with flip animation',
                icon: BookOpen,
              },
              {
                id: 'quiz' as ContentType,
                title: 'Quiz',
                desc: 'Multiple-choice with instant feedback',
                icon: HelpCircle,
              },
              {
                id: 'both' as ContentType,
                title: 'Both Formats',
                desc: 'Complete flashcard deck + interactive quiz',
                icon: Layers,
              },
            ].map((option) => {
              const isSelected = contentType === option.id;
              const Icon = option.icon;

              return (
                <div
                  key={option.id}
                  onClick={() => !isLoading && setContentType(option.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                      : 'border-navy-200 bg-white hover:bg-navy-50/70 hover:border-navy-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-2.5 mb-1">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-navy-100 text-navy-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        isSelected ? 'text-brand-950' : 'text-navy-900'
                      }`}
                    >
                      {option.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-navy-500 leading-tight pl-9">
                    {option.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Row: Difficulty & Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Difficulty Selector */}
          <div>
            <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy' as DifficultyLevel, label: 'Easy', color: 'emerald' },
                { id: 'medium' as DifficultyLevel, label: 'Medium', color: 'indigo' },
                { id: 'hard' as DifficultyLevel, label: 'Hard', color: 'rose' },
              ].map((lvl) => {
                const isSelected = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id)}
                    disabled={isLoading}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      isSelected
                        ? lvl.id === 'easy'
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/20'
                          : lvl.id === 'medium'
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-800 ring-2 ring-indigo-500/20'
                          : 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/20'
                        : 'bg-white border-navy-200 text-navy-600 hover:bg-navy-50'
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="count-slider"
                className="text-xs font-bold text-navy-800 uppercase tracking-wider"
              >
                Quantity ({count} {contentType === 'flashcards' ? 'cards' : contentType === 'quiz' ? 'questions' : 'each'})
              </label>
              <span className="text-xs font-bold font-mono text-brand-600">
                {count} items
              </span>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <input
                id="count-slider"
                type="range"
                min={3}
                max={15}
                step={1}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-navy-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>
            <div className="flex justify-between text-[10px] text-navy-400 mt-1 font-mono">
              <span>3 quick</span>
              <span>5 standard</span>
              <span>10 deep</span>
              <span>15 mastery</span>
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-700 hover:via-brand-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Study Content with Gemini...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Generate Study Material</span>
                <span className="text-[10px] opacity-75 font-normal ml-1">
                  (Ctrl + Enter)
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
