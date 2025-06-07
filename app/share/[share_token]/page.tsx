'use client';

import ChatHeader from '@/components/ChatComponents/ChatHeader';
import SharedPlaylistClient from '@/app/share/[share_token]/SharedPlaylistClient';

export default function SharedPlaylistPage({
  params,
}: {
  params: { share_token: string };
}) {
  return (
    <>
      <ChatHeader />
      <SharedPlaylistClient share_token={params.share_token} />
    </>
  );
}
