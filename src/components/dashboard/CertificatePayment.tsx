import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
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

  // Verifying state
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

  // Paid AND eligible — certificate ready
  if (cert?.payment_status === "paid" && cert?.eligible) {
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
              <p className="text-xs text-green-600 font-medium">Certificate Ready ✓</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your payment of ₦{cert.amount.toLocaleString()} has been confirmed and you've completed the program. Your certificate will be issued shortly.
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

  // Paid but NOT yet eligible — waiting for program completion
  if (cert?.payment_status === "paid") {
    return (
      <Card className="border-border bg-card border-amber-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="font-display text-lg text-foreground">
                Certificate of Completion
              </CardTitle>
              <p className="text-xs text-amber-600 font-medium">Payment Confirmed ✓</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your payment of ₦{cert.amount.toLocaleString()} is confirmed! Your certificate will be issued once you complete the program.
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

  // Not yet paid — show pay button (available to all students)
  const amount = cert?.amount ?? 10000;

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
            <p className="text-xs text-muted-foreground font-medium">Secure your certificate early</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Pay ₦{amount.toLocaleString()} now to reserve your official DelveTek certificate. 
          It will be issued once you complete the program.
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
              <ExternalLink className="w-4 h-4 mr-2" /> Pay ₦{amount.toLocaleString()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CertificatePayment;
