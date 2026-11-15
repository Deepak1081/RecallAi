import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Server,
  Trash2,
  Save,
  ExternalLink,
  Zap,
  RefreshCw,
  Sparkles,
  Bot,
} from 'lucide-react';
import { getUserSettings, saveUserSettings } from '../utils/storage';
import { getBackendHealth, testApiKey } from '../services/api';
import { UserSettings, DifficultyLevel, AiProvider } from '../types/study';

interface SettingsPageProps {
  onSettingsSaved?: () => void;
  onClearHistory?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onSettingsSaved,
  onClearHistory,
}) => {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Backend Health state
  const [backendStatus, setBackendStatus] = useState<{
    status: string;
    activeProvider: string;
    groq: { configured: boolean; model: string };
    gemini: { configured: boolean; model: string };
  } | null>(null);

  // Key testing state
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    provider: string;
  } | null>(null);

  useEffect(() => {
    getBackendHealth().then(setBackendStatus);
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveUserSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    if (onSettingsSaved) onSettingsSaved();
    getBackendHealth().then(setBackendStatus);
  };

  const handleTestConnection = async (provider: AiProvider) => {
    setIsTestingKey(true);
    setTestResult(null);
    const keyToTest = provider === 'groq' ? settings.groqApiKey : settings.geminiApiKey;
    try {
      const res = await testApiKey(keyToTest, provider);
      setTestResult({
        tested: true,
        success: res.connected,
        message: res.message,
        provider,
      });
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err.message || 'Connection test failed',
        provider,
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          Settings & AI Configuration
        </h2>
        <p className="text-xs sm:text-sm text-navy-500 mt-1">
          Configure your Groq or Gemini API keys, preferred models, and local preferences.
        </p>
      </div>

      {/* Backend & AI Connection Status Card */}
      <div className="bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-navy-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">Backend Server Status</h3>
              <p className="text-xs text-navy-500">Express Server • Port 5000</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                backendStatus?.status === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-semibold text-navy-700 capitalize">
              {backendStatus?.status === 'ok' ? 'Server Online' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          {/* Groq status */}
          <div className="p-3.5 bg-navy-50/60 rounded-xl border border-navy-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 font-bold text-navy-800 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Groq (Ultra-Fast)</span>
              </div>
              <span className="text-navy-500 block text-[11px]">Model: {backendStatus?.groq?.model || 'llama-3.3-70b-versatile'}</span>
            </div>
            <div className="mt-2 text-[11px]">
              {backendStatus?.groq?.configured ? (
                <span className="text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Configured in backend/.env</span>
                </span>
              ) : (
                <span className="text-amber-700 font-medium">Not configured in backend/.env</span>
              )}
            </div>
          </div>

          {/* Gemini status */}
          <div className="p-3.5 bg-navy-50/60 rounded-xl border border-navy-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 font-bold text-navy-800 mb-1">
                <Bot className="w-3.5 h-3.5 text-brand-600" />
                <span>Google Gemini</span>
              </div>
              <span className="text-navy-500 block text-[11px]">Model: {backendStatus?.gemini?.model || 'gemini-2.5-flash'}</span>
            </div>
            <div className="mt-2 text-[11px]">
              {backendStatus?.gemini?.configured ? (
                <span className="text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Configured in backend/.env</span>
                </span>
              ) : (
                <span className="text-navy-400 font-medium">Not configured in backend/.env</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main AI Configuration Form */}
      <form onSubmit={handleSave} className="bg-white border border-navy-100 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
        <div>
          <h3 className="text-base font-bold text-navy-900 mb-1">
            Active AI Provider
          </h3>
          <p className="text-xs text-navy-500 mb-3">
            Select your preferred inference provider. You can save your API key in <code className="font-mono bg-navy-100 px-1 rounded">backend/.env</code> or enter it below.
          </p>

          {/* Provider Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setSettings({ ...settings, activeProvider: 'groq' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                settings.activeProvider === 'groq'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                  : 'border-navy-200 bg-white hover:bg-navy-50/70'
              }`}
            >
              <div className="flex items-center space-x-2.5 mb-1">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                    settings.activeProvider === 'groq'
                      ? 'bg-amber-500 text-white'
                      : 'bg-navy-100 text-navy-600'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-sm font-bold text-navy-950">Groq</span>
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Fastest
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-navy-500 pl-9.5">
                Sub-second generation powered by Llama 3.3 70B & Groq LPUs.
              </p>
            </div>

            <div
              onClick={() => setSettings({ ...settings, activeProvider: 'gemini' })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                settings.activeProvider === 'gemini'
                  ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                  : 'border-navy-200 bg-white hover:bg-navy-50/70'
              }`}
            >
              <div className="flex items-center space-x-2.5 mb-1">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                    settings.activeProvider === 'gemini'
                      ? 'bg-brand-600 text-white'
                      : 'bg-navy-100 text-navy-600'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-navy-950">Google Gemini</span>
                </div>
              </div>
              <p className="text-[11px] text-navy-500 pl-9.5">
                High-reasoning generation powered by Gemini 2.5 Flash / 1.5 Flash.
              </p>
            </div>
          </div>
        </div>

        {/* GROQ KEY INPUT */}
        {settings.activeProvider === 'groq' && (
          <div className="p-5 bg-amber-50/30 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Groq API Key</span>
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center space-x-1"
              >
                <span>Get a free key at console.groq.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showGroqKey ? 'text' : 'password'}
                value={settings.groqApiKey}
                onChange={(e) => setSettings({ ...settings, groqApiKey: e.target.value })}
                placeholder="gsk_..."
                className="w-full pl-4 pr-12 py-2.5 text-xs sm:text-sm text-navy-900 font-mono bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/25"
              />
              <button
                type="button"
                onClick={() => setShowGroqKey(!showGroqKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700"
              >
                {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-navy-500">
                You can also paste this into <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-navy-200">backend/.env</code> as <code className="font-mono text-navy-800">GROQ_API_KEY</code>.
              </span>
              <button
                type="button"
                onClick={() => handleTestConnection('groq')}
                disabled={isTestingKey}
                className="text-[11px] font-bold text-amber-900 hover:text-amber-950 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors inline-flex items-center space-x-1 shrink-0"
              >
                {isTestingKey && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Test Groq Key</span>
              </button>
            </div>
          </div>
        )}

        {/* GEMINI KEY INPUT */}
        {settings.activeProvider === 'gemini' && (
          <div className="p-5 bg-brand-50/30 rounded-2xl border border-brand-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Bot className="w-3.5 h-3.5 text-brand-600" />
                <span>Google Gemini API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1"
              >
                <span>Get a free key at Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={settings.geminiApiKey}
                onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full pl-4 pr-12 py-2.5 text-xs sm:text-sm text-navy-900 font-mono bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-navy-500">
                You can also paste this into <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-navy-200">backend/.env</code> as <code className="font-mono text-navy-800">GEMINI_API_KEY</code>.
              </span>
              <button
                type="button"
                onClick={() => handleTestConnection('gemini')}
                disabled={isTestingKey}
                className="text-[11px] font-bold text-brand-900 hover:text-brand-950 px-3 py-1.5 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors inline-flex items-center space-x-1 shrink-0"
              >
                {isTestingKey && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Test Gemini Key</span>
              </button>
            </div>
          </div>
        )}

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] block opacity-75">
                {testResult.provider} Result
              </span>
              <span>{testResult.message}</span>
            </div>
          </div>
        )}

        {/* Default Preferences */}
        <div className="pt-4 border-t border-navy-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block mb-2">
              Default Difficulty
            </label>
            <select
              value={settings.defaultDifficulty}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultDifficulty: e.target.value as DifficultyLevel,
                })
              }
              className="w-full px-3 py-2 text-xs text-navy-900 bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            >
              <option value="easy">Easy (Definitions & Fundamentals)</option>
              <option value="medium">Medium (Mechanisms & Concepts)</option>
              <option value="hard">Hard (Deep Edge Cases & Trade-offs)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-navy-800 uppercase tracking-wider block mb-2">
              Default Question Count
            </label>
            <select
              value={settings.defaultCount}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultCount: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 text-xs text-navy-900 bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            >
              <option value={3}>3 Questions / Cards</option>
              <option value={5}>5 Questions / Cards (Recommended)</option>
              <option value={10}>10 Questions / Cards</option>
              <option value={15}>15 Questions / Cards</option>
            </select>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>

          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved!</span>
            </span>
          )}
        </div>
      </form>

      {/* Danger Zone: Clear Data */}
      <div className="bg-white border border-rose-200/80 rounded-3xl p-6 sm:p-8 shadow-soft">
        <h3 className="text-base font-bold text-rose-900 mb-1">Clear Local History</h3>
        <p className="text-xs text-rose-700 mb-4">
          Reset all saved study sets, quiz attempts, and revision lists stored in localStorage.
        </p>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to clear your local study history? This action cannot be undone.')) {
              if (onClearHistory) onClearHistory();
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors flex items-center space-x-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset All Study Data</span>
        </button>
      </div>
    </div>
  );
};
