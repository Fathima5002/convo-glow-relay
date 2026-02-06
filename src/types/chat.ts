export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  reply_to_id: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
  attachment_size: number | null;
  created_at: string;
  sender?: User;
  reply_to?: Message | null;
  reactions?: Reaction[];
  state?: MessageState | null;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface MessageState {
  id: string;
  message_id: string;
  user_id: string;
  is_important: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface ChatContextType {
  currentUser: User | null;
  otherUser: User | null;
  messages: Message[];
  loading: boolean;
  sendMessage: (content: string, replyToId?: string, attachment?: File) => Promise<void>;
  toggleImportant: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  clearChat: (saveImportant: boolean) => Promise<void>;
  switchUser: (username: string) => void;
}
