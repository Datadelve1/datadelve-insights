import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
        toast({ title: "You're in! 🎉", description: "Check your email for details." });
      }
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(187_85%_53%_/_0.08)_0%,_transparent_60%)]" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Live badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">Live Webinar</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-4">
              Stop Learning Tech
            </h1>
            <div className="inline-block px-5 py-2 rounded-md bg-primary/15 border border-primary/30 mb-8">
              <p className="font-display text-lg md:text-2xl text-primary font-semibold">
                Unless You Want To Stay Relevant
              </p>
            </div>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Join us for an eye-opening conversation about why continuous learning isn't optional in tech — and how to do it right.
            </p>

            {/* Event details pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl glass">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">27th March, 2026</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl glass">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">8:00 PM (GMT+1)</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl glass">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">Online — Free</span>
              </div>
            </div>

            {/* Email CTA */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email to register"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary h-12 text-base"
                maxLength={255}
              />
              <Button type="submit" variant="hero" size="lg" disabled={isLoading} className="shrink-0">
                {isLoading ? "Registering..." : (
                  <>
                    Reserve My Spot
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-primary font-medium mb-3 block text-sm uppercase tracking-wider">Meet The Speakers</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              Learn From The <span className="gradient-text">Best</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Host */}
            <div className="glass rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
                <Users className="w-3 h-3" />
                Host
              </div>
              <h3 className="font-display text-2xl font-bold mb-1">Pipeloluwa Opeyemi</h3>
              <p className="text-primary font-medium text-sm mb-4">Data Analytics Expert</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Passionate about making tech accessible to everyone. Pipeloluwa brings clarity and energy to every session, guiding learners through their tech journey with practical insights.
              </p>
            </div>

            {/* Guest Speaker */}
            <div className="glass rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold mb-5 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Guest Speaker
              </div>
              <h3 className="font-display text-2xl font-bold mb-1">Tobi Anifowose</h3>
              <p className="text-primary font-medium text-sm mb-4">Senior Software Engineer</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                With over eight years of experience building scalable software across healthcare, finance, and legal industries. A First Class graduate in Electrical & Electronics Engineering, Tobi combines analytical thinking with a passion for clean architecture and high-performance systems. He's also the founder of Booklynk.co.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(270_60%_60%_/_0.05)_0%,_transparent_60%)]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              What You'll <span className="gradient-text">Walk Away With</span>
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
              <div key={i} className="p-6 rounded-2xl glass border border-border/50 hover:border-primary/20 transition-all">
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(187_85%_53%_/_0.1)_0%,_transparent_60%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Don't Miss Out
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Spots are limited. Register now and take the first step towards staying relevant in tech.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50 border-border/50 focus:border-primary h-12 text-base"
              maxLength={255}
            />
            <Button type="submit" variant="hero" size="lg" disabled={isLoading} className="shrink-0">
              {isLoading ? "Registering..." : "Register Free"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">Free · Online · 27th March 2026 · 8PM GMT+1</p>
        </div>
      </section>
    </div>
  );
};

export default Webinar;
