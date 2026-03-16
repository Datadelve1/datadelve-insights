import { Linkedin, Mail, Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "#about" },
      { name: "Services", href: "#services" },
      { name: "Contact", href: "#contact" },
    ],
    resources: [
      { name: "Blog", href: "/blog" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "Free Resources", href: "https://www.youtube.com/@Delvetek", external: true },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
    ],
  };

  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/company/datadelve.com/", label: "LinkedIn" },
    { icon: Facebook, href: "https://www.facebook.com/share/15hQHcG1G9L/?mibextid=wwXIfr", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/delvetek_?igsh=MXB2Y2Myd2pibzc3Yg%3D%3D&utm_source=qr", label: "Instagram" },
    { icon: Mail, href: "mailto:datadelve1@gmail.com", label: "Email" },
  ];

  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#home" className="flex items-center gap-3 mb-6">
              <img src={delvetekLogo} alt="Delvetek" className="h-10 w-auto rounded-lg" />
              <span className="font-display font-bold text-xl text-foreground">
                Delve<span className="text-primary">Tek</span>
              </span>
            </a>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              Empowering individuals to master in-demand tech skills through structured, multi-track training programs. 
              Transform your career with expert guidance.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-colors duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors duration-300">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors duration-300">{link.name}</a>
                  ) : (
                    <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors duration-300">{link.name}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors duration-300">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">© {currentYear} DelveTek. All rights reserved.</p>
          <p className="text-muted-foreground text-sm">Your Path to Global Tech Mastery</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
