import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ExternalLink, MessageCircle } from "lucide-react";

const CertificatePayment = () => {
  return (
    <Card className="border-border bg-card border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-lg text-foreground">
              Certificate of Completion
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium">₦10,000 — Issued upon program completion</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Pay ₦10,000 to reserve your official DelveTek certificate. It will be issued once you complete the program.
        </p>
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
          <p className="text-sm text-foreground font-medium mb-1">📋 How to pay:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Click the payment button below to pay via BursaPay</li>
            <li>After payment, send your receipt/proof of payment to our WhatsApp line</li>
            <li>Your certificate will be issued upon program completion</li>
          </ol>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="glow"
            size="lg"
            className="flex-1"
            asChild
          >
            <a href="https://bursapay.com/pay/widget/b8HmgtGKOxxxn33l/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Pay ₦10,000 via BursaPay
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
          >
            <a href="https://wa.me/447775739225?text=Hello%2C%20I%20just%20paid%20for%20my%20certificate.%20Here%20is%20my%20receipt." target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" /> Send Receipt
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificatePayment;
