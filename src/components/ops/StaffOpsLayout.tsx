import { Outlet, NavLink, useNavigate, useLocation, Navigate } from "react-router-dom";
import { getOpsScope } from "@/lib/opsScope";
import { useOpsAccess } from "@/hooks/useOpsAccess";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Calendar, Users, Mail, CheckSquare, ScrollText,
  LogOut, ArrowLeft, Loader2, Bell, GraduationCap, Menu, X, ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { to: "/staff/ops", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/staff/ops/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/staff/ops/training-schedule", label: "Training Schedule", icon: GraduationCap },
  { to: "/staff/ops/cohorts", label: "Cohorts", icon: Users },
  { to: "/staff/ops/calendar", label: "Calendar", icon: Calendar },
  { to: "/staff/ops/emails", label: "Communications", icon: Mail },
  { to: "/staff/ops/activity", label: "Activity", icon: ScrollText },
];

export default function StaffOpsLayout() {
  const { loading, user, isAdmin } = useOpsAccess();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const scope = getOpsScope(user?.email);

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

  // Ops-only people see just the Operations page.
  if (scope && location.pathname.replace(/\/+$/, "") !== "/staff/ops") {
    return <Navigate to="/staff/ops" replace />;
  }
  const navItems = scope ? [{ ...items[0], label: "Operations" }] : items;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/staff/login");
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/70 md:hidden" onClick={() => setMenuOpen(false)} />
      )}
      <aside
        className={`w-56 border-r border-border bg-card flex-col fixed inset-y-0 left-0 z-50 md:static md:flex ${
          menuOpen ? "flex" : "hidden"
        }`}
      >
        <div className="p-4 border-b border-border flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Delvetek</div>
            <div className="font-display font-bold text-lg">Operations Centre</div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden -mr-2" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground/80 hover:bg-secondary"
                }`
              }
            >
              <it.icon className="h-5 w-5" />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          {isAdmin && !scope && (
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate("/admin/dashboard")}>
              <ShieldCheck className="w-4 h-4 mr-2" /> Admin Portal
            </Button>
          )}
          {!scope && (
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate("/staff/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Staff Dashboard
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" className="md:hidden -ml-2" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="text-sm text-muted-foreground truncate">
              {scope ? `Cohort ${scope.cohorts.join(", ")}` : isAdmin ? "Admin" : "Staff"} · {user?.email}
            </div>
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
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet context={{ user, isAdmin, scope }} />
        </main>
      </div>
    </div>
  );
}
