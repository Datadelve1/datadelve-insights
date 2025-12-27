import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, TrendingUp, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(187_85%_53%_/_0.08)_0%,_transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float animation-delay-400" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(222_30%_18%_/_0.3)_1px,_transparent_1px),_linear-gradient(90deg,_hsl(222_30%_18%_/_0.3)_1px,_transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,_black_30%,_transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 opacity-0 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Transform Your Data Skills</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 opacity-0 animate-fade-in animation-delay-200">
            Master Data Analytics with{" "}
            <span className="gradient-text">1:1 Expert Training</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in animation-delay-400 text-balance">
            Unlock the power of data with personalized training sessions. From fundamentals to advanced analytics, we guide you every step of the way.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in animation-delay-600">
            <Button variant="hero" size="xl" className="group">
              Book Your Session
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-outline" size="xl">
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/50 opacity-0 animate-fade-in animation-delay-600">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="font-display text-3xl md:text-4xl font-bold text-foreground">500+</span>
              </div>
              <p className="text-sm text-muted-foreground">Students Trained</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-display text-3xl md:text-4xl font-bold text-foreground">98%</span>
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-display text-3xl md:text-4xl font-bold text-foreground">1:1</span>
              </div>
              <p className="text-sm text-muted-foreground">Personal Coaching</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
