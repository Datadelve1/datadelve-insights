import { useEffect, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import EnrollmentModal from "@/components/EnrollmentModal";

const VALID_TIERS = ["beginner", "professional", "advanced"];

const EnrollTier = () => {
  const { tier } = useParams<{ tier: string }>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) navigate("/enroll");
  }, [open, navigate]);

  if (!tier || !VALID_TIERS.includes(tier)) {
    return <Navigate to="/enroll" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <EnrollmentModal open={open} onOpenChange={setOpen} defaultTrack={tier} />
    </div>
  );
};

export default EnrollTier;
