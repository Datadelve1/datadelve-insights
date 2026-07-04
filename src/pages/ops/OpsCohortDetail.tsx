import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Ctx = { user: any; isAdmin: boolean };

export default function OpsCohortDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useOutletContext<Ctx>();
  const [cohort, setCohort] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({ email_type: "welcome", subject: "", body: "", scheduled_at: "" });
  const [checklistLabel, setChecklistLabel] = useState("");

  const load = async () => {
    const [c, s, ci, em] = await Promise.all([
      supabase.from("ops_cohorts").select("*").eq("id", id).maybeSingle(),
      supabase.from("ops_cohort_students").select("*").eq("cohort_id", id).order("created_at"),
      supabase.from("ops_checklist_items").select("*").eq("cohort_id", id).order("sort_order"),
      supabase.from("ops_emails").select("*").eq("cohort_id", id).order("created_at", { ascending: false }),
    ]);
    setCohort(c.data);
    setStudents(s.data || []);
    setChecklist(ci.data || []);
    setEmails(em.data || []);
  };
  useEffect(() => { if (id) load(); }, [id]);

  const updateCohort = async (patch: any) => {
    const { error } = await supabase.from("ops_cohorts").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const addStudents = async () => {
    const lines = pasteText.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    const rows: any[] = [];
    for (const line of lines) {
      // format: "Name <email>" or "email" or "name,email"
      const m = line.match(/^(.*?)[<\s](.+@.+?)>?$/);
      let name = "", email = line;
      if (m) { name = m[1].trim(); email = m[2].trim(); }
      if (!email.includes("@")) continue;
      rows.push({ cohort_id: id, email, full_name: name || null });
    }
    if (rows.length === 0) return toast.error("No valid emails");
    const { error } = await supabase.from("ops_cohort_students").upsert(rows, { onConflict: "cohort_id,email" });
    if (error) return toast.error(error.message);
    toast.success(`${rows.length} students added`);
    setPasteOpen(false); setPasteText("");
    load();
  };

  const removeStudent = async (sid: string) => {
    await supabase.from("ops_cohort_students").delete().eq("id", sid);
    load();
  };

  const updateStudentStatus = async (sid: string, status: string) => {
    await supabase.from("ops_cohort_students").update({ status }).eq("id", sid);
    load();
  };

  const createEmailDraft = async () => {
    if (!newEmail.subject) return toast.error("Subject required");
    const recipients = students.map(s => ({ email: s.email, name: s.full_name }));
    const { error, data } = await supabase.from("ops_emails").insert({
      cohort_id: id,
      email_type: newEmail.email_type,
      subject: newEmail.subject,
      body: newEmail.body,
      recipients,
      scheduled_at: newEmail.scheduled_at || null,
      status: "waiting_approval",
      created_by: user.id,
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("ops_activity_log").insert({
      actor_user_id: user.id, actor_kind: isAdmin ? "admin" : "staff",
      action: "email_prepared", entity_type: "ops_emails", entity_id: data.id,
      detail: { cohort_id: id, subject: newEmail.subject, recipients: recipients.length },
    });
    toast.success("Email draft created — waiting for approval");
    setEmailOpen(false); setNewEmail({ email_type: "welcome", subject: "", body: "", scheduled_at: "" });
    load();
  };

  const addChecklist = async () => {
    if (!checklistLabel.trim()) return;
    await supabase.from("ops_checklist_items").insert({ cohort_id: id, label: checklistLabel, sort_order: checklist.length });
    setChecklistLabel(""); load();
  };
  const toggleChecklist = async (item: any) => {
    await supabase.from("ops_checklist_items").update({ done: !item.done, done_at: !item.done ? new Date().toISOString() : null, done_by: !item.done ? user.id : null }).eq("id", item.id);
    load();
  };

  if (!cohort) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const dateArrEditor = (label: string, field: "beginner_dates" | "professional_dates") => {
    const arr: string[] = cohort[field] || [];
    const remove = (d: string) => updateCohort({ [field]: arr.filter(x => x !== d) });
    const [inp, setInp] = [null, null]; // placeholder to keep linter quiet
    return (
      <div>
        <Label>{label}</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {arr.map(d => (
            <Badge key={d} variant="outline" className="gap-1">
              {format(new Date(d), "MMM d, yyyy")}
              {isAdmin && <button onClick={() => remove(d)} className="ml-1">×</button>}
            </Badge>
          ))}
        </div>
        {isAdmin && (
          <div className="flex gap-2 mt-2">
            <Input type="date" onChange={(e) => {
              if (!e.target.value) return;
              updateCohort({ [field]: [...arr, e.target.value] });
              e.target.value = "";
            }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/staff/ops/cohorts")}><ArrowLeft className="w-4 h-4 mr-1"/> Cohorts</Button>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Cohort {cohort.number} {cohort.name && cohort.name !== `Cohort ${cohort.number}` ? `— ${cohort.name}` : ""}</h1>
        <Badge>{cohort.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Onboarding date</Label>
              <Input type="date" disabled={!isAdmin} value={cohort.onboarding_date || ""} onChange={e => updateCohort({ onboarding_date: e.target.value || null })} />
            </div>
            <div>
              <Label>Graduation date</Label>
              <Input type="date" disabled={!isAdmin} value={cohort.graduation_date || ""} onChange={e => updateCohort({ graduation_date: e.target.value || null })} />
            </div>
            {dateArrEditor("Beginner class dates", "beginner_dates")}
            {dateArrEditor("Professional class dates", "professional_dates")}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Students ({students.length})</CardTitle>
            {isAdmin && <Button size="sm" onClick={() => setPasteOpen(true)}><Plus className="w-4 h-4 mr-1"/>Add</Button>}
          </CardHeader>
          <CardContent>
            {students.length === 0 && <p className="text-sm text-muted-foreground">No students yet. Add them as they register.</p>}
            <div className="divide-y divide-border">
              {students.map(s => (
                <div key={s.id} className="py-2 flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{s.full_name || "(no name)"}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </div>
                  <Select value={s.status} onValueChange={(v) => updateStudentStatus(s.id, v)} disabled={!isAdmin}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  {isAdmin && <Button variant="ghost" size="icon" onClick={() => removeStudent(s.id)}><Trash2 className="w-4 h-4"/></Button>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Email schedule (waiting approval only)</CardTitle>
            {isAdmin && <Button size="sm" onClick={() => setEmailOpen(true)} disabled={students.length === 0}><Mail className="w-4 h-4 mr-1"/>Prepare Email</Button>}
          </CardHeader>
          <CardContent>
            {emails.length === 0 && <p className="text-sm text-muted-foreground">No emails prepared. Emails are never sent automatically — they wait here for admin approval.</p>}
            <div className="divide-y divide-border">
              {emails.map(e => (
                <Link key={e.id} to="/staff/ops/emails" className="py-2 flex items-center justify-between hover:bg-secondary/40 rounded px-2">
                  <div>
                    <div className="text-sm font-medium">{e.subject}</div>
                    <div className="text-xs text-muted-foreground">{e.email_type} · {Array.isArray(e.recipients) ? e.recipients.length : 0} recipients {e.scheduled_at ? `· ${format(new Date(e.scheduled_at), "MMM d, HH:mm")}` : ""}</div>
                  </div>
                  <Badge variant={e.status === "sent" ? "outline" : "default"}>{e.status.replace("_", " ")}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Operational Checklist</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {checklist.map(it => (
              <div key={it.id} className="flex items-center gap-2 text-sm">
                <Checkbox checked={it.done} onCheckedChange={() => toggleChecklist(it)} />
                <span className={it.done ? "line-through text-muted-foreground" : ""}>{it.label}</span>
              </div>
            ))}
            {isAdmin && (
              <div className="flex gap-2 pt-2">
                <Input placeholder="New checklist item" value={checklistLabel} onChange={e => setChecklistLabel(e.target.value)} />
                <Button size="sm" onClick={addChecklist}>Add</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add students</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Paste emails (one per line, "Name email@x.com" also accepted)</Label>
            <Textarea rows={10} value={pasteText} onChange={e => setPasteText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasteOpen(false)}>Cancel</Button>
            <Button onClick={addStudents}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Prepare email (waiting for approval)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Email type</Label>
              <Select value={newEmail.email_type} onValueChange={v => setNewEmail({...newEmail, email_type: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="login_details">Login details</SelectItem>
                  <SelectItem value="final_reminder">Final reminder</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Subject</Label><Input value={newEmail.subject} onChange={e => setNewEmail({...newEmail, subject: e.target.value})} /></div>
            <div><Label>Body</Label><Textarea rows={8} value={newEmail.body} onChange={e => setNewEmail({...newEmail, body: e.target.value})} /></div>
            <div><Label>Scheduled for (optional)</Label><Input type="datetime-local" value={newEmail.scheduled_at} onChange={e => setNewEmail({...newEmail, scheduled_at: e.target.value})} /></div>
            <p className="text-xs text-muted-foreground">Recipients will be snapshotted from the current student list ({students.length}). Nothing is sent until an admin approves in Communications Centre.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={createEmailDraft}>Create draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
