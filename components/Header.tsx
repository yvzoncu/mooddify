'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  const isNmPath = pathname === '/new-mood';

  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between p-4 bg-white shadow-md z-50">
      {/* Logo */}
      <div className="text-2xl font-bold text-blue-500">Moodi</div>

      {/* Right-aligned Items */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}

        {!isNmPath && (
          <div className="flex items-center bg-gray-100 rounded-full p-2">
            <input
              type="text"
              placeholder="Search moods..."
              className="bg-transparent outline-none text-gray-700"
            />
          </div>
        )}

        {/* New Mood Button - Hide if on /nm path */}
        {!isNmPath && (
          <Link
            href="/new-mood"
            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md"
          >
            + Add new mood
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
