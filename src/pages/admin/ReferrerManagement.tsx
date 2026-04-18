import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Plus, Pencil, Trash2, Copy, CheckCircle2, XCircle, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface Referrer {
  id: string;
  code: string;
  full_name: string;
  email: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface AmbassadorSignup {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  why_refer: string;
  status: string;
  referrer_id: string | null;
  notes: string | null;
  created_at: string;
}

const ReferrerManagement = () => {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [signups, setSignups] = useState<AmbassadorSignup[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Referrer | null>(null);
  const [form, setForm] = useState({ code: "", full_name: "", email: "", notes: "", is_active: true });

  // Approval dialog state
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalSignup, setApprovalSignup] = useState<AmbassadorSignup | null>(null);
  const [approvalCode, setApprovalCode] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: refs }, { data: enrolls }, { data: sgnps }] = await Promise.all([
      supabase.from("referrers").select("*").order("created_at", { ascending: false }),
      supabase.from("cohort2_enrollments").select("referral_code").not("referral_code", "is", null),
      supabase.from("ambassador_signups" as any).select("*").order("created_at", { ascending: false }),
    ]);
    setReferrers((refs as Referrer[]) || []);
    setSignups((sgnps as unknown as AmbassadorSignup[]) || []);
    const c: Record<string, number> = {};
    (enrolls || []).forEach((e: any) => {
      const code = (e.referral_code || "").toUpperCase();
      if (code) c[code] = (c[code] || 0) + 1;
    });
    setCounts(c);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ code: "", full_name: "", email: "", notes: "", is_active: true });
    setOpen(true);
  };

  const openEdit = (r: Referrer) => {
    setEditing(r);
    setForm({ code: r.code, full_name: r.full_name, email: r.email || "", notes: r.notes || "", is_active: r.is_active });
    setOpen(true);
  };

  const save = async () => {
    if (!form.code.trim() || !form.full_name.trim()) {
      toast.error("Code and full name are required");
      return;
    }
    const payload = {
      code: form.code.trim().toUpperCase(),
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
      is_active: form.is_active,
    };
    if (editing) {
      const { error } = await supabase.from("referrers").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Referrer updated");
    } else {
      const { error } = await supabase.from("referrers").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Referrer created");
    }
    setOpen(false);
    fetchAll();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this referrer? Existing enrollments referencing the code will be unaffected.")) return;
    const { error } = await supabase.from("referrers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Referrer deleted");
    fetchAll();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };

  const copyTrackingLink = (code: string) => {
    const url = `${window.location.origin}/track/${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Tracking link copied");
  };

  const openApprove = (s: AmbassadorSignup) => {
    setApprovalSignup(s);
    // Suggest a code from first name
    const first = s.full_name.trim().split(" ")[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
    setApprovalCode(`${first}2026`);
    setApprovalOpen(true);
  };

  const approveSignup = async () => {
    if (!approvalSignup || !approvalCode.trim()) return;
    const code = approvalCode.trim().toUpperCase();

    // Create referrer
    const { data: newRef, error: refErr } = await supabase
      .from("referrers")
      .insert({
        code,
        full_name: approvalSignup.full_name,
        email: approvalSignup.email,
        notes: `From ambassador signup. Phone: ${approvalSignup.phone}`,
        is_active: true,
      })
      .select()
      .single();

    if (refErr) return toast.error(refErr.message);

    // Update signup
    const { error: sErr } = await supabase
      .from("ambassador_signups" as any)
      .update({ status: "approved", referrer_id: (newRef as any).id })
      .eq("id", approvalSignup.id);

    if (sErr) return toast.error(sErr.message);

    toast.success(`Approved! Code ${code} created. Share tracking link with ${approvalSignup.email}`);
    setApprovalOpen(false);
    fetchAll();
  };

  const rejectSignup = async (id: string) => {
    if (!confirm("Reject this signup?")) return;
    const { error } = await supabase
      .from("ambassador_signups" as any)
      .update({ status: "rejected" })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Signup rejected");
    fetchAll();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const pendingSignups = signups.filter((s) => s.status === "pending");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Referrers & Ambassadors</h1>
          <p className="text-muted-foreground text-sm">Manage referral codes and ambassador signups</p>
        </div>
        <Button variant="hero" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> New Referrer</Button>
      </div>

      <Tabs defaultValue="referrers">
        <TabsList>
          <TabsTrigger value="referrers">Referrers ({referrers.length})</TabsTrigger>
          <TabsTrigger value="signups">
            Ambassador Signups
            {pendingSignups.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-primary text-primary-foreground">
                {pendingSignups.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referrers" className="mt-4">
          {referrers.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No referrers yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-3 text-muted-foreground font-medium">Code</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Referrals</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {referrers.map((r) => (
                    <tr key={r.id} className="border-t border-border/50 hover:bg-secondary/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-primary">{r.code}</code>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyCode(r.code)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-3 text-foreground">{r.full_name}</td>
                      <td className="p-3 text-muted-foreground text-xs">{r.email || "—"}</td>
                      <td className="p-3 font-semibold text-foreground">{counts[r.code.toUpperCase()] || 0}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${r.is_active ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"}`}>
                          {r.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7" title="Copy tracking link" onClick={() => copyTrackingLink(r.code)}>
                            <LinkIcon className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7" onClick={() => openEdit(r)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7" onClick={() => remove(r.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="signups" className="mt-4">
          {signups.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No signups yet. Share <code className="font-mono text-primary">/become-ambassador</code> to start collecting applications.
            </p>
          ) : (
            <div className="space-y-3">
              {signups.map((s) => (
                <div key={s.id} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{s.full_name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status === "approved" ? "bg-green-500/20 text-green-600" :
                          s.status === "rejected" ? "bg-destructive/20 text-destructive" :
                          "bg-yellow-500/20 text-yellow-600"
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.email} · {s.phone} · {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {s.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="hero" onClick={() => openApprove(s)}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => rejectSignup(s.id)}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{s.why_refer}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Referrer" : "New Referrer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Referral Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. JOHN2026"
                className="font-mono"
                maxLength={32}
              />
              <p className="text-xs text-muted-foreground mt-1">Auto-uppercased. Must be unique.</p>
            </div>
            <div>
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} />
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active (students can use this code)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save}>{editing ? "Save Changes" : "Create Referrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve & Assign Code</DialogTitle>
          </DialogHeader>
          {approvalSignup && (
            <div className="space-y-3">
              <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                <p className="font-semibold text-foreground">{approvalSignup.full_name}</p>
                <p className="text-muted-foreground text-xs">{approvalSignup.email}</p>
              </div>
              <div>
                <Label>Assign Referral Code *</Label>
                <Input
                  value={approvalCode}
                  onChange={(e) => setApprovalCode(e.target.value.toUpperCase())}
                  className="font-mono"
                  maxLength={32}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  After approval, copy their tracking link from the Referrers tab and email it to them.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={approveSignup}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferrerManagement;
