import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/metaPixel";

/** Fires Meta Pixel PageView on every SPA route change. */
const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView();
  }, [location.pathname, location.search]);
  return null;
};

export default RouteTracker;
