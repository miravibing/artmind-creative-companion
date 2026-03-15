
-- Fix habits policies: drop public-role policies, recreate as authenticated
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can insert their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;

CREATE POLICY "Users can view their own habits" ON public.habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits" ON public.habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON public.habits FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON public.habits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix habit_completions policies
DROP POLICY IF EXISTS "Users can view their own completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can delete their own completions" ON public.habit_completions;

CREATE POLICY "Users can view their own completions" ON public.habit_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completions" ON public.habit_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completions" ON public.habit_completions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix mood_entries policies
DROP POLICY IF EXISTS "Users can view their own moods" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can insert their own moods" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can update their own moods" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can delete their own moods" ON public.mood_entries;

CREATE POLICY "Users can view their own moods" ON public.mood_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own moods" ON public.mood_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own moods" ON public.mood_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own moods" ON public.mood_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix prompt_favorites policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.prompt_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.prompt_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.prompt_favorites;

CREATE POLICY "Users can view their own favorites" ON public.prompt_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.prompt_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.prompt_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);
