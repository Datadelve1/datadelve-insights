import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useOpsAccess } from "@/hooks/useOpsAccess";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Calendar, Users, Mail, CheckSquare, ScrollText,
  LogOut, ArrowLeft, Loader2, Bell, GraduationCap,
} from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { to: "/staff/ops", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/staff/ops/calendar", label: "Calendar", icon: Calendar },
  { to: "/staff/ops/training-schedule", label: "Training Schedule", icon: GraduationCap },
  { to: "/staff/ops/cohorts", label: "Cohorts", icon: Users },
];

export default function StaffOpsLayout() {
  const { loading, user, isAdmin } = useOpsAccess();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count } = await supabase
        .from("ops_notifications")
        .select("*", { count: "exact", head: true })
        .is("read_at", null)
        .or(`user_id.eq.${user.id},user_id.is.null`);
      setNotifCount(count || 0);
    })();
  }, [user]);

  useEffect(() => {
    document.title = "Delvetek Ops Centre — Internal Control Panel";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/staff/login");
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <aside className="w-56 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="text-xs text-muted-foreground">Delvetek</div>
          <div className="font-display font-bold text-lg">Operations Centre</div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground/80 hover:bg-secondary"
                }`
              }
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate("/staff/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Staff Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isAdmin ? "Admin" : "Staff"} · {user?.email}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet context={{ user, isAdmin }} />
        </main>
      </div>
    </div>
  );
}
