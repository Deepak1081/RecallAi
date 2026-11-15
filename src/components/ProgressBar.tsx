import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  subLabel?: string;
  color?: 'brand' | 'emerald' | 'amber' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  subLabel,
  color = 'brand',
  size = 'md',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  const colorGradients = {
    brand: 'from-brand-600 via-brand-500 to-indigo-500',
    emerald: 'from-emerald-600 to-teal-400',
    amber: 'from-amber-500 to-yellow-400',
    indigo: 'from-indigo-600 to-blue-500',
  }[color];

  return (
    <div className="w-full">
      {(label || subLabel) && (
        <div className="flex items-center justify-between text-xs font-medium text-navy-600 mb-1.5">
          {label && <span>{label}</span>}
          {subLabel && <span className="text-navy-500 font-mono">{subLabel}</span>}
        </div>
      )}
      <div className={`w-full bg-navy-100 rounded-full overflow-hidden ${heightClasses}`}>
        <div
          className={`h-full bg-gradient-to-r ${colorGradients} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
