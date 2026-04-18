import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Eye, Check, X, LogOut, Clock, AlertTriangle } from "lucide-react";

interface StaffMember {
  user_id: string;
  email: string;
  full_name: string;
  salary: number;
  status: string;
  sessionTime: number;
  todayHours: number;
  weekHours: number;
}

const StaffAdminDashboard = () => {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const isSuperAdmin = user?.email === "datadelve1@gmail.com";
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [staffDetail, setStaffDetail] = useState<any>(null);
  const [idlePeriods, setIdlePeriods] = useState<any[]>([]);
  const [pendingIdle, setPendingIdle] = useState<any[]>([]);

  const loadStaffList = useCallback(async () => {
    const { data: profiles } = await supabase
      .from("staff_profiles")
      .select("*");

    if (!profiles) return;

    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const enriched: StaffMember[] = [];

    for (const p of profiles) {
      // Get current session
      const { data: activeSession } = await supabase
        .from("time_sessions")
        .select("*")
        .eq("user_id", p.user_id)
        .in("status", ["active", "idle"])
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let currentStatus = "offline";
      let sessionTime = 0;
      if (activeSession) {
        currentStatus = activeSession.status;
        sessionTime = Math.floor((Date.now() - new Date(activeSession.started_at).getTime()) / 1000);
      }

      // Get completed sessions this week
      const { data: sessions } = await supabase
        .from("time_sessions")
        .select("started_at, ended_at")
        .eq("user_id", p.user_id)
        .eq("status", "offline")
        .gte("started_at", weekStart.toISOString());

      let todayHours = 0;
      let weekHours = 0;
      sessions?.forEach((s: any) => {
        const start = new Date(s.started_at);
        const end = new Date(s.ended_at);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        weekHours += hours;
        if (start >= todayStart) todayHours += hours;
      });

      enriched.push({
        user_id: p.user_id,
        email: p.email,
        full_name: p.full_name || p.email,
        salary: p.salary,
        status: currentStatus,
        sessionTime,
        todayHours: Math.max(0, todayHours),
        weekHours: Math.max(0, weekHours),
      });
    }

    setStaffList(enriched);
    setLoading(false);
  }, []);

  const loadPendingIdle = useCallback(async () => {
    const { data } = await supabase
      .from("idle_periods")
      .select("*")
      .eq("idle_type", "management_delay")
      .is("admin_approved", null)
      .order("started_at", { ascending: false });
    setPendingIdle(data || []);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isSuperAdmin) return;
    loadStaffList();
    loadPendingIdle();

    // Realtime subscriptions
    const channel = supabase
      .channel("admin-staff-monitor")
      .on("postgres_changes", { event: "*", schema: "public", table: "time_sessions" }, () => loadStaffList())
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, () => {
        if (selectedStaff) loadStaffDetail(selectedStaff);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "idle_periods" }, () => {
        loadPendingIdle();
        loadStaffList();
      })
      .subscribe();

    const interval = setInterval(loadStaffList, 30000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [authLoading, isSuperAdmin, loadStaffList, loadPendingIdle, selectedStaff]);

  const loadStaffDetail = async (userId: string) => {
    setSelectedStaff(userId);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [activitiesRes, sessionsRes, idleRes] = await Promise.all([
      supabase.from("activity_logs").select("*").eq("user_id", userId).gte("logged_at", today.toISOString()).order("logged_at", { ascending: true }),
      supabase.from("time_sessions").select("*").eq("user_id", userId).gte("started_at", today.toISOString()).order("started_at", { ascending: true }),
      supabase.from("idle_periods").select("*").eq("user_id", userId).gte("started_at", today.toISOString()).order("started_at", { ascending: true }),
    ]);

    const staff = staffList.find(s => s.user_id === userId);
    setStaffDetail({
      email: staff?.email,
      activities: activitiesRes.data || [],
      sessions: sessionsRes.data || [],
      idlePeriods: idleRes.data || [],
    });
    setIdlePeriods(idleRes.data || []);
  };

  const handleApproveIdle = async (id: string, approved: boolean) => {
    await supabase
      .from("idle_periods")
      .update({ admin_approved: approved, approved_by: user?.id })
      .eq("id", id);
    toast.success(approved ? "Idle time approved" : "Idle time rejected");
    loadPendingIdle();
    if (selectedStaff) loadStaffDetail(selectedStaff);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatLogTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const statusColor = (s: string) => {
    if (s === "active") return "default";
    if (s === "idle") return "secondary";
    return "outline";
  };

  if (authLoading || loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;

  if (!isSuperAdmin) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Access Denied — Super admin only</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Staff Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Monitor staff activity in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = "/admin/dashboard"}>Admin Home</Button>
        </div>
      </div>

      {/* Pending Idle Approvals */}
      {pendingIdle.length > 0 && (
        <Card className="border-yellow-500/30 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="w-4 h-4" /> Pending Idle Approvals ({pendingIdle.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingIdle.map((ip) => {
                const staff = staffList.find(s => s.user_id === ip.user_id);
                const duration = ip.ended_at
                  ? Math.floor((new Date(ip.ended_at).getTime() - new Date(ip.started_at).getTime()) / 1000)
                  : Math.floor((Date.now() - new Date(ip.started_at).getTime()) / 1000);
                return (
                  <div key={ip.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <span className="text-sm font-medium text-foreground">{staff?.full_name || staff?.email || ip.user_id}</span>
                      <p className="text-xs text-muted-foreground">
                        {ip.reason} — {formatTime(duration)} {ip.flagged && <Badge variant="destructive" className="ml-1 text-xs">Flagged</Badge>}
                      </p>
                      {ip.description && <p className="text-xs text-muted-foreground mt-1">{ip.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" onClick={() => handleApproveIdle(ip.id, true)}>
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleApproveIdle(ip.id, false)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> All Staff ({staffList.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Today</TableHead>
                <TableHead>Week</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((s) => (
                <TableRow key={s.user_id}>
                  <TableCell className="text-sm">
                    <div>{s.full_name}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(s.status)} className="capitalize">{s.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {s.status !== "offline" ? formatTime(s.sessionTime) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{s.todayHours.toFixed(1)}h</TableCell>
                  <TableCell className="text-sm">{s.weekHours.toFixed(1)}h</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => loadStaffDetail(s.user_id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Staff Detail Dialog */}
      <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" /> {staffDetail?.email} — Today's Detail
            </DialogTitle>
          </DialogHeader>
          {staffDetail && (
            <div className="space-y-4">
              {/* Sessions */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Sessions
                </h3>
                {staffDetail.sessions.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm py-1 border-b border-border">
                    <Badge variant={statusColor(s.status)} className="capitalize text-xs">{s.status}</Badge>
                    <span className="font-mono text-muted-foreground">
                      {formatLogTime(s.started_at)} → {s.ended_at ? formatLogTime(s.ended_at) : "ongoing"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Activities */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Activity Timeline</h3>
                {staffDetail.activities.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No activities today</p>
                ) : (
                  staffDetail.activities.map((a: any) => (
                    <div key={a.id} className="flex gap-3 py-1 border-b border-border">
                      <span className="font-mono text-xs text-primary whitespace-nowrap">{formatLogTime(a.logged_at)}</span>
                      <span className="text-sm text-foreground">{a.description}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Idle Periods */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Idle Periods
                </h3>
                {staffDetail.idlePeriods.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No idle periods today</p>
                ) : (
                  staffDetail.idlePeriods.map((ip: any) => {
                    const duration = ip.ended_at
                      ? Math.floor((new Date(ip.ended_at).getTime() - new Date(ip.started_at).getTime()) / 1000)
                      : Math.floor((Date.now() - new Date(ip.started_at).getTime()) / 1000);
                    return (
                      <div key={ip.id} className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                          <p className="text-sm text-foreground">
                            {ip.reason || "No reason"} — {formatTime(duration)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Type: <Badge variant={ip.idle_type === "management_delay" ? "secondary" : "outline"} className="text-xs">{ip.idle_type}</Badge>
                            {ip.admin_approved === true && <Badge className="ml-1 text-xs">Approved</Badge>}
                            {ip.admin_approved === false && <Badge variant="destructive" className="ml-1 text-xs">Rejected</Badge>}
                          </p>
                        </div>
                        {ip.idle_type === "management_delay" && ip.admin_approved === null && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="default" onClick={() => handleApproveIdle(ip.id, true)}>
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleApproveIdle(ip.id, false)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffAdminDashboard;
