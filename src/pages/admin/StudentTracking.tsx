import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Search, Download, CheckCircle2, XCircle, Minus,
  StickyNote, ChevronLeft, ChevronRight,
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
  reviewWeeks: Set<number>;
  progress: number;
  status: string;
  notes: string[];
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
  const [page, setPage] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [noteStudentId, setNoteStudentId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [profilesRes, commitmentsRes, attendanceRes, reviewsRes, submissionsRes, notesRes] =
      await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("training_commitments").select("user_id, email"),
        supabase.from("student_attendance").select("*"),
        supabase.from("weekly_reviews").select("user_id, week_number"),
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

    // Attendance map: userId → { "1-friday": "present", "1-saturday": "absent", ... }
    const attendanceMap = new Map<string, Record<string, string>>();
    attendance.forEach((a: any) => {
      if (!attendanceMap.has(a.user_id)) attendanceMap.set(a.user_id, {});
      const key = `${a.week_number}-${a.session_day || 'friday'}`;
      attendanceMap.get(a.user_id)![key] = a.status;
    });

    const reviewMap = new Map<string, Set<number>>();
    reviews.forEach((r: any) => {
      if (!reviewMap.has(r.user_id)) reviewMap.set(r.user_id, new Set());
      reviewMap.get(r.user_id)!.add(r.week_number);
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
      const revWeeks = reviewMap.get(p.id) ?? new Set<number>();
      const assWeeks = assignMap.get(p.id) ?? new Set<number>();
      const hasCommitment = commitUserIds.has(p.id) || commitEmails.has(p.email);

      // Count sessions attended (out of 16 total: 8 weeks × 2 days)
      const attCount = SESSIONS.filter(s => att[`${s.week}-${s.day}`] === "present").length;
      const commitScore = hasCommitment ? 10 : 0;
      const attScore = (attCount / 16) * 40;
      const assScore = (assWeeks.size / 6) * 25;
      const revScore = (revWeeks.size / 8) * 25;
      const progress = Math.round(commitScore + attScore + assScore + revScore);

      // Status based on missed items:
      // Week 1: attendance + reviews only (no assignments)
      // Week 2+: attendance + reviews + assignments
      const missedAttendance = SESSIONS.filter(s => att[`${s.week}-${s.day}`] === "absent").length;
      // Count expected review weeks that are missing
      const expectedReviewWeeks = WEEKS.filter(w => SESSIONS.some(s => s.week === w && att[`${s.week}-${s.day}`] === "present"));
      const missedReviews = expectedReviewWeeks.filter(w => !revWeeks.has(w)).length;
      // Assignments only from week 2+
      const expectedAssignmentWeeks = WEEKS.filter(w => w >= 2 && SESSIONS.some(s => s.week === w && att[`${s.week}-${s.day}`] === "present"));
      const missedAssignments = expectedAssignmentWeeks.filter(w => !assWeeks.has(w)).length;

      const maxMissed = Math.max(missedAttendance, missedReviews, missedAssignments);

      let status = "Active"; // Green
      if (p.student_status === "withdrawn") {
        status = "Withdrawn";
      } else if (maxMissed >= 3) {
        status = "Inactive"; // Red
      } else if (maxMissed >= 2) {
        status = "Action Required"; // Orange
      } else if (maxMissed >= 1) {
        status = "Monitor"; // Amber
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
        reviewWeeks: revWeeks,
        progress,
        status,
        notes: notesMap.get(p.id) ?? [],
      };
    });

    setStudents(rows);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(
    () => students.filter(s =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    ),
    [students, search]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleAttendance = async (studentId: string, week: number, day: string, current: string | undefined) => {
    const newStatus = current === "present" ? "absent" : "present";
    const key = `${studentId}-${week}-${day}`;
    setSavingAttendance(key);
    const { error } = await supabase.from("student_attendance").upsert(
      { user_id: studentId, week_number: week, session_day: day, status: newStatus, marked_by: user!.id } as any,
      { onConflict: "user_id,week_number,session_day" }
    );
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setStudents(prev =>
        prev.map(s =>
          s.id === studentId
            ? { ...s, attendance: { ...s.attendance, [`${week}-${day}`]: newStatus } }
            : s
        )
      );
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
      WEEKS.forEach(w => {
        row[`Week ${w} Reflection`] = s.reviewWeeks.has(w) ? "Yes" : "No";
        if (w <= 6) row[`Week ${w} Assignment`] = s.assignmentWeeks.has(w) ? "Yes" : "No";
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

  const statusColor = (status: string) => {
    switch (status) {
      case "Completed Program": return "bg-green-600/20 text-green-400 border-green-600/30";
      case "Active": return "bg-primary/20 text-primary border-primary/30";
      case "Falling Behind": return "bg-orange-600/20 text-orange-400 border-orange-600/30";
      case "Inactive": return "bg-destructive/20 text-destructive border-destructive/30";
      case "At Risk": return "bg-red-800/20 text-red-400 border-red-800/30";
      default: return "bg-muted text-muted-foreground";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Student Tracking</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 w-64 bg-card border-border"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => exportData("xlsx")}>
            <Download className="w-4 h-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData("csv")}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="sticky left-0 bg-secondary/50 z-10 min-w-[180px]">Student</TableHead>
              <TableHead className="min-w-[80px]">Commitment</TableHead>
              {SESSIONS.map(s => (
                <TableHead key={`att-${s.week}-${s.day}`} className="min-w-[60px] text-center text-xs">
                  {s.label}
                </TableHead>
              ))}
              {[1, 2, 3, 4, 5, 6].map(w => (
                <TableHead key={`asg-${w}`} className="min-w-[60px] text-center">
                  W{w} Asgn.
                </TableHead>
              ))}
              {WEEKS.map(w => (
                <TableHead key={`ref-${w}`} className="min-w-[60px] text-center">
                  W{w} Ref.
                </TableHead>
              ))}
              <TableHead className="min-w-[120px]">Progress</TableHead>
              <TableHead className="min-w-[130px]">Status</TableHead>
              <TableHead className="min-w-[80px]">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(s => (
              <TableRow key={s.id} className="hover:bg-secondary/30">
                <TableCell className="sticky left-0 bg-card z-10">
                  <div>
                    <p className="font-medium text-foreground text-sm">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {s.hasCommitment ? (
                    <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive mx-auto" />
                  )}
                </TableCell>
                {SESSIONS.map(sess => {
                  const key = `${sess.week}-${sess.day}`;
                  const val = s.attendance[key];
                  const savingKey = `${s.id}-${sess.week}-${sess.day}`;
                  return (
                    <TableCell key={`att-${key}`} className="text-center">
                      <button
                        onClick={() => toggleAttendance(s.id, sess.week, sess.day, val)}
                        disabled={savingAttendance === savingKey}
                        className="p-1 rounded hover:bg-secondary transition-colors"
                      >
                        {savingAttendance === savingKey ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />
                        ) : val === "present" ? (
                          <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                        ) : val === "absent" ? (
                          <XCircle className="w-4 h-4 text-destructive mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
                        )}
                      </button>
                    </TableCell>
                  );
                })}
                {[1, 2, 3, 4, 5, 6].map(w => (
                  <TableCell key={`asg-${w}`} className="text-center">
                    {s.assignmentWeeks.has(w) ? (
                      <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                ))}
                {WEEKS.map(w => (
                  <TableCell key={`ref-${w}`} className="text-center">
                    {s.reviewWeeks.has(w) ? (
                      <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={s.progress} className="h-2 w-16" />
                    <span className="text-xs font-medium text-foreground">{s.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColor(s.status)}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setNoteStudentId(s.id)}
                        className="p-1 rounded hover:bg-secondary transition-colors relative"
                      >
                        <StickyNote className="w-4 h-4 text-muted-foreground" />
                        {s.notes.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary text-[8px] text-primary-foreground flex items-center justify-center">
                            {s.notes.length}
                          </span>
                        )}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="font-display text-foreground">
                          Notes — {s.full_name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Add a note..."
                            value={noteStudentId === s.id ? noteText : ""}
                            onChange={(e) => { setNoteStudentId(s.id); setNoteText(e.target.value); }}
                            className="bg-secondary border-border"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={saveNote}
                          disabled={savingNote || !noteText.trim()}
                        >
                          {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Note"}
                        </Button>
                        {s.notes.length > 0 && (
                          <div className="space-y-2 max-h-48 overflow-auto">
                            {s.notes.map((n, i) => (
                              <div key={i} className="text-sm text-muted-foreground bg-secondary rounded-lg p-3">
                                {n}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
