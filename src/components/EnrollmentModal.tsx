import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Shield, Heart, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TRACK_PRICES: Record<string, number> = {
  beginner: 10000,
  professional: 50000,
  advanced: 100000,
};

const CERTIFICATE_PRICE = 10000;

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTrack?: string;
}

const COMMITMENT_ITEMS = [
  "I will submit weekly written and video reviews after each session",
  "I will complete weekly individual assessments",
  "I will participate in weekly group assignments with peers",
  "I understand attendance is mandatory — missing more than 3 classes may result in removal from the program",
  "I consent that my written and video reviews may be used for promotional and marketing purposes",
];

const EnrollmentModal = ({ open, onOpenChange, defaultTrack }: EnrollmentModalProps) => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [track, setTrack] = useState(defaultTrack || "");
  const [addCertificate, setAddCertificate] = useState(false);
  const [commitmentChecks, setCommitmentChecks] = useState<boolean[]>(new Array(COMMITMENT_ITEMS.length).fill(false));
  const [classSchedule, setClassSchedule] = useState("");
  const [paying, setPaying] = useState(false);

  const allCommitmentsChecked = commitmentChecks.every(Boolean);
  const trackPrice = TRACK_PRICES[track] || 0;
  const totalAmount = trackPrice + (addCertificate ? CERTIFICATE_PRICE : 0);

  const handleCommitmentToggle = (index: number) => {
    const updated = [...commitmentChecks];
    updated[index] = !updated[index];
    setCommitmentChecks(updated);
  };

  const handleEnroll = async () => {
    if (!fullName.trim() || !email.trim() || !track) {
      toast.error("Please fill in all required fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setPaying(true);
    try {
      const callbackUrl = `${window.location.origin}/enrollment-callback`;
      const { data, error } = await supabase.functions.invoke("initialize-enrollment-payment", {
        body: {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          track,
          certificate_requested: addCertificate,
          callback_url: callbackUrl,
          class_schedule: classSchedule,
          commitment_accepted: true,
        },
      });

      if (error) throw error;
      if (data?.ok && data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.error(data?.error || "Failed to initialize payment");
        setPaying(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Payment initialization failed");
      setPaying(false);
    }
  };

  const resetAndClose = (open: boolean) => {
    if (!open) {
      setStep(1);
      setCommitmentChecks(new Array(COMMITMENT_ITEMS.length).fill(false));
      setClassSchedule("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === 1 && "Step 1: Your Details"}
            {step === 2 && "Step 2: Commitment Agreement"}
            {step === 3 && "Step 3: Choose Your Schedule"}
            {step === 4 && "Step 4: Payment"}
          </DialogTitle>
          <div className="flex gap-1.5 pt-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-secondary"}`} />
            ))}
          </div>
        </DialogHeader>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" maxLength={100} />
            </div>
            <div>
              <Label>Email Address *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" maxLength={255} />
            </div>
            <div>
              <Label>Select Track *</Label>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger><SelectValue placeholder="Choose a track" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (₦10,000)</SelectItem>
                  <SelectItem value="professional">Professional (₦50,000)</SelectItem>
                  <SelectItem value="advanced">Advanced (₦100,000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="certificate" checked={addCertificate} onCheckedChange={(checked) => setAddCertificate(!!checked)} />
              <Label htmlFor="certificate" className="cursor-pointer">Add Certificate of Completion (₦10,000)</Label>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!fullName.trim() || !email.trim() || !track}
              onClick={() => setStep(2)}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Commitment Form */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Reassuring message */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-foreground">This is not a traditional course payment</p>
                  <p className="text-muted-foreground">
                    The fee you pay is a <strong className="text-foreground">commitment fee</strong>, not full payment for the program. We are equally committed to your growth and success — which is why these guidelines are in place.
                  </p>
                  <p className="text-muted-foreground">
                    This structure is designed to <strong className="text-foreground">support discipline, accountability, and real results</strong>. We believe in you, and we want to make sure you get the most out of this experience.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm font-medium text-foreground">Please confirm you agree to the following:</p>

            <div className="space-y-3">
              {COMMITMENT_ITEMS.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <Checkbox
                    id={`commit-${i}`}
                    checked={commitmentChecks[i]}
                    onCheckedChange={() => handleCommitmentToggle(i)}
                    className="mt-0.5"
                  />
                  <Label htmlFor={`commit-${i}`} className="cursor-pointer text-sm text-foreground leading-relaxed">{item}</Label>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button variant="hero" size="lg" className="flex-1" disabled={!allCommitmentsChecked} onClick={() => setStep(3)}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Class Schedule */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose your preferred class schedule:</p>

            <RadioGroup value={classSchedule} onValueChange={setClassSchedule} className="space-y-3">
              <label
                htmlFor="weekday"
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  classSchedule === "weekday" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <RadioGroupItem value="weekday" id="weekday" className="mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Weekday Class</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    <span>Monday & Wednesday · 5:00 PM – 8:00 PM</span>
                  </div>
                </div>
              </label>

              <label
                htmlFor="weekend"
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  classSchedule === "weekend" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <RadioGroupItem value="weekend" id="weekend" className="mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Weekend Class</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    <span>Friday & Saturday · 6:00 PM – 9:00 PM</span>
                  </div>
                </div>
              </label>
            </RadioGroup>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button variant="hero" size="lg" className="flex-1" disabled={!classSchedule} onClick={() => setStep(4)}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="text-foreground font-medium">{fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground font-medium">{email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Track:</span>
                <span className="text-foreground font-medium capitalize">{track}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Schedule:</span>
                <span className="text-foreground font-medium capitalize">{classSchedule === "weekday" ? "Weekday (Mon & Wed)" : "Weekend (Fri & Sat)"}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Track Fee:</span>
                <span className="text-foreground">₦{trackPrice.toLocaleString()}</span>
              </div>
              {addCertificate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Certificate:</span>
                  <span className="text-foreground">₦{CERTIFICATE_PRICE.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-1">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Commitment confirmed</strong> — You've agreed to all program terms. After payment, you'll receive an email with a link to set up your student dashboard account.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(3)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleEnroll} disabled={paying} variant="hero" size="lg" className="flex-1">
                {paying ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Redirecting...</>
                ) : (
                  `Pay ₦${totalAmount.toLocaleString()}`
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Secure payment via Paystack. You'll receive login details after payment.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentModal;
