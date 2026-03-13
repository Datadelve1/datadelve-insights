import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const AmbassadorForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    linkedin_url: "",
    attended_sessions: "",
    completed_assignments: "",
    submitted_reflections: "",
    whatsapp_engagement: "",
    why_ambassador: "",
    skills_strengths: "",
    willing_20hrs: "",
    commitment_agreed: false,
  });

  const theme = {
    bg: "#FAF8F5",
    bgAlt: "#F2EDE6",
    text: "#1A1A1A",
    textMuted: "#5A5A5A",
    gold: "#D4A017",
    goldLight: "#F5E6B8",
    border: "#E8E0D4",
    card: "#FFFFFF",
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("form-uploads").upload(path, file);
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = supabase.storage.from("form-uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!form.full_name || !form.email || !form.phone || !form.linkedin_url) {
      toast({ title: "Please fill in all personal details", variant: "destructive" });
      return;
    }
    if (!form.attended_sessions || !form.completed_assignments || !form.submitted_reflections || !form.whatsapp_engagement) {
      toast({ title: "Please complete all participation metrics", variant: "destructive" });
      return;
    }
    if (!form.why_ambassador || !form.skills_strengths || !form.willing_20hrs) {
      toast({ title: "Please complete all motivation & skills fields", variant: "destructive" });
      return;
    }
    if (!cvFile || !videoFile) {
      toast({ title: "Please upload both your CV and video introduction", variant: "destructive" });
      return;
    }
    if (!form.commitment_agreed) {
      toast({ title: "Please agree to the commitment agreement", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const [cvUrl, vidUrl] = await Promise.all([
        uploadFile(cvFile, "ambassador-cvs"),
        uploadFile(videoFile, "ambassador-videos"),
      ]);

      const { error } = await supabase.from("ambassador_applications" as any).insert({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        linkedin_url: form.linkedin_url.trim(),
        attended_sessions: form.attended_sessions === "Yes",
        completed_assignments: form.completed_assignments === "Yes",
        submitted_reflections: form.submitted_reflections === "Yes",
        whatsapp_engagement: form.whatsapp_engagement,
        why_ambassador: form.why_ambassador.trim(),
        skills_strengths: form.skills_strengths.trim(),
        willing_20hrs: form.willing_20hrs === "Yes",
        cv_url: cvUrl,
        video_url: vidUrl,
        commitment_agreed: true,
      });

      if (error) throw error;

      // Send auto-response email
      await supabase.functions.invoke("send-ambassador-confirmation", {
        body: { email: form.email.trim(), full_name: form.full_name.trim() },
      });

      toast({ title: "Application submitted! 🎉", description: "Check your email for confirmation." });
      setForm({
        full_name: "", email: "", phone: "", linkedin_url: "",
        attended_sessions: "", completed_assignments: "", submitted_reflections: "",
        whatsapp_engagement: "", why_ambassador: "", skills_strengths: "",
        willing_20hrs: "", commitment_agreed: false,
      });
      setCvFile(null);
      setVideoFile(null);
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
        <div className="flex items-center gap-2">
          <RadioGroupItem value="Yes" id={`${field}-yes`} />
          <Label htmlFor={`${field}-yes`} style={{ color: theme.text }}>Yes</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="No" id={`${field}-no`} />
          <Label htmlFor={`${field}-no`} style={{ color: theme.text }}>No</Label>
        </div>
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
            Delvetek Ambassador Application Form
          </h1>
          <p className="mb-10 leading-relaxed" style={{ color: theme.textMuted }}>
            Welcome to the Delvetek Ambassador Program Application! This form is for participants who have demonstrated consistent engagement and wish to become a Delvetek Ambassador. All fields are required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 1 – Personal Details
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Full Name", field: "full_name", type: "text" },
                  { label: "Email Address", field: "email", type: "email" },
                  { label: "Phone Number", field: "phone", type: "tel" },
                  { label: "LinkedIn / Portfolio URL", field: "linkedin_url", type: "url" },
                ].map((item) => (
                  <div key={item.field} className="space-y-1">
                    <Label style={{ color: theme.text }}>{item.label} *</Label>
                    <Input
                      type={item.type}
                      required
                      value={(form as any)[item.field]}
                      onChange={(e) => updateField(item.field, e.target.value)}
                      className="border"
                      style={{ borderColor: theme.border, background: theme.bg }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 2 – Participation Metrics
              </h2>
              <div className="space-y-5">
                <YesNoField label="Have you consistently attended all training sessions? *" value={form.attended_sessions} field="attended_sessions" />
                <YesNoField label="Have you completed all weekly assignments? *" value={form.completed_assignments} field="completed_assignments" />
                <YesNoField label="Have you submitted all reflections or video reviews? *" value={form.submitted_reflections} field="submitted_reflections" />
                <div className="space-y-2">
                  <Label style={{ color: theme.text }}>How would you rate your engagement on WhatsApp and learning posts? *</Label>
                  <RadioGroup value={form.whatsapp_engagement} onValueChange={(v) => updateField("whatsapp_engagement", v)} className="flex gap-6">
                    {["High", "Medium", "Low"].map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <RadioGroupItem value={opt} id={`eng-${opt}`} />
                        <Label htmlFor={`eng-${opt}`} style={{ color: theme.text }}>{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 3 – Motivation & Skills
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label style={{ color: theme.text }}>Why do you want to be an ambassador? *</Label>
                  <Textarea
                    required
                    value={form.why_ambassador}
                    onChange={(e) => updateField("why_ambassador", e.target.value)}
                    style={{ borderColor: theme.border, background: theme.bg }}
                    rows={4}
                  />
                </div>
                <div className="space-y-1">
                  <Label style={{ color: theme.text }}>What skills or strengths would you bring to the program? *</Label>
                  <Textarea
                    required
                    value={form.skills_strengths}
                    onChange={(e) => updateField("skills_strengths", e.target.value)}
                    style={{ borderColor: theme.border, background: theme.bg }}
                    rows={4}
                  />
                </div>
                <YesNoField label="Are you willing to dedicate 20 hours/week to ambassador tasks? *" value={form.willing_20hrs} field="willing_20hrs" />
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 4 – File Uploads
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label style={{ color: theme.text }}>Upload your CV / Resume * (PDF, max 1GB)</Label>
                  <label
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-solid"
                    style={{ borderColor: theme.border, background: theme.bg }}
                  >
                    <Upload className="w-5 h-5" style={{ color: theme.gold }} />
                    <span className="text-sm" style={{ color: theme.textMuted }}>
                      {cvFile ? cvFile.name : "Click to upload CV"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <div className="space-y-1">
                  <Label style={{ color: theme.text }}>Upload a short video introduction * (mp4/mov, max 1GB, face visible)</Label>
                  <label
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-solid"
                    style={{ borderColor: theme.border, background: theme.bg }}
                  >
                    <Upload className="w-5 h-5" style={{ color: theme.gold }} />
                    <span className="text-sm" style={{ color: theme.textMuted }}>
                      {videoFile ? videoFile.name : "Click to upload video"}
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime"
                      className="hidden"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 5 – Commitment Agreement
              </h2>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={form.commitment_agreed}
                  onCheckedChange={(v) => updateField("commitment_agreed", !!v)}
                  className="mt-1"
                />
                <Label className="text-sm leading-relaxed" style={{ color: theme.text }}>
                  I confirm that all information provided is accurate and I am willing to fulfill ambassador responsibilities. *
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 font-display font-semibold text-base"
              style={{ background: theme.gold, color: "#FFFFFF" }}
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorForm;
