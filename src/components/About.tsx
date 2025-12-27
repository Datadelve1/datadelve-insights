import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Customized curriculum based on your goals",
  "Flexible scheduling - learn at your own pace",
  "Real-world projects and case studies",
  "Post-session support and resources",
  "Industry-recognized certification prep",
  "Direct access to expert mentors",
];

const About = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_right,_hsl(187_85%_53%_/_0.05)_0%,_transparent_60%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="text-primary font-medium mb-4 block">Why Choose DataDelve</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Your Journey to Data Mastery <span className="gradient-text">Starts Here</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              At DataDelve, we believe everyone can become a data expert with the right guidance. 
              Our 1:1 training approach ensures you get personalized attention, practical experience, 
              and the confidence to tackle real-world data challenges.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg">
              Start Your Journey
            </Button>
          </div>

          {/* Right - Visual Element */}
          <div className="relative">
            <div className="aspect-square rounded-3xl glass p-8 relative overflow-hidden">
              {/* Gradient Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl" />
              
              {/* Content Cards */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="gradient-border rounded-2xl p-6 bg-card/80 backdrop-blur-sm">
                  <div className="text-5xl font-display font-bold gradient-text mb-2">10+</div>
                  <p className="text-muted-foreground">Years of Industry Experience</p>
                </div>
                
                <div className="gradient-border rounded-2xl p-6 bg-card/80 backdrop-blur-sm self-end max-w-[80%]">
                  <div className="text-5xl font-display font-bold gradient-text mb-2">24/7</div>
                  <p className="text-muted-foreground">Support & Resources Access</p>
                </div>
                
                <div className="gradient-border rounded-2xl p-6 bg-card/80 backdrop-blur-sm max-w-[70%]">
                  <div className="text-5xl font-display font-bold gradient-text mb-2">100%</div>
                  <p className="text-muted-foreground">Personalized Experience</p>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">★</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">Top Rated</p>
                  <p className="text-sm text-muted-foreground">5.0 Average</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
