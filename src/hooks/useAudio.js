// src/hooks/useAudio.js

/**
 * useAudio Hook
 *
 * Professional, reusable custom hook for audio management.
 * Uses native HTML5 Audio API with support for single tracks and playlists.
 * Provides complete control over playback, volume, and audio state.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Default configuration for the audio hook.
 */
const DEFAULT_CONFIG = {
  volume: 1,
  muted: false,
  loop: false,
  playbackRate: 1,
  autoPlay: false,
  preload: "metadata",
};

/**
 * Audio event types for cleanup.
 */
const AUDIO_EVENTS = [
  "loadstart",
  "loadedmetadata",
  "loadeddata",
  "canplay",
  "canplaythrough",
  "play",
  "playing",
  "pause",
  "ended",
  "timeupdate",
  "volumechange",
  "error",
];

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Creates a new Audio instance.
 * @param {string} src - Audio source URL
 * @param {Object} options - Audio options
 * @returns {HTMLAudioElement} Audio instance
 */
const createAudioElement = (src, options = {}) => {
  const audio = new Audio(src);

  if (options.preload) audio.preload = options.preload;
  if (options.loop) audio.loop = options.loop;
  if (options.volume !== undefined) audio.volume = options.volume;
  if (options.muted) audio.muted = options.muted;
  if (options.playbackRate) audio.playbackRate = options.playbackRate;

  return audio;
};

/**
 * Formats time in MM:SS format.
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

/**
 * Creates a fallback audio element for development/testing.
 * @param {string} src - Audio source URL
 * @returns {HTMLAudioElement} Audio instance
 */
const createFallbackAudio = (src) => {
  // Create a silent audio element for testing when no real audio is available
  const audio = new Audio();
  audio.src = src;
  return audio;
};

// ============================================================
// USE AUDIO HOOK
// ============================================================

/**
 * useAudio custom hook for managing audio playback.
 * Supports single tracks, playlists, and complete audio control.
 */
