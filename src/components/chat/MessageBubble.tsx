import { format } from 'date-fns';
import { Star, Reply, Smile, Trash2, MoreHorizontal, Download, Play, Pause, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Message } from '@/types/chat';
import { useChatContext } from '@/contexts/ChatContext';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  onReply: (message: Message) => void;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageBubble = ({ message, onReply }: MessageBubbleProps) => {
  const { currentUser, toggleImportant, deleteMessage, addReaction, removeReaction } = useChatContext();
  const [showActions, setShowActions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const isSent = message.sender_id === currentUser?.id;
  const isImportant = message.state?.is_important;

  const handleEmojiClick = async (emoji: string) => {
    const existingReaction = message.reactions?.find(
      r => r.user_id === currentUser?.id && r.emoji === emoji
    );

    if (existingReaction) {
      await removeReaction(message.id, emoji);
    } else {
      await addReaction(message.id, emoji);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = () => setIsPlaying(false);
    }
  }, []);

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const isAudio = message.attachment_type?.startsWith('audio/');
  const isImage = message.attachment_type?.startsWith('image/');

  return (
    <div
      className={cn(
        'group flex gap-2 px-4 py-1 message-enter',
        isSent ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn('max-w-[75%] relative', isSent ? 'items-end' : 'items-start')}>
        {/* Reply preview */}
        {message.reply_to && (
          <div 
            className={cn(
              'text-xs px-3 py-2 rounded-t-lg border-l-2 mb-1',
              isSent 
                ? 'bg-bubble-sent/80 border-primary-foreground/50 text-primary-foreground/80' 
                : 'bg-bubble-reply border-primary text-muted-foreground'
            )}
          >
            <p className="font-medium text-[10px] opacity-70">
              {message.reply_to.sender?.display_name}
            </p>
            <p className="line-clamp-1">
              {message.reply_to.content || '📎 Attachment'}
            </p>
          </div>
        )}

        {/* Bubble */}
        <div className={cn(
          'relative px-3 py-2',
          isSent ? 'bubble-sent' : 'bubble-received',
          message.reply_to && 'rounded-t-none'
        )}>
          {/* Important star */}
          {isImportant && (
            <Star className="absolute -top-2 -right-2 h-4 w-4 important-star fill-current" />
          )}

          {/* Attachment */}
          {message.attachment_url && (
            <div className="mb-2">
              {isImage ? (
                <img 
                  src={message.attachment_url} 
                  alt={message.attachment_name || 'Image'} 
                  className="rounded-lg max-w-full max-h-64 object-cover"
                />
              ) : isAudio ? (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-black/10">
                  <audio ref={audioRef} src={message.attachment_url} />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground"
                    onClick={toggleAudio}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </Button>
                  <div className="flex-1">
                    <div className="h-1 bg-black/20 rounded-full">
                      <div className="h-full w-1/3 bg-primary-foreground/70 rounded-full" />
                    </div>
                    <p className="text-xs mt-1 opacity-70">
                      {message.attachment_name}
                    </p>
                  </div>
                </div>
              ) : (
                <a 
                  href={message.attachment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <File className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {message.attachment_name}
                    </p>
                    <p className="text-xs opacity-70">
                      {message.attachment_size ? formatFileSize(message.attachment_size) : 'File'}
                    </p>
                  </div>
                  <Download className="h-5 w-5 opacity-70" />
                </a>
              )}
            </div>
          )}

          {/* Content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Timestamp */}
          <p className={cn(
            'text-[10px] mt-1 text-right',
            isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {format(new Date(message.created_at), 'HH:mm')}
          </p>
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={cn(
            'flex flex-wrap gap-1 mt-1',
            isSent ? 'justify-end' : 'justify-start'
          )}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="reaction-badge hover:scale-110 transition-transform"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-muted-foreground">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={cn(
        'flex items-center gap-1 opacity-0 transition-opacity',
        showActions && 'opacity-100'
      )}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Smile className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-1">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-xl hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isSent ? 'end' : 'start'}>
            <DropdownMenuItem onClick={() => onReply(message)} className="gap-2">
              <Reply className="h-4 w-4" />
              Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleImportant(message.id)} className="gap-2">
              <Star className={cn('h-4 w-4', isImportant && 'fill-important text-important')} />
              {isImportant ? 'Remove from Important' : 'Mark as Important'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => deleteMessage(message.id)} 
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
