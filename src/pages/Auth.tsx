import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({
          title: "Reset link sent! 📧",
          description: "Check your email for the password reset link.",
        });
        setIsForgot(false);
        setIsLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;

      // Check if student is withdrawn
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("student_status")
          .eq("id", authUser.id)
          .single();

        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authUser.id);
        const hasAdmin = roles?.some((r: any) => r.role === "admin");

        if (!hasAdmin && profileData?.student_status === "withdrawn") {
          await supabase.auth.signOut();
          toast({
            title: "Account Withdrawn",
            description: "You have been withdrawn from the Delvetek program. Please contact support if you believe this is an error.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (hasAdmin) {
          navigate("/admin/dashboard");
          return;
        }
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img src={delvetekLogo} alt="Delvetek" className="h-14 w-auto rounded-xl" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {isForgot ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isForgot
              ? "Enter your email to receive a reset link"
              : "Sign in to access your student dashboard"}
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <Label className="text-foreground">Email Address</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-secondary border-border"
              />
            </div>

            {!isForgot && (
              <div className="space-y-2">
                <Label className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="bg-secondary border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              variant="hero"
              className="w-full h-12 text-base"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
              ) : isForgot ? (
                "Send Reset Link"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {!isForgot && (
              <button
                onClick={() => setIsForgot(true)}
                className="text-sm text-muted-foreground hover:text-primary hover:underline block mx-auto"
              >
                Forgot your password?
              </button>
            )}
            {isForgot && (
              <button
                onClick={() => setIsForgot(false)}
                className="text-sm text-muted-foreground hover:text-primary hover:underline block mx-auto"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
