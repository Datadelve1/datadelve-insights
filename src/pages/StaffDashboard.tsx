import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock, Power, PowerOff, Plus, Activity, AlertTriangle, LogOut,
} from "lucide-react";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

const IDLE_REASONS = [
  "Waiting for instructions",
  "Waiting for files",
  "Waiting for approval",
  "Technical issue",
  "Management Delay",
  "Other",
];

const StaffDashboard = () => {
  const { user, staffProfile, loading, signOut } = useStaffAuth();
  const [status, setStatus] = useState<"offline" | "active" | "idle">("offline");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activityInput, setActivityInput] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [todayHours, setTodayHours] = useState(0);
  const [weekHours, setWeekHours] = useState(0);
  const [showIdleDialog, setShowIdleDialog] = useState(false);
  const [idleReason, setIdleReason] = useState("");
  const [idleDescription, setIdleDescription] = useState("");
  const [currentIdlePeriodId, setCurrentIdlePeriodId] = useState<string | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const hourlyRate = staffProfile ? Math.round(staffProfile.salary / 150) : 0;

  // Load today's activities
  const loadActivities = useCallback(async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", today.toISOString())
      .order("logged_at", { ascending: true });

    setActivities(data || []);
  }, [user]);

  // Calculate hours
  const calculateHours = useCallback(async () => {
    if (!user) return;
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    // Get completed sessions
    const { data: sessions } = await supabase
      .from("time_sessions")
      .select("started_at, ended_at")
      .eq("user_id", user.id)
      .eq("status", "offline")
      .gte("started_at", weekStart.toISOString());

    let todayTotal = 0;
    let weekTotal = 0;

    sessions?.forEach((s: any) => {
      const start = new Date(s.started_at);
      const end = new Date(s.ended_at);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      weekTotal += hours;
      if (start >= todayStart) todayTotal += hours;
    });

    // Subtract idle periods (unapproved)
    const { data: idlePeriods } = await supabase
      .from("idle_periods")
      .select("started_at, ended_at, idle_type, admin_approved")
      .eq("user_id", user.id)
      .gte("started_at", weekStart.toISOString())
      .not("ended_at", "is", null);

    idlePeriods?.forEach((ip: any) => {
      if (ip.idle_type === "unapproved" || (ip.idle_type === "management_delay" && ip.admin_approved === false)) {
        const start = new Date(ip.started_at);
        const end = new Date(ip.ended_at);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        weekTotal -= hours;
        if (start >= todayStart) todayTotal -= hours;
      }
    });

    setTodayHours(Math.max(0, todayTotal));
    setWeekHours(Math.max(0, weekTotal));
  }, [user]);

  // Check for existing active session on load
  useEffect(() => {
    if (!user) return;
    const checkActiveSession = async () => {
      const { data } = await supabase
        .from("time_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setStatus("active");
        setCurrentSessionId(data.id);
        setSessionStartTime(new Date(data.started_at));
        lastActivityRef.current = Date.now();
        startIdleTimer();
      }
    };
    checkActiveSession();
    loadActivities();
    calculateHours();
  }, [user, loadActivities, calculateHours]);

  // Elapsed timer
  useEffect(() => {
    if (status !== "active" || !sessionStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, sessionStartTime]);

  const startIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      handleIdleDetected();
    }, IDLE_TIMEOUT_MS);
  };

  const resetIdleTimer = () => {
    lastActivityRef.current = Date.now();
    startIdleTimer();
  };

  const handleIdleDetected = async () => {
    if (!currentSessionId || !user) return;
    setStatus("idle");
    setShowIdleDialog(true);

    // Create idle period
    const { data } = await supabase
      .from("idle_periods")
      .insert({
        user_id: user.id,
        session_id: currentSessionId,
        started_at: new Date().toISOString(),
        idle_type: "unapproved",
      })
      .select()
      .single();

    if (data) setCurrentIdlePeriodId(data.id);

    // Update session status
    await supabase
      .from("time_sessions")
      .update({ status: "idle" })
      .eq("id", currentSessionId);
  };

  const handleIdleReasonSubmit = async () => {
    if (!idleReason) { toast.error("Please select a reason"); return; }
    if (idleReason === "Other" && !idleDescription.trim()) {
      toast.error("Please provide a description"); return;
    }
    if (idleReason === "Management Delay" && !idleDescription.trim()) {
      toast.error("Management Delay requires a description"); return;
    }

    const isManagement = idleReason === "Management Delay";

    // Check management delay limit (2 hours/day)
    if (isManagement && user) {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const { data: todayMgmt } = await supabase
        .from("idle_periods")
        .select("started_at, ended_at")
        .eq("user_id", user.id)
        .eq("idle_type", "management_delay")
        .gte("started_at", todayStart.toISOString());

      let totalMgmtMinutes = 0;
      todayMgmt?.forEach((p: any) => {
        if (p.ended_at) {
          totalMgmtMinutes += (new Date(p.ended_at).getTime() - new Date(p.started_at).getTime()) / 60000;
        }
      });
      if (totalMgmtMinutes >= 120) {
        toast.warning("Management Delay limit (2 hours/day) reached. This will be flagged for admin review.");
      }
    }

    if (currentIdlePeriodId) {
      await supabase
        .from("idle_periods")
        .update({
          reason: idleReason === "Other" ? idleDescription : idleReason,
          idle_type: isManagement ? "management_delay" : "unapproved",
          description: idleDescription || null,
          flagged: isManagement,
        })
        .eq("id", currentIdlePeriodId);
    }

    setShowIdleDialog(false);
    setIdleReason("");
    setIdleDescription("");
    toast.info("Idle reason recorded. Go Active when ready to resume.");
  };

  const goActive = async () => {
    if (!user) return;

    // End any current idle period
    if (currentIdlePeriodId) {
      await supabase
        .from("idle_periods")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", currentIdlePeriodId);
      setCurrentIdlePeriodId(null);
    }

    if (currentSessionId && status === "idle") {
      // Resume existing session
      await supabase
        .from("time_sessions")
        .update({ status: "active" })
        .eq("id", currentSessionId);
      setStatus("active");
      resetIdleTimer();
      return;
    }

    // Start new session
    const { data } = await supabase
      .from("time_sessions")
      .insert({ user_id: user.id, status: "active" })
      .select()
      .single();

    if (data) {
      setCurrentSessionId(data.id);
      setSessionStartTime(new Date(data.started_at));
      setStatus("active");
      setElapsed(0);
      resetIdleTimer();
      toast.success("You are now Active");
    }
  };

  const goOffline = async () => {
    if (!currentSessionId || !user) return;

    // End any idle period
    if (currentIdlePeriodId) {
      await supabase
        .from("idle_periods")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", currentIdlePeriodId);
      setCurrentIdlePeriodId(null);
    }

    await supabase
      .from("time_sessions")
      .update({ status: "offline", ended_at: new Date().toISOString() })
      .eq("id", currentSessionId);

    setStatus("offline");
    setCurrentSessionId(null);
    setSessionStartTime(null);
    setElapsed(0);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    calculateHours();
    toast.info("You are now Offline");
  };

  const logActivity = async () => {
    if (!activityInput.trim()) { toast.error("Please describe what you're doing"); return; }
    if (!currentSessionId || !user) { toast.error("You must be Active to log activities"); return; }

    await supabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        session_id: currentSessionId,
        description: activityInput.trim(),
      });

    setActivityInput("");
    resetIdleTimer();
    loadActivities();
    toast.success("Activity logged");
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatLogTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;

  const extraHours = Math.max(0, weekHours - 37.5);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Welcome, {staffProfile?.full_name || "Staff"}
          </h1>
          <p className="text-muted-foreground text-sm">{staffProfile?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === "active" ? "default" : status === "idle" ? "secondary" : "outline"} className="capitalize">
            {status}
          </Badge>
          <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Status Controls */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Power className="w-4 h-4" /> Status Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={goActive} className="w-full" disabled={status === "active"} variant={status === "active" ? "secondary" : "default"}>
              <Power className="w-4 h-4 mr-2" /> Go Active
            </Button>
            <Button onClick={goOffline} className="w-full" variant="outline" disabled={status === "offline"}>
              <PowerOff className="w-4 h-4 mr-2" /> Go Offline
            </Button>
          </CardContent>
        </Card>

        {/* Session Timer */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Current Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-primary">
              {status !== "offline" ? formatTime(elapsed) : "00:00:00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₦{hourlyRate.toLocaleString()}/hour
            </p>
          </CardContent>
        </Card>

        {/* Today Hours */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-foreground">{todayHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Target: 7.5h/day</p>
          </CardContent>
        </Card>

        {/* Week Hours */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-foreground">{weekHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Required: 37.5h {extraHours > 0 && <span className="text-primary">(+{extraHours.toFixed(1)}h extra)</span>}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logging */}
      <Card className="border-border mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Plus className="w-4 h-4" /> Log Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
              placeholder="What are you doing?"
              onKeyDown={(e) => e.key === "Enter" && logActivity()}
              disabled={status !== "active"}
            />
            <Button onClick={logActivity} disabled={status !== "active"}>
              <Plus className="w-4 h-4 mr-1" /> Log
            </Button>
          </div>
          {status === "active" && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> You will be marked idle after 15 minutes without logging
            </p>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" /> Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No activities logged today</p>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-xs text-primary font-mono whitespace-nowrap mt-0.5">
                    {formatLogTime(a.logged_at)}
                  </span>
                  <span className="text-sm text-foreground">{a.description}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Idle Reason Dialog */}
      <Dialog open={showIdleDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" /> You've been marked as Idle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No activity logged for 15 minutes. Please select a reason:
            </p>
            <Select value={idleReason} onValueChange={setIdleReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {IDLE_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(idleReason === "Other" || idleReason === "Management Delay") && (
              <Textarea
                value={idleDescription}
                onChange={(e) => setIdleDescription(e.target.value)}
                placeholder={idleReason === "Management Delay" ? "Describe the management delay..." : "Describe the reason..."}
                required
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleIdleReasonSubmit} disabled={!idleReason}>
              Submit Reason
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDashboard;
