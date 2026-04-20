import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, Sparkles, Upload, Mail, Instagram } from "lucide-react";

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Phone is required").max(30),
  why_refer: z.string().trim().min(20, "Tell us at least 20 characters").max(800),
  ig_handle: z.string().trim().max(50).optional(),
});

const AmbassadorSignup = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [allowIgTag, setAllowIgTag] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    why_refer: "",
    ig_handle: "",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `ambassadors/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("form-uploads").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("form-uploads").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
      setPhotoPreview(URL.createObjectURL(file));
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Please check your details",
        description: parsed.error.issues[0]?.message,
        variant: "destructive",
      });
      return;
    }
    if (!photoUrl) {
      toast({ title: "Please upload a professional headshot", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("ambassador_signups" as any).insert({
        full_name: parsed.data.full_name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        why_refer: parsed.data.why_refer,
        photo_url: photoUrl,
        ig_handle: parsed.data.ig_handle ? parsed.data.ig_handle.replace(/^@/, "").trim() || null : null,
        allow_ig_tag: allowIgTag,
      });
      if (error) throw error;

      // Fire-and-forget confirmation emails (don't block the success state)
      supabase.functions.invoke("send-ambassador-confirmation", {
        body: { email: parsed.data.email.toLowerCase(), full_name: parsed.data.full_name },
      }).catch((e) => console.error("Confirmation email failed:", e));

      setSubmitted(true);
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">Application received 🎉</h1>
          <p className="text-muted-foreground leading-relaxed">
            Thanks for your interest in becoming a Delvetek Ambassador! Our team will review your
            details and <strong className="text-foreground">email you your unique referral code</strong> along
            with a private link to track everyone who signs up with it.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check your inbox (and spam folder) within 24–48 hours.
          </p>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-12 max-w-2xl">

        <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AMBASSADOR PROGRAM
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Become a Delvetek Ambassador
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Help us spread the word about Delvetek and earn rewards for every student you refer.
          </p>

          <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-8">
            <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">Your code arrives by email</p>
              <p className="text-muted-foreground leading-relaxed">
                Once approved, we'll email you a unique referral code and a private tracking link so
                you can see exactly who signs up with your code.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Headshot upload */}
            <div className="space-y-2">
              <Label>Professional Headshot *</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                    ) : photoUrl ? (
                      "Change Photo"
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Upload Photo</>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Clear, professional headshot. JPG/PNG, max 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">We'll email your referral code here.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number (WhatsApp preferred) *</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+234 800 000 0000"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="why_refer">Why do you want to refer people to Delvetek? *</Label>
              <Textarea
                id="why_refer"
                value={form.why_refer}
                onChange={(e) => update("why_refer", e.target.value)}
                placeholder="Tell us about your audience, network, or why you believe in Delvetek..."
                rows={5}
                required
              />
              <p className="text-xs text-muted-foreground">Min 20 characters.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ig_handle" className="flex items-center gap-2">
                <Instagram className="w-4 h-4" /> Instagram Handle <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Input
                id="ig_handle"
                value={form.ig_handle}
                onChange={(e) => update("ig_handle", e.target.value)}
                placeholder="@yourhandle"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">If you'd like us to feature you on our Instagram.</p>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/30 cursor-pointer">
              <Checkbox
                checked={allowIgTag}
                onCheckedChange={(v) => setAllowIgTag(!!v)}
                className="mt-0.5"
              />
              <span className="text-sm text-foreground leading-relaxed">
                Yes, I'd like Delvetek to <strong>tag me</strong> or <strong>collaborate with me</strong> when posting me as an ambassador on Instagram.
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading || uploading}
              className="w-full h-12 font-semibold text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              No account needed. We'll email your referral code and tracking link once approved.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorSignup;
