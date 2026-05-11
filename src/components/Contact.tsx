import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Clock, Send, MessageCircle, Phone } from "lucide-react";
import { trackContact } from "@/lib/metaPixel";

const Contact = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    trackContact({ method: "contact_form" });

    // Open mailto with the form data
    const mailtoLink = `mailto:info@delvetek.io?subject=${encodeURIComponent(formData.subject || "Contact from Website")}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;
    window.open(mailtoLink);

    toast({
      title: "Opening your email client...",
      description: "Your message is ready to send to info@delvetek.io",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsLoading(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      value: "info@delvetek.io",
      href: "mailto:info@delvetek.io",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "+44 7775 739225",
      href: "https://wa.me/447775739225?text=Hello%20I%20want%20to%20chat",
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "Within 24 hours",
    },
  ];

  return (
    <section id="contact" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium mb-4 block">Get In Touch</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">Start Learning?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Send us a message and we'll get back to you with a personalized learning plan.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map((info) => (
              <div
                key={info.title}
                className="flex items-start gap-4 p-6 rounded-2xl glass"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{info.title}</p>
                  {info.href ? (
                    <a href={info.href} target={info.href.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer" className="font-display font-semibold text-foreground hover:text-primary transition-colors">
                      {info.value}
                    </a>
                  ) : (
                    <p className="font-display font-semibold text-foreground">{info.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Clarity Session Card */}
            <div className="p-6 rounded-2xl gradient-border bg-card/50">
              <h3 className="font-display font-semibold text-lg mb-3 text-foreground">
                Book a Free Clarity Session
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Not sure where to start? Reach out via WhatsApp or email for a personalized consultation.
              </p>
              <div className="flex gap-3">
                <Button variant="hero" size="sm" asChild>
                  <a href="https://wa.me/447775739225?text=Hello%20I%20want%20to%20book%20a%20clarity%20session" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </Button>
                <Button variant="hero-outline" size="sm" asChild>
                  <a href="mailto:info@delvetek.io?subject=Clarity%20Session%20Booking">
                    <Mail className="w-4 h-4" /> Email
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="p-8 rounded-3xl glass space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Your Name *</label>
                  <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="bg-secondary/50 border-border/50 focus:border-primary" maxLength={100} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="bg-secondary/50 border-border/50 focus:border-primary" maxLength={255} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="What would you like to learn?" className="bg-secondary/50 border-border/50 focus:border-primary" maxLength={200} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your goals and experience level..." rows={5} className="bg-secondary/50 border-border/50 focus:border-primary resize-none" maxLength={1000} />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : (<>Send Message <Send className="w-4 h-4" /></>)}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
