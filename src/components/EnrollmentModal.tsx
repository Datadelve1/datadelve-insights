import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
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

const EnrollmentModal = ({ open, onOpenChange, defaultTrack }: EnrollmentModalProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [track, setTrack] = useState(defaultTrack || "");
  const [addCertificate, setAddCertificate] = useState(false);
  const [paying, setPaying] = useState(false);

  const trackPrice = TRACK_PRICES[track] || 0;
  const totalAmount = trackPrice + (addCertificate ? CERTIFICATE_PRICE : 0);

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
        },
      });

      if (error) throw error;
      if (data?.authorization_url) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Enroll in Cohort 2</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              maxLength={100}
            />
          </div>
          <div>
            <Label>Email Address *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              maxLength={255}
            />
          </div>
          <div>
            <Label>Select Track *</Label>
            <Select value={track} onValueChange={setTrack}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner (₦10,000)</SelectItem>
                <SelectItem value="professional">Professional (₦50,000)</SelectItem>
                <SelectItem value="advanced">Advanced (₦100,000)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="certificate"
              checked={addCertificate}
              onCheckedChange={(checked) => setAddCertificate(!!checked)}
            />
            <Label htmlFor="certificate" className="cursor-pointer">
              Add Certificate of Completion (₦10,000)
            </Label>
          </div>

          {track && (
            <div className="rounded-lg bg-secondary/50 p-4 space-y-1">
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
              <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleEnroll}
            disabled={paying || !track}
            variant="hero"
            size="lg"
            className="w-full"
          >
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Redirecting to payment...
              </>
            ) : (
              `Pay ₦${totalAmount.toLocaleString()} & Enroll`
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Secure payment via Paystack. You'll receive login details after payment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentModal;
