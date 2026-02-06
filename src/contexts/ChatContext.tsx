import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Message, Reaction, MessageState, ChatContextType } from '@/types/chat';
import { toast } from 'sonner';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const otherUser = users.find(u => u.id !== currentUser?.id) || null;

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username');
      
      if (error) {
        toast.error('Failed to load users');
        return;
      }

      setUsers(data as User[]);
      // Default to first user (yass)
      if (data.length > 0) {
        const savedUser = localStorage.getItem('currentUser');
        const user = data.find(u => u.username === savedUser) || data[0];
        setCurrentUser(user as User);
      }
    };

    fetchUsers();
  }, []);

  // Fetch messages with relations
  const fetchMessages = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    
    // Fetch messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (messagesError) {
      toast.error('Failed to load messages');
      setLoading(false);
      return;
    }

    // Fetch reactions
    const { data: reactionsData } = await supabase
      .from('reactions')
      .select('*');

    // Fetch message states for current user
    const { data: statesData } = await supabase
      .from('message_states')
      .select('*')
      .eq('user_id', currentUser.id);

    // Combine data
    const enrichedMessages: Message[] = (messagesData || []).map(msg => {
      const sender = users.find(u => u.id === msg.sender_id);
      const replyTo = msg.reply_to_id 
        ? messagesData?.find(m => m.id === msg.reply_to_id) 
        : null;
      const reactions = (reactionsData || []).filter(r => r.message_id === msg.id);
      const state = (statesData || []).find(s => s.message_id === msg.id);

      return {
        ...msg,
        sender,
        reply_to: replyTo ? {
          ...replyTo,
          sender: users.find(u => u.id === replyTo.sender_id)
        } : null,
        reactions: reactions as Reaction[],
        state: state as MessageState | null
      };
    });

    // Filter out deleted messages for current user
    const visibleMessages = enrichedMessages.filter(m => !m.state?.is_deleted);
    setMessages(visibleMessages);
    setLoading(false);
  }, [currentUser, users]);

  useEffect(() => {
    if (currentUser && users.length > 0) {
      fetchMessages();
    }
  }, [currentUser, users, fetchMessages]);

  // Real-time subscriptions
  useEffect(() => {
    if (!currentUser) return;

    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    const reactionsChannel = supabase
      .channel('reactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
        fetchMessages();
      })
      .subscribe();

    const statesChannel = supabase
      .channel('states-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_states' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(statesChannel);
    };
  }, [currentUser, fetchMessages]);

  const sendMessage = async (content: string, replyToId?: string, attachment?: File) => {
    if (!currentUser) return;

    let attachmentUrl: string | null = null;
    let attachmentType: string | null = null;
    let attachmentName: string | null = null;
    let attachmentSize: number | null = null;

    if (attachment) {
      const fileExt = attachment.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(fileName, attachment);

      if (uploadError) {
        toast.error('Failed to upload attachment');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);

      attachmentUrl = urlData.publicUrl;
      attachmentType = attachment.type;
      attachmentName = attachment.name;
      attachmentSize = attachment.size;
    }

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      content: content || null,
      reply_to_id: replyToId || null,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      attachment_name: attachmentName,
      attachment_size: attachmentSize
    });

    if (error) {
      toast.error('Failed to send message');
    }
  };

  const toggleImportant = async (messageId: string) => {
    if (!currentUser) return;

    const existingState = messages.find(m => m.id === messageId)?.state;

    if (existingState) {
      await supabase
        .from('message_states')
        .update({ is_important: !existingState.is_important })
        .eq('id', existingState.id);
    } else {
      await supabase.from('message_states').insert({
        message_id: messageId,
        user_id: currentUser.id,
        is_important: true,
        is_deleted: false
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentUser) return;

    const existingState = messages.find(m => m.id === messageId)?.state;

    if (existingState) {
      await supabase
        .from('message_states')
        .update({ is_deleted: true })
        .eq('id', existingState.id);
    } else {
      await supabase.from('message_states').insert({
        message_id: messageId,
        user_id: currentUser.id,
        is_important: false,
        is_deleted: true
      });
    }

    toast.success('Message deleted');
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    const { error } = await supabase.from('reactions').insert({
      message_id: messageId,
      user_id: currentUser.id,
      emoji
    });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      toast.error('Failed to add reaction');
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    await supabase
      .from('reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', currentUser.id)
      .eq('emoji', emoji);
  };

  const clearChat = async (saveImportant: boolean) => {
    if (!currentUser) return;

    const messagesToDelete = messages.filter(m => 
      saveImportant ? !m.state?.is_important : true
    );

    for (const msg of messagesToDelete) {
      const existingState = msg.state;

      if (existingState) {
        await supabase
          .from('message_states')
          .update({ is_deleted: true })
          .eq('id', existingState.id);
      } else {
        await supabase.from('message_states').insert({
          message_id: msg.id,
          user_id: currentUser.id,
          is_important: false,
          is_deleted: true
        });
      }
    }

    toast.success('Chat cleared');
  };

  const switchUser = (username: string) => {
    const user = users.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', username);
      toast.success(`Switched to ${user.display_name}`);
    }
  };

  return (
    <ChatContext.Provider value={{
      currentUser,
      otherUser,
      messages,
      loading,
      sendMessage,
      toggleImportant,
      deleteMessage,
      addReaction,
      removeReaction,
      clearChat,
      switchUser
    }}>
      {children}
    </ChatContext.Provider>
  );
};
