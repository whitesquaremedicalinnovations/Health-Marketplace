import { Suspense } from 'react';
import ChatClient from './chat-client';
import { Loading } from '@/components/ui/loading';

export default function ChatPage() {
  return (
    <Suspense fallback={<Loading variant="page" text="Loading chat..." />}>
      <ChatClient />
    </Suspense>
  );
}