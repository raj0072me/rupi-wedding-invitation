"use client";

import { useState, useRef, useEffect } from "react";

export default function MusicPlayer() {
  const [mounted, setMounted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // Show polite prompt after brief delay if not answered yet
    const timer = setTimeout(() => {
      const answered = sessionStorage.getItem("rupi_music_answered");
      if (!answered) {
        setShowPrompt(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const handlePlayYes = () => {
    sessionStorage.setItem("rupi_music_answered", "yes");
    setShowPrompt(false);
    if (audioRef.current) {
      audioRef.current.volume = 0.55;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Audio play allowed:", err));
    }
  };

  const handlePlayNo = () => {
    sessionStorage.setItem("rupi_music_answered", "no");
    setShowPrompt(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/lemon_tree.m4a"
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Gentle Floating Song Prompt Banner */}
      {showPrompt && (
        <div className="music-prompt-overlay fade-in">
          <div className="music-prompt-card">
            <div className="flex items-start gap-3">
              <div className="music-note-badge pulse-gold">
                🍋
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Ambient Music
                  </span>
                </div>
                <h4 className="font-display text-maroon text-base font-semibold leading-snug mt-1">
                  Would you like to play relaxing music while filling your details?
                </h4>
                <p className="font-cormorant italic text-sm mt-0.5 text-stone-600">
                  Lemon Tree — Acoustic Melody 🍋✨
                </p>

                <div className="flex items-center gap-2 mt-3.5">
                  <button
                    id="btn-play-music-yes"
                    type="button"
                    onClick={handlePlayYes}
                    className="btn-music-yes"
                  >
                    ▶ Play Melody 🎵
                  </button>
                  <button
                    id="btn-play-music-no"
                    type="button"
                    onClick={handlePlayNo}
                    className="btn-music-no"
                  >
                    No, thanks
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePlayNo}
                className="music-close-btn"
                aria-label="Dismiss music prompt"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Floating Music Controller Widget */}
      <div className={`floating-music-widget ${collapsed ? "collapsed" : ""}`}>
        {collapsed ? (
          <button
            type="button"
            className="music-fab pulse-gold"
            onClick={() => setCollapsed(false)}
            title="Open music player"
          >
            {isPlaying ? "🎶" : "🍋"}
          </button>
        ) : (
          <div className="music-pill">
            <button
              type="button"
              className={`music-play-btn ${isPlaying ? "playing" : ""}`}
              onClick={togglePlay}
              title={isPlaying ? "Pause music" : "Play Lemon Tree"}
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? (
                <span className="equalizer-bars">
                  <span className="bar bar-1"></span>
                  <span className="bar bar-2"></span>
                  <span className="bar bar-3"></span>
                </span>
              ) : (
                "▶"
              )}
            </button>

            <div className="music-info" onClick={togglePlay} role="button" tabIndex={0}>
              <span className="song-title">Lemon Tree 🍋</span>
              <span className="song-status">{isPlaying ? "Playing 🎵" : "Tap to Play"}</span>
            </div>

            <button
              type="button"
              className="music-mute-btn"
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            <button
              type="button"
              className="music-minimize-btn"
              onClick={() => setCollapsed(true)}
              title="Minimize"
              aria-label="Minimize player"
            >
              ▾
            </button>
          </div>
        )}
      </div>
    </>
  );
}
