import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Clock, CalendarDays, Monitor, Award, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CourseFAQ {
  question: string;
  answer: string;
}

interface CourseDetailProps {
  title: string;
  tagline: string;
  icon: LucideIcon;
  skills: string[];
  faqs: CourseFAQ[];
}

const CourseDetailPage = ({ title, tagline, icon: Icon, skills, faqs }: CourseDetailProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Back */}
          <Link to="/#delve-school" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>

          {/* Hero */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 text-foreground">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{tagline}</p>
          </div>

          {/* Program Overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
            {[
              { icon: Clock, label: "Duration", value: "6 weeks + 2 week project" },
              { icon: CalendarDays, label: "Sessions", value: "3 hrs, Fri & Sat" },
              { icon: Monitor, label: "Mode", value: "Live online via dashboard" },
              { icon: Award, label: "Certificate", value: "Yes, upon completion" },
            ].map((item) => (
              <Card key={item.label} className="border-primary/20 bg-primary/5">
                <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                  <item.icon className="w-6 h-6 text-primary" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="font-display font-semibold text-sm text-foreground">{item.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skills & Tools */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="font-display text-2xl font-bold mb-6 text-foreground text-center">
              Skills & Tools You Will Learn
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {skills.map((skill) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-foreground">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* What's Included */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="font-display text-2xl font-bold mb-6 text-foreground text-center">
              What's Included
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Weekly assignments with automated grading",
                "Video reflections to reinforce learning",
                "Class recordings accessible via dashboard",
                "2-week hands-on real-world project",
                "Progress tracking and completion certificate",
                "Dedicated student dashboard",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 rounded-xl glass border border-border/50">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Advanced Package */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-8 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold mb-3 text-foreground">
                  Optional Advanced Package
                </h3>
                <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                  Take your career to the next level with CV optimization, LinkedIn profile setup, and personalized job application guidance.
                </p>
                <Button variant="hero" asChild>
                  <a href="/#contact">Contact Us for Details</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-2xl font-bold mb-6 text-foreground text-center">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glass rounded-xl px-6 border-none">
                  <AccordionTrigger className="text-left font-display font-semibold hover:text-primary transition-colors py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">
                <BookOpen className="w-5 h-5" /> Enroll Now
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetailPage;
