import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { BreadcrumbItem } from '@/types/MoodifyTypes';

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  onBackClick: () => void;
  className?: string;
}

const Breadcrumb = ({ items = [], onBackClick }: BreadcrumbProps) => {
  return (
    <div className="flex items-center mb-2">
      {/* Back Icon */}

      <button
        onClick={onBackClick}
        className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Go back"
      >
        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
      </button>

      <div className="flex items-center space-x-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {/* Separator (except for first item) */}
            {index > 0 && (
              <span className="mx-2 text-gray-400 dark:text-gray-500">
                <span className="text-sm">/</span>
              </span>
            )}

            {/* Breadcrumb Item */}
            <div
              onClick={item.onClick}
              className={`cursor-pointer px-3 py-2 cursor-pointer transition-colors duration-200 ${
                item.isActive
                  ? 'text-gray-300 font-normal underline '
                  : 'text-gray-400 hover:text-gray-300 font-normal'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb;
