import { getOpsScope } from "@/lib/opsScope";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { LogOut, Loader2, ShieldCheck } from "lucide-react";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";
import { AdminCohortProvider, useAdminCohort, ADMIN_COHORTS, type Cohort } from "@/contexts/AdminCohortContext";
import { adminNavFor, findAdminNavItem } from "@/lib/adminNav";

function AdminSidebar({ userEmail }: { userEmail?: string | null }) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const groups = adminNavFor(userEmail);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 flex items-center gap-3">
          <img src={delvetekLogo} alt="Delvetek" className="h-9 w-9 rounded-lg shrink-0" />
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display font-bold text-sidebar-foreground">Delvetek</div>
              <div className="text-xs text-muted-foreground">Admin portal</div>
            </div>
          )}
        </div>
        {groups.map((g) => (
          <SidebarGroup key={g.label} className="py-1">
            {!collapsed && <SidebarGroupLabel className="uppercase tracking-wide">{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={item.title} className="h-10 text-[15px]">
                      <NavLink
                        to={item.url}
                        end
                        onClick={() => isMobile && setOpenMobile(false)}
                        className="hover:bg-sidebar-accent/60"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

function CohortSelector() {
  const { cohort, setCohort } = useAdminCohort();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden md:inline">Showing</span>
      <Select value={cohort} onValueChange={(v) => setCohort(v as Cohort)}>
        <SelectTrigger className="w-32 h-9 bg-secondary border-border font-medium" aria-label="Cohort">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ADMIN_COHORTS.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PageTitle() {
  const location = useLocation();
  const item = findAdminNavItem(location.pathname);
  if (!item) return null;
  return (
    <div className="min-w-0 hidden sm:block">
      <div className="font-display font-semibold leading-tight truncate">{item.title}</div>
      <div className="text-xs text-muted-foreground truncate hidden lg:block">{item.description}</div>
    </div>
  );
}

const AdminLayout = () => {
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return <Navigate to="/admin" replace />;
  if (getOpsScope(user.email)) return <Navigate to="/staff/ops" replace />;

  return (
    <AdminCohortProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar userEmail={user.email} />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 flex items-center justify-between gap-3 border-b border-border bg-card px-4">
              <div className="flex items-center gap-3 min-w-0">
                <SidebarTrigger className="text-foreground" />
                <PageTitle />
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <CohortSelector />
                <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={() => window.location.assign("/staff/ops")}>
                  <ShieldCheck className="w-4 h-4 mr-2" /> Operations Centre
                </Button>
                <span className="text-sm text-muted-foreground hidden xl:block max-w-40 truncate">
                  {profile?.full_name || user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
                  <LogOut className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminCohortProvider>
  );
};

export default AdminLayout;
