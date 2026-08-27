import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";

const WelcomePopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show once per session
    const seen = sessionStorage.getItem("delvetek_welcome_popup");
    if (seen) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("delvetek_welcome_popup", "1");
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const goToEnroll = () => {
    setOpen(false);
    setTimeout(() => {
      document.getElementById("delve-school")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
        onClick={() => setOpen(false)}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden border border-primary/30 bg-card shadow-[0_0_60px_hsl(48_100%_50%_/_0.25)] animate-[popup-rise_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0"
      >
        {/* Glow accents */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-float animation-delay-400" />

        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-[1] p-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-[fade-in_0.5s_ease-out_0.2s_both]">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">New Cohort Enrolling Now</span>
          </div>

          {/* Headline */}
          <h2
            id="welcome-popup-title"
            className="font-display text-3xl md:text-4xl font-bold mb-3 animate-[fade-in_0.6s_ease-out_0.35s_both]"
          >
            New Cohort Starts <span className="gradient-text">October</span>
          </h2>

          <p className="text-muted-foreground text-base mb-8 max-w-xs mx-auto animate-[fade-in_0.6s_ease-out_0.5s_both]">
            Join Delvetek's 12-week data analytics training. Secure your spot before the discount ends.
          </p>

          {/* CTA */}
          <button
            onClick={goToEnroll}
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-display font-semibold shadow-glow hover:scale-105 transition-transform animate-[fade-in_0.6s_ease-out_0.65s_both]"
          >
            Click Here to Enroll
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Footnote */}
          <p className="mt-5 text-xs text-muted-foreground/70 animate-[fade-in_0.6s_ease-out_0.8s_both]">
            Limited discounted seats available.
          </p>
        </div>

        {/* Bottom gradient line */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      </div>

      <style>{`
        @keyframes popup-rise {
          0% { transform: translateY(40px) scale(0.94); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WelcomePopup;
