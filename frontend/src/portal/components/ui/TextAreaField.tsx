import React from 'react';
import { HelpCircle } from 'lucide-react';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helper?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  helper,
  required,
  ...props
}) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-danger-500">*</span>}
      {helper && (
        <span className="group relative inline-block">
          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
            {helper}
          </span>
        </span>
      )}
    </label>
    <textarea
      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 resize-none dark:text-white"
      rows={4}
      required={required}
      {...props}
    />
  </div>
);
