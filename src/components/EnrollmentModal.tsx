import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Heart, Clock, Copy, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BANK_NAME = "Wema Bank";
const ACCOUNT_NUMBER = "0127561293";
const ACCOUNT_NAME = "Delvetek Limited";
const WHATSAPP_NUMBER = "447775739225";

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
  const [referralCode, setReferralCode] = useState("");
  const [commitmentChecks, setCommitmentChecks] = useState<boolean[]>(new Array(COMMITMENT_ITEMS.length).fill(false));
  const [classSchedule, setClassSchedule] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const allCommitmentsChecked = commitmentChecks.every(Boolean);
  const trackPrice = TRACK_PRICES[track] || 0;
  const totalAmount = trackPrice + (addCertificate ? CERTIFICATE_PRICE : 0);
  const isCommitmentFeeTrack = track === "beginner";

  const handleCommitmentToggle = (index: number) => {
    const updated = [...commitmentChecks];
    updated[index] = !updated[index];
    setCommitmentChecks(updated);
  };

  const handleSubmitEnrollment = async () => {
    if (!fullName.trim() || !email.trim() || !track) {
      toast.error("Please fill in all required fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-manual-enrollment", {
        body: {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          track,
          certificate_requested: addCertificate,
          class_schedule: classSchedule,
          commitment_accepted: true,
          referral_code: referralCode.trim() || null,
        },
      });

      if (error) throw error;
      if (data?.ok && data?.reference) {
        setReference(data.reference);
        setStep(5);
      } else {
        toast.error(data?.error || "Failed to submit enrollment");
      }
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const whatsappLink = () => {
    const msg = `Hello Delvetek, I have just paid ₦${totalAmount.toLocaleString()} for my enrollment.%0A%0AName: ${fullName}%0AEmail: ${email}%0ATrack: ${track}%0AReference: ${reference}%0A%0AHere is my proof of payment:`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  const resetAndClose = (open: boolean) => {
    if (!open) {
      setStep(1);
      setCommitmentChecks(new Array(COMMITMENT_ITEMS.length).fill(false));
      setClassSchedule("");
      setReference(null);
      setReferralCode("");
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
            {step === 4 && "Step 4: Payment Instructions"}
            {step === 5 && "Enrollment Submitted"}
          </DialogTitle>
          <div className="flex gap-1.5 pt-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= Math.min(step, 4) ? "bg-primary" : "bg-secondary"}`} />
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
            {isCommitmentFeeTrack && (
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
            )}

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

        {/* Step 4: Bank Transfer Instructions */}
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
                <span className="text-foreground">Total to Pay:</span>
                <span className="text-primary">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Make payment to this bank account:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Bank</p>
                    <p className="text-foreground font-medium">{BANK_NAME}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Account Number</p>
                    <p className="text-foreground font-mono font-bold text-base">{ACCOUNT_NUMBER}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(ACCOUNT_NUMBER, "Account number")}>
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Account Name</p>
                    <p className="text-foreground font-medium">{ACCOUNT_NAME}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Amount</p>
                    <p className="text-primary font-bold">₦{totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/30 border border-border/50 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">📌 How it works:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Click <strong className="text-foreground">"I Have Paid"</strong> below to register your enrollment</li>
                <li>Open your bank app and transfer the exact amount to the account above</li>
                <li>You'll be given a reference code — send your proof of payment to us on WhatsApp</li>
                <li>Once we confirm your payment, we'll email your dashboard login details</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(3)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleSubmitEnrollment} disabled={submitting} variant="hero" size="lg" className="flex-1">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                ) : (
                  "I Have Paid / Will Pay Now"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Success - Send Proof on WhatsApp */}
        {step === 5 && reference && (
          <div className="space-y-4">
            <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
              <p className="font-semibold text-foreground">Enrollment registered!</p>
              <p className="text-xs text-muted-foreground">Your reference code:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="font-mono text-base font-bold text-primary bg-background px-3 py-1.5 rounded border border-border">{reference}</code>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(reference, "Reference")}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/30 border border-border/50 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Next step: Send your proof of payment</p>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Pay <strong className="text-foreground">₦{totalAmount.toLocaleString()}</strong> to <strong className="text-foreground">{BANK_NAME} · {ACCOUNT_NUMBER}</strong> ({ACCOUNT_NAME})</li>
                <li>Take a screenshot of your transfer receipt</li>
                <li>Click the WhatsApp button below — it will open with a pre-filled message including your reference</li>
                <li>Attach your screenshot and send</li>
                <li>Once we confirm, your dashboard login will be emailed to <strong className="text-foreground">{email}</strong></li>
              </ol>
            </div>

            <Button asChild variant="hero" size="lg" className="w-full">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" /> Send Proof on WhatsApp
              </a>
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You can safely close this window. Your enrollment is saved with reference <strong className="text-foreground">{reference}</strong>.
            </p>

            <Button variant="outline" size="lg" className="w-full" onClick={() => resetAndClose(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentModal;
