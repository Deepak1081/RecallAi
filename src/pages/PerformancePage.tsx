import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Layers,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useStudyHistory } from '../hooks/useStudyHistory';

export const PerformancePage: React.FC = () => {
  const { metrics, quizAttempts, flashcardSessions } = useStudyHistory();

  // SVG Chart Dimensions & Data
  const trendData = metrics.accuracyTrend;
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 25;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          Performance & Analytics
        </h2>
        <p className="text-xs sm:text-sm text-navy-500 mt-1">
          Review your learning retention, accuracy progress, and study volume over time.
        </p>
      </div>

      {/* 5 Primary Performance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-navy-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">
              Total Sessions
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            {metrics.totalSessions}
          </div>
          <p className="text-[11px] text-navy-400 mt-1">Total reviews</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-navy-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">
              Flashcards
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            {metrics.totalCardsReviewed}
          </div>
          <p className="text-[11px] text-navy-400 mt-1">Cards flipped</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-navy-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">
              Quizzes
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            {metrics.totalQuizzes}
          </div>
          <p className="text-[11px] text-navy-400 mt-1">Quizzes finished</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-navy-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">
              Avg Accuracy
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            {metrics.avgAccuracy > 0 ? `${metrics.avgAccuracy}%` : '—'}
          </div>
          <p className="text-[11px] text-navy-400 mt-1">Overall test score</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-navy-100 shadow-soft col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">
              Need Revision
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            {metrics.questionsNeedingRevision}
          </div>
          <p className="text-[11px] text-navy-400 mt-1">Wrong questions</p>
        </div>
      </div>

      {/* Accuracy Trend Interactive Visual Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-navy-900">Quiz Accuracy History</h3>
            <p className="text-xs text-navy-500">Chronological performance on recent quiz attempts</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
            Target: ≥ 80%
          </span>
        </div>

        {trendData.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 text-navy-400"
            >
              {/* Reference Grid lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={chartWidth - paddingX}
                y2={paddingY}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text x={paddingX - 8} y={paddingY + 4} fontSize="9" textAnchor="end" fill="#94a3b8">
                100%
              </text>

              <line
                x1={paddingX}
                y1={chartHeight / 2}
                x2={chartWidth - paddingX}
                y2={chartHeight / 2}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text x={paddingX - 8} y={chartHeight / 2 + 4} fontSize="9" textAnchor="end" fill="#94a3b8">
                50%
              </text>

              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="#cbd5e1"
              />
              <text x={paddingX - 8} y={chartHeight - paddingY + 4} fontSize="9" textAnchor="end" fill="#94a3b8">
                0%
              </text>

              {/* Data points & Bars */}
              {trendData.map((d, i) => {
                const totalBars = trendData.length;
                const barSpacing = (chartWidth - paddingX * 2) / Math.max(1, totalBars);
                const x = paddingX + i * barSpacing + barSpacing / 2;
                const barHeight = ((chartHeight - paddingY * 2) * d.accuracy) / 100;
                const y = chartHeight - paddingY - barHeight;

                return (
                  <g key={i} className="group cursor-pointer">
                    {/* Bar */}
                    <rect
                      x={x - 12}
                      y={y}
                      width={24}
                      height={Math.max(4, barHeight)}
                      rx={6}
                      fill={d.accuracy >= 75 ? '#6366f1' : d.accuracy >= 50 ? '#8b5cf6' : '#f43f5e'}
                      className="opacity-90 hover:opacity-100 transition-opacity"
                    />

                    {/* Percentage label on top of bar */}
                    <text
                      x={x}
                      y={y - 6}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="#334155"
                    >
                      {d.accuracy}%
                    </text>

                    {/* Bottom label */}
                    <text
                      x={x}
                      y={chartHeight - paddingY + 14}
                      fontSize="8"
                      textAnchor="middle"
                      fill="#64748b"
                    >
                      {d.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-navy-400">
            No quiz attempts recorded yet. Take a quiz to populate your accuracy trend!
          </div>
        )}
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-navy-100 shadow-soft">
        <h3 className="text-base font-bold text-navy-900 mb-1">Recent Study Activity</h3>
        <p className="text-xs text-navy-500 mb-6">A log of your recent study sessions</p>

        {metrics.recentActivity.length === 0 ? (
          <div className="text-center py-8 text-xs text-navy-400">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-navy-50">
            {metrics.recentActivity.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'quiz'
                        ? 'bg-brand-50 text-brand-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    {item.type === 'quiz' ? (
                      <HelpCircle className="w-4 h-4" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-navy-900">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-navy-500">{item.subtitle}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      item.accuracy >= 75
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-navy-100 text-navy-700'
                    }`}
                  >
                    {item.accuracy}%
                  </span>
                  <div className="text-[10px] text-navy-400 mt-0.5">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
