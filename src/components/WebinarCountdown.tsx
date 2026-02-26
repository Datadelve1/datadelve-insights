import { useState, useEffect } from "react";

const WEBINAR_DATE = new Date("2026-03-28T19:00:00Z"); // 8PM GMT+1 = 7PM UTC

const WebinarCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const diff = Math.max(0, WEBINAR_DATE.getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: diff === 0,
    };
  }

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 justify-center py-4">
        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <span className="font-display text-xl font-bold" style={{ color: "#D4A017" }}>
          The webinar is live now!
        </span>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Mins" },
    { value: timeLeft.seconds, label: "Secs" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border flex items-center justify-center shadow-sm"
              style={{ background: "#FFFFFF", borderColor: "#E8E0D4" }}
            >
              <span className="font-display text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: "#1A1A1A" }}>
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
            <span className="text-xs font-medium mt-1.5 uppercase tracking-wider" style={{ color: "#5A5A5A" }}>
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="font-display text-2xl font-bold -mt-5" style={{ color: "#D4A017" }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default WebinarCountdown;
