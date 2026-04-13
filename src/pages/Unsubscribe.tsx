import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Unsubscribe = () => {
  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
          headers: { apikey: anonKey },
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          setStatus("valid");
        } else if (data.reason === "already_unsubscribed") {
          setStatus("already");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("error");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-lg text-center">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold text-foreground mb-4">Checking...</h1>
            <p className="text-muted-foreground">Validating your unsubscribe request.</p>
          </>
        )}
        {status === "valid" && (
          <>
            <h1 className="text-xl font-bold text-foreground mb-4">Unsubscribe from DelveTek Emails</h1>
            <p className="text-muted-foreground mb-6">You will no longer receive app emails from DelveTek. Authentication emails (password reset, etc.) will still be sent.</p>
            <button
              onClick={handleUnsubscribe}
              className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
            >
              Confirm Unsubscribe
            </button>
          </>
        )}
        {status === "already" && (
          <>
            <h1 className="text-xl font-bold text-foreground mb-4">Already Unsubscribed</h1>
            <p className="text-muted-foreground">You've already unsubscribed from DelveTek app emails.</p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-xl font-bold text-foreground mb-4">Unsubscribed ✓</h1>
            <p className="text-muted-foreground">You've been successfully unsubscribed from DelveTek app emails.</p>
          </>
        )}
        {status === "invalid" && (
          <>
            <h1 className="text-xl font-bold text-foreground mb-4">Invalid Link</h1>
            <p className="text-muted-foreground">This unsubscribe link is invalid or expired.</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-foreground mb-4">Something Went Wrong</h1>
            <p className="text-muted-foreground">Please try again later or contact support.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
