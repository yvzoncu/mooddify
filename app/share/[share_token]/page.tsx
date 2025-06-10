import ChatHeader from '@/components/ChatComponents/ChatHeader';
import SharedPlaylistClient from '@/app/share/[share_token]/SharedPlaylistClient';

export default async function SharedPlaylistPage({
  params,
}: {
  params: Promise<{ share_token: string }>;
}) {
  const { share_token } = await params;

  return (
    <>
      <ChatHeader />
      <SharedPlaylistClient share_token={share_token} />
    </>
  );
}
