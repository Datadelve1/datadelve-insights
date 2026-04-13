import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const EnrollmentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) {
      setStatus("error");
      setErrorMsg("No payment reference found");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-enrollment-payment", {
          body: { reference },
        });
        if (error) throw error;
        if (data?.ok || data?.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(data?.error || "Verification failed");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Verification failed");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h1 className="font-display text-2xl font-bold text-foreground">Verifying Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="font-display text-2xl font-bold text-foreground">Enrollment Successful! 🎉</h1>
            <p className="text-muted-foreground">
              Your account has been created. Check your email for login details. 
              Please change your password on first login.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="hero" asChild>
                <Link to="/auth">Go to Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="font-display text-2xl font-bold text-foreground">Verification Failed</h1>
            <p className="text-muted-foreground">{errorMsg}</p>
            <p className="text-sm text-muted-foreground">
              If your payment was deducted, please contact us on{" "}
              <a href="https://wa.me/447775739225" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>{" "}
              with your payment reference.
            </p>
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EnrollmentCallback;
