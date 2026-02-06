import { X, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

interface ImportantVaultProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportantVault = ({ isOpen, onClose }: ImportantVaultProps) => {
  const { messages, currentUser, toggleImportant } = useChatContext();
  
  const importantMessages = messages.filter(m => m.state?.is_important);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-md bg-card border-l shadow-xl",
          "animate-slide-in-right"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-important fill-important" />
              Important Messages
            </h2>
            <p className="text-xs text-muted-foreground">
              {importantMessages.length} message{importantMessages.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[calc(100vh-73px)]">
          {importantMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-medium text-foreground mb-1">No important messages</h3>
              <p className="text-sm text-muted-foreground">
                Mark messages as important to save them here
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {importantMessages.map(message => {
                const isSent = message.sender_id === currentUser?.id;

                return (
                  <div 
                    key={message.id}
                    className="p-4 bg-muted rounded-lg animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {message.sender?.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), 'MMM d, yyyy · HH:mm')}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => toggleImportant(message.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {message.attachment_url && (
                      <div className="mb-2">
                        {message.attachment_type?.startsWith('image/') ? (
                          <img 
                            src={message.attachment_url}
                            alt={message.attachment_name || 'Image'}
                            className="rounded-lg max-h-32 object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-card rounded">
                            <span className="text-sm">📎 {message.attachment_name}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
