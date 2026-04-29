import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { trackLead, trackInitiateCheckout } from "@/lib/metaPixel";

const BANK_NAME = "Wema Bank";
const ACCOUNT_NUMBER = "0127561293";
const ACCOUNT_NAME = "Delvetek Limited";
const WHATSAPP_NUMBER = "447775739225";

const TRACKS: { id: string; label: string; price: number }[] = [
  { id: "beginner", label: "Beginner", price: 10000 },
  { id: "professional", label: "Professional", price: 50000 },
  { id: "advanced", label: "Advanced", price: 100000 },
];

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTrack?: string;
}

const EnrollmentModal = ({ open, onOpenChange, defaultTrack }: EnrollmentModalProps) => {
  const [selected, setSelected] = useState(defaultTrack || "professional");
  const track = TRACKS.find((t) => t.id === selected) || TRACKS[1];

  // Fire Lead event when modal opens
  useEffect(() => {
    if (open) {
      trackLead({ content_name: "Enrollment Modal Opened", content_category: track.id, value: track.price, currency: "NGN" });
    }
  }, [open]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const whatsappLink = () => {
    const msg =
      `Hello Delvetek, I want to enrol in the *${track.label}* track (₦${track.price.toLocaleString()}).%0A%0A` +
      `I have made the payment to ${BANK_NAME} · ${ACCOUNT_NUMBER} (${ACCOUNT_NAME}).%0A%0A` +
      `Here are my details:%0A` +
      `Full Name:%0A` +
      `Email:%0A` +
      `Phone:%0A%0A` +
      `Attached is my proof of payment.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Enrol in 2 easy steps</DialogTitle>
          <p className="text-sm text-muted-foreground pt-1">
            1. Pay the commitment fee · 2. Send proof + your details on WhatsApp
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Track selection */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Choose your track</p>
            <div className="grid grid-cols-3 gap-2">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
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

          {/* Bank details */}
          <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Pay to this bank account:</p>
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
                <Button variant="outline" size="sm" onClick={() => copy(ACCOUNT_NUMBER, "Account number")}>
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
                  <p className="text-primary font-bold">₦{track.price.toLocaleString()}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copy(String(track.price), "Amount")}>
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-foreground">📌 After paying:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Tap the WhatsApp button below</li>
              <li>Fill in your name, email & phone in the pre-filled message</li>
              <li>Attach your proof of payment screenshot and send</li>
              <li>We'll confirm and email your dashboard login</li>
            </ol>
          </div>

          {/* WhatsApp CTA */}
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
              <MessageCircle className="w-4 h-4 mr-2" /> Send Proof & Details on WhatsApp
            </a>
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>No long forms · Instant enrolment via WhatsApp</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentModal;
