import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, XCircle, Search, X, Mail, Trash2, UserPlus, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { useAdminCohort } from "@/contexts/AdminCohortContext";

interface Enrollment {
  id: string;
  full_name: string;
  email: string;
  track: string;
  payment_status: string;
  payment_reference: string | null;
  certificate_requested: boolean;
  confirmed_by_admin: boolean;
  amount_paid: number;
  paid_at: string | null;
  created_at: string;
  class_schedule?: string;
  commitment_accepted?: boolean;
  cohort?: string;
  referral_code?: string | null;
}

const EnrollmentManagement = () => {
  const { cohort } = useAdminCohort();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState<Enrollment | null>(null);
  const [moveTrack, setMoveTrack] = useState("beginner");
  const [moveSchedule, setMoveSchedule] = useState("weekend");
  const [referralFilter, setReferralFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "pending">("all");

  // Create student form state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTrack, setNewTrack] = useState("beginner");
  const [newSchedule, setNewSchedule] = useState("weekend");
  const [newCertificate, setNewCertificate] = useState(false);

  const handleCreateStudent = async () => {
    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();
    if (!name) return toast.error("Enter the student's full name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email");
    if (!confirm(`Create account for ${name} (${email}) on the ${newTrack} track and email login details?`)) return;

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-student", {
        body: {
          full_name: name,
          email,
          track: newTrack,
          class_schedule: newSchedule,
          cohort,
          certificate_requested: newCertificate,
        },
      });
      if (error) throw error;
      if (data?.ok) {
        if (data.email_sent) {
          toast.success(`Account created — login email sent to ${email}`);
        } else if (data.password) {
          await navigator.clipboard.writeText(data.password).catch(() => {});
          toast.warning(`Account created but email failed. Temp password copied: ${data.password}`, { duration: 20000 });
        } else {
          toast.success("Account created (email send failed, check logs)");
        }
        setNewName(""); setNewEmail(""); setNewCertificate(false);
        setCreateOpen(false);
        fetchEnrollments();
      } else {
        toast.error(data?.error || "Failed to create student account");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create student account");
    } finally {
      setCreating(false);
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cohort2_enrollments")
      .select("*")
      .eq("cohort", cohort)
      .order("created_at", { ascending: false });
    setEnrollments((data as Enrollment[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEnrollments(); }, [cohort]);

  const confirmPayment = async (id: string) => {
    if (!confirm("Confirm payment received? This will create the student's account and email their login details.")) return;
    setConfirmingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("confirm-manual-enrollment", {
        body: { enrollment_id: id },
      });
      if (error) throw error;
      if (data?.ok) {
        if (data.email_sent) {
          toast.success("Confirmed — login email sent");
        } else if (data.password) {
          await navigator.clipboard.writeText(data.password).catch(() => {});
          toast.warning(`Confirmed but email failed. Temp password copied to clipboard: ${data.password}`, { duration: 20000 });
        } else {
          toast.success("Confirmed (email send failed, check logs)");
        }
        fetchEnrollments();
      } else {
        toast.error(data?.error || "Failed to confirm");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm");
    } finally {
      setConfirmingId(null);
    }
  };

  const resendWelcome = async (id: string, email: string) => {
    if (!confirm(`Resend welcome email with NEW temporary password to ${email}? Their existing password will be reset.`)) return;
    setResendingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("confirm-manual-enrollment", {
        body: { enrollment_id: id, resend_email: true },
      });
      if (error) throw error;
      if (data?.ok) {
        if (data.email_sent) {
          toast.success(`Welcome email resent to ${email}`);
        } else if (data.password) {
          await navigator.clipboard.writeText(data.password).catch(() => {});
          toast.warning(`Email failed but password reset. Temp password copied: ${data.password}`, { duration: 20000 });
        } else {
          toast.error("Resend failed — check logs");
        }
      } else {
        toast.error(data?.error || "Failed to resend");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to resend");
    } finally {
      setResendingId(null);
    }
  };

  const deleteEnrollment = async (id: string, name: string) => {
    if (!confirm(`Delete enrollment for ${name}? This cannot be undone. Only use for unpaid/test entries.`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("cohort2_enrollments").delete().eq("id", id);
      if (error) throw error;
      toast.success(`Deleted enrollment for ${name}`);
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const openMoveDialog = (e: Enrollment) => {
    setMoveTarget(e);
    setMoveTrack(e.track || "beginner");
    setMoveSchedule(e.class_schedule || "weekend");
  };

  const confirmMove = async () => {
    if (!moveTarget) return;
    const currentCohort = moveTarget.cohort;
    const targetCohort = currentCohort === "Cohort 2" ? "Cohort 1" : "Cohort 2";
    setMovingId(moveTarget.id);
    try {
      const { data, error } = await supabase.functions.invoke("admin-upgrade-student-cohort", {
        body: {
          enrollment_id: moveTarget.id,
          target_cohort: targetCohort,
          track: moveTrack,
          class_schedule: moveSchedule,
        },
      });
      if (error) throw error;
      if (data?.ok) {
        if (data.email_sent) {
          toast.success(`${moveTarget.full_name} moved to ${targetCohort} (${moveTrack}) — notification email sent`);
        } else {
          toast.warning(`${moveTarget.full_name} moved to ${targetCohort} (${moveTrack}) — email send failed, please notify them manually`);
        }
        setMoveTarget(null);
        fetchEnrollments();
      } else {
        toast.error(data?.error || "Failed to move student");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to move student");
    } finally {
      setMovingId(null);
    }
  };

  const filteredEnrollments = useMemo(() => {
    const ref = referralFilter.trim().toUpperCase();
    const stu = studentFilter.trim().toLowerCase();
    return enrollments.filter((e) => {
      if (ref && !(e.referral_code || "").toUpperCase().includes(ref)) return false;
      if (stu && !`${e.full_name} ${e.email}`.toLowerCase().includes(stu)) return false;
      if (paymentFilter === "paid" && e.payment_status !== "paid") return false;
      if (paymentFilter === "pending" && e.payment_status === "paid") return false;
      return true;
    });
  }, [enrollments, referralFilter, studentFilter, paymentFilter]);

  const renderTable = (trackFilter: string) => {
    const filtered = filteredEnrollments.filter((e) => e.track === trackFilter);
    if (!filtered.length) {
      return <p className="text-muted-foreground text-sm py-8 text-center">No enrollments match.</p>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Referral</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Amount</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Schedule</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Payment</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Certificate</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Commitment</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="p-3 text-foreground">{e.full_name}</td>
                <td className="p-3 text-muted-foreground">{e.email}</td>
                <td className="p-3">
                  {e.referral_code ? (
                    <code className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">{e.referral_code}</code>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3 text-foreground">₦{e.amount_paid.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    e.class_schedule === "weekday" 
                      ? "bg-blue-500/20 text-blue-600" 
                      : "bg-purple-500/20 text-purple-600"
                  }`}>
                    {e.class_schedule === "weekday" ? "Weekday" : "Weekend"}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    e.payment_status === "paid" 
                      ? "bg-green-500/20 text-green-600" 
                      : "bg-amber-500/20 text-amber-600"
                  }`}>
                    {e.payment_status === "paid" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {e.payment_status}
                  </span>
                </td>
                <td className="p-3">
                  <span className={e.certificate_requested ? "text-green-600" : "text-muted-foreground"}>
                    {e.certificate_requested ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-3">
                  <span className={e.commitment_accepted ? "text-green-600 text-xs" : "text-muted-foreground text-xs"}>
                    {e.commitment_accepted ? "✓ Agreed" : "—"}
                  </span>
                </td>
                <td className="p-3">
                  {e.confirmed_by_admin ? (
                    <span className="text-xs text-green-600 font-medium">✓ Confirmed</span>
                  ) : (
                    <span className="text-xs text-amber-600">Pending</span>
                  )}
                </td>
                <td className="p-3">
                  {!e.confirmed_by_admin && (
                    <div className="space-y-1">
                      {e.payment_reference && (
                        <div className="text-[10px] font-mono text-muted-foreground">{e.payment_reference}</div>
                      )}
                      <Button
                        size="sm"
                        variant="hero"
                        disabled={confirmingId === e.id}
                        onClick={() => confirmPayment(e.id)}
                      >
                        {confirmingId === e.id ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Confirming...</>
                        ) : (
                          "Confirm Payment & Send Login"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === e.id}
                        onClick={() => deleteEnrollment(e.id, e.full_name)}
                        className="text-destructive hover:text-destructive"
                        title="Delete this enrollment (use for unpaid/test entries)"
                      >
                        {deletingId === e.id ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Deleting...</>
                        ) : (
                          <><Trash2 className="w-3 h-3 mr-1" /> Delete</>
                        )}
                      </Button>
                    </div>
                  )}
                  {e.confirmed_by_admin && (
                    <div className="space-y-1">
                      {e.payment_reference && (
                        <div className="text-[10px] font-mono text-muted-foreground">{e.payment_reference}</div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={resendingId === e.id}
                        onClick={() => resendWelcome(e.id, e.email)}
                        title="Generate a new temp password and resend the welcome email"
                      >
                        {resendingId === e.id ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Sending...</>
                        ) : (
                          <><Mail className="w-3 h-3 mr-1" /> Resend Welcome Email</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={movingId === e.id}
                        onClick={() => openMoveDialog(e)}
                        title="Move this student to the other cohort. Keeps their existing login — no new email is sent."
                      >
                        {movingId === e.id ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Moving...</>
                        ) : (
                          <><ArrowRightLeft className="w-3 h-3 mr-1" /> Move to {e.cohort === "Cohort 2" ? "Cohort 1" : "Cohort 2"}</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === e.id}
                        onClick={() => deleteEnrollment(e.id, e.full_name)}
                        className="text-destructive hover:text-destructive"
                        title="Delete this enrollment record (does not delete their auth account)"
                      >
                        {deletingId === e.id ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Deleting...</>
                        ) : (
                          <><Trash2 className="w-3 h-3 mr-1" /> Delete</>
                        )}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const counts = {
    beginner: enrollments.filter((e) => e.track === "beginner").length,
    professional: enrollments.filter((e) => e.track === "professional").length,
    advanced: enrollments.filter((e) => e.track === "advanced").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Enrollments</h1>
          <p className="text-muted-foreground text-sm">Manage student enrollments by track</p>
        </div>
        <Button variant="hero" onClick={() => setCreateOpen((v) => !v)}>
          <UserPlus className="w-4 h-4 mr-2" />
          {createOpen ? "Close" : "Create Student Account"}
        </Button>
      </div>

      {createOpen && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Create student account</h2>
            <p className="text-xs text-muted-foreground">
              Creates a paid enrollment, provisions a dashboard account, and emails login details immediately.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-name">Full name</Label>
              <Input id="new-name" placeholder="Jane Doe" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" type="email" placeholder="student@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label>Track</Label>
              <Select value={newTrack} onValueChange={setNewTrack}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Class schedule</Label>
              <Select value={newSchedule} onValueChange={setNewSchedule}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekend">Weekend (Fri/Sat)</SelectItem>
                  <SelectItem value="weekday">Weekday (Mon/Wed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <Checkbox checked={newCertificate} onCheckedChange={(v) => setNewCertificate(v === true)} />
            Include certificate (₦10,000 — marks certificate as paid)
          </label>
          <div className="flex gap-2">
            <Button variant="hero" disabled={creating} onClick={handleCreateStudent}>
              {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</> : <><UserPlus className="w-4 h-4 mr-2" /> Create & Send Login</>}
            </Button>
            <Button variant="outline" disabled={creating} onClick={() => setCreateOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            placeholder="Filter by student name or email..."
            className="pl-9 pr-9"
          />
          {studentFilter && (
            <button
              onClick={() => setStudentFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={referralFilter}
            onChange={(e) => setReferralFilter(e.target.value)}
            placeholder="Filter by referral code..."
            className="pl-9 pr-9 font-mono uppercase"
          />
          {referralFilter && (
            <button
              onClick={() => setReferralFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground mr-1">Payment:</span>
        {(["all", "paid", "pending"] as const).map((opt) => {
          const count =
            opt === "all"
              ? filteredEnrollments.length + (paymentFilter !== "all" ? enrollments.filter((e) => paymentFilter === "paid" ? e.payment_status !== "paid" : e.payment_status === "paid").length : 0)
              : enrollments.filter((e) => opt === "paid" ? e.payment_status === "paid" : e.payment_status !== "paid").length;
          return (
            <Button
              key={opt}
              size="sm"
              variant={paymentFilter === opt ? "hero" : "outline"}
              onClick={() => setPaymentFilter(opt)}
              className="capitalize"
            >
              {opt} ({opt === "all" ? enrollments.length : count})
            </Button>
          );
        })}
      </div>

      <Tabs defaultValue="beginner">
        <TabsList>
          <TabsTrigger value="beginner">Beginner ({counts.beginner})</TabsTrigger>
          <TabsTrigger value="professional">Professional ({counts.professional})</TabsTrigger>
          <TabsTrigger value="advanced">Advanced ({counts.advanced})</TabsTrigger>
        </TabsList>
        <TabsContent value="beginner">{renderTable("beginner")}</TabsContent>
        <TabsContent value="professional">{renderTable("professional")}</TabsContent>
        <TabsContent value="advanced">{renderTable("advanced")}</TabsContent>
      </Tabs>

      <Dialog open={!!moveTarget} onOpenChange={(o) => !o && setMoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Move {moveTarget?.full_name} to {moveTarget?.cohort === "Cohort 2" ? "Cohort 1" : "Cohort 2"}
            </DialogTitle>
            <DialogDescription>
              Pick the track and schedule for the student in their new cohort. Their existing login is preserved — no new email is sent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Track</Label>
              <Select value={moveTrack} onValueChange={setMoveTrack}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Class schedule</Label>
              <Select value={moveSchedule} onValueChange={setMoveSchedule}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekend">Weekend (Fri/Sat)</SelectItem>
                  <SelectItem value="weekday">Weekday (Mon/Wed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveTarget(null)} disabled={!!movingId}>Cancel</Button>
            <Button variant="hero" onClick={confirmMove} disabled={!!movingId}>
              {movingId ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Moving…</> : <><ArrowRightLeft className="w-4 h-4 mr-2" /> Confirm move</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrollmentManagement;
