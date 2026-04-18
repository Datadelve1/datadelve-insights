import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, TrendingUp, Loader2, AlertCircle } from "lucide-react";

interface Enrollment {
  first_name: string;
  track: string;
  payment_status: string;
  created_at: string;
}

interface TrackingData {
  found: boolean;
  referrer_name?: string;
  code?: string;
  count?: number;
  enrollments?: Enrollment[];
}

const ReferrerTracking = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!code) return;
      const { data: result, error } = await supabase.rpc("get_referrer_tracking" as any, {
        _code: code,
      });
      if (error) {
        setData({ found: false });
      } else {
        setData(result as TrackingData);
      }
      setLoading(false);
    };
    load();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.found) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold">Code not found</h1>
          <p className="text-muted-foreground">
            This referral code is invalid or no longer active. Please contact Delvetek support.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const paidCount = data.enrollments?.filter((e) => e.payment_status === "paid").length ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">Welcome back,</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">{data.referrer_name}</h1>
          <p className="mt-2 text-muted-foreground">
            Your referral code:{" "}
            <span className="font-mono font-bold text-primary text-lg">{data.code}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Total Sign-ups</p>
            </div>
            <p className="text-4xl font-bold">{data.count ?? 0}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Confirmed Paid</p>
            </div>
            <p className="text-4xl font-bold">{paidCount}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Recent Sign-ups</h2>
          {data.enrollments && data.enrollments.length > 0 ? (
            <div className="space-y-3">
              {data.enrollments.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{e.first_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {e.track} track · {new Date(e.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={e.payment_status === "paid" ? "default" : "secondary"}>
                    {e.payment_status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No sign-ups yet. Share your code{" "}
              <span className="font-mono font-bold text-primary">{data.code}</span> to start
              tracking referrals!
            </p>
          )}
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-8">
          Bookmark this page to check your stats anytime. For questions, contact info@delvetek.io.
        </p>
      </div>
    </div>
  );
};

export default ReferrerTracking;
