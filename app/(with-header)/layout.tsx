'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Plus, Edit } from 'lucide-react';

export default function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showFAB, setShowFAB] = useState(true);

  // Define which pages should display the FAB
  useEffect(() => {
    // Hide FAB on specific pages where it's not needed
    const pagesWithoutFAB = ['/new-post'];
    setShowFAB(!pagesWithoutFAB.includes(pathname || ''));
  }, [pathname]);

  // Determine which icon and action to use based on current page
  const getFABConfig = () => {
    if (pathname?.includes('/messages')) {
      return {
        icon: <Edit size={36} />,
        action: () => (window.location.href = '/messages/compose'),
        ariaLabel: 'Compose message',
      };
    }

    // Default for most pages - create new mood
    return {
      icon: <Plus size={36} />,
      action: () => (window.location.href = '/new-post'),
      ariaLabel: 'Create new mood',
    };
  };

  const fabConfig = getFABConfig();

  return (
    <>
      <HeaderWithUser />
      <main className="pt-20 bg-indigo-50">{children}</main>

      {showFAB && (
        <FloatingActionButton
          icon={fabConfig.icon}
          onClick={fabConfig.action}
          ariaLabel={fabConfig.ariaLabel}
        />
      )}
    </>
  );
}

function HeaderWithUser() {
  // For the layout example, using a static user
  const user = {
    id: '1',
    name: 'Sarah Johnson',
    username: 'sarahj',
    avatar:
      'https://mood-pictures.s3.eu-north-1.amazonaws.com/woman-3289372_640.jpg',
    joinDate: '2023-06-15',
    followers: 247,
    following: 182,
  };

  return <Header user={user} />;
}
