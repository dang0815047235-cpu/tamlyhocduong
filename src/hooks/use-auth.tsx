import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = { id: string; display_name: string; class_name: string | null };

type AuthValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: "student" | "teacher" | null;
  isAdmin: boolean;
  pendingTeacher: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  profile: null,
  role: null,
  isAdmin: false,
  pendingTeacher: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingTeacher, setPendingTeacher] = useState(false);


  useEffect(() => {
    let active = true;

    const loadDetails = async (userId: string) => {
      const [{ data: p }, { data: r }, { data: req }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, class_name").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("teacher_requests").select("status").eq("user_id", userId).maybeSingle(),
      ]);
      if (!active) return;
      const roles = (r ?? []).map((x) => x.role as string);
      setProfile((p as Profile) ?? null);
      setIsAdmin(roles.includes("admin"));
      setPendingTeacher(!roles.includes("teacher") && req?.status === "pending");
      setRole(roles.includes("teacher") ? "teacher" : "student");
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void loadDetails(nextSession.user.id);
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) void loadDetails(data.session.user.id);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AuthValue = {
    user: session?.user ?? null,
    session,
    profile,
    role,
    isAdmin,
    pendingTeacher,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
