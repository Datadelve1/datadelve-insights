import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, ArrowRight, Users, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import WebinarCountdown from "@/components/WebinarCountdown";
import webinarFlyerMain from "@/assets/webinar-flyer-main.jpg";
import webinarFlyerSpeaker from "@/assets/webinar-flyer-speaker.jpg";

const Webinar = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("webinar_registrations" as any)
        .insert({ email: email.trim() });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "You're already registered!", description: "We'll see you there 🎉" });
        } else {
          throw error;
        }
      } else {
        // Send confirmation email
        supabase.functions.invoke("send-webinar-confirmation", {
          body: { email: email.trim() },
        });
        toast({ title: "You're in! 🎉", description: "Check your email for a confirmation." });
      }
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Light theme colors inspired by the flyer
  const theme = {
    bg: "#FAF8F5",
    bgAlt: "#F2EDE6",
    text: "#1A1A1A",
    textMuted: "#5A5A5A",
    gold: "#D4A017",
    goldLight: "#F5E6B8",
    goldDark: "#B8860B",
    border: "#E8E0D4",
    card: "#FFFFFF",
  };

  return (
    <div className="min-h-screen font-body" style={{ background: theme.bg, color: theme.text }}>
      {/* Hero */}
      <section className="relative py-16 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at top right, ${theme.goldLight}, transparent 60%)` }} />

        <div className="container mx-auto px-6 relative z-10">
          {/* Live badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ borderColor: theme.border, background: theme.card }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: theme.gold }} />
              <span className="text-sm font-medium" style={{ color: theme.textMuted }}>Live Webinar</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-4" style={{ color: theme.text }}>
              Stop Learning Tech
            </h1>
            <div className="inline-block px-6 py-2.5 rounded-md mb-8" style={{ background: theme.gold }}>
              <p className="font-display text-lg md:text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
                Unless You Want To Stay Relevant
              </p>
            </div>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: theme.textMuted }}>
              Join us for an eye-opening conversation about why continuous learning isn't optional in tech — and how to do it right.
            </p>

            {/* Event details pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { icon: Calendar, label: "28th March, 2026" },
                { icon: Clock, label: "8:00 PM (GMT+1)" },
                { icon: MapPin, label: "Online — Free" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-xl border" style={{ borderColor: theme.border, background: theme.card }}>
                  <item.icon className="w-5 h-5" style={{ color: theme.gold }} />
                  <span className="font-medium" style={{ color: theme.text }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Countdown */}
            <div className="mb-12">
              <WebinarCountdown />
            </div>

            {/* Email CTA */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email to register"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className="flex-1 h-12 px-4 rounded-lg text-base border outline-none transition-colors"
                style={{
                  background: theme.card,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                onFocus={(e) => (e.target.style.borderColor = theme.gold)}
                onBlur={(e) => (e.target.style.borderColor = theme.border)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="h-12 px-8 rounded-lg font-display font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-105 shrink-0 disabled:opacity-50"
                style={{ background: theme.gold, color: "#FFFFFF" }}
              >
                {isLoading ? "Registering..." : (
                  <>
                    Reserve My Spot
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Flyer Graphics */}
      <section className="py-16 relative" style={{ background: theme.bgAlt }}>
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="rounded-3xl overflow-hidden shadow-xl border" style={{ borderColor: theme.border }}>
              <img src={webinarFlyerMain} alt="Stop Learning Tech webinar flyer featuring host and guest speaker" className="w-full h-auto" />
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl border" style={{ borderColor: theme.border }}>
              <img src={webinarFlyerSpeaker} alt="Meet our speaker Tobi Anifowose - Senior Software Engineer" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="font-medium mb-3 block text-sm uppercase tracking-wider" style={{ color: theme.gold }}>Meet The Speakers</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold" style={{ color: theme.text }}>
              Learn From The Best
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Host */}
            <div className="rounded-3xl p-8 border transition-all duration-300 hover:shadow-lg" style={{ background: theme.card, borderColor: theme.border }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 uppercase tracking-wider" style={{ background: theme.goldLight, color: theme.goldDark }}>
                <Users className="w-3 h-3" />
                Host
              </div>
              <h3 className="font-display text-2xl font-bold mb-1" style={{ color: theme.text }}>Pipeloluwa Oshinubi</h3>
              <p className="font-medium text-sm mb-4" style={{ color: theme.gold }}>Data Analyst & Co-Founder, DelveSchool</p>
              <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                A data analyst with over five years of experience helping businesses make smarter decisions through data. Pipeloluwa is the co-founder of DelveSchool, passionate about making tech education accessible to everyone. He brings clarity and energy to every session, guiding learners through their tech journey with practical, real-world insights.
              </p>
            </div>

            {/* Guest Speaker */}
            <div className="rounded-3xl p-8 border transition-all duration-300 hover:shadow-lg" style={{ background: theme.card, borderColor: theme.border }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 uppercase tracking-wider" style={{ background: theme.goldLight, color: theme.goldDark }}>
                <Sparkles className="w-3 h-3" />
                Guest Speaker
              </div>
              <h3 className="font-display text-2xl font-bold mb-1" style={{ color: theme.text }}>Tobi Anifowose</h3>
              <p className="font-medium text-sm mb-4" style={{ color: theme.gold }}>Senior Software Engineer</p>
              <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                With over eight years of experience building scalable software across healthcare, finance, and legal industries. A First Class graduate in Electrical & Electronics Engineering, Tobi combines analytical thinking with a passion for clean architecture and high-performance systems. He's also the founder of Booklynk.co.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 relative" style={{ background: theme.bgAlt }}>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4" style={{ color: theme.text }}>
              What You'll Walk Away With
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Why Most Developers Plateau", desc: "Understand why simply 'learning tech' isn't enough and what separates those who grow from those who stagnate." },
              { title: "How To Stay Relevant", desc: "Practical strategies for continuous learning that actually stick — beyond just watching tutorials." },
              { title: "Building Real-World Systems", desc: "Insights from building scalable solutions across multiple industries and what it takes to excel." },
              { title: "From Engineer to Founder", desc: "How product thinking and technical execution combine to create impactful products." },
              { title: "Career Growth Mindset", desc: "Developing the mindset that drives sustainable career growth in a fast-changing industry." },
              { title: "Live Q&A Session", desc: "Get your burning questions answered by industry veterans in an interactive session." },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border transition-all hover:shadow-md" style={{ background: theme.card, borderColor: theme.border }}>
                <h3 className="font-display font-semibold text-lg mb-2" style={{ color: theme.text }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at bottom, ${theme.goldLight}, transparent 60%)` }} />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4" style={{ color: theme.text }}>
            Don't Miss Out
          </h2>
          <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: theme.textMuted }}>
            Spots are limited. Register now and take the first step towards staying relevant in tech.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              className="flex-1 h-12 px-4 rounded-lg text-base border outline-none transition-colors"
              style={{ background: theme.card, borderColor: theme.border, color: theme.text }}
              onFocus={(e) => (e.target.style.borderColor = theme.gold)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-8 rounded-lg font-display font-semibold text-base transition-all duration-300 hover:shadow-lg hover:scale-105 shrink-0 disabled:opacity-50"
              style={{ background: theme.gold, color: "#FFFFFF" }}
            >
              {isLoading ? "Registering..." : "Register Free"}
            </button>
          </form>
          <p className="text-xs mt-4" style={{ color: theme.textMuted }}>Free · Online · 28th March 2026 · 8PM GMT+1</p>
        </div>
      </section>
    </div>
  );
};

export default Webinar;
