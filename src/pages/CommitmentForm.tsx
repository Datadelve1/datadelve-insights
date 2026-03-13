import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const CommitmentForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    country: "",
    current_status: "",
    available_fridays: "",
    agree_weekly_assignments: "",
    submit_reflections: "",
    engage_posts: "",
    ambassador_interest: "",
    commitment_agreed: false,
  });

  const theme = {
    bg: "#FAF8F5", bgAlt: "#F2EDE6", text: "#1A1A1A", textMuted: "#5A5A5A",
    gold: "#D4A017", goldLight: "#F5E6B8", border: "#E8E0D4", card: "#FFFFFF",
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.country || !form.current_status) {
      toast({ title: "Please fill in all personal details", variant: "destructive" }); return;
    }
    if (!form.available_fridays || !form.agree_weekly_assignments || !form.submit_reflections || !form.engage_posts) {
      toast({ title: "Please complete all training commitment fields", variant: "destructive" }); return;
    }
    if (!form.ambassador_interest) {
      toast({ title: "Please indicate your ambassador interest", variant: "destructive" }); return;
    }
    if (!form.commitment_agreed) {
      toast({ title: "Please agree to the commitment", variant: "destructive" }); return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("training_commitments" as any).insert({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        country: form.country.trim(),
        current_status: form.current_status,
        available_fridays: form.available_fridays === "Yes",
        agree_weekly_assignments: form.agree_weekly_assignments === "Yes",
        submit_reflections: form.submit_reflections === "Yes",
        engage_posts: form.engage_posts === "Yes",
        ambassador_interest: form.ambassador_interest,
        commitment_agreed: true,
      });
      if (error) throw error;

      await supabase.functions.invoke("send-commitment-confirmation", {
        body: { email: form.email.trim(), full_name: form.full_name.trim() },
      });

      toast({ title: "Commitment confirmed! 🎉", description: "Check your email for confirmation." });
      setForm({
        full_name: "", email: "", country: "", current_status: "",
        available_fridays: "", agree_weekly_assignments: "", submit_reflections: "",
        engage_posts: "", ambassador_interest: "", commitment_agreed: false,
      });
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const YesNoField = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium" style={{ color: theme.text }}>{label}</Label>
      <RadioGroup value={value} onValueChange={(v) => updateField(field, v)} className="flex gap-6">
        {["Yes", "No"].map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <RadioGroupItem value={opt} id={`${field}-${opt}`} />
            <Label htmlFor={`${field}-${opt}`} style={{ color: theme.text }}>{opt}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  return (
    <div className="min-h-screen font-body" style={{ background: theme.bg, color: theme.text }}>
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:underline" style={{ color: theme.gold }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="rounded-3xl p-8 md:p-12 border" style={{ background: theme.card, borderColor: theme.border }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: theme.text }}>
            Confirm Your Participation – Delvetek Free Data Analysis Training
          </h1>
          <p className="mb-4 leading-relaxed" style={{ color: theme.textMuted }}>
            Welcome to Delvetek! To ensure a high-quality and productive learning experience, all participants must confirm their commitment to the program. This form tracks participation metrics such as:
          </p>
          <ul className="mb-4 space-y-1 text-sm" style={{ color: theme.textMuted }}>
            <li>• Weekly assignment completion</li>
            <li>• Learning reflections (video or written)</li>
            <li>• Active engagement with posts and discussions</li>
          </ul>
          <p className="mb-2 font-semibold text-sm" style={{ color: theme.text }}>Why this matters:</p>
          <ul className="mb-10 space-y-1 text-sm" style={{ color: theme.textMuted }}>
            <li>• Verify participation</li>
            <li>• Issue certificates of completion</li>
            <li>• Provide professional references</li>
            <li>• Authorize use of the Delvetek name</li>
          </ul>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 1 – Personal Details
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Full Name", field: "full_name", type: "text" },
                  { label: "Email Address (must match registration email)", field: "email", type: "email" },
                  { label: "Country of Residence", field: "country", type: "text" },
                ].map((item) => (
                  <div key={item.field} className="space-y-1">
                    <Label style={{ color: theme.text }}>{item.label} *</Label>
                    <Input
                      type={item.type} required
                      value={(form as any)[item.field]}
                      onChange={(e) => updateField(item.field, e.target.value)}
                      style={{ borderColor: theme.border, background: theme.bg }}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label style={{ color: theme.text }}>Current Status *</Label>
                  <RadioGroup value={form.current_status} onValueChange={(v) => updateField("current_status", v)} className="space-y-2">
                    {["Student", "Job Seeker", "Working Professional", "Career Switcher", "Other"].map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <RadioGroupItem value={opt} id={`status-${opt}`} />
                        <Label htmlFor={`status-${opt}`} style={{ color: theme.text }}>{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 2 – Training Commitment
              </h2>
              <div className="space-y-5">
                <YesNoField label="Are you available to attend the live training every Friday, 6 PM – 9 PM? *" value={form.available_fridays} field="available_fridays" />
                <YesNoField label="Do you agree to complete and submit weekly assignments before the next class? *" value={form.agree_weekly_assignments} field="agree_weekly_assignments" />
                <YesNoField label="After each class, will you submit a short learning reflection or review (video or written)? *" value={form.submit_reflections} field="submit_reflections" />
                <YesNoField label="Are you willing to actively engage with Delvetek posts, discussions, and learning updates? *" value={form.engage_posts} field="engage_posts" />
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 3 – Ambassador Interest
              </h2>
              <div className="space-y-2">
                <Label style={{ color: theme.text }}>Would you be interested in applying to the Delvetek Ambassador Program after 3 months of consistent participation? *</Label>
                <RadioGroup value={form.ambassador_interest} onValueChange={(v) => updateField("ambassador_interest", v)} className="flex gap-6">
                  {["Yes", "Maybe", "No"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem value={opt} id={`amb-${opt}`} />
                      <Label htmlFor={`amb-${opt}`} style={{ color: theme.text }}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 4 – Final Commitment
              </h2>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={form.commitment_agreed}
                  onCheckedChange={(v) => updateField("commitment_agreed", !!v)}
                  className="mt-1"
                />
                <Label className="text-sm leading-relaxed" style={{ color: theme.text }}>
                  I confirm that I am fully committed to participating in the Delvetek Free Data Analysis Training Program, completing weekly assignments, submitting learning reflections, and actively engaging with the learning community. I understand that these metrics are required for access to class materials, recordings, certificates, references, and professional authorization to use the Delvetek name. *
                </Label>
              </div>
            </div>

            <Button
              type="submit" disabled={isLoading}
              className="w-full h-12 font-display font-semibold text-base"
              style={{ background: theme.gold, color: "#FFFFFF" }}
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Confirm Commitment"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommitmentForm;
