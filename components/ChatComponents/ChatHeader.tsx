'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ChatHeader() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white">Moodify</h1>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">{user.email}</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-sm text-white bg-transparent hover:bg-gray-800 rounded-lg transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}
