'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import Image from 'next/image';
import { User as UserType } from '@/types/user';

interface HeaderProps {
  user?: UserType;
}

// Define the Button props interface properly
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
  size?: 'default' | 'icon';
  className?: string;
  children: React.ReactNode;
}

// Button component with proper typing
function Button({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors';

  const variantClasses = {
    default: 'bg-indigo-500 text-white hover:bg-indigo-600',
    ghost: 'hover:bg-gray-100',
  };

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    icon: 'h-10 w-10',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

const Header = ({ user }: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between p-4 bg-white shadow-md z-50">
      {/* Logo */}
      <Link
        href="/"
        className="text-2xl font-bold text-indigo-500 flex items-center"
      >
        <span className="mr-1">🌈</span>
        Moodi
      </Link>

      {/* Right-aligned Items */}
      <div className="flex items-center space-x-4">
        {/* Navigation icons */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Bell size={20} />
          </Button>
        </div>

        {/* User Profile - Show if logged in */}
        {user ? (
          <div className="relative">
            <button
              className="flex items-center space-x-1"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="relative w-8 h-8 overflow-hidden">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  className="rounded-full object-cover"
                  fill
                  sizes="32px"
                />
              </div>
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  href={`/profile/${user.username}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center text-sm font-medium text-indigo-500"
          >
            <User size={18} className="mr-1" />
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
