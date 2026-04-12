import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Award, Search, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface CertRecord {
  id: string;
  user_id: string;
  eligible: boolean;
  payment_status: string;
  payment_reference: string | null;
  amount: number;
  paid_at: string | null;
  profile?: { full_name: string; email: string };
}

const CertificateManagement = () => {
  const [records, setRecords] = useState<CertRecord[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string; email: string }>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: certs }, { data: allProfiles }] = await Promise.all([
      supabase.from("certificate_payments").select("*"),
      supabase.from("profiles").select("id, full_name, email"),
    ]);

    const profileMap: Record<string, { full_name: string; email: string }> = {};
    (allProfiles || []).forEach((p: any) => {
      profileMap[p.id] = { full_name: p.full_name, email: p.email };
    });
    setProfiles(profileMap);

    // Merge cert records with profile info
    const merged = (certs || []).map((c: any) => ({
      ...c,
      profile: profileMap[c.user_id],
    }));
    setRecords(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleEligibility = async (userId: string, currentEligible: boolean) => {
    setToggling(userId);
    // Check if record exists
    const existing = records.find((r) => r.user_id === userId);
    if (existing) {
      const { error } = await supabase
        .from("certificate_payments")
        .update({ eligible: !currentEligible, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) {
        toast.error("Failed to update eligibility");
      } else {
        toast.success(`Student marked as ${!currentEligible ? "eligible" : "not eligible"}`);
        fetchData();
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from("certificate_payments")
        .insert({ user_id: userId, eligible: true });
      if (error) {
        toast.error("Failed to create record");
      } else {
        toast.success("Student marked as eligible");
        fetchData();
      }
    }
    setToggling(null);
  };

  // Show all students (profiles) with cert status
  const allStudents = Object.entries(profiles).map(([id, p]) => {
    const cert = records.find((r) => r.user_id === id);
    return { userId: id, ...p, cert };
  });

  const filtered = allStudents.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status?: string) => {
    if (!status || status === "pending")
      return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
    if (status === "paid")
      return <Badge className="gap-1 bg-green-600"><CheckCircle2 className="w-3 h-3" /> Paid</Badge>;
    return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Failed</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const eligibleCount = records.filter((r) => r.eligible).length;
  const paidCount = records.filter((r) => r.payment_status === "paid").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> Certificate Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Students can pay anytime. Toggle eligibility to approve certificate issuance after program completion.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="font-display text-2xl font-bold text-foreground">{allStudents.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Eligible</p>
            <p className="font-display text-2xl font-bold text-primary">{eligibleCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="font-display text-2xl font-bold text-green-600">{paidCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Student List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No students found.</p>
            )}
            {filtered.map((student) => (
              <div
                key={student.userId}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{student.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                  {student.cert?.paid_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Paid on {new Date(student.cert.paid_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {student.cert && statusBadge(student.cert.payment_status)}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Issue Cert</span>
                    <Switch
                      checked={student.cert?.eligible ?? false}
                      disabled={toggling === student.userId}
                      onCheckedChange={() =>
                        toggleEligibility(student.userId, student.cert?.eligible ?? false)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateManagement;
