
-- Challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  tags TEXT[] DEFAULT '{}',
  deadline TIMESTAMPTZ,
  cover_image_url TEXT,
  season TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view challenges"
  ON public.challenges FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create their own challenges"
  ON public.challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON public.challenges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges"
  ON public.challenges FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Likes
CREATE TABLE public.challenge_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view likes"
  ON public.challenge_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can like"
  ON public.challenge_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON public.challenge_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Bookmarks
CREATE TABLE public.challenge_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON public.challenge_bookmarks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark"
  ON public.challenge_bookmarks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove bookmark"
  ON public.challenge_bookmarks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Participants
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view participants"
  ON public.challenge_participants FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can participate"
  ON public.challenge_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave"
  ON public.challenge_participants FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Comments
CREATE TABLE public.challenge_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view comments"
  ON public.challenge_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can comment"
  ON public.challenge_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.challenge_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Storage bucket for cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('challenge-covers', 'challenge-covers', true);

CREATE POLICY "Anyone can view challenge covers"
  ON storage.objects FOR SELECT USING (bucket_id = 'challenge-covers');

CREATE POLICY "Authenticated users can upload challenge covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'challenge-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own challenge covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'challenge-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own challenge covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'challenge-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
