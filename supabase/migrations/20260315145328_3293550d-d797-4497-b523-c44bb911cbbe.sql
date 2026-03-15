-- Fix user_streaks policies: scope to authenticated role only
DROP POLICY IF EXISTS "Users can view their own streak" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update their own streak" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can insert their own streak" ON public.user_streaks;

CREATE POLICY "Users can view their own streak" ON public.user_streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own streak" ON public.user_streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streak" ON public.user_streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);