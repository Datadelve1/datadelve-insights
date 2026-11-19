import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FlaskConical, Loader2, Send } from "lucide-react";
import { buildTaskEmail, taskTrack, tracksFor, isRecordingTask, type OpsTaskLike } from "@/lib/opsTaskEmails";
import { completeOpsTask } from "@/lib/opsTaskComplete";

interface Props {
  task: (OpsTaskLike & { cohort_id: string | null }) | null;
  cohortNumber: number | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: { id: string; email?: string };
  actorName: string;
  isAdmin: boolean;
  onDone: () => void;
}

export default function TaskEmailDialog({ task, cohortNumber, open, onOpenChange, user, actorName, isAdmin, onDone }: Props) {
  const [classLink, setClassLink] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<Array<{ email: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<"" | "test" | "send">("");
  const [draftId, setDraftId] = useState<string | null>(null);
  const needsLink = task?.task_type === "class_link";

  useEffect(() => {
    if (!open || !task) return;
    setClassLink(""); setDraftId(null);
    const t = buildTaskEmail(task, cohortNumber, "");
    setSubject(t.subject); setBody(t.body);
  }, [open, task?.id]);

  // Keep the class link inside the message as it's typed.
  useEffect(() => {
    if (!task || !needsLink) return;
    setBody(buildTaskEmail(task, cohortNumber, classLink).body);
    setDraftId(null);
  }, [classLink]);

  useEffect(() => {
    if (!open || !task || !cohortNumber) { setRecipients([]); return; }
    setLoading(true);
    let q = supabase.from("cohort2_enrollments").select("full_name, email")
      .eq("cohort", `Cohort ${cohortNumber}`).eq("payment_status", "paid");
    const tracks = tracksFor(taskTrack(task));
    if (tracks) q = q.in("track", tracks);
    q.then(({ data, error }) => {
      if (error) toast.error(error.message);
      const seen = new Set<string>();
      setRecipients((data || [])
        .map((r: any) => ({ email: String(r.email || "").trim().toLowerCase(), name: String(r.full_name || "").trim() }))
        .filter((r) => r.email && !seen.has(r.email) && seen.add(r.email)));
      setLoading(false);
    });
  }, [open, task?.id, cohortNumber]);

  const validate = () => {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and message are required"); return false; }
    if (needsLink && !/^https?:\/\//i.test(classLink.trim())) { toast.error("Add the class link first"); return false; }
    if (/\[(add class link|Write the .* message here\.)\]/i.test(body)) { toast.error("Fill in the part in [brackets] first"); return false; }
    return true;
  };

  // One saved copy of the email, refreshed with the latest wording before each test/send.
  const saveDraft = async (): Promise<string | null> => {
    const row = {
      email_type: isRecordingTask(task!) ? "recording_assignment" : task!.task_type === "class_link" ? "class_reminder" : "task_email",
      subject, body, recipients, cohort_id: task!.cohort_id, status: "waiting_approval", created_by: user.id,
    };
    if (draftId) {
      const { error } = await supabase.from("ops_emails").update(row).eq("id", draftId);
      if (error) { toast.error(error.message); return null; }
      return draftId;
    }
    const { data, error } = await supabase.from("ops_emails").insert(row).select("id").single();
    if (error) { toast.error(error.message); return null; }
    setDraftId(data.id);
    return data.id;
  };

  const sendTest = async () => {
    if (!validate()) return;
    setBusy("test");
    const id = await saveDraft();
    if (!id) return setBusy("");
    const { data, error } = await supabase.functions.invoke("ops-approve-and-send", { body: { emailId: id, test: true } });
    setBusy("");
    if (error || !data?.ok) return toast.error(data?.error || error?.message || "Test failed");
    toast.success(`Test sent to ${data.to}`);
  };

  const send = async () => {
    if (!validate()) return;
    if (recipients.length === 0) return toast.error("No paid students found for this cohort");
    if (!confirm(`Send this email to ${recipients.length} student(s) now?`)) return;
    setBusy("send");
    const id = await saveDraft();
    if (!id) return setBusy("");
    const { data, error } = await supabase.functions.invoke("ops-approve-and-send", { body: { emailId: id } });
    if (error || !data?.ok) { setBusy(""); return toast.error(data?.error || error?.message || "Send failed"); }
    const res = await completeOpsTask(task!, { id: user.id, name: actorName, isAdmin }, `Email sent to ${data.sent} student(s)`);
    setBusy("");
    if (!res.ok) toast.error(res.error || "Email sent, but the task could not be marked done");
    else toast.success(`Sent to ${data.sent} student(s) — task marked done`);
    onOpenChange(false);
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send email</DialogTitle>
          <DialogDescription>{task?.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          {needsLink && (
            <div><Label>Class link</Label>
              <Input value={classLink} onChange={(e) => setClassLink(e.target.value)} placeholder="https://meet.google.com/..." />
            </div>
          )}
          <div><Label>Subject</Label><Input value={subject} onChange={(e) => { setSubject(e.target.value); }} /></div>
          <div>
            <Label>Message</Label>
            <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">{"{first_name}"} is replaced with each student's first name.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {loading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : <strong className="text-foreground">{recipients.length}</strong>} paid student(s) in {cohortNumber ? `Cohort ${cohortNumber}` : "this cohort"} will receive this.
          </p>
        </div>
        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!busy}>Cancel</Button>
          <Button variant="secondary" onClick={sendTest} disabled={!!busy || loading}>
            {busy === "test" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FlaskConical className="w-4 h-4 mr-1" />} Send test to me
          </Button>
          <Button onClick={send} disabled={!!busy || loading || recipients.length === 0}>
            {busy === "send" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />} Send to students
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