const useAudio = (src, config = {}) => {
  // ============================================================
  // CONFIGURATION
  // ============================================================

  const {
    volume: initialVolume = DEFAULT_CONFIG.volume,
    muted: initialMuted = DEFAULT_CONFIG.muted,
    loop: initialLoop = DEFAULT_CONFIG.loop,
    playbackRate: initialPlaybackRate = DEFAULT_CONFIG.playbackRate,
    autoPlay = DEFAULT_CONFIG.autoPlay,
    preload = DEFAULT_CONFIG.preload,
  } = config;

  // Determine if we're using a playlist
  const isPlaylist = Array.isArray(src);
  const currentSrc = isPlaylist ? src[0] || "" : src;

  // ============================================================
  // STATE
  // ============================================================

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolumeState] = useState(initialVolume);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLooping, setIsLooping] = useState(initialLoop);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(initialPlaybackRate);

  // ============================================================
  // REFS
  // ============================================================

  const audioRef = useRef(null);
  const playlistRef = useRef(isPlaylist ? src : [src]);
  const isMountedRef = useRef(true);
  const isUserInteractedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  /**
   * Cleans up audio element and event listeners.
   */
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      // Remove all event listeners
      AUDIO_EVENTS.forEach((event) => {
        audioRef.current.removeEventListener(event, handleAudioEvent);
      });

      // Pause and unload
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();

      audioRef.current = null;
    }
  }, []);

  /**
   * Handles audio events.
   */
  const handleAudioEvent = useCallback(
    (event) => {
      const audio = audioRef.current;
      if (!audio) return;

      switch (event.type) {
        case "loadstart":
          setIsLoading(true);
          setError(null);
          break;

        case "loadedmetadata":
          setDuration(audio.duration);
          break;

        case "loadeddata":
        case "canplay":
        case "canplaythrough":
          setIsLoading(false);
          setError(null);
          if (autoPlay && isMountedRef.current) {
            play();
          }
          break;

        case "play":
          setIsPlaying(true);
          break;

        case "playing":
          setIsPlaying(true);
          break;

        case "pause":
          setIsPlaying(false);
          break;

        case "ended":
          setIsPlaying(false);
          if (isLooping) {
            replay();
          } else if (isPlaylist) {
            nextTrack();
          }
          break;

        case "timeupdate":
          setCurrentTime(audio.currentTime);
          break;

        case "volumechange":
          setVolumeState(audio.volume);
          setIsMuted(audio.muted);
          break;

        case "error":
          const errorMessage = `Audio loading error: ${audio.error?.message || "Unknown error"}`;
          setError(errorMessage);
          setIsLoading(false);
          console.error("[useAudio]", errorMessage);

          // Retry loading
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            setTimeout(() => {
              if (isMountedRef.current && audioRef.current) {
                audioRef.current.load();
              }
            }, 1000 * retryCountRef.current);
          }
          break;

        default:
          break;
      }
    },
    [autoPlay, isLooping, isPlaylist, play, replay, nextTrack],
  );

  /**
   * Sets up audio element with event listeners.
   */
  const setupAudio = useCallback(
    (audioSrc) => {
      // Clean up existing audio
      cleanupAudio();

      if (!audioSrc) {
        setError("No audio source provided");
        return;
      }

      try {
        // Create new audio element
        const audio = createAudioElement(audioSrc, {
          preload,
          loop: isLooping,
          volume: initialVolume,
          muted: initialMuted,
          playbackRate: initialPlaybackRate,
        });

        // Store reference
        audioRef.current = audio;

        // Register event listeners
        AUDIO_EVENTS.forEach((event) => {
          audio.addEventListener(event, handleAudioEvent);
        });

        // Load the audio
        audio.load();

        // Reset state
        setError(null);
        setCurrentTime(0);
        setDuration(0);
        setIsLoading(true);
      } catch (err) {
        setError(`Failed to create audio: ${err.message}`);
        console.error("[useAudio]", err);
      }
    },
    [
      cleanupAudio,
      handleAudioEvent,
      preload,
      isLooping,
      initialVolume,
      initialMuted,
      initialPlaybackRate,
    ],
  );

  // ============================================================
  // PUBLIC METHODS
  // ============================================================

  /**
   * Loads a new audio source.
   * @param {string} newSrc - New audio source URL
   */
  const loadAudio = useCallback(
    (newSrc) => {
      if (!newSrc) {
        setError("No audio source provided");
        return;
      }

      retryCountRef.current = 0;
      setupAudio(newSrc);
    },
    [setupAudio],
  );

  /**
   * Plays the audio.
   * @returns {Promise} Playback promise
   */
  const play = useCallback(async () => {
    if (!audioRef.current) {
      setError("Audio not loaded");
      return Promise.reject(new Error("Audio not loaded"));
    }

    try {
      isUserInteractedRef.current = true;
      setIsLoading(true);

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setIsLoading(false);
        setError(null);
      }

      return Promise.resolve();
    } catch (err) {
      // Handle autoplay restriction
      if (err.name === "NotAllowedError") {
        console.warn(
          "[useAudio] Autoplay blocked by browser. Waiting for user interaction.",
        );
        setIsPlaying(false);
        setIsLoading(false);
        setError("Autoplay blocked. Click play to start.");
      } else {
        setError(`Play failed: ${err.message}`);
        console.error("[useAudio]", err);
      }
      return Promise.reject(err);
    }
  }, []);

  /**
   * Pauses the audio.
   */
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  /**
   * Stops the audio and resets to beginning.
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  /**
   * Replays the audio from the beginning.
   */
  const replay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return play();
    }
    return Promise.reject(new Error("Audio not loaded"));
  }, [play]);

  /**
   * Toggles play/pause.
   */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  /**
   * Toggles mute/unmute.
   */
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  }, []);

  /**
   * Sets the volume.
   * @param {number} newVolume - Volume value (0-1)
   */
  const setVolume = useCallback((newVolume) => {
    if (newVolume < 0 || newVolume > 1) {
      console.warn("[useAudio] Volume must be between 0 and 1");
      return;
    }

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
    }
  }, []);

  /**
   * Seeks to a specific time.
   * @param {number} time - Time in seconds
   */
  const seekTo = useCallback(
    (time) => {
      if (audioRef.current && duration > 0) {
        const seekTime = Math.max(0, Math.min(time, duration));
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
      }
    },
    [duration],
  );

  /**
   * Sets the playback rate.
   * @param {number} rate - Playback rate (0.5 to 2.0)
   */
  const setPlaybackRate = useCallback((rate) => {
    if (rate < 0.5 || rate > 2.0) {
      console.warn("[useAudio] Playback rate should be between 0.5 and 2.0");
      return;
    }

    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, []);

  /**
   * Sets loop mode.
   * @param {boolean} loop - Loop flag
   */
  const setLoop = useCallback((loop) => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
      setIsLooping(loop);
    }
  }, []);

  /**
   * Plays the next track in the playlist.
   */
  const nextTrack = useCallback(() => {
    if (isPlaylist && playlistRef.current.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % playlistRef.current.length;
      setCurrentTrackIndex(nextIndex);
      loadAudio(playlistRef.current[nextIndex]);

      // Auto-play if currently playing
      if (isPlaying) {
        setTimeout(() => play(), 100);
      }
    }
  }, [isPlaylist, currentTrackIndex, loadAudio, play, isPlaying]);

  /**
   * Plays the previous track in the playlist.
   */
  const previousTrack = useCallback(() => {
    if (isPlaylist && playlistRef.current.length > 0) {
      const prevIndex =
        currentTrackIndex === 0
          ? playlistRef.current.length - 1
          : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      loadAudio(playlistRef.current[prevIndex]);

      // Auto-play if currently playing
      if (isPlaying) {
        setTimeout(() => play(), 100);
      }
    }
  }, [isPlaylist, currentTrackIndex, loadAudio, play, isPlaying]);

  // ============================================================
  // EFFECTS
  // ============================================================

  /**
   * Cleanup on unmount.
   */
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cleanupAudio();
    };
  }, [cleanupAudio]);

  /**
   * Initialize audio when src changes.
   */
  useEffect(() => {
    if (currentSrc) {
      retryCountRef.current = 0;
      setupAudio(currentSrc);
    }

    return () => {
      cleanupAudio();
    };
  }, [currentSrc, setupAudio, cleanupAudio]);

  /**
   * Handle user interaction for autoplay.
   */
  useEffect(() => {
    const handleUserInteraction = () => {
      isUserInteractedRef.current = true;
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  // ============================================================
  // COMPUTED VALUES
  // ============================================================

  /**
   * Formatted current time.
   */
  const formattedCurrentTime = useMemo(() => {
    return formatTime(currentTime);
  }, [currentTime]);

  /**
   * Formatted duration.
   */
  const formattedDuration = useMemo(() => {
    return formatTime(duration);
  }, [duration]);

  /**
   * Progress percentage (0-100).
   */
  const progress = useMemo(() => {
    if (duration > 0) {
      return (currentTime / duration) * 100;
    }
    return 0;
  }, [currentTime, duration]);

  /**
   * Audio is ready to play.
   */
  const isReady = useMemo(() => {
    return !isLoading && !error && audioRef.current !== null;
  }, [isLoading, error]);

  /**
   * Audio is currently loading.
   */
  const isBuffering = useMemo(() => {
    return isLoading && !isPlaying;
  }, [isLoading, isPlaying]);

  // ============================================================
  // RETURN VALUE
  // ============================================================

  return useMemo(
    () => ({
      // State
      isPlaying,
      isMuted,
      volume,
      currentTime,
      duration,
      isLoading,
      error,
      isLooping,
      currentTrackIndex,
      playbackRate,
      isReady,
      isBuffering,

      // Formatted values
      formattedCurrentTime,
      formattedDuration,
      progress,

      // Methods
      play,
      pause,
      stop,
      replay,
      togglePlay,
      toggleMute,
      setVolume,
      seekTo,
      setPlaybackRate,
      setLoop,
      loadAudio,
      nextTrack,
      previousTrack,

      // Additional helpers
      isPlayingTrack: () => isPlaying,
      getAudioElement: () => audioRef.current,
    }),
    [
      isPlaying,
      isMuted,
      volume,
      currentTime,
      duration,
      isLoading,
      error,
      isLooping,
      currentTrackIndex,
      playbackRate,
      isReady,
      isBuffering,
      formattedCurrentTime,
      formattedDuration,
      progress,
      play,
      pause,
      stop,
      replay,
      togglePlay,
      toggleMute,
      setVolume,
      seekTo,
      setPlaybackRate,
      setLoop,
      loadAudio,
      nextTrack,
      previousTrack,
    ],
  );
};

// ============================================================
// EXPORT
// ============================================================

export default useAudio;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why audio management belongs in a custom hook:
 *
 * - Reusability: Audio logic can be used across multiple components
 *   without code duplication. Any component that needs sound effects
 *   can simply use the hook.
 *
 * - Separation of Concerns: The hook encapsulates all audio logic,
 *   keeping it separate from UI components. Components focus on
 *   rendering, not on audio management.
 *
 * - Lifecycle Management: The hook handles audio element creation,
 *   event listeners, and cleanup automatically.
 *
 * - Performance: The hook uses useCallback and useMemo to prevent
 *   unnecessary re-renders and optimize performance.
 *
 * - Consistency: All audio in the application behaves consistently
 *   because they use the same hook implementation.
 *
 * - Browser Compatibility: The hook handles browser autoplay
 *   restrictions and loading failures gracefully.
 *
 * - Testability: The hook can be tested with mock audio elements.
 *
 * 2. Where this hook will be used in the Ludo application:
 *
 * Dice Roll:
 * - Rolling sound effect when dice is thrown
 * - Different sounds for each dice value (optional)
 * - Celebration sound when rolling a six
 *
 * Token Movement:
 * - Movement sound as token moves on board
 * - Click sound when token is selected
 * - Landing sound when token reaches a new position
 *
 * Capture:
 * - Capture sound when a token captures another
 * - Dramatic sound for important captures
 * - Home return sound when token is sent home
 *
 * Winner Celebration:
 * - Victory fanfare when a player wins
 * - Confetti or celebration sound effects
 * - End game jingle
 *
 * Button Clicks:
 * - Click feedback sound for all buttons
 * - Hover sound effects for interactive elements
 * - Navigation sounds between screens
 *
 * Game Events:
 * - Turn start notification sound
 * - Timer warning sound (10 seconds remaining)
 * - Timer expired sound
 * - Extra turn awarded sound
 *
 * Player Actions:
 * - Player join/leave sound
 * - Chat message notification
 * - Ready/Unready toggle sound
 *
 * Background Music:
 * - Menu theme music
 * - Gameplay background music
 * - Victory/Defeat music
 * - Ambient sounds for immersion
 *
 * Notifications:
 * - Friend request sound
 * - Game invite sound
 * - Alert/System notification sound
 *
 * UI Feedback:
 * - Page transition sounds
 * - Modal open/close sounds
 * - Selection sounds
 * - Error sounds
 *
 * 3. How this design makes future sound packs and themes easy to support:
 *
 * - The hook accepts a src prop, making it easy to load different
 *   sound files for different themes or sound packs.
 *
 * - Sound packs can be implemented by simply passing different
 *   audio URLs to the hook. A sound pack manager could dynamically
 *   determine which URLs to use.
 *
 * - The hook's volume, mute, and playback rate controls allow
 *   users to customize their audio experience.
 *
 * - The playlist support enables ambient music tracks or sound
 *   packs with multiple variations.
 *
 * - The hook's clean separation from UI means that sound packs
 *   can be changed without modifying component code.
 *
 * - Example of sound pack implementation:
 *
 *   const SOUND_PACKS = {
 *     default: {
 *       diceRoll: '/sounds/default/dice-roll.mp3',
 *       capture: '/sounds/default/capture.mp3',
 *       victory: '/sounds/default/victory.mp3',
 *     },
 *     retro: {
 *       diceRoll: '/sounds/retro/dice-roll.mp3',
 *       capture: '/sounds/retro/capture.mp3',
 *       victory: '/sounds/retro/victory.mp3',
 *     },
 *     fantasy: {
 *       diceRoll: '/sounds/fantasy/dice-roll.mp3',
 *       capture: '/sounds/fantasy/capture.mp3',
 *       victory: '/sounds/fantasy/victory.mp3',
 *     },
 *   };
 *
 *   // Usage
 *   const { play: playDiceRoll } = useAudio(SOUND_PACKS[currentPack].diceRoll);
 *   const { play: playCapture } = useAudio(SOUND_PACKS[currentPack].capture);
 *
 * - This design makes it easy to support:
 *   * Custom sound packs
 *   * Seasonal/themed sound effects
 *   * Accessibility options (reduced audio)
 *   * User preferences (mute, volume)
 *   * A/B testing of different sound designs
 */
