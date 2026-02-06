import { Phone, Video, MoreVertical, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useChatContext } from '@/contexts/ChatContext';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChatHeaderProps {
  onOpenVault: () => void;
}

export const ChatHeader = ({ onOpenVault }: ChatHeaderProps) => {
  const { otherUser, clearChat } = useChatContext();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');

  const handleCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setShowCallDialog(true);
  };

  const handleClearChat = async (saveImportant: boolean) => {
    await clearChat(saveImportant);
    setShowClearDialog(false);
  };

  return (
    <>
      <header className="flex items-center gap-3 px-4 py-3 bg-card border-b shadow-sm">
        <Button variant="ghost" size="icon" className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {otherUser?.display_name?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-foreground truncate">
            {otherUser?.display_name || 'Loading...'}
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-online" />
            Online
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleCall('video')}
            className="text-muted-foreground hover:text-primary"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleCall('voice')}
            className="text-muted-foreground hover:text-primary"
          >
            <Phone className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onOpenVault} className="gap-2">
                <Star className="h-4 w-4" />
                Important Messages
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowClearDialog(true)}
                className="text-destructive focus:text-destructive gap-2"
              >
                Clear Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Clear Chat Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all messages from your view. The other user's chat will remain unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleClearChat(true)}
              className="bg-primary"
            >
              Keep Important
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => handleClearChat(false)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Call Dialog */}
      <AlertDialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {callType === 'video' ? 'Video' : 'Voice'} Call
            </AlertDialogTitle>
            <AlertDialogDescription>
              {callType === 'video' ? 'Video' : 'Voice'} calling requires WebRTC implementation. 
              This feature would need real-time peer-to-peer connection setup with STUN/TURN servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
