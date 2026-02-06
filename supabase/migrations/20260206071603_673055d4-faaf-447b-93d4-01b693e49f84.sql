-- Create users table for fixed users
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT,
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    attachment_url TEXT,
    attachment_type TEXT,
    attachment_name TEXT,
    attachment_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reactions table (shared between users)
CREATE TABLE public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Create per-user message states
CREATE TABLE public.message_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_important BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Enable RLS on all tables (with public access for this demo)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_states ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for demo (no auth required)
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update messages" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "Public delete messages" ON public.messages FOR DELETE USING (true);

CREATE POLICY "Public read reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Public insert reactions" ON public.reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete reactions" ON public.reactions FOR DELETE USING (true);

CREATE POLICY "Public read message_states" ON public.message_states FOR SELECT USING (true);
CREATE POLICY "Public insert message_states" ON public.message_states FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update message_states" ON public.message_states FOR UPDATE USING (true);

-- Insert the two fixed users
INSERT INTO public.users (username, display_name, avatar_url) VALUES
('yass', 'Yass', NULL),
('aishu', 'Aishu', NULL);

-- Enable realtime for messages and reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_states;

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- Storage policies
CREATE POLICY "Public read attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Public insert attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "Public delete attachments" ON storage.objects FOR DELETE USING (bucket_id = 'attachments');