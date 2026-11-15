import React from 'react';
import { Menu, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onQuickCreate: () => void;
  revisionCount: number;
  onOpenRevision: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onQuickCreate,
  revisionCount,
  onOpenRevision,
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Your personal AI-powered study space',
    },
    create: {
      title: 'Create Study Set',
      subtitle: 'Convert notes and topics into flashcards and quizzes',
    },
    sets: {
      title: 'My Study Sets',
      subtitle: 'Your library of generated study materials',
    },
    revision: {
      title: 'Revision Queue',
      subtitle: 'Targeted practice for incorrectly answered questions',
    },
    performance: {
      title: 'Performance & Analytics',
      subtitle: 'Track your study streaks, accuracy, and mastery over time',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage Gemini API keys, preferences, and local data',
    },
  };

  const current = titles[currentTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-navy-100 px-4 sm:px-8 py-4 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-2 -ml-2 rounded-xl text-navy-600 hover:text-navy-900 hover:bg-navy-100 lg:hidden focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-navy-950 tracking-tight">
              {current.title}
            </h1>
            <p className="text-xs text-navy-500 hidden sm:block">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          {revisionCount > 0 && (
            <button
              type="button"
              onClick={onOpenRevision}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{revisionCount} To Revise</span>
            </button>
          )}

          {currentTab !== 'create' && (
            <button
              type="button"
              onClick={onQuickCreate}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-brand-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Study Set</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
