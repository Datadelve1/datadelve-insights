import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Lock, Loader2 } from "lucide-react";

const CommitmentGate = ({
  profile,
  signOut,
}: {
  profile: { full_name: string; email: string } | null;
  signOut: () => void;
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Complete Your Commitment First
        </h1>
        <p className="text-muted-foreground">
          Hi {profile?.full_name || "there"}, before accessing your dashboard, you need to confirm
          your commitment to the Delvetek Data Analysis Training Program.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="hero"
            size="lg"
            onClick={() => (window.location.href = "/dashboard/commitment")}
          >
            Complete Commitment Form
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommitmentGate;
