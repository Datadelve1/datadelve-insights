import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-8 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: March 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">We collect information you provide directly to us, including your name, email address, phone number, and any other information you choose to provide when registering for our training programs, contacting us, or using our services. We also automatically collect certain information about your device and usage of our website, including your IP address, browser type, operating system, and pages visited.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">We use the information we collect to provide, maintain, and improve our services; process your registration and manage your account; send you training materials, updates, and administrative messages; respond to your comments, questions, and requests; monitor and analyse trends, usage, and activities; and personalise your experience on our platform.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as necessary to provide our services, comply with the law, or protect our rights. We may share information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">We implement appropriate technical and organisational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">Our website may contain links to third-party websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to review the privacy policy of every site you visit.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">Our services are not intended for individuals under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">You have the right to access, update, or delete your personal information at any time. You may also opt out of receiving promotional communications from us by following the unsubscribe instructions in those messages. To exercise any of these rights, please contact us at info@delvetek.io.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">If you have any questions about this Privacy Policy, please contact us at <a href="mailto:info@delvetek.io" className="text-primary hover:underline">info@delvetek.io</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default PrivacyPolicy;
