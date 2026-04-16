import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface StaffProfile {
  id: string;
  user_id: string;
  email: string;
  salary: number;
  has_onboarded: boolean;
  must_change_password: boolean;
}

export const useStaffAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/staff/login"); setLoading(false); return; }

      setUser(session.user);

      const { data: profile } = await supabase
        .from("staff_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!profile) { navigate("/staff/login"); setLoading(false); return; }

      setStaffProfile(profile as StaffProfile);

      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      setIsAdmin(roles?.some((r: any) => r.role === "admin") ?? false);

      if (profile.must_change_password) navigate("/staff/change-password");
      else if (!profile.has_onboarded) navigate("/staff/onboarding");

      setLoading(false);
    };
    init();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/staff/login");
  };

  return { user, staffProfile, isAdmin, loading, signOut };
};
