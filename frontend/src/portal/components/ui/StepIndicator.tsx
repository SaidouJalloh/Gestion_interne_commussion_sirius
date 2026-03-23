import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, index) => (
      <React.Fragment key={index}>
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
              index + 1 < currentStep
                ? 'bg-success-500 text-white'
                : index + 1 === currentStep
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            }`}
          >
            {index + 1 < currentStep ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
          </div>
          <span
            className={`mt-2 text-xs font-medium ${
              index + 1 <= currentStep ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
            }`}
          >
            {step}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
              index + 1 < currentStep ? 'bg-success-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);
