import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Trash2,
  Search,
  Plus,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StudySet, ContentType } from '../types/study';

interface StudySetsPageProps {
  studySets: StudySet[];
  onOpenStudySet: (set: StudySet, mode: 'flashcards' | 'quiz') => void;
  onDeleteStudySet: (id: string) => void;
  onCreateNew: () => void;
}

export const StudySetsPage: React.FC<StudySetsPageProps> = ({
  studySets,
  onOpenStudySet,
  onDeleteStudySet,
  onCreateNew,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSets = studySets.filter((set) => {
    const matchesFilter = filterType === 'all' || set.type === filterType;
    const matchesSearch =
      set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.sourcePrompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            My Study Sets
          </h2>
          <p className="text-xs sm:text-sm text-navy-500 mt-1">
            Browse, search, and practice your generated study materials.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Set</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search study sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs text-navy-900 bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
        </div>

        {/* Type Filter Chips */}
        <div className="flex items-center space-x-1.5 p-1 bg-navy-100/70 rounded-xl self-start sm:self-auto">
          {[
            { id: 'all', label: 'All Sets' },
            { id: 'both', label: 'Both' },
            { id: 'flashcards', label: 'Flashcards' },
            { id: 'quiz', label: 'Quizzes' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === tab.id
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-500 hover:text-navy-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sets Grid */}
      {filteredSets.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-navy-200">
          <BookOpen className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-800">No study sets found</h3>
          <p className="text-xs text-navy-500 mt-1 mb-6 max-w-sm mx-auto">
            {searchQuery
              ? `No study sets match "${searchQuery}". Try a different keyword.`
              : 'You haven\'t created any study sets in this category yet.'}
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold"
          >
            Create Your First Set
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSets.map((set) => {
            const cardCount = set.flashcards?.length || 0;
            const quizCount = set.questions?.length || 0;

            return (
              <div
                key={set.id}
                className="bg-white rounded-2xl border border-navy-100 p-5 shadow-soft hover:shadow-soft-lg hover:border-brand-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy-100 text-navy-700">
                      {set.type}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDeleteStudySet(set.id)}
                      title="Delete study set"
                      className="p-1 text-navy-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-navy-950 mb-1.5 line-clamp-1">
                    {set.title}
                  </h4>
                  <p className="text-xs text-navy-500 line-clamp-2 leading-relaxed mb-4">
                    {set.sourcePrompt}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-3 text-xs text-navy-400 pt-3 border-t border-navy-50 mb-3 font-medium">
                    {cardCount > 0 && <span>{cardCount} flashcards</span>}
                    {cardCount > 0 && quizCount > 0 && <span>•</span>}
                    {quizCount > 0 && <span>{quizCount} questions</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {cardCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenStudySet(set, 'flashcards')}
                        className="w-full py-2 px-3 rounded-xl bg-navy-50 hover:bg-brand-50 hover:text-brand-700 text-navy-700 border border-navy-200 hover:border-brand-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Flashcards</span>
                      </button>
                    )}

                    {quizCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenStudySet(set, 'quiz')}
                        className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Take Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
