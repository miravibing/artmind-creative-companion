import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LoginStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  loading: boolean;
}

export function useLoginStreak(): LoginStreak {
  const { user } = useAuth();
  const [streak, setStreak] = useState<LoginStreak>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setStreak({ currentStreak: 0, longestStreak: 0, lastLoginDate: null, loading: false });
      return;
    }

    const updateStreak = async () => {
      const { data, error } = await supabase.rpc("update_login_streak", {
        p_user_id: user.id,
      });

      if (error) {
        console.error("Error updating login streak:", error);
        setStreak((s) => ({ ...s, loading: false }));
        return;
      }

      if (data && data.length > 0) {
        const row = data[0];
        setStreak({
          currentStreak: row.current_streak,
          longestStreak: row.longest_streak,
          lastLoginDate: row.last_login_date,
          loading: false,
        });
      }
    };

    updateStreak();
  }, [user]);

  return streak;
}
