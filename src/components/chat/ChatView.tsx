import { useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ImportantVault } from './ImportantVault';
import { Message } from '@/types/chat';

export const ChatView = () => {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showVault, setShowVault] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader onOpenVault={() => setShowVault(true)} />
      <MessageList onReply={setReplyTo} />
      <ChatInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
      <ImportantVault isOpen={showVault} onClose={() => setShowVault(false)} />
    </div>
  );
};
