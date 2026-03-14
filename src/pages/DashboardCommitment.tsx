import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Navigate, Link } from "react-router-dom";

const DashboardCommitment = () => {
  const { user, profile, isLoading, hasCommitted, refreshCommitment } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    country: "",
    current_status: "",
    available_fridays: "",
    agree_weekly_assignments: "",
    submit_reflections: "",
    engage_posts: "",
    ambassador_interest: "",
    commitment_agreed: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (hasCommitted) return <Navigate to="/dashboard" replace />;

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.country || !form.current_status) {
      toast({ title: "Please fill in all personal details", variant: "destructive" });
      return;
    }
    if (
      !form.available_fridays ||
      !form.agree_weekly_assignments ||
      !form.submit_reflections ||
      !form.engage_posts
    ) {
      toast({ title: "Please complete all training commitment fields", variant: "destructive" });
      return;
    }
    if (!form.ambassador_interest) {
      toast({ title: "Please indicate your ambassador interest", variant: "destructive" });
      return;
    }
    if (!form.commitment_agreed) {
      toast({ title: "Please agree to the commitment", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("training_commitments").insert({
        full_name: profile?.full_name ?? "",
        email: profile?.email ?? user.email ?? "",
        country: form.country.trim(),
        current_status: form.current_status,
        available_fridays: form.available_fridays === "Yes",
        agree_weekly_assignments: form.agree_weekly_assignments === "Yes",
        submit_reflections: form.submit_reflections === "Yes",
        engage_posts: form.engage_posts === "Yes",
        ambassador_interest: form.ambassador_interest,
        commitment_agreed: true,
        user_id: user.id,
      } as any);
      if (error) throw error;

      // Send confirmation email
      await supabase.functions.invoke("send-commitment-confirmation", {
        body: { email: profile?.email ?? user.email, full_name: profile?.full_name },
      });

      toast({ title: "Commitment confirmed! 🎉", description: "Your dashboard is now unlocked." });
      // Force page reload to refresh auth context
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const YesNoField = ({
    label,
    value,
    field,
  }: {
    label: string;
    value: string;
    field: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <RadioGroup value={value} onValueChange={(v) => updateField(field, v)} className="flex gap-6">
        {["Yes", "No"].map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <RadioGroupItem value={opt} id={`${field}-${opt}`} />
            <Label htmlFor={`${field}-${opt}`} className="text-foreground">
              {opt}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Confirm Your Participation
          </h1>
          <p className="text-muted-foreground mb-2">
            Welcome to Delvetek! Confirm your commitment to unlock your full student dashboard.
          </p>
          <div className="rounded-xl bg-secondary p-4 mb-8">
            <p className="text-sm text-foreground font-medium">
              Signed in as: {profile?.full_name} ({profile?.email ?? user.email})
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Details */}
            <div>
              <h2 className="font-display text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
                Personal Details
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-foreground">Country of Residence *</Label>
                  <Input
                    type="text"
                    required
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Current Status *</Label>
                  <RadioGroup
                    value={form.current_status}
                    onValueChange={(v) => updateField("current_status", v)}
                    className="space-y-2"
                  >
                    {["Student", "Job Seeker", "Working Professional", "Career Switcher", "Other"].map(
                      (opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <RadioGroupItem value={opt} id={`status-${opt}`} />
                          <Label htmlFor={`status-${opt}`} className="text-foreground">
                            {opt}
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Training Commitment */}
            <div>
              <h2 className="font-display text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
                Training Commitment
              </h2>
              <div className="space-y-5">
                <YesNoField
                  label="Are you available to attend the live training every Friday, 6 PM – 9 PM? *"
                  value={form.available_fridays}
                  field="available_fridays"
                />
                <YesNoField
                  label="Do you agree to complete and submit weekly assignments before the next class? *"
                  value={form.agree_weekly_assignments}
                  field="agree_weekly_assignments"
                />
                <YesNoField
                  label="After each class, will you submit a short learning reflection or review? *"
                  value={form.submit_reflections}
                  field="submit_reflections"
                />
                <YesNoField
                  label="Are you willing to actively engage with Delvetek posts and discussions? *"
                  value={form.engage_posts}
                  field="engage_posts"
                />
              </div>
            </div>

            {/* Ambassador Interest */}
            <div>
              <h2 className="font-display text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
                Ambassador Interest
              </h2>
              <div className="space-y-2">
                <Label className="text-foreground">
                  Interested in the Ambassador Program after 3 months? *
                </Label>
                <RadioGroup
                  value={form.ambassador_interest}
                  onValueChange={(v) => updateField("ambassador_interest", v)}
                  className="flex gap-6"
                >
                  {["Yes", "Maybe", "No"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem value={opt} id={`amb-${opt}`} />
                      <Label htmlFor={`amb-${opt}`} className="text-foreground">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Final Commitment */}
            <div>
              <h2 className="font-display text-lg font-semibold text-primary mb-4 pb-2 border-b border-border">
                Final Commitment
              </h2>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={form.commitment_agreed}
                  onCheckedChange={(v) => updateField("commitment_agreed", !!v)}
                  className="mt-1"
                />
                <Label className="text-sm leading-relaxed text-foreground">
                  I confirm that I am fully committed to participating in the Delvetek Free Data
                  Analysis Training Program, completing weekly assignments, submitting learning
                  reflections, and actively engaging with the learning community. *
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="hero"
              className="w-full h-12 text-base"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                "Confirm Commitment & Unlock Dashboard"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardCommitment;
