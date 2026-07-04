import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface OpsAccess {
  loading: boolean;
  user: User | null;
  isStaff: boolean;
  isAdmin: boolean;
}

export function useOpsAccess(): OpsAccess {
  const [state, setState] = useState<OpsAccess>({
    loading: true, user: null, isStaff: false, isAdmin: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/staff/login"); return; }
      const user = session.user;

      const [{ data: staff }, { data: roles }] = await Promise.all([
        supabase.from("staff_profiles").select("id").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);

      const isAdmin = (roles || []).some((r: any) => r.role === "admin");
      const isStaff = !!staff || isAdmin;

      if (!isStaff) { navigate("/dashboard"); return; }
      if (!cancel) setState({ loading: false, user, isStaff, isAdmin });
    })();
    return () => { cancel = true; };
  }, [navigate]);

  return state;
}
