import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DelveSchool from "@/components/DelveSchool";
import Services from "@/components/Services";
import WebinarRegistration from "@/components/WebinarRegistration";
import Testimonials from "@/components/Testimonials";
import MeetTheTeam from "@/components/MeetTheTeam";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <DelveSchool />
        <Services />
        <WebinarRegistration />
        <Testimonials />
        <MeetTheTeam />
        <About />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
