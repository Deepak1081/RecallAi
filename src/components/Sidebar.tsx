import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookMarked,
  BarChart3,
  Settings,
  AlertCircle,
  Zap,
  CheckCircle2,
  KeyRound,
  Layers,
  Bot,
} from 'lucide-react';
import { AiProvider } from '../types/study';

export type NavTab = 'dashboard' | 'create' | 'sets' | 'revision' | 'performance' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  revisionCount: number;
  studySetsCount: number;
  isAiConfigured: boolean;
  activeProvider?: AiProvider | string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  revisionCount,
  studySetsCount,
  isAiConfigured,
  activeProvider = 'groq',
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'create' as NavTab,
      label: 'Create Study Set',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'sets' as NavTab,
      label: 'My Study Sets',
      icon: BookMarked,
      badge: studySetsCount > 0 ? studySetsCount : undefined,
    },
    {
      id: 'revision' as NavTab,
      label: 'Revision Queue',
      icon: AlertCircle,
      badge: revisionCount > 0 ? revisionCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'performance' as NavTab,
      label: 'Performance',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const isGroq = activeProvider === 'groq';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-navy-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-navy-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-navy-950 tracking-tight">
                  RecallAI
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-navy-400">
                AI Study Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-800 border border-brand-200/80 shadow-sm'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-600' : 'text-navy-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.badgeColor || 'bg-navy-100 text-navy-700 border-navy-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom AI Status & Footer */}
        <div className="p-4 border-t border-navy-100/80 space-y-3">
          {/* Active AI Status Badge */}
          <div
            onClick={() => handleNavClick('settings')}
            className="p-3 bg-navy-50 rounded-2xl border border-navy-100 cursor-pointer hover:bg-navy-100/70 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-navy-700 flex items-center space-x-1.5">
                {isGroq ? (
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-brand-600" />
                )}
                <span>{isGroq ? 'Groq LPU' : 'Gemini AI'}</span>
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isAiConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </div>
            <p className="text-[10px] text-navy-500 truncate">
              {isAiConfigured ? 'Connected & Ready' : 'Key Needed in Settings'}
            </p>
          </div>

          <div className="text-[11px] text-navy-400 text-center font-medium">
            RecallAI • Fast Structured JSON
          </div>
        </div>
      </aside>
    </>
  );
};
