import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import {
  LogOut,
  Users,
  BarChart3,
  Video,
  FileText,
  Award,
  Bell,
  GraduationCap,
  Loader2,
  LayoutDashboard,
  Database,
  FileVideo,
  MessageSquare,
} from "lucide-react";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";

const navItems = [
  { title: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Student Tracking", url: "/admin/students", icon: Users },
  { title: "Weekly Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Review Questions", url: "/admin/review-questions", icon: MessageSquare },
  { title: "Video Management", url: "/admin/videos", icon: Video },
  { title: "Student Videos", url: "/admin/student-videos", icon: FileVideo },
  { title: "Assignments", url: "/admin/assignments", icon: FileText },
  { title: "Datasets", url: "/admin/datasets", icon: Database },
  { title: "Certificates", url: "/admin/certificates", icon: GraduationCap },
  { title: "Ambassadors", url: "/admin/ambassadors", icon: Award },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 flex items-center gap-3">
          <img src={delvetekLogo} alt="Delvetek" className="h-8 w-8 rounded-lg shrink-0" />
          {!collapsed && (
            <span className="font-display font-bold text-sm text-sidebar-foreground">
              Admin Portal
            </span>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <SidebarTrigger className="text-foreground" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {profile?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
