import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service | Delvetek"
        description="Terms governing the use of Delvetek's training programs and platform."
        path="/terms-of-service"
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-8 text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mb-6">Last updated: March 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">By accessing and using DelveTek's website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Use of Services</h2>
              <p className="text-muted-foreground leading-relaxed">Our training programs and services are provided for educational purposes. You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">All content on this website, including text, graphics, logos, images, audio clips, video clips, data compilations, and software, is the property of DelveTek or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, modify, or create derivative works from any content without our express written consent.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Training Programs</h2>
              <p className="text-muted-foreground leading-relaxed">Training programs are delivered online via our student dashboard. Session recordings are available to enrolled students who submit their weekly reviews. Assignments are graded automatically with additional admin review. Completion certificates are issued upon meeting all program requirements and are subject to a separate fee. Certificates are paid and not included in free/standard access.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Payment and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">Certain services may require payment. All payments are processed securely through our payment providers. Refund requests must be submitted within 7 days of purchase. We reserve the right to deny refund requests that do not comply with our refund policy.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">6. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed">You agree not to use our services to upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. You also agree not to attempt to gain unauthorised access to any portion of the website or any systems connected to the website.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">DelveTek shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services. Our total liability shall not exceed the amount paid by you for the specific service giving rise to the claim.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">We may terminate or suspend your account and bar access to our services immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms. Upon termination, your right to use our services will cease immediately.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">9. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. Continued use of our services after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">If you have any questions about these Terms of Service, please contact us at <a href="mailto:info@delvetek.io" className="text-primary hover:underline">info@delvetek.io</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default TermsOfService;
