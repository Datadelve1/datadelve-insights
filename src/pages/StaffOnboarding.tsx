import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BookOpen, Clock, DollarSign } from "lucide-react";

const StaffOnboarding = () => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salary, setSalary] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/staff/login"); return; }

      const { data: profile } = await supabase
        .from("staff_profiles")
        .select("salary, has_onboarded, must_change_password")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) { navigate("/staff/login"); return; }
      if (profile.must_change_password) { navigate("/staff/change-password"); return; }
      if (profile.has_onboarded) { navigate("/staff/dashboard"); return; }

      setSalary(profile.salary);
      setHourlyRate(Math.round(profile.salary / 150));
    };
    loadProfile();
  }, [navigate]);

  const handleContinue = async () => {
    if (!agreed) { toast.error("Please agree to the work rules"); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("staff_profiles")
          .update({ has_onboarded: true })
          .eq("user_id", user.id);
      }
      navigate("/staff/dashboard");
    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display text-foreground">Staff Work Rules</CardTitle>
          <p className="text-muted-foreground text-sm">Please review before proceeding</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
              <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Weekly Requirement</h3>
                <p className="text-muted-foreground text-sm">You are required to work <span className="text-primary font-bold">37.5 hours per week</span></p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
              <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Monthly Requirement</h3>
                <p className="text-muted-foreground text-sm">Total monthly working hours: <span className="text-primary font-bold">150 hours</span></p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <DollarSign className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Your Hourly Rate</h3>
                <p className="text-muted-foreground text-sm">
                  Based on your salary of <span className="text-foreground font-bold">₦{salary.toLocaleString()}</span>, your hourly rate is{" "}
                  <span className="text-primary font-bold text-lg">₦{hourlyRate.toLocaleString()}/hour</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <h3 className="font-semibold text-foreground">Important Rules</h3>
              <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
                <li>You must log activities while active</li>
                <li>15 minutes of inactivity will mark you as Idle</li>
                <li>Idle time (unapproved) is not counted as working hours</li>
                <li>Management delays must include a reason</li>
                <li>Past logs cannot be edited after submission</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <label htmlFor="agree" className="text-sm text-foreground cursor-pointer">
              I understand and agree to the work rules above
            </label>
          </div>

          <Button onClick={handleContinue} className="w-full" size="lg" disabled={!agreed || loading}>
            {loading ? "Please wait..." : "Continue to Dashboard →"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffOnboarding;
