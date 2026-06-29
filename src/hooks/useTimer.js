// src/hooks/useTimer.js

/**
 * useTimer Hook
 *
 * Professional, reusable custom hook for timer functionality.
 * Supports both countdown and count-up modes with complete control.
 * Used throughout the application for turn timers, countdowns, and animations.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Default configuration for the timer.
 */
const DEFAULT_CONFIG = {
  initialTime: 60, // seconds
  mode: "countdown",
  autoStart: false,
  interval: 1000, // milliseconds
  onComplete: null,
};

/**
 * Formats time in MM:SS format.
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Formatted time string
 */
const formatTime = (totalSeconds) => {
  if (totalSeconds < 0) totalSeconds = 0;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

/**
 * Formats time in MM:SS:MS format (for more precision).
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Formatted time string with milliseconds
 */
const formatTimeWithMs = (totalSeconds) => {
  if (totalSeconds < 0) totalSeconds = 0;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(3, "0")}`;
};

// ============================================================
// USE TIMER HOOK
// ============================================================

/**
 * useTimer custom hook for managing timers.
 * Supports countdown and count-up modes with complete control.
 */
const useTimer = (config = {}) => {
  // ============================================================
  // CONFIGURATION
  // ============================================================

  const {
    initialTime = DEFAULT_CONFIG.initialTime,
    mode = DEFAULT_CONFIG.mode,
    autoStart = DEFAULT_CONFIG.autoStart,
    interval = DEFAULT_CONFIG.interval,
    onComplete = DEFAULT_CONFIG.onComplete,
  } = config;

  // ============================================================
  // STATE
  // ============================================================

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // ============================================================
  // REFS
  // ============================================================

  const intervalRef = useRef(null);
  const initialTimeRef = useRef(initialTime);
  const onCompleteRef = useRef(onComplete);
  const isMountedRef = useRef(true);

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  /**
   * Clears the interval timer.
   */
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Gets the next time value based on mode.
   * @param {number} currentTime - Current time
   * @returns {number} Next time value
   */
  const getNextTime = useCallback(
    (currentTime) => {
      if (mode === "countdown") {
        return currentTime - interval / 1000;
      } else {
        return currentTime + interval / 1000;
      }
    },
    [mode, interval],
  );

  /**
   * Checks if the timer has completed.
   * @param {number} currentTime - Current time
   * @returns {boolean} True if completed
   */
  const checkCompletion = useCallback(
    (currentTime) => {
      if (mode === "countdown" && currentTime <= 0) {
        return true;
      }
      return false;
    },
    [mode],
  );

  /**
   * Handles timer completion.
   */
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(true);
    clearTimer();

    if (onCompleteRef.current && typeof onCompleteRef.current === "function") {
      onCompleteRef.current();
    }
  }, [clearTimer]);

  // ============================================================
  // TIMER METHODS
  // ============================================================

  /**
   * Starts the timer.
   */
  const start = useCallback(() => {
    if (isCompleted) {
      // Reset completed state when starting
      setIsCompleted(false);
    }

    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [isRunning, isCompleted]);

  /**
   * Pauses the timer.
   */
  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
      clearTimer();
    }
  }, [isRunning, clearTimer]);

  /**
   * Resumes the timer.
   */
  const resume = useCallback(() => {
    if (!isRunning && !isCompleted) {
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [isRunning, isCompleted]);

  /**
   * Stops the timer and resets to initial time.
   */
  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    clearTimer();
    setTime(initialTimeRef.current);
  }, [clearTimer]);

  /**
   * Resets the timer to initial time without stopping.
   */
  const reset = useCallback(() => {
    setTime(initialTimeRef.current);
    setIsCompleted(false);
    setIsPaused(false);

    if (autoStart) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
      clearTimer();
    }
  }, [autoStart, clearTimer]);

  /**
   * Sets the time to a specific value.
   * @param {number} newTime - New time in seconds
   */
  const setTimeValue = useCallback(
    (newTime) => {
      if (typeof newTime !== "number" || newTime < 0) {
        throw new Error("Time must be a non-negative number");
      }

      setTime(newTime);
      setIsCompleted(false);

      // If timer is running, keep running with new time
      if (isRunning) {
        // No need to restart interval
      }
    },
    [isRunning],
  );

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
      clearTimer();
    };
  }, [clearTimer]);

  /**
   * Update onComplete ref when it changes.
   */
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  /**
   * Main timer interval effect.
   */
  useEffect(() => {
    // Clear existing interval
    clearTimer();

    // Don't start if not running or already completed
    if (!isRunning || isCompleted) {
      return;
    }

    // Start the interval
    intervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        clearTimer();
        return;
      }

      setTime((currentTime) => {
        const nextTime = getNextTime(currentTime);
        const roundedTime = Math.max(0, Math.round(nextTime * 100) / 100);

        // Check for completion
        if (mode === "countdown" && roundedTime <= 0) {
          // Handle completion on next tick to avoid state update issues
          setTimeout(() => {
            if (isMountedRef.current) {
              handleComplete();
            }
          }, 0);
          return 0;
        }

        return roundedTime;
      });
    }, interval);

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearTimer();
    };
  }, [
    isRunning,
    isCompleted,
    mode,
    interval,
    getNextTime,
    handleComplete,
    clearTimer,
  ]);

  /**
   * Reset time when initialTime changes.
   */
  useEffect(() => {
    initialTimeRef.current = initialTime;
    if (!isRunning && !isPaused) {
      setTime(initialTime);
      setIsCompleted(false);
    }
  }, [initialTime, isRunning, isPaused]);

  // ============================================================
  // COMPUTED VALUES
  // ============================================================

  /**
   * Formatted time in MM:SS format.
   */
  const formattedTime = useMemo(() => {
    return formatTime(time);
  }, [time]);

  /**
   * Formatted time with milliseconds.
   */
  const formattedTimeWithMs = useMemo(() => {
    return formatTimeWithMs(time);
  }, [time]);

  /**
   * Minutes component of the time.
   */
  const minutes = useMemo(() => {
    return Math.floor(time / 60);
  }, [time]);

  /**
   * Seconds component of the time.
   */
  const seconds = useMemo(() => {
    return Math.floor(time % 60);
  }, [time]);

  /**
   * Milliseconds component of the time.
   */
  const milliseconds = useMemo(() => {
    return Math.floor((time % 1) * 1000);
  }, [time]);

  /**
   * Progress percentage (for countdown mode).
   */
  const progress = useMemo(() => {
    if (mode === "countdown" && initialTimeRef.current > 0) {
      const progressValue = (time / initialTimeRef.current) * 100;
      return Math.max(0, Math.min(100, progressValue));
    }
    return 0;
  }, [time, mode]);

  /**
   * Time remaining in seconds (for countdown mode).
   */
  const timeRemaining = useMemo(() => {
    if (mode === "countdown") {
      return Math.max(0, time);
    }
    return time;
  }, [time, mode]);

  /**
   * Elapsed time in seconds (for count-up mode).
   */
  const elapsedTime = useMemo(() => {
    if (mode === "countup") {
      return time;
    }
    return initialTimeRef.current - time;
  }, [time, mode]);

  // ============================================================
  // RETURN VALUE
  // ============================================================

  return useMemo(
    () => ({
      // State
      time,
      isRunning,
      isCompleted,
      isPaused,

      // Formatted helpers
      formattedTime,
      formattedTimeWithMs,
      minutes,
      seconds,
      milliseconds,
      progress,
      timeRemaining,
      elapsedTime,

      // Methods
      start,
      pause,
      resume,
      stop,
      reset,
      setTime: setTimeValue,

      // Additional helpers
      getTime: () => time,
      getInitialTime: () => initialTimeRef.current,
      isActive: isRunning || isPaused,
      hasCompleted: isCompleted,
    }),
    [
      time,
      isRunning,
      isCompleted,
      isPaused,
      formattedTime,
      formattedTimeWithMs,
      minutes,
      seconds,
      milliseconds,
      progress,
      timeRemaining,
      elapsedTime,
      start,
      pause,
      resume,
      stop,
      reset,
      setTimeValue,
    ],
  );
};

// ============================================================
// EXPORT
// ============================================================

export default useTimer;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why timer functionality belongs in a custom hook:
 *
 * - Reusability: Timer logic can be used across multiple components
 *   without code duplication. Any component that needs a timer can
 *   simply use the hook.
 *
 * - Separation of Concerns: The hook encapsulates all timer logic,
 *   keeping it separate from UI components. Components focus on
 *   rendering, not on timer management.
 *
 * - Clean Code: The hook abstracts away the complexity of setInterval,
 *   cleanup, and state management, making components cleaner and
 *   easier to read.
 *
 * - Testability: The hook can be tested in isolation with mock timers,
 *   ensuring reliable tests for timer-dependent components.
 *
 * - Performance: The hook uses useCallback and useMemo to prevent
 *   unnecessary re-renders and optimize performance.
 *
 * - Consistency: All timers in the application behave consistently
 *   because they use the same hook implementation.
 *
 * - Lifecycle Management: The hook automatically cleans up intervals
 *   on unmount, preventing memory leaks.
 *
 * 2. Where this hook can be used in the Ludo application:
 *
 * Turn Timer:
 * - Each player has a time limit to make a move (e.g., 30 seconds)
 * - Countdown mode with visual warning when time is low
 * - Auto-advance turn when timer completes
 *
 * Room Countdown:
 * - Countdown before game starts (e.g., "Game starting in 5...")
 * - Countdown for reconnection attempts
 * - Countdown for player readiness
 *
 * Dice Animation:
 * - Countdown while dice is rolling
 * - Timer for dice result display
 * - Delay before next action
 *
 * Move History:
 * - Timestamp for each move
 * - Time taken per move (count-up)
 * - Total game duration
 *
 * Player Statistics:
 * - Average turn time
 * - Time spent in game
 * - Fastest move time
 *
 * Game Events:
 * - Countdown for special events (e.g., "2x points in 10 seconds")
 * - Timer for power-ups or bonuses
 * - Cooldown timers for abilities
 *
 * Connection Management:
 * - Reconnection countdown
 * - Ping/Pong timing
 * - Connection timeout detection
 *
 * Animations:
 * - Timer for animation sequences
 * - Delay between animations
 * - Synchronization timer for multi-step animations
 *
 * Chat & Communication:
 * - Message cooldown timers
 * - Typing indicator timing
 * - Auto-hide notifications after timer
 *
 * Tournament Mode:
 * - Round timers
 * - Match duration tracking
 * - Break timers between rounds
 *
 * Spectator Mode:
 * - Game stream delay timer
 * - Refresh interval for updates
 *
 * 3. How this design keeps timer logic separate from UI components:
 *
 * - The hook returns raw time data (time, minutes, seconds) and
 *   formatted strings (formattedTime) that components can display
 *   however they want.
 *
 * - Components don't need to know how the timer works internally.
 *   They just call start(), pause(), stop(), and display the time.
 *
 * - The hook provides progress, elapsedTime, and timeRemaining
 *   values that components can use for visual indicators (progress
 *   bars, color changes, etc.).
 *
 * - Components can implement their own visual styles while the
 *   hook handles the core timer logic.
 *
 * - Multiple components can use the same timer instance without
 *   interfering with each other.
 *
 * - The hook is framework-agnostic and can be used with any React
 *   component or even outside React if needed.
 *
 * Example usage in a UI component:
 *
 * function TurnTimer({ playerId, onTimeout }) {
 *   const { time, formattedTime, progress, start, pause, isRunning } = useTimer({
 *     initialTime: 30,
 *     mode: 'countdown',
 *     autoStart: true,
 *     onComplete: onTimeout,
 *   });
 *
 *   return (
 *     <div className="turn-timer">
 *       <div className="timer-display">{formattedTime}</div>
 *       <div className="progress-bar" style={{ width: `${progress}%` }} />
 *       {isRunning && <button onClick={pause}>Pause</button>}
 *     </div>
 *   );
 * }
 *
 * The component focuses on rendering and user interaction,
 * while the hook handles all the timer logic.
 */
