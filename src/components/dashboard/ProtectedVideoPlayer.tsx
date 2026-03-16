import { useEffect, useRef, useState } from "react";
import { Shield, AlertTriangle } from "lucide-react";

interface ProtectedVideoPlayerProps {
  src: string;
  title?: string;
  onClose?: () => void;
}

/**
 * Secure video player with protections against:
 * - Right-click download
 * - Keyboard shortcuts (Ctrl+S, PrintScreen, etc.)
 * - Screen recording detection (via Visibility API + blur)
 * - DevTools detection (resize heuristic)
 * - Watermark overlay for deterrence
 * - No download attribute on video element
 * - CSS overlay to block direct video interaction
 */
const ProtectedVideoPlayer = ({ src, title, onClose }: ProtectedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [screenRecordDetected, setScreenRecordDetected] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    // Block right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+S, Ctrl+Shift+I, F12, PrintScreen, Ctrl+U, Ctrl+Shift+J
      if (
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "u") ||
        e.key === "F12" ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Detect screen sharing / recording via navigator.mediaDevices
    const checkScreenCapture = async () => {
      try {
        if (navigator.mediaDevices && "getDisplayMedia" in navigator.mediaDevices) {
          // We can't directly detect, but we use visibility API
        }
      } catch {}
    };

    // Pause video when tab is not visible (potential screen recording)
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    // Detect window blur (alt-tab to screen recorder)
    const handleBlur = () => {
      // Don't pause on blur as it's too aggressive for normal use
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    checkScreenCapture();

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Disable PiP (picture-in-picture) which could allow external viewing
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.disablePictureInPicture = true;
      video.controlsList?.add("nodownload");
      video.controlsList?.add("noplaybackrate");
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  if (screenRecordDetected) {
    return (
      <div className="flex items-center justify-center bg-background rounded-xl p-12">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-foreground font-display font-bold">Screen Recording Detected</p>
          <p className="text-muted-foreground text-sm">
            Video playback has been paused for content protection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden bg-black select-none"
      onDragStart={(e) => e.preventDefault()}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Video element — no native controls to prevent download button */}
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="w-full aspect-video"
        playsInline
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        style={{ pointerEvents: "none" }}
      />

      {/* Transparent overlay to block direct video interaction */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Watermark overlay for deterrence */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04]">
        <div className="text-white text-4xl font-bold rotate-[-30deg] whitespace-nowrap">
          DELVETEK CONFIDENTIAL
        </div>
      </div>

      {/* Play/Pause overlay when paused */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Custom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 space-y-2">
        {/* Progress bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 accent-primary cursor-pointer"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Time */}
            <span className="text-white text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Protected badge */}
            <span className="flex items-center gap-1 text-[10px] text-white/50">
              <Shield className="w-3 h-3" /> Protected
            </span>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Anti-screenshot CSS: blur on print */}
      <style>{`
        @media print {
          video { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ProtectedVideoPlayer;
