import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Search, Download, CheckCircle2, XCircle, Minus,
  StickyNote, ChevronLeft, ChevronRight, RotateCcw,
  ChevronDown, ChevronUp, FileText, BookOpen, CalendarCheck,
} from "lucide-react";
import * as XLSX from "xlsx";

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  hasCommitment: boolean;
  attendance: Record<string, string>;
  assignmentWeeks: Set<number>;
  reviewSessions: Set<string>;
  progress: number;
  status: string;
  notes: string[];
  // Computed summaries
  attendedCount: number;
  reviewCount: number;
  assignmentCount: number;
  missedReviews: number;
  missedAssignments: number;
}

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];
const SESSIONS = WEEKS.flatMap(w => [
  { week: w, day: "friday" as const, label: `W${w} Fri` },
  { week: w, day: "saturday" as const, label: `W${w} Sat` },
]);
const PAGE_SIZE = 20;

const StudentTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [noteStudentId, setNoteStudentId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [profilesRes, commitmentsRes, attendanceRes, reviewsRes, submissionsRes, notesRes] =
      await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("training_commitments").select("user_id, email"),
        supabase.from("student_attendance").select("*"),
        supabase.from("weekly_reviews").select("user_id, week_number, session_day"),
        supabase
          .from("assignment_submissions")
          .select("user_id, assignment_id, assignments!inner(week_number)"),
        supabase.from("admin_notes").select("*").order("created_at", { ascending: false }),
      ]);

    const profiles = profilesRes.data ?? [];
    const commitments = commitmentsRes.data ?? [];
    const attendance = attendanceRes.data ?? [];
    const reviews = reviewsRes.data ?? [];
    const submissions = submissionsRes.data ?? [];
    const notes = notesRes.data ?? [];

    const commitUserIds = new Set(commitments.filter((c: any) => c.user_id).map((c: any) => c.user_id));
    const commitEmails = new Set(commitments.map((c: any) => c.email));

    const attendanceMap = new Map<string, Record<string, string>>();
    attendance.forEach((a: any) => {
      if (!attendanceMap.has(a.user_id)) attendanceMap.set(a.user_id, {});
      const key = `${a.week_number}-${a.session_day || 'friday'}`;
      attendanceMap.get(a.user_id)![key] = a.status;
    });

    const reviewMap = new Map<string, Set<string>>();
    reviews.forEach((r: any) => {
      if (!r.user_id) return;
      if (!reviewMap.has(r.user_id)) reviewMap.set(r.user_id, new Set());
      const day = r.session_day || "friday";
      reviewMap.get(r.user_id)!.add(`${r.week_number}-${day}`);
    });

    const assignMap = new Map<string, Set<number>>();
    submissions.forEach((s: any) => {
      const wn = (s as any).assignments?.week_number;
      if (!wn) return;
      if (!assignMap.has(s.user_id)) assignMap.set(s.user_id, new Set());
      assignMap.get(s.user_id)!.add(wn);
    });

    const notesMap = new Map<string, string[]>();
    notes.forEach((n: any) => {
      if (!notesMap.has(n.user_id)) notesMap.set(n.user_id, []);
      notesMap.get(n.user_id)!.push(n.note);
    });

    const rows: StudentRow[] = profiles.map((p: any) => {
      const att = attendanceMap.get(p.id) ?? {};
      const revSessions = reviewMap.get(p.id) ?? new Set<string>();
      const assWeeks = assignMap.get(p.id) ?? new Set<number>();
      const hasCommitment = commitUserIds.has(p.id) || commitEmails.has(p.email);

      const attendedCount = SESSIONS.filter(s => att[`${s.week}-${s.day}`] === "present").length;
      const revCount = revSessions.size;
      const commitScore = hasCommitment ? 10 : 0;
      const attScore = (attendedCount / 16) * 35;
      const revScore = (revCount / 16) * 30;
      const assScore = (assWeeks.size / 8) * 25;
      const progress = Math.round(commitScore + attScore + revScore + assScore);

      const missedAttendance = SESSIONS.filter(s => att[`${s.week}-${s.day}`] === "absent").length;
      const missedReviews = SESSIONS.filter(s => {
        const key = `${s.week}-${s.day}`;
        return att[key] === "present" && !revSessions.has(key);
      }).length;
      const expectedAssignmentWeeks = WEEKS.filter(w =>
        att[`${w}-friday`] === "present" || att[`${w}-saturday`] === "present"
      );
      const missedAssignments = expectedAssignmentWeeks.filter(w => !assWeeks.has(w)).length;

      const maxMissed = Math.max(missedAttendance, missedReviews, missedAssignments);

      let status = "Active";
      if (p.student_status === "withdrawn") {
        status = "Withdrawn";
      } else if (maxMissed >= 3) {
        status = "Inactive";
      } else if (maxMissed >= 2) {
        status = "Action Required";
      } else if (maxMissed >= 1) {
        status = "Monitor";
      }
      if (progress >= 90 && status === "Active") status = "Completed Program";

      return {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        created_at: p.created_at,
        hasCommitment,
        attendance: att,
        assignmentWeeks: assWeeks,
        reviewSessions: revSessions,
        progress,
        status,
        notes: notesMap.get(p.id) ?? [],
        attendedCount,
        reviewCount: revCount,
        assignmentCount: assWeeks.size,
        missedReviews,
        missedAssignments,
      };
    });

    setStudents(rows);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(
    () => students.filter(s => {
      const matchesSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
    [students, search, statusFilter]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleAttendance = async (studentId: string, week: number, day: string, current: string | undefined) => {
    // Cycle: blank → present → absent → blank
    const nextStatus = !current || current === "" ? "present" : current === "present" ? "absent" : "";
    const savKey = `${studentId}-${week}-${day}`;
    setSavingAttendance(savKey);

    if (nextStatus === "") {
      // Delete the record to reset to blank
      const { error } = await supabase
        .from("student_attendance")
        .delete()
        .eq("user_id", studentId)
        .eq("week_number", week)
        .eq("session_day", day);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setStudents(prev =>
          prev.map(s => {
            if (s.id !== studentId) return s;
            const newAtt = { ...s.attendance };
            delete newAtt[`${week}-${day}`];
            return { ...s, attendance: newAtt };
          })
        );
      }
    } else {
      const { error } = await supabase.from("student_attendance").upsert(
        { user_id: studentId, week_number: week, session_day: day, status: nextStatus, marked_by: user!.id } as any,
        { onConflict: "user_id,week_number,session_day" }
      );
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setStudents(prev =>
          prev.map(s =>
            s.id === studentId
              ? { ...s, attendance: { ...s.attendance, [`${week}-${day}`]: nextStatus } }
              : s
          )
        );
      }
    }
    setSavingAttendance(null);
  };

  const saveNote = async () => {
    if (!noteStudentId || !noteText.trim()) return;
    setSavingNote(true);
    const { error } = await supabase.from("admin_notes").insert({
      user_id: noteStudentId,
      note: noteText.trim(),
      admin_id: user!.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Note saved" });
      setStudents(prev =>
        prev.map(s =>
          s.id === noteStudentId ? { ...s, notes: [noteText.trim(), ...s.notes] } : s
        )
      );
      setNoteText("");
      setNoteStudentId(null);
    }
    setSavingNote(false);
  };

  const exportData = (format: "xlsx" | "csv") => {
    const rows = filtered.map(s => {
      const row: Record<string, any> = {
        Name: s.full_name,
        Email: s.email,
        "Date Registered": new Date(s.created_at).toLocaleDateString(),
        "Commitment Form": s.hasCommitment ? "Yes" : "No",
      };
      SESSIONS.forEach(sess => {
        const key = `${sess.week}-${sess.day}`;
        const val = s.attendance[key];
        row[`${sess.label} Attendance`] = val === "present" ? "Present" : val === "absent" ? "Absent" : "—";
      });
      SESSIONS.forEach(sess => {
        const key = `${sess.week}-${sess.day}`;
        row[`${sess.label} Review`] = s.reviewSessions?.has(key) ? "Yes" : "No";
      });
      WEEKS.forEach(w => {
        row[`Week ${w} Assignment`] = s.assignmentWeeks?.has(w) ? "Yes" : "No";
      });
      row["Progress"] = `${s.progress}%`;
      row["Status"] = s.status;
      row["Notes"] = s.notes.join(" | ");
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `delvetek-students.${format}`);
  };

  const withdrawStudent = async (studentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("withdraw-student", {
        body: { studentId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Student withdrawn", description: data?.message || "Student has been removed and notified." });
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const reinstateStudent = async (studentId: string) => {
    const { error } = await supabase.from("profiles").update({ student_status: "active" }).eq("id", studentId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Student reinstated" });
      fetchAll();
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Completed Program": return "bg-green-600/20 text-green-400 border-green-600/30";
      case "Active": return "bg-green-600/20 text-green-400 border-green-600/30";
      case "Monitor": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Action Required": return "bg-orange-600/20 text-orange-400 border-orange-600/30";
      case "Inactive": return "bg-red-600/20 text-red-400 border-red-600/30";
      case "Withdrawn": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const statusDot = (status: string) => {
    switch (status) {
      case "Completed Program":
      case "Active": return "bg-green-500";
      case "Monitor": return "bg-amber-500";
      case "Action Required": return "bg-orange-500";
      case "Inactive": return "bg-red-500";
      case "Withdrawn": return "bg-destructive";
      default: return "bg-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Student Tracking</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} students</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 w-64 bg-card border-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-44 bg-card border-border">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Monitor">Monitor</SelectItem>
              <SelectItem value="Action Required">Action Required</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Withdrawn">Withdrawn</SelectItem>
              <SelectItem value="Completed Program">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportData("xlsx")}>
            <Download className="w-4 h-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData("csv")}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <span className="text-sm font-medium text-foreground mr-2">Legend:</span>
        {[
          { color: "bg-green-500", label: "Active (0)" },
          { color: "bg-amber-500", label: "Monitor (1)" },
          { color: "bg-orange-500", label: "Action (2)" },
          { color: "bg-red-500", label: "Inactive (3+)" },
          { color: "bg-destructive", label: "Withdrawn" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Student Cards */}
      <div className="space-y-3">
        {paginated.map(s => {
          const isExpanded = expandedStudent === s.id;

          return (
            <Card key={s.id} className="border-border bg-card overflow-hidden">
              {/* Main Row - Always Visible */}
              <div className="flex items-center gap-4 p-4">
                {/* Status dot */}
                <span className={`w-3 h-3 rounded-full shrink-0 ${statusDot(s.status)}`} />

                {/* Student Info */}
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-foreground text-sm truncate">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                </div>

                {/* Summary Pills */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs bg-secondary rounded-lg px-2.5 py-1 text-muted-foreground flex items-center gap-1">
                    <CalendarCheck className="w-3 h-3" />
                    {s.attendedCount}/16
                  </span>
                  <span className={`text-xs rounded-lg px-2.5 py-1 flex items-center gap-1 ${
                    s.missedReviews > 0 ? "bg-amber-500/10 text-amber-500" : "bg-secondary text-muted-foreground"
                  }`}>
                    <FileText className="w-3 h-3" />
                    {s.reviewCount}/16
                    {s.missedReviews > 0 && <span className="text-[10px]">({s.missedReviews} missed)</span>}
                  </span>
                  <span className={`text-xs rounded-lg px-2.5 py-1 flex items-center gap-1 ${
                    s.missedAssignments > 0 ? "bg-amber-500/10 text-amber-500" : "bg-secondary text-muted-foreground"
                  }`}>
                    <BookOpen className="w-3 h-3" />
                    {s.assignmentCount}/8
                    {s.missedAssignments > 0 && <span className="text-[10px]">({s.missedAssignments} missed)</span>}
                  </span>
                </div>

                {/* Progress */}
                <div className="hidden sm:flex items-center gap-2 w-24">
                  <Progress value={s.progress} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-foreground w-8 text-right">{s.progress}%</span>
                </div>

                {/* Status Badge */}
                <Badge variant="outline" className={`text-xs shrink-0 ${statusColor(s.status)}`}>
                  {s.status}
                </Badge>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {s.status === "Withdrawn" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Reinstate ${s.full_name}?`)) reinstateStudent(s.id);
                      }}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  ) : s.status !== "Completed Program" ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Withdraw ${s.full_name}?`)) withdrawStudent(s.id);
                      }}
                    >
                      Withdraw
                    </Button>
                  ) : null}

                  {/* Notes */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 relative"
                        onClick={(e) => { e.stopPropagation(); setNoteStudentId(s.id); }}
                      >
                        <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
                        {s.notes.length > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-[8px] text-primary-foreground flex items-center justify-center">
                            {s.notes.length}
                          </span>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="font-display text-foreground">Notes — {s.full_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Add a note..."
                          value={noteStudentId === s.id ? noteText : ""}
                          onChange={(e) => { setNoteStudentId(s.id); setNoteText(e.target.value); }}
                          className="bg-secondary border-border"
                        />
                        <Button size="sm" onClick={saveNote} disabled={savingNote || !noteText.trim()}>
                          {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Note"}
                        </Button>
                        {s.notes.length > 0 && (
                          <div className="space-y-2 max-h-48 overflow-auto">
                            {s.notes.map((n, i) => (
                              <div key={i} className="text-sm text-muted-foreground bg-secondary rounded-lg p-3">{n}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Expand */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setExpandedStudent(isExpanded ? null : s.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile summary - visible only on small screens */}
              <div className="flex md:hidden items-center gap-2 px-4 pb-3 flex-wrap">
                <span className="text-xs bg-secondary rounded-lg px-2 py-0.5 text-muted-foreground">
                  Attended {s.attendedCount}/16
                </span>
                <span className="text-xs bg-secondary rounded-lg px-2 py-0.5 text-muted-foreground">
                  Reviews {s.reviewCount}/16
                </span>
                <span className="text-xs bg-secondary rounded-lg px-2 py-0.5 text-muted-foreground">
                  Assign {s.assignmentCount}/8
                </span>
                <span className="text-xs text-muted-foreground">{s.progress}%</span>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <CardContent className="border-t border-border bg-secondary/30 pt-4 space-y-5">
                  {/* Attendance - Manual (interactive) */}
                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-primary" />
                      Attendance
                      <span className="text-xs font-normal text-muted-foreground">(click to toggle)</span>
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {SESSIONS.map(sess => {
                        const key = `${sess.week}-${sess.day}`;
                        const val = s.attendance[key];
                        const savKey = `${s.id}-${sess.week}-${sess.day}`;
                        return (
                          <button
                            key={`att-${key}`}
                            onClick={() => toggleAttendance(s.id, sess.week, sess.day, val)}
                            disabled={savingAttendance === savKey}
                            className={`flex flex-col items-center gap-0.5 rounded-lg p-2 text-xs transition-colors border ${
                              val === "present"
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : val === "absent"
                                ? "bg-destructive/10 border-destructive/20 text-destructive"
                                : "bg-card border-border text-muted-foreground hover:bg-secondary"
                            }`}
                          >
                            <span className="font-medium">{sess.label}</span>
                            {savingAttendance === savKey ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : val === "present" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : val === "absent" ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reviews - Automated (read-only) */}
                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Session Reviews
                      <span className="text-xs font-normal text-muted-foreground">(auto-tracked)</span>
                      <span className="ml-auto text-xs font-normal text-muted-foreground">
                        {s.reviewCount}/16 submitted
                        {s.missedReviews > 0 && (
                          <span className="text-amber-500 ml-1">· {s.missedReviews} missed</span>
                        )}
                      </span>
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {SESSIONS.map(sess => {
                        const key = `${sess.week}-${sess.day}`;
                        const submitted = s.reviewSessions?.has(key);
                        const wasPresent = s.attendance[key] === "present";
                        const missed = wasPresent && !submitted;
                        return (
                          <div
                            key={`rev-${key}`}
                            className={`flex flex-col items-center gap-0.5 rounded-lg p-2 text-xs border ${
                              submitted
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : missed
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                : "bg-card border-border text-muted-foreground"
                            }`}
                          >
                            <span className="font-medium">{sess.label}</span>
                            <span className="text-[10px]">
                              {sess.day === "friday" ? "Written" : "Video"}
                            </span>
                            {submitted ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : missed ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assignments - Automated (read-only) */}
                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Assignments
                      <span className="text-xs font-normal text-muted-foreground">(auto-tracked)</span>
                      <span className="ml-auto text-xs font-normal text-muted-foreground">
                        {s.assignmentCount}/8 submitted
                        {s.missedAssignments > 0 && (
                          <span className="text-amber-500 ml-1">· {s.missedAssignments} missed</span>
                        )}
                      </span>
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {WEEKS.map(w => {
                        const submitted = s.assignmentWeeks?.has(w);
                        const attended = s.attendance[`${w}-friday`] === "present" || s.attendance[`${w}-saturday`] === "present";
                        const missed = attended && !submitted;
                        return (
                          <div
                            key={`asg-${w}`}
                            className={`flex flex-col items-center gap-0.5 rounded-lg p-2 text-xs border ${
                              submitted
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : missed
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                : "bg-card border-border text-muted-foreground"
                            }`}
                          >
                            <span className="font-medium">W{w}</span>
                            {submitted ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : missed ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Commitment & Registration */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Commitment: {s.hasCommitment ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </span>
                    <span>Registered: {new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentTracking;
