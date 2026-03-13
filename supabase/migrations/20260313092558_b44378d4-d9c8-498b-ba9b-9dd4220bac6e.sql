CREATE OR REPLACE FUNCTION public.update_login_streak(p_user_id uuid)
 RETURNS TABLE(current_streak integer, longest_streak integer, last_login_date date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_last_login date;
  v_current_streak integer;
  v_longest_streak integer;
  v_today date := CURRENT_DATE;
BEGIN
  -- Authorization: ensure caller can only update their own streak
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Get existing streak record
  SELECT us.last_login_date, us.current_streak, us.longest_streak
  INTO v_last_login, v_current_streak, v_longest_streak
  FROM public.user_streaks us
  WHERE us.user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_login_date)
    VALUES (p_user_id, 1, 1, v_today);
    RETURN QUERY SELECT 1, 1, v_today;
    RETURN;
  END IF;

  IF v_last_login = v_today THEN
    RETURN QUERY SELECT v_current_streak, v_longest_streak, v_last_login;
    RETURN;
  END IF;

  IF v_last_login = v_today - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  ELSE
    v_current_streak := 1;
  END IF;

  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  UPDATE public.user_streaks us
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_login_date = v_today,
      updated_at = now()
  WHERE us.user_id = p_user_id;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_today;
END;
$function$;