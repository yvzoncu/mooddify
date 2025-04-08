import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="w-full flex items-center justify-between p-4 bg-white shadow-md w-full z-50 mb-10">
      {/* Logo */}
      <div className="text-2xl font-bold text-blue-500">Moodi</div>

      {/* Right-aligned Items */}
      <div className="flex items-right space-x-4">
        {/* Search Bar */}
        <div className="flex items-right bg-gray-100 rounded-full p-2">
          <input
            type="text"
            placeholder="Search moods..."
            className="bg-transparent outline-none text-gray-700"
          />
        </div>

        {/* New Mood Button */}
        <Link
          href="/new-mood"
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md"
        >
          + Add new mood
        </Link>
      </div>
    </header>
  );
};

export default Header;
