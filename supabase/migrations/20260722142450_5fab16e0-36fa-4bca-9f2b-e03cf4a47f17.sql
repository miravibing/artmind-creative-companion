
DROP POLICY IF EXISTS "Anyone authenticated can view likes" ON public.challenge_likes;
CREATE POLICY "Users can view their own likes"
  ON public.challenge_likes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_challenge_like_counts(challenge_ids uuid[])
RETURNS TABLE(challenge_id uuid, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT challenge_id, COUNT(*)::bigint
  FROM public.challenge_likes
  WHERE challenge_id = ANY(challenge_ids)
  GROUP BY challenge_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_challenge_like_counts(uuid[]) TO authenticated;
