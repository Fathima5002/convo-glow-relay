import { ChatProvider } from '@/contexts/ChatContext';
import { ChatView } from '@/components/chat/ChatView';
import { UserSwitcher } from '@/components/chat/UserSwitcher';

const Index = () => {
  return (
    <ChatProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-80 flex-col bg-card border-r">
          <UserSwitcher />
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="font-semibold text-lg mb-2">ChatterBox</h2>
            <p className="text-sm text-muted-foreground">
              WhatsApp-style messaging between Yass and Aishu
            </p>
            <div className="mt-6 space-y-2 text-xs text-muted-foreground">
              <p>✨ Real-time messaging</p>
              <p>⭐ Important messages vault</p>
              <p>💬 Reply to messages</p>
              <p>😊 Emoji reactions</p>
              <p>📎 File attachments</p>
              <p>🎙 Voice recording</p>
            </div>
          </div>
        </aside>

        {/* Mobile user switcher */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40">
          <UserSwitcher />
        </div>

        {/* Chat area */}
        <main className="flex-1 md:mt-0 mt-[73px]">
          <ChatView />
        </main>
      </div>
    </ChatProvider>
  );
};

export default Index;
