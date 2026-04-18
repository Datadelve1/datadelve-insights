import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, CheckCircle2, Sparkles } from "lucide-react";

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Phone is required").max(30),
  why_refer: z.string().trim().min(20, "Tell us at least 20 characters").max(800),
});

const AmbassadorSignup = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    why_refer: "",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

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

    setLoading(true);
    try {
      const { error } = await supabase.from("ambassador_signups" as any).insert({
        full_name: parsed.data.full_name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        why_refer: parsed.data.why_refer,
      });
      if (error) throw error;
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
            details and reach out via email with your unique referral code and tracking link.
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
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AMBASSADOR PROGRAM
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Become a Delvetek Ambassador
          </h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Help us spread the word about Delvetek and earn rewards for every student you refer.
            Fill in your details below — once approved, we'll email you a unique referral code and a
            private link to track your referrals.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <Button
              type="submit"
              disabled={loading}
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
              No account needed. We'll email you a private tracking link once approved.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorSignup;
