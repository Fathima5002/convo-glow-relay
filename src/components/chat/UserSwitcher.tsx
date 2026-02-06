import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User } from 'lucide-react';

export const UserSwitcher = () => {
  const { currentUser, switchUser } = useChatContext();

  return (
    <div className="p-4 bg-primary">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between text-primary-foreground hover:bg-primary-foreground/10"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-primary-foreground/20">
                <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
                  {currentUser?.display_name?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold">{currentUser?.display_name || 'Loading...'}</p>
                <p className="text-xs text-primary-foreground/70">@{currentUser?.username}</p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-primary-foreground/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={() => switchUser('yass')} className="gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">Y</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Yass</p>
              <p className="text-xs text-muted-foreground">@yass</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchUser('aishu')} className="gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">A</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Aishu</p>
              <p className="text-xs text-muted-foreground">@aishu</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
