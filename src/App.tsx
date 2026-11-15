import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { CreateStudySet } from './pages/CreateStudySet';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { QuizPage } from './pages/QuizPage';
import { RevisionPage } from './pages/RevisionPage';
import { PerformancePage } from './pages/PerformancePage';
import { StudySetsPage } from './pages/StudySetsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useStudyHistory } from './hooks/useStudyHistory';
import { getUserSettings } from './utils/storage';
import {
  generateStudyContent,
  fetchCuratedSample,
  getBackendHealth,
  ApiError,
} from './services/api';
import {
  GenerationParams,
  GenerationResponse,
  StudySet,
  QuizQuestionItem,
  AiProvider,
} from './types/study';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isAiConfigured, setIsAiConfigured] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AiProvider>('groq');

  // Active Studying state
  const [activeStudySet, setActiveStudySet] = useState<StudySet | null>(null);
  const [activeStudyMode, setActiveStudyMode] = useState<'flashcards' | 'quiz' | null>(null);

  // Revision Quiz state (when practicing wrong questions queue)
  const [isRevisionQuiz, setIsRevisionQuiz] = useState(false);
  const [revisionQuizQuestions, setRevisionQuizQuestions] = useState<QuizQuestionItem[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<ApiError | Error | string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GenerationResponse | null>(null);
  const [generatedSource, setGeneratedSource] = useState<string | undefined>();
  const [generationNotice, setGenerationNotice] = useState<string | undefined>();
  const [lastParams, setLastParams] = useState<GenerationParams | null>(null);

  // AbortController to cancel previous requests & prevent race conditions
  const abortControllerRef = useRef<AbortController | null>(null);

  // Study history hook
  const {
    studySets,
    revisionQueue,
    metrics,
    refreshAll,
    saveStudySet,
    deleteStudySet,
    removeRevisionItem,
    clearRevisionQueue,
  } = useStudyHistory();

  // Check backend health and active key status
  const checkHealth = useCallback(async () => {
    const health = await getBackendHealth();
    const settings = getUserSettings();
    const provider = settings.activeProvider || (health.activeProvider as AiProvider) || 'groq';
    setActiveProvider(provider);

    const isConfigured = provider === 'groq'
      ? Boolean(health.groq.configured || (settings.groqApiKey && settings.groqApiKey.trim().length > 0))
      : Boolean(health.gemini.configured || (settings.geminiApiKey && settings.geminiApiKey.trim().length > 0));

    setIsAiConfigured(isConfigured);
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Handle study content generation with race condition prevention
  const handleGenerate = async (params: GenerationParams) => {
    // Cancel any previous in-flight generation request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedContent(null);
    setGeneratedSource(undefined);
    setGenerationNotice(undefined);
    setLastParams(params);

    try {
      const result = await generateStudyContent(params, { signal: controller.signal });
      setGeneratedContent(result.data);
      setGeneratedSource(result.source);
      setGenerationNotice(result.notice);

      // Auto save the generated set
      const newStudySet: StudySet = {
        id: `set-${Date.now()}`,
        title: result.data.title,
        type: result.data.type,
        sourcePrompt: params.content,
        difficulty: params.difficulty,
        createdAt: new Date().toISOString(),
        flashcards: result.data.flashcards || [],
        questions: result.data.questions || [],
      };
      saveStudySet(newStudySet);
    } catch (err: any) {
      if (err.code === 'ABORTED') {
        return;
      }
      console.error('[Generation Error]:', err);
      setGenerationError(err);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Sample fallback generation (for instant preview without API key)
  const handleUseSampleFallback = async () => {
    if (!lastParams) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const sample = await fetchCuratedSample(
        lastParams.content || 'Operating Systems',
        lastParams.contentType
      );
      setGeneratedContent(sample.data);
      setGeneratedSource('curated_sample_fallback');
      setGenerationNotice(
        'Curated sample curriculum loaded for preview. To generate custom topics with AI, add your GROQ_API_KEY in backend/.env or the Settings page.'
      );

      const newStudySet: StudySet = {
        id: `set-${Date.now()}`,
        title: sample.data.title,
        type: sample.data.type,
        sourcePrompt: lastParams.content,
        difficulty: lastParams.difficulty,
        createdAt: new Date().toISOString(),
        flashcards: sample.data.flashcards || [],
        questions: sample.data.questions || [],
      };
      saveStudySet(newStudySet);
    } catch (err: any) {
      setGenerationError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Cancel generation request
  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Open an existing study set
  const handleOpenStudySet = (set: StudySet, mode: 'flashcards' | 'quiz') => {
    setActiveStudySet(set);
    setActiveStudyMode(mode);
    setIsRevisionQuiz(false);
  };

  // Launch revision quiz (only questions in revision queue)
  const handleStartRevisionQuiz = () => {
    if (revisionQueue.length === 0) return;
    const questions = revisionQueue.map((item) => item.question);
    const mockRevisionSet: StudySet = {
      id: 'active-revision-session',
      title: 'Wrong Answer Revision Practice',
      type: 'quiz',
      sourcePrompt: 'Revision Queue Practice',
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
      questions,
    };
    setActiveStudySet(mockRevisionSet);
    setRevisionQuizQuestions(questions);
    setActiveStudyMode('quiz');
    setIsRevisionQuiz(true);
  };

  // Save generated set and start studying immediately
  const handleSaveAndStudy = (set: StudySet, mode: 'flashcards' | 'quiz') => {
    saveStudySet(set);
    setActiveStudySet(set);
    setActiveStudyMode(mode);
    setIsRevisionQuiz(false);
  };

  // Exit study viewer and return to dashboard or sets
  const handleExitStudy = () => {
    setActiveStudySet(null);
    setActiveStudyMode(null);
    setIsRevisionQuiz(false);
    refreshAll();
  };

  // Switch between flashcards and quiz within an active session
  const handleSwitchStudyMode = (mode: 'flashcards' | 'quiz') => {
    setActiveStudyMode(mode);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-navy-900 flex font-sans antialiased selection:bg-brand-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          handleExitStudy();
          setCurrentTab(tab);
        }}
        revisionCount={revisionQueue.length}
        studySetsCount={studySets.length}
        isAiConfigured={isAiConfigured}
        activeProvider={activeProvider}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Sticky Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onQuickCreate={() => {
            handleExitStudy();
            setCurrentTab('create');
          }}
          revisionCount={revisionQueue.length}
          onOpenRevision={() => {
            handleExitStudy();
            setCurrentTab('revision');
          }}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Active Flashcard Viewer View */}
          {activeStudySet && activeStudyMode === 'flashcards' && (
            <FlashcardsPage
              studySet={activeStudySet}
              onBack={handleExitStudy}
              onSwitchToQuiz={() => handleSwitchStudyMode('quiz')}
            />
          )}

          {/* Active Quiz View */}
          {activeStudySet && activeStudyMode === 'quiz' && (
            <QuizPage
              studySet={activeStudySet}
              customQuestions={isRevisionQuiz ? revisionQuizQuestions : undefined}
              isRevisionMode={isRevisionQuiz}
              onBack={handleExitStudy}
              onSwitchToFlashcards={() => handleSwitchStudyMode('flashcards')}
              onGoToDashboard={() => {
                handleExitStudy();
                setCurrentTab('dashboard');
              }}
            />
          )}

          {/* Tab Pages (visible when not studying a specific set) */}
          {!activeStudySet && (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard
                  onStartGeneration={(params) => {
                    setCurrentTab('create');
                    handleGenerate(params);
                  }}
                  isLoading={isGenerating}
                  studySets={studySets}
                  revisionQueue={revisionQueue}
                  metrics={metrics}
                  onOpenStudySet={handleOpenStudySet}
                  onOpenRevisionQuiz={handleStartRevisionQuiz}
                  onViewAllSets={() => setCurrentTab('sets')}
                  onViewRevisionQueue={() => setCurrentTab('revision')}
                />
              )}

              {currentTab === 'create' && (
                <CreateStudySet
                  onGenerate={handleGenerate}
                  isLoading={isGenerating}
                  error={generationError}
                  generatedContent={generatedContent}
                  generatedSource={generatedSource}
                  generationNotice={generationNotice}
                  onSaveAndStudy={handleSaveAndStudy}
                  onOpenSettings={() => setCurrentTab('settings')}
                  onRetry={() => {
                    if (lastParams) handleGenerate(lastParams);
                  }}
                  onCancelRequest={handleCancelRequest}
                  onUseSampleFallback={handleUseSampleFallback}
                />
              )}

              {currentTab === 'sets' && (
                <StudySetsPage
                  studySets={studySets}
                  onOpenStudySet={handleOpenStudySet}
                  onDeleteStudySet={deleteStudySet}
                  onCreateNew={() => setCurrentTab('create')}
                />
              )}

              {currentTab === 'revision' && (
                <RevisionPage
                  revisionQueue={revisionQueue}
                  onStartRevisionQuiz={handleStartRevisionQuiz}
                  onRemoveItem={removeRevisionItem}
                  onClearAll={clearRevisionQueue}
                  onGoToDashboard={() => setCurrentTab('dashboard')}
                />
              )}

              {currentTab === 'performance' && <PerformancePage />}

              {currentTab === 'settings' && (
                <SettingsPage
                  onSettingsSaved={checkHealth}
                  onClearHistory={() => {
                    localStorage.clear();
                    refreshAll();
                    checkHealth();
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
