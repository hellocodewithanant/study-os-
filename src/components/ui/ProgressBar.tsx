import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string; // custom hex or css color
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const safeProgress = Math.min(100, Math.max(0, isNaN(progress) ? 0 : progress));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{safeProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${!color ? 'bg-indigo-600 dark:bg-indigo-500' : ''}`}
          style={{
            width: `${safeProgress}%`,
            backgroundColor: color || undefined
          }}
        />
      </div>
    </div>
  );
};
