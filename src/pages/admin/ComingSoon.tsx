import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const titles: Record<string, string> = {
  "/admin/videos": "Video Management",
  "/admin/assignments": "Assignment Management",
  "/admin/certificates": "Certificate Management",
  "/admin/ambassadors": "Ambassador Program",
  "/admin/notifications": "Notifications",
};

const ComingSoon = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Module";

  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <Card className="border-border bg-card max-w-md w-full">
        <CardContent className="text-center py-12 space-y-4">
          <Construction className="w-12 h-12 text-primary mx-auto" />
          <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm">
            This module is under development and will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;
