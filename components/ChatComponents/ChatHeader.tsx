import { useAuth } from '@/contexts/AuthContext';

export default function ChatHeader() {
  const { user, signIn, signOut } = useAuth();

  return (
    <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
      <div className="text-xl font-bold text-white">Moodify</div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-white">{user.email}</span>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Sign In with Google
          </button>
        )}
      </div>
    </div>
  );
}
