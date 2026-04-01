import { useEffect, useRef, useState, useCallback } from "react";
import { Shield, AlertTriangle, Loader2, SkipBack, SkipForward } from "lucide-react";

interface ProtectedVideoPlayerProps {
  src: string;
  title?: string;
  onClose?: () => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const ProtectedVideoPlayer = ({ src, title, onClose }: ProtectedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [screenRecordDetected, setScreenRecordDetected] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const pauseVideo = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Screen capture detection
  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;
    const checkScreenCapturePermission = async () => {
      try {
        permissionStatus = await navigator.permissions.query({ name: "display-capture" as PermissionName });
        if (permissionStatus.state === "granted") {
          setScreenRecordDetected(true);
          pauseVideo();
        }
        permissionStatus.addEventListener("change", () => {
          if (permissionStatus?.state === "granted") {
            setScreenRecordDetected(true);
            pauseVideo();
          }
        });
      } catch {}
    };
    checkScreenCapturePermission();
    return () => { permissionStatus?.removeEventListener("change", () => {}); };
  }, [pauseVideo]);

  useEffect(() => {
    const handlePipEnter = () => { pauseVideo(); setScreenRecordDetected(true); };
    document.addEventListener("enterpictureinpicture", handlePipEnter);
    return () => document.removeEventListener("enterpictureinpicture", handlePipEnter);
  }, [pauseVideo]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); return false; };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === "s") || (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") || (e.ctrlKey && e.key === "u") ||
        e.key === "F12" || e.key === "PrintScreen"
      ) { e.preventDefault(); e.stopPropagation(); return false; }
    };
    const handleVisibilityChange = () => { if (document.hidden) pauseVideo(); };
    const handleBlur = () => { pauseVideo(); };
    let lastWidth = window.outerWidth;
    let lastHeight = window.outerHeight;
    const handleResize = () => {
      const widthDiff = Math.abs(window.outerWidth - lastWidth);
      const heightDiff = Math.abs(window.outerHeight - lastHeight);
      if (widthDiff > 200 || heightDiff > 200) pauseVideo();
      lastWidth = window.outerWidth;
      lastHeight = window.outerHeight;
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("resize", handleResize);
    };
  }, [pauseVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.disablePictureInPicture = true;
      (video as any).controlsList?.add("nodownload");
      (video as any).controlsList?.add("noplaybackrate");
      video.preload = "auto";
    }
  }, []);

  // Buffering detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);
    const onSeeking = () => setIsBuffering(true);
    const onSeeked = () => setIsBuffering(false);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("seeked", onSeeked);
    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("seeked", onSeeked);
    };
  }, []);

  const togglePlay = () => {
    if (screenRecordDetected) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setIsPlaying(true); }
    else { video.pause(); setIsPlaying(false); }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) { videoRef.current.currentTime = time; setCurrentTime(time); }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) { videoRef.current.volume = vol; setVolume(vol); }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else containerRef.current.requestFullscreen();
    }
  };

  if (screenRecordDetected) {
    return (
      <div className="flex items-center justify-center bg-background rounded-xl p-12">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-foreground font-display font-bold">Screen Recording Detected</p>
          <p className="text-muted-foreground text-sm">
            Video playback has been disabled. Screen recording or sharing is not permitted.
          </p>
          <button
            onClick={() => setScreenRecordDetected(false)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            I've stopped recording — Resume
          </button>
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
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="w-full aspect-video"
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        style={{ pointerEvents: "none" }}
      />

      {/* Transparent overlay */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Loading / Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Watermark overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-16 rotate-[-30deg] scale-150">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="text-white text-2xl font-bold whitespace-nowrap">
              DELVETEK CONFIDENTIAL
            </span>
          ))}
        </div>
      </div>

      {/* Play/Pause overlay when paused & not buffering */}
      {!isPlaying && !isBuffering && (
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Skip backward 10s */}
            <button onClick={skipBackward} className="text-white hover:text-primary transition-colors" title="Back 10s">
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
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
            {/* Skip forward 10s */}
            <button onClick={skipForward} className="text-white hover:text-primary transition-colors" title="Forward 10s">
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="text-white text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolumeChange}
              className="w-12 sm:w-16 h-1 accent-primary cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white hover:text-primary transition-colors text-xs font-mono px-1.5 py-0.5 rounded border border-white/20 hover:border-primary/50"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 bg-black/90 border border-white/20 rounded-lg py-1 min-w-[80px] z-20">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
                        speed === playbackSpeed
                          ? "text-primary bg-primary/10"
                          : "text-white hover:text-primary hover:bg-white/5"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-white/50">
              <Shield className="w-3 h-3" /> Protected
            </span>
            <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print { video { display: none !important; } }
      `}</style>
    </div>
  );
};


export default ProtectedVideoPlayer;
