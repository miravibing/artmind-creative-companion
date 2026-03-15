-- Fix challenge_bookmarks policies
DROP POLICY IF EXISTS "Users can bookmark" ON public.challenge_bookmarks;
DROP POLICY IF EXISTS "Users can remove bookmark" ON public.challenge_bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.challenge_bookmarks;
CREATE POLICY "Users can bookmark" ON public.challenge_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmark" ON public.challenge_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own bookmarks" ON public.challenge_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fix challenge_comments policies
DROP POLICY IF EXISTS "Anyone authenticated can view comments" ON public.challenge_comments;
DROP POLICY IF EXISTS "Users can comment" ON public.challenge_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.challenge_comments;
CREATE POLICY "Anyone authenticated can view comments" ON public.challenge_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can comment" ON public.challenge_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.challenge_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix challenge_likes policies
DROP POLICY IF EXISTS "Anyone authenticated can view likes" ON public.challenge_likes;
DROP POLICY IF EXISTS "Users can like" ON public.challenge_likes;
DROP POLICY IF EXISTS "Users can unlike" ON public.challenge_likes;
CREATE POLICY "Anyone authenticated can view likes" ON public.challenge_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like" ON public.challenge_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.challenge_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix challenge_participants policies
DROP POLICY IF EXISTS "Anyone authenticated can view participants" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can participate" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can leave" ON public.challenge_participants;
CREATE POLICY "Anyone authenticated can view participants" ON public.challenge_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can participate" ON public.challenge_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave" ON public.challenge_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix challenges policies
DROP POLICY IF EXISTS "Anyone authenticated can view challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can create their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON public.challenges;
CREATE POLICY "Anyone authenticated can view challenges" ON public.challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create their own challenges" ON public.challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenges" ON public.challenges FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own challenges" ON public.challenges FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix habit_completions policies (some were missed)
DROP POLICY IF EXISTS "Users can view their own completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can delete their own completions" ON public.habit_completions;
CREATE POLICY "Users can view their own completions" ON public.habit_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completions" ON public.habit_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completions" ON public.habit_completions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix habits policies
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can insert their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;
CREATE POLICY "Users can view their own habits" ON public.habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits" ON public.habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON public.habits FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON public.habits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix mood_entries policies
DROP POLICY IF EXISTS "Users can view their own moods" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can insert their own moods" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can update their own moods" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can delete their own moods" ON public.mood_entries;
CREATE POLICY "Users can view their own moods" ON public.mood_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own moods" ON public.mood_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own moods" ON public.mood_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own moods" ON public.mood_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix profiles policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Fix prompt_favorites policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.prompt_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.prompt_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.prompt_favorites;
CREATE POLICY "Users can view their own favorites" ON public.prompt_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.prompt_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.prompt_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);