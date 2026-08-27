import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DelveSchool from "@/components/DelveSchool";
import Services from "@/components/Services";
import WebinarRegistration from "@/components/WebinarRegistration";
import Testimonials from "@/components/Testimonials";
import TrustpilotCTA from "@/components/TrustpilotCTA";
import MeetTheTeam from "@/components/MeetTheTeam";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import WelcomePopup from "@/components/WelcomePopup";
import SEO from "@/components/SEO";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="DataDelve | Expert 1:1 Data Analytics & Tech Training"
        description="Cohort-based training in data analytics, project management, business analysis, cybersecurity, software and data engineering. Learn 1:1 with expert mentors."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "Delvetek",
          alternateName: "DataDelve",
          url: "https://www.datadelve.io",
          email: "info@delvetek.io",
        }}
      />
      <Navbar />

      <main>
        <Hero />
        <DelveSchool />
        <Services />
        <WebinarRegistration />
        <Testimonials />
        <TrustpilotCTA />
        <MeetTheTeam />
        <About />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
      <WelcomePopup />
    </div>
  );
};

export default Index;
