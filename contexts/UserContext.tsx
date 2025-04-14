// context/UserContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user';

// Sample default user for development
const defaultUser: User = {
  id: '1',
  name: 'Sarah Johnson',
  username: 'sarahj',
  avatar:
    'https://mood-pictures.s3.eu-north-1.amazonaws.com/woman-3289372_640.jpg',
  joinDate: '2023-06-15',
  followers: 247,
  following: 182,
};

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  logout: () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the user from your API or local storage
    // For development, we'll set the default user after a short delay
    const timer = setTimeout(() => {
      setUser(defaultUser);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const logout = () => {
    // Clear user data
    setUser(null);
    // In a real app, you would clear tokens/cookies and redirect
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </UserContext.Provider>
  );
}
