import React from 'react';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showLabel = true }) => (
  <div className="w-full">
    <div className="flex justify-between items-center mb-1">
      {showLabel && <span className="text-xs text-gray-500 dark:text-gray-400">Progression</span>}
      {showLabel && <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{progress}%</span>}
    </div>
    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);
