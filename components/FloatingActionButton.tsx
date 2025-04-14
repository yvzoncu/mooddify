'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const FloatingActionButton = ({
  icon = <Plus size={24} />,
  onClick = () => {},
  className = 'text-white',
  ariaLabel = 'Action button',
}: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 
        w-20 h-20 
        bg-indigo-500 
        rounded-full 
        shadow-lg 
        flex items-center justify-center 
        z-50 
        transition 
        duration-200 
        ease-in-out 
        cursor-pointer
        hover:bg-indigo-600 
        active:bg-indigo-700 
        hover:scale-105 
        active:scale-95 
        focus:outline-none 
        focus:ring-4 
        focus:ring-indigo-300
        ${className}`}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton;
