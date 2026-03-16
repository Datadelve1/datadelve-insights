import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ComingSoonPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-6 px-6">
          <Construction className="w-16 h-16 text-primary mx-auto" />
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Coming <span className="gradient-text">Soon</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            We're working hard to bring you this training program. Stay tuned for updates!
          </p>
          <Button variant="hero" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default ComingSoonPage;
