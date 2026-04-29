// Meta Pixel helper — Dataset ID: 1339164311368050
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const fbqTrack = (event: string, params?: Record<string, any>) => {
  if (typeof window === "undefined" || !window.fbq) return;
  try {
    if (params) window.fbq("track", event, params);
    else window.fbq("track", event);
  } catch (e) {
    console.warn("Meta Pixel error:", e);
  }
};

export const trackPageView = () => fbqTrack("PageView");
export const trackLead = (params?: Record<string, any>) => fbqTrack("Lead", params);
export const trackInitiateCheckout = (params?: Record<string, any>) =>
  fbqTrack("InitiateCheckout", params);
export const trackCompleteRegistration = (params?: Record<string, any>) =>
  fbqTrack("CompleteRegistration", params);
