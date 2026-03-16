import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const WebinarRegistration = () => {
  const EXTERNAL_FORM_URL = "https://forms.gle/rtGLzwfspG849Y4H6";

  const handleRegisterClick = () => {
    window.open(EXTERNAL_FORM_URL, "_blank", "noopener,noreferrer");
  };

  const upcomingTrainings = [
    {
      title: "Data Analytics Fundamentals",
      date: "March 27th, 2026",
      time: "6:00 PM (GMT+1)",
      spots: "25 slots available – Closing soon",
      description: "Learn the basics of data analytics, including Excel, SQL fundamentals, and data visualization principles.",
      registerAction: handleRegisterClick,
    },
    {
      title: "Project Management",
      date: "Coming Soon",
      time: "TBA",
      spots: "Limited spots",
      description: "Learn PRINCE2, Agile, and Scrum frameworks to manage projects confidently in any industry.",
      comingSoon: true,
    },
    {
      title: "Business Analysis",
      date: "Coming Soon",
      time: "TBA",
      spots: "Limited spots",
      description: "Bridge business needs with technical solutions through requirements gathering and process mapping.",
      comingSoon: true,
    },
  ];

  return (
    <section id="webinar" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(187_85%_53%_/_0.05)_0%,_transparent_50%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Free Training Sessions</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Register for <span className="gradient-text">Free Training</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Join our free training sessions and kickstart your data analytics journey. Limited spots available!
          </p>
        </div>

        {/* Training Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {upcomingTrainings.map((training, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="mb-4">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {training.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {training.description}
                </p>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{training.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{training.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{training.spots}</span>
                </div>
              </div>

              {training.comingSoon ? (
                <Button variant="hero-outline" className="w-full" asChild>
                  <Link to="/coming-soon">
                    Coming Soon
                  </Link>
                </Button>
              ) : (
                <Button 
                  variant="hero-outline" 
                  className="w-full group/btn"
                  onClick={training.registerAction}
                >
                  Register Now
                  <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Can't find a suitable time? Contact us for personalized scheduling.
          </p>
          <Button 
            variant="ghost" 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WebinarRegistration;
