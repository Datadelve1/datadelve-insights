import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Shield } from "lucide-react";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [isForgot, setIsForgot] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  // If already logged in as admin, redirect
  if (user && isAdmin) {
    navigate("/admin/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: "Reset link sent! 📧", description: "Check your email for the password reset link." });
        setIsForgot(false);
        setIsLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;

      // Check if user has admin role
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Authentication failed");

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id);

      const hasAdmin = roles?.some((r: any) => r.role === "admin");
      if (!hasAdmin) {
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin privileges required.");
      }

      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({ title: "Access Denied", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img src={delvetekLogo} alt="Delvetek" className="h-14 w-auto rounded-xl" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isForgot ? "Reset Password" : "Admin Portal"}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {isForgot ? "Enter your admin email to receive a reset link" : "Authorized personnel only"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground">Email / Username</Label>
              <Input
                type="email"
                placeholder="Admin email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
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

            <Button
              type="submit"
              disabled={isLoading}
              variant="hero"
              className="w-full h-12 text-base"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : (
                "Sign In as Admin"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
