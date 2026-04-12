import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Check, AlertTriangle, Briefcase, Rocket, GraduationCap, FileText, Linkedin, Users } from "lucide-react";

const DelveSchool = () => {
  return (
    <section id="delve-school" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Choose Your Track</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Delvetek</span> Training Tracks
          </h2>
          <p className="text-muted-foreground text-lg">
            Pick the path that matches your goals. All tracks start June 5.
          </p>
        </div>

        {/* Track Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* BEGINNER TRACK */}
          <div className="group p-6 rounded-2xl glass border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
              Start Your Data Career from Scratch
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Beginner Track</p>

            {/* Pricing */}
            <div className="mb-4">
              <span className="text-muted-foreground line-through text-sm">₦150,000</span>
              <div className="text-xl font-bold text-primary">FREE <span className="text-xs font-normal text-muted-foreground">(This Cohort Only)</span></div>
              <p className="text-sm text-foreground mt-1">Commitment Fee: <span className="font-semibold">₦10,000</span></p>
            </div>

            {/* Content */}
            <ul className="space-y-2 mb-4 flex-1">
              {["SQL (Fundamentals)", "Excel (Fundamentals)", "Power BI (Fundamentals)", "Weekly assignments", "Collaborative projects", "Breakout sessions with tutors", "Live Q&A support", "Personal dashboard to track progress"].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-sm font-medium text-foreground mb-1">Build a strong foundation in data analysis</p>
            <p className="text-xs text-muted-foreground mb-3">Perfect for absolute beginners</p>

            <div className="flex items-center gap-1.5 text-xs text-yellow-500 mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Limited to 250 students
            </div>

            <Button variant="hero" size="lg" className="w-full group/btn" asChild>
              <a href="https://wa.me/2348038149647?text=Hello%20I%20want%20to%20enroll%20in%20the%20Beginner%20Track" target="_blank" rel="noopener noreferrer">
                Enroll in Beginner Track
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

          {/* PROFESSIONAL TRACK */}
          <div className="group p-6 rounded-2xl glass border-2 border-primary/50 hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              Most Popular
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
              Become a Data Analyst in 12 Weeks — From Beginner to Advanced
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Professional Track</p>

            {/* Pricing */}
            <div className="mb-4">
              <span className="text-muted-foreground line-through text-sm">₦275,000</span>
              <div className="text-xl font-bold text-primary">Discount Applied</div>
              <p className="text-sm text-foreground mt-1">Commitment Fee: <span className="font-semibold">₦50,000</span></p>
            </div>

            {/* Content */}
            <ul className="space-y-2 mb-4 flex-1">
              {["SQL (Beginner to Advanced)", "Excel (Beginner to Advanced)", "Power BI (Beginner to Advanced)", "Real-world projects", "Portfolio development", "Case studies", "Hands-on training"].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
              <li className="flex items-start gap-2 text-sm font-medium text-foreground">
                <Rocket className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Bonus: UK Work Experience Exposure
              </li>
            </ul>

            <p className="text-sm font-medium text-foreground mb-1">Become job-ready with a strong portfolio</p>
            <p className="text-xs text-muted-foreground mb-3">No prior experience needed — includes beginner to advanced training</p>

            <div className="flex items-center gap-1.5 text-xs text-yellow-500 mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Limited to 250 students
            </div>

            <Button variant="hero" size="lg" className="w-full group/btn" asChild>
              <a href="https://wa.me/2348038149647?text=Hello%20I%20want%20to%20enroll%20in%20the%20Professional%20Track" target="_blank" rel="noopener noreferrer">
                Enroll in Professional Track
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

          {/* ADVANCED TRACK */}
          <div className="group p-6 rounded-2xl glass border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
              The Fastest Path to Becoming Job-Ready in Tech
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Advanced Track</p>

            {/* Pricing */}
            <div className="mb-4">
              <span className="text-muted-foreground line-through text-sm">₦350,000</span>
              <div className="text-xl font-bold text-primary">Discount Applied</div>
              <p className="text-sm text-foreground mt-1">Commitment Fee: <span className="font-semibold">₦100,000</span></p>
            </div>

            {/* Full Learning Path */}
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Full Learning Path</p>
            <ul className="space-y-2 mb-4">
              {["SQL (Beginner to Advanced)", "Excel (Beginner to Advanced)", "Power BI (Beginner to Advanced)"].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Internship */}
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Internship</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                3-Month Internship with DelveTek (Non-paid)
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Work with real company data
              </li>
            </ul>

            {/* Career Acceleration */}
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Career Acceleration</p>
            <ul className="space-y-2 mb-4 flex-1">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-foreground">DelveTek Smart CV Engine</span>
                  <span className="block text-xs mt-0.5">Upload CV → Paste job description → Auto-optimized CV → Admin review → Delivered via Email/WhatsApp</span>
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Linkedin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                LinkedIn Optimization
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Interview Preparation
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Job Referrals to partner companies
              </li>
            </ul>

            <p className="text-sm font-medium text-foreground mb-1">Go from beginner to fully job-positioned</p>
            <p className="text-xs text-muted-foreground italic mb-3">We don't guarantee jobs — but we position you strongly to get one</p>

            <div className="flex items-center gap-1.5 text-xs text-yellow-500 mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Limited to 250 students
            </div>

            <Button variant="hero" size="lg" className="w-full group/btn" asChild>
              <a href="https://wa.me/2348038149647?text=Hello%20I%20want%20to%20enroll%20in%20the%20Advanced%20Track" target="_blank" rel="noopener noreferrer">
                Enroll in Advanced Track
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All tracks start June 5 • Live online sessions • Certificate upon completion (paid)
          </p>
        </div>
      </div>
    </section>
  );
};

export default DelveSchool;
