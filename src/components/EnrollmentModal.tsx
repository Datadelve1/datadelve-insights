import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, MessageCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { trackLead, trackInitiateCheckout } from "@/lib/metaPixel";
import {
  DISCOUNTED_PRICES,
  NORMAL_PRICES,
  isDiscountActive,
  isRegistrationOpen,
  PRICING_NOTICE,
  type TrackId,
} from "@/lib/enrollmentPricing";

const BANK_NAME = "Wema Bank";
const ACCOUNT_NUMBER = "0127561293";
const ACCOUNT_NAME = "Delvetek Limited";
const WHATSAPP_NUMBER = "447775739225";

const TRACK_LABELS: { id: TrackId; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "professional", label: "Professional" },
  { id: "advanced", label: "Advanced" },
];

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTrack?: string;
}

const EnrollmentModal = ({ open, onOpenChange, defaultTrack }: EnrollmentModalProps) => {
  const initialTrack = (defaultTrack as TrackId) || "professional";
  const [selected, setSelected] = useState<TrackId>(initialTrack);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const discountActive = isDiscountActive();
  const registrationOpen = isRegistrationOpen();
  const priceFor = (id: TrackId) => (discountActive ? DISCOUNTED_PRICES[id] : NORMAL_PRICES[id]);
  const track = {
    id: selected,
    label: TRACK_LABELS.find((t) => t.id === selected)?.label || "Professional",
    price: priceFor(selected),
  };

  // Reset on close
  useEffect(() => {
    if (!open) {
      setReference(null);
      setSubmitting(false);
    } else {
      trackLead({ content_name: "Enrollment Modal Opened", content_category: track.id, value: track.price, currency: "NGN" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const handleSubmitDetails = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) return toast.error("Please enter your full name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return toast.error("Please enter a valid email");

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-manual-enrollment", {
        body: {
          full_name: trimmedName,
          email: trimmedEmail,
          track: track.id,
          certificate_requested: false,
          class_schedule: "weekend",
          commitment_accepted: true,
          referral_code: referralCode.trim() || null,
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Could not register your details");

      setReference(data.reference);
      trackInitiateCheckout({
        content_name: "Enrollment Details Submitted",
        content_category: track.id,
        value: track.price,
        currency: "NGN",
      });
      toast.success("Details saved — see payment instructions below");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappLink = () => {
    const msg =
      `Hello Delvetek, I want to enrol in the *${track.label}* track (₦${track.price.toLocaleString()}).%0A%0A` +
      `Name: ${encodeURIComponent(fullName)}%0A` +
      `Email: ${encodeURIComponent(email)}%0A` +
      `Reference: ${reference || ""}%0A%0A` +
      `Attached is my proof of payment.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {reference ? "Almost done — pay & send proof" : "Enrol in 2 quick steps"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground pt-1">
            {reference
              ? "Your spot is reserved. Pay the commitment fee, then send proof on WhatsApp."
              : "1. Your details · 2. Pay & send proof on WhatsApp"}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Track selection (always visible) */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Choose your track</p>
            <div className="grid grid-cols-3 gap-2">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  disabled={!!reference}
                  onClick={() => setSelected(t.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    selected === t.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="text-sm font-semibold capitalize text-foreground">{t.label}</p>
                  <p className="text-xs text-primary font-bold mt-0.5">₦{t.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          {!reference ? (
            <>
              {/* Step 1: details */}
              <div className="space-y-3 rounded-xl border border-border p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="enroll-name">Full name</Label>
                  <Input
                    id="enroll-name"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="enroll-email">Email</Label>
                  <Input
                    id="enroll-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="enroll-ref" className="flex items-center gap-2">
                    Referral code <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="enroll-ref"
                    placeholder="e.g. DELVE123"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    maxLength={20}
                  />
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                disabled={submitting}
                onClick={handleSubmitDetails}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  <>Continue to payment →</>
                )}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                We use your email only to confirm your enrolment. No spam.
              </p>
            </>
          ) : (
            <>
              {/* Step 2: bank details + WhatsApp */}
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-sm">
                <p className="text-foreground">
                  ✅ Spot reserved for <span className="font-semibold">{fullName}</span>.
                  Reference:{" "}
                  <span className="font-mono font-bold text-primary">{reference}</span>
                </p>
              </div>

              <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">Pay to this bank account:</p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Bank</p>
                    <p className="text-foreground font-medium">{BANK_NAME}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Account Number</p>
                      <p className="text-foreground font-mono font-bold text-base">{ACCOUNT_NUMBER}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copy(ACCOUNT_NUMBER, "Account number")}>
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Account Name</p>
                    <p className="text-foreground font-medium">{ACCOUNT_NAME}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Amount</p>
                      <p className="text-primary font-bold">₦{track.price.toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copy(String(track.price), "Amount")}>
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-foreground">📌 After paying:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Tap the WhatsApp button below</li>
                  <li>Attach your proof of payment screenshot</li>
                  <li>We'll confirm and email your dashboard login</li>
                </ol>
              </div>

              <Button
                asChild
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() =>
                  trackInitiateCheckout({
                    content_name: "WhatsApp Proof Click",
                    content_category: track.id,
                    value: track.price,
                    currency: "NGN",
                  })
                }
              >
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" /> Send Proof on WhatsApp
                </a>
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Your details are saved · Please send proof immediately</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentModal;
