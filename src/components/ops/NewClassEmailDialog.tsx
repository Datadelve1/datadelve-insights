import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { buildClassEmail, CLASS_EMAIL_LABELS, type ClassEmailKind } from "@/lib/classEmailTemplates";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId: string;
  isAdmin: boolean;
  onCreated: () => void;
}

const TRACKS = [
  { value: "all", label: "All tracks" },
  { value: "beginner", label: "Beginner" },
  { value: "professional", label: "Professional" },
  { value: "advanced", label: "Advanced" },
];

export default function NewClassEmailDialog({ open, onOpenChange, userId, isAdmin, onCreated }: Props) {
  const [kind, setKind] = useState<ClassEmailKind>("class_reminder");
  const [cohorts, setCohorts] = useState<string[]>([]);
  const [cohort, setCohort] = useState("");
  const [track, setTrack] = useState("all");
  const [when, setWhen] = useState("today at 6 PM WAT");
  const [classLink, setClassLink] = useState("");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<Array<{ email: string; name: string }>>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load cohorts that have paid students.
  useEffect(() => {
    if (!open) return;
    supabase.from("cohort2_enrollments").select("cohort").eq("payment_status", "paid").then(({ data }) => {
      const list = Array.from(new Set((data || []).map((d: any) => d.cohort))).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }));
      setCohorts(list);
      if (!cohort && list.length) setCohort(list[list.length - 1]);
    });
  }, [open]);

  // Refresh wording whenever the inputs change.
  useEffect(() => {
    if (!cohort) return;
    const t = buildClassEmail(kind, { cohort, when, classLink, topic });
    setSubject(t.subject);
    setBody(t.body);
  }, [kind, cohort, when, classLink, topic]);

  // Load paid students for the chosen cohort/track.
  useEffect(() => {
    if (!open || !cohort) return;
    setLoadingRecipients(true);
    let q = supabase.from("cohort2_enrollments").select("full_name, email").eq("cohort", cohort).eq("payment_status", "paid");
    if (track !== "all") q = q.eq("track", track);
    q.then(({ data, error }) => {
      if (error) toast.error(error.message);
      const seen = new Set<string>();
      const rows = (data || [])
        .map((r: any) => ({ email: String(r.email || "").trim().toLowerCase(), name: String(r.full_name || "").trim() }))
        .filter((r) => r.email && !seen.has(r.email) && seen.add(r.email));
      setRecipients(rows);
      setLoadingRecipients(false);
    });
  }, [open, cohort, track]);

  const save = async () => {
    if (!subject.trim() || !body.trim()) return toast.error("Subject and message are required");
    if (recipients.length === 0) return toast.error("No paid students found for this cohort");
    if (kind === "class_reminder" && !/^https?:\/\//i.test(classLink.trim())) return toast.error("Add the class link");
    setSaving(true);
    const { data, error } = await supabase.from("ops_emails").insert({
      email_type: kind,
      subject,
      body,
      recipients,
      status: "waiting_approval",
      created_by: userId,
    }).select().single();
    if (error) { setSaving(false); return toast.error(error.message); }
    await supabase.from("ops_activity_log").insert({
      actor_user_id: userId, actor_kind: isAdmin ? "admin" : "staff",
      action: "email_prepared", entity_type: "ops_emails", entity_id: data.id,
      detail: { cohort, track, kind, recipients: recipients.length },
    });
    setSaving(false);
    toast.success("Saved — waiting for admin approval");
    onOpenChange(false);
    setClassLink(""); setTopic("");
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>New class email</DialogTitle></DialogHeader>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Email type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as ClassEmailKind)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CLASS_EMAIL_LABELS) as ClassEmailKind[]).map((k) => (
                    <SelectItem key={k} value={k}>{CLASS_EMAIL_LABELS[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Cohort</Label>
              <Select value={cohort} onValueChange={setCohort}>
                <SelectTrigger><SelectValue placeholder="Choose cohort" /></SelectTrigger>
                <SelectContent>{cohorts.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Track</Label>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TRACKS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Topic (optional)</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Excel pivot tables" /></div>
            {kind === "class_reminder" && (
              <>
                <div><Label>Class time</Label><Input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="today at 6 PM WAT" /></div>
                <div><Label>Class link</Label><Input value={classLink} onChange={(e) => setClassLink(e.target.value)} placeholder="https://meet.google.com/..." /></div>
              </>
            )}
          </div>
          <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div>
            <Label>Message</Label>
            <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">{"{first_name}"} is replaced with each student's first name.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {loadingRecipients ? <Loader2 className="inline w-4 h-4 animate-spin" /> : <strong className="text-foreground">{recipients.length}</strong>} paid student(s) will receive this after an admin approves it.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || loadingRecipients}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Save for approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
