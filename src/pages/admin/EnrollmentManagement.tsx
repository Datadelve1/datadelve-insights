import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
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
}

const EnrollmentManagement = () => {
  const { cohort } = useAdminCohort();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

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
        toast.success(data.email_sent ? "Confirmed — login email sent" : "Confirmed (email send failed, check logs)");
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

  const renderTable = (trackFilter: string) => {
    const filtered = enrollments.filter((e) => e.track === trackFilter);
    if (!filtered.length) {
      return <p className="text-muted-foreground text-sm py-8 text-center">No enrollments for this track yet.</p>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-muted-foreground font-medium">Name</th>
              <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
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
                    </div>
                  )}
                  {e.confirmed_by_admin && e.payment_reference && (
                    <span className="text-[10px] font-mono text-muted-foreground">{e.payment_reference}</span>
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
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Enrollments</h1>
        <p className="text-muted-foreground text-sm">Manage student enrollments by track</p>
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
    </div>
  );
};

export default EnrollmentManagement;
