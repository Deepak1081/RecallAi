import React from 'react';
import { AlertTriangle, RefreshCw, Key, ShieldAlert, WifiOff, FileWarning } from 'lucide-react';
import { ApiError } from '../services/api';

interface ErrorStateProps {
  error: ApiError | Error | string | null;
  onRetry?: () => void;
  onOpenSettings?: () => void;
  onUseSampleFallback?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onOpenSettings,
  onUseSampleFallback,
}) => {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;
  const code = (error as ApiError)?.code || '';
  const statusCode = (error as ApiError)?.statusCode || 0;

  // Classify error type
  const isKeyError =
    code === 'MISSING_API_KEY' ||
    code === 'INVALID_API_KEY' ||
    statusCode === 401 ||
    message.toLowerCase().includes('api_key') ||
    message.toLowerCase().includes('gemini_api_key');

  const isRateLimit =
    statusCode === 429 ||
    code === 'RATE_LIMIT_EXCEEDED' ||
    message.toLowerCase().includes('quota') ||
    message.toLowerCase().includes('rate limit');

  const isNetwork =
    code === 'NETWORK_ERROR' ||
    statusCode === 0 ||
    message.toLowerCase().includes('connect to recallai backend') ||
    message.toLowerCase().includes('failed to fetch');

  const isSchemaError =
    code === 'SCHEMA_VALIDATION_FAILED' ||
    code === 'INVALID_SCHEMA' ||
    code === 'INVALID_JSON';

  return (
    <div className="w-full max-w-2xl mx-auto my-6 p-6 bg-rose-50/70 border border-rose-200/80 rounded-2xl shadow-soft">
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
          {isKeyError ? (
            <Key className="w-6 h-6" />
          ) : isNetwork ? (
            <WifiOff className="w-6 h-6" />
          ) : isRateLimit ? (
            <ShieldAlert className="w-6 h-6" />
          ) : isSchemaError ? (
            <FileWarning className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-base font-semibold text-rose-900">
              {isKeyError
                ? 'Gemini API Key Required'
                : isNetwork
                ? 'Backend Connection Failed'
                : isRateLimit
                ? 'Gemini Quota / Rate Limit Reached'
                : isSchemaError
                ? 'AI Schema Validation Failed'
                : 'Generation Error'}
            </h4>
            {statusCode > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-200 text-rose-800">
                HTTP {statusCode}
              </span>
            )}
          </div>

          <p className="text-sm text-rose-700 leading-relaxed mb-4">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-rose-500/20 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Generation</span>
              </button>
            )}

            {isKeyError && onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configure Key in Settings</span>
              </button>
            )}

            {isKeyError && onUseSampleFallback && (
              <button
                type="button"
                onClick={onUseSampleFallback}
                className="inline-flex items-center space-x-2 px-3 py-2 text-xs font-medium text-navy-700 hover:text-navy-900 bg-white/80 border border-navy-200 rounded-lg hover:bg-white transition-colors"
              >
                <span>Preview with Sample Curriculum</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
