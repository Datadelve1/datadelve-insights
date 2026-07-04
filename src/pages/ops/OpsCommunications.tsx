import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle2, Send, Eye, Trash2, AlertTriangle } from "lucide-react";

type Ctx = { user: any; isAdmin: boolean };

const STATUSES = ["all", "draft", "waiting_approval", "scheduled", "sent", "failed"];

export default function OpsCommunications() {
  const { isAdmin, user } = useOutletContext<Ctx>();
  const [emails, setEmails] = useState<any[]>([]);
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [sending, setSending] = useState(false);

  const load = async () => {
    let q = supabase.from("ops_emails").select("*").order("created_at", { ascending: false });
    if (status !== "all") q = q.eq("status", status);
    const { data } = await q;
    setEmails(data || []);
  };
  useEffect(() => { load(); }, [status]);

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from("ops_emails").update({
      subject: editing.subject,
      body: editing.body,
      recipients: editing.recipients,
      scheduled_at: editing.scheduled_at || null,
      status: editing.status,
    }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null); load();
  };

  const sendNow = async (row: any) => {
    if (!isAdmin) return toast.error("Admin only");
    if (!confirm(`Send "${row.subject}" to ${(row.recipients || []).length} recipient(s) now?`)) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("ops-approve-and-send", { body: { emailId: row.id } });
      if (error || !data?.ok) {
        toast.error(data?.error || error?.message || "Send failed");
      } else {
        toast.success(`Sent ${data.sent}, failed ${data.failed}`);
      }
    } finally {
      setSending(false); load(); setEditing(null);
    }
  };

  const removeRow = async (row: any) => {
    if (!confirm("Delete this email draft?")) return;
    await supabase.from("ops_emails").delete().eq("id", row.id);
    await supabase.from("ops_activity_log").insert({
      actor_user_id: user.id, actor_kind: isAdmin ? "admin" : "staff",
      action: "email_deleted", entity_type: "ops_emails", entity_id: row.id, detail: { subject: row.subject },
    });
    load();
  };

  const updateRecipients = (text: string) => {
    if (!editing) return;
    const rows = text.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const parts = l.split(/[,\s]+/);
      const email = parts.find(p => p.includes("@")) || l;
      const name = parts.filter(p => !p.includes("@")).join(" ");
      return { email, name };
    });
    setEditing({ ...editing, recipients: rows });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Communications Centre</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />
          Emails are never sent automatically — an admin must review and approve every send.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {STATUSES.map(s => (
          <Button key={s} variant={status === s ? "default" : "outline"} size="sm" onClick={() => setStatus(s)}>
            {s.replace("_", " ")}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs text-muted-foreground">
              <tr><th className="text-left p-3">Subject</th><th className="text-left p-3">Type</th><th className="text-left p-3">Recipients</th><th className="text-left p-3">Scheduled</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {emails.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No emails.</td></tr>}
              {emails.map(e => (
                <tr key={e.id}>
                  <td className="p-3 font-medium">{e.subject || "(no subject)"}</td>
                  <td className="p-3 text-xs">{e.email_type}</td>
                  <td className="p-3 text-xs">{Array.isArray(e.recipients) ? e.recipients.length : 0}</td>
                  <td className="p-3 text-xs">{e.scheduled_at ? format(new Date(e.scheduled_at), "MMM d, HH:mm") : "—"}</td>
                  <td className="p-3"><Badge variant={e.status === "sent" ? "outline" : e.status === "failed" ? "destructive" : "default"}>{e.status.replace("_", " ")}</Badge></td>
                  <td className="p-3 flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setPreview(e)}><Eye className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(e)}>Edit</Button>
                    {isAdmin && e.status !== "sent" && <Button variant="ghost" size="icon" onClick={() => sendNow(e)} disabled={sending}><Send className="w-4 h-4"/></Button>}
                    {isAdmin && <Button variant="ghost" size="icon" onClick={() => removeRow(e)}><Trash2 className="w-4 h-4"/></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Review email</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              <div><Label>Status</Label>
                <Select value={editing.status} onValueChange={v => setEditing({...editing, status: v})} disabled={!isAdmin}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="waiting_approval">Waiting for Approval</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Subject</Label><Input value={editing.subject || ""} onChange={e => setEditing({...editing, subject: e.target.value})} /></div>
              <div><Label>Body</Label><Textarea rows={10} value={editing.body || ""} onChange={e => setEditing({...editing, body: e.target.value})} /></div>
              <div><Label>Scheduled for</Label><Input type="datetime-local" value={editing.scheduled_at ? editing.scheduled_at.slice(0,16) : ""} onChange={e => setEditing({...editing, scheduled_at: e.target.value})} /></div>
              <div>
                <Label>Recipients ({(editing.recipients || []).length}) — one per line ("Name email@x.com")</Label>
                <Textarea rows={6} value={(editing.recipients || []).map((r: any) => r.name ? `${r.name} ${r.email}` : r.email).join("\n")} onChange={e => updateRecipients(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Close</Button>
            <Button onClick={save}>Save</Button>
            {isAdmin && editing && editing.status !== "sent" && (
              <Button onClick={() => sendNow(editing)} disabled={sending}><CheckCircle2 className="w-4 h-4 mr-1"/> Approve & Send Now</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Preview</DialogTitle></DialogHeader>
          {preview && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">Subject</div>
              <div className="font-medium">{preview.subject}</div>
              <div className="text-xs text-muted-foreground">Body</div>
              <div className="whitespace-pre-wrap bg-secondary/30 p-4 rounded text-sm">{preview.body}</div>
              <div className="text-xs text-muted-foreground">Recipients ({(preview.recipients || []).length})</div>
              <div className="text-xs bg-secondary/30 p-3 rounded max-h-40 overflow-y-auto">
                {(preview.recipients || []).map((r: any, i: number) => <div key={i}>{r.name ? `${r.name} <${r.email}>` : r.email}</div>)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
