import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const ADMIN_EMAILS = [
  "datadelve1@gmail.com",
  "goodydavis82@gmail.com",
  "adewoleaderemi2019@gmail.com",
];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: { full_name: string; email: string; student_status?: string } | null;
  isAdmin: boolean;
  isLoading: boolean;
  hasCommitted: boolean;
  isWithdrawn: boolean;
  signOut: () => Promise<void>;
  refreshCommitment: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  hasCommitted: false,
  isWithdrawn: false,
  signOut: async () => {},
  refreshCommitment: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; email: string; student_status?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCommitted, setHasCommitted] = useState(false);

  const fetchUserData = async (userId: string, email: string) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email, student_status")
      .eq("id", userId)
      .single();

    if (profileData) setProfile(profileData as any);

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const userIsAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
    setIsAdmin(userIsAdmin);

    // Admins are exempt from commitment requirement
    if (userIsAdmin || ADMIN_EMAILS.includes(email)) {
      setHasCommitted(true);
      return;
    }

    // Check commitment
    const { data: commitments } = await supabase
      .from("training_commitments")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (commitments?.length) {
      setHasCommitted(true);
      return;
    }

    // Also check by email if no user_id match (legacy submissions)
    const { data: legacyCommitments } = await supabase
      .from("training_commitments")
      .select("id")
      .eq("email", email)
      .limit(1);
    if (legacyCommitments?.length) {
      setHasCommitted(true);
      return;
    }

    // Cohort 2 students accept commitment as part of enrollment — treat as committed
    const { data: enrollments } = await supabase
      .from("cohort2_enrollments")
      .select("id")
      .or(`user_id.eq.${userId},email.eq.${email}`)
      .eq("commitment_accepted", true)
      .limit(1);
    setHasCommitted(!!enrollments?.length);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock, but await fetchUserData
          setTimeout(async () => {
            await fetchUserData(session.user.id, session.user.email ?? "");
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setHasCommitted(false);
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email ?? "").then(() =>
          setIsLoading(false)
        );
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshCommitment = async () => {
    if (user) {
      if (isAdmin || ADMIN_EMAILS.includes(user.email ?? "")) {
        setHasCommitted(true);
        return;
      }
      const { data } = await supabase
        .from("training_commitments")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      if (!data?.length && user.email) {
        const { data: legacy } = await supabase
          .from("training_commitments")
          .select("id")
          .eq("email", user.email)
          .limit(1);
        setHasCommitted(!!legacy?.length);
      } else {
        setHasCommitted(!!data?.length);
      }
    }
  };

  const isWithdrawn = profile?.student_status === "withdrawn";

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isAdmin, isLoading, hasCommitted, isWithdrawn, signOut, refreshCommitment }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export { ADMIN_EMAILS };
