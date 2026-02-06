import { useState, useRef } from 'react';
import { Paperclip, Mic, Send, X, Square, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatContext } from '@/contexts/ChatContext';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatInputProps {
  replyTo: Message | null;
  onCancelReply: () => void;
}

export const ChatInput = ({ replyTo, onCancelReply }: ChatInputProps) => {
  const { sendMessage } = useChatContext();
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = async () => {
    if (!message.trim() && !attachment) return;

    await sendMessage(message, replyTo?.id, attachment || undefined);
    setMessage('');
    setAttachment(null);
    onCancelReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (type: 'image' | 'file') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '*/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setAttachment(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setAttachment(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAttachment(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.info('Recording cancelled');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-card border-t">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-lg animate-fade-in">
          <div className="w-1 h-10 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">
              Replying to {replyTo.sender?.display_name}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {replyTo.content || '📎 Attachment'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancelReply}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-lg animate-fade-in">
          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
            {attachment.type.startsWith('image/') ? (
              <Image className="h-5 w-5 text-primary" />
            ) : attachment.type.startsWith('audio/') ? (
              <Mic className="h-5 w-5 text-primary" />
            ) : (
              <FileText className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">
              {(attachment.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setAttachment(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {isRecording ? (
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-destructive/10 rounded-full animate-fade-in">
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-destructive recording-pulse" />
            </div>
            <span className="text-destructive font-medium">{formatTime(recordingTime)}</span>
            <div className="flex-1" />
            <Button variant="ghost" size="icon" onClick={cancelRecording}>
              <X className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="rounded-full bg-destructive hover:bg-destructive/90"
              onClick={stopRecording}
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          </div>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleFileSelect('image')} className="gap-2">
                  <Image className="h-4 w-4" />
                  Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileSelect('file')} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 min-h-[44px] max-h-32 resize-none rounded-2xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
              rows={1}
            />

            {message.trim() || attachment ? (
              <Button 
                size="icon" 
                className="shrink-0 rounded-full bg-primary hover:bg-primary/90"
                onClick={handleSend}
              >
                <Send className="h-5 w-5" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                onClick={startRecording}
              >
                <Mic className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
