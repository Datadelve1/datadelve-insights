import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Delve School", href: "#delve-school" },
    { name: "Services", href: "#services" },
    { name: "Free Training", href: "#webinar" },
    { name: "About", href: "#about" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  const handleLogoClick = (e: React.MouseEvent) => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount >= 5) {
      setLogoClickCount(0);
      window.location.href = "/admin";
    }
    // Reset after 3 seconds
    setTimeout(() => setLogoClickCount(0), 3000);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3" onClick={handleLogoClick}>
            <img src={delvetekLogo} alt="Delvetek" className="h-10 w-auto rounded-lg" />
            <span className="font-display font-bold text-xl text-foreground">
              Delve<span className="text-primary">Tek</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                {link.name}
              </a>
            ))}
            <Button variant="hero" size="default" asChild>
              <Link to="/auth">
                <GraduationCap className="w-4 h-4" /> Student Portal
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Button variant="hero" size="default" className="w-full mt-2" asChild>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <GraduationCap className="w-4 h-4" /> Student Portal
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
