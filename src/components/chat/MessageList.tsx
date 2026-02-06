import { useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { MessageBubble } from './MessageBubble';
import { useChatContext } from '@/contexts/ChatContext';
import { Message } from '@/types/chat';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  onReply: (message: Message) => void;
}

export const MessageList = ({ onReply }: MessageListProps) => {
  const { messages, loading } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach(msg => {
    const dateStr = format(new Date(msg.created_at), 'yyyy-MM-dd');
    const existing = groupedMessages.find(g => g.date === dateStr);
    if (existing) {
      existing.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center chat-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto chat-bg scrollbar-thin py-4"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">Start a conversation</h3>
          <p className="text-sm text-muted-foreground">
            Send a message to begin chatting
          </p>
        </div>
      ) : (
        groupedMessages.map(group => (
          <div key={group.date}>
            {/* Date header */}
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 text-xs font-medium text-muted-foreground bg-card/80 backdrop-blur-sm rounded-full shadow-sm">
                {formatDateHeader(new Date(group.date))}
              </span>
            </div>

            {/* Messages */}
            {group.messages.map(message => (
              <MessageBubble 
                key={message.id} 
                message={message}
                onReply={onReply}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
};
