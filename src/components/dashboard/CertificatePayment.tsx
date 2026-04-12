import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Lock, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const CertificatePayment = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchCertStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("certificate_payments")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setCert(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCertStatus();
  }, [user]);

  // Handle callback from Paystack
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (reference && cert && cert.payment_status !== "paid") {
      verifyPayment(reference);
    }
  }, [searchParams, cert]);

  const verifyPayment = async (reference: string) => {
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-certificate-payment", {
        body: { reference },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success("Payment verified! Your certificate payment is confirmed.");
        fetchCertStatus();
      } else {
        toast.error(data?.error || "Payment verification failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    }
    setVerifying(false);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const callbackUrl = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.functions.invoke("initialize-certificate-payment", {
        body: { callback_url: callbackUrl },
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

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // No record = not eligible yet
  if (!cert || !cert.eligible) {
    return (
      <Card className="border-border bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Lock className="w-6 h-6 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">
              Complete the program to become eligible
            </p>
          </div>
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <Award className="w-6 h-6" />
            </div>
            <CardTitle className="font-display text-lg text-foreground">
              Certificate of Completion
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your certificate will be available after the admin marks you as eligible.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Paid
  if (cert.payment_status === "paid") {
    return (
      <Card className="border-border bg-card border-green-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="font-display text-lg text-foreground">
                Certificate of Completion
              </CardTitle>
              <p className="text-xs text-green-600 font-medium">Payment Confirmed ✓</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your certificate payment of ₦{cert.amount.toLocaleString()} has been confirmed. Your certificate will be issued shortly.
          </p>
          {cert.paid_at && (
            <p className="text-xs text-muted-foreground mt-2">
              Paid on {new Date(cert.paid_at).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Eligible but not paid — verifying
  if (verifying) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying your payment...</p>
        </CardContent>
      </Card>
    );
  }

  // Eligible, not paid
  return (
    <Card className="border-border bg-card border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-lg text-foreground">
              Certificate of Completion
            </CardTitle>
            <p className="text-xs text-primary font-medium">You are eligible! 🎉</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Congratulations! You've been marked as eligible for a certificate of completion. 
          Pay ₦{cert.amount.toLocaleString()} to receive your official DelveTek certificate.
        </p>
        <Button
          onClick={handlePay}
          disabled={paying}
          variant="glow"
          size="lg"
          className="w-full"
        >
          {paying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Redirecting to Paystack...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" /> Pay ₦{cert.amount.toLocaleString()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CertificatePayment;
