import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-soft ${
      hover ? 'hover:shadow-medium hover:-translate-y-1 cursor-pointer' : ''
    } transition-all duration-300 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);
