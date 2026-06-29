// src/components/Common/Tooltip.jsx

/**
 * Tooltip Component
 * 
 * Professional, reusable tooltip component for the entire application.
 * Supports multiple placements, triggers, and animations.
 * Fully accessible with keyboard support.
 */

import React, { useState, useRef, useEffect, useCallback, cloneElement } from 'react';

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Placement configuration mapping.
 * Each placement defines positioning and arrow alignment.
 */
const PLACEMENT_CONFIG = {
    top: {
        position: 'bottom-full left-1/2 -translate-x-1/2',
        arrow: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45',
        margin: 'mb-2',
    },
    bottom: {
        position: 'top-full left-1/2 -translate-x-1/2',
        arrow: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
        margin: 'mt-2',
    },
    left: {
        position: 'right-full top-1/2 -translate-y-1/2',
        arrow: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45',
        margin: 'mr-2',
    },
    right: {
        position: 'left-full top-1/2 -translate-y-1/2',
        arrow: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45',
        margin: 'ml-2',
    },
};

/**
 * Default props for the component.
 */
const defaultProps = {
    content: '',
    placement: 'top',
    trigger: 'hover',
    delay: 300,
    disabled: false,
    maxWidth: 'max-w-xs',
    className: '',
};

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Generates the tooltip container classes.
 * @param {string} placement - Tooltip placement
 * @param {string} maxWidth - Max width class
 * @param {string} className - Additional custom classes
 * @param {boolean} visible - Whether tooltip is visible
 * @returns {string} Combined class names
 */
const getTooltipClasses = (placement, maxWidth, className, visible) => {
    const placementConfig = PLACEMENT_CONFIG[placement] || PLACEMENT_CONFIG.top;

    const classes = [
        // Base styles
        'absolute',
        'z-50',
        'px-3',
        'py-2',
        'text-sm',
        'text-white',
        'bg-gray-900',
        'rounded-lg',
        'shadow-lg',
        'pointer-events-none',
        'select-none',
        maxWidth,

        // Placement
        placementConfig.position,
        placementConfig.margin,

        // Animation
        'transition-all',
        'duration-200',
        'ease-out',
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',

        // Custom
        className,
    ].filter(Boolean);

    return classes.join(' ');
};

/**
 * Generates the arrow classes.
 * @param {string} placement - Tooltip placement
 * @returns {string} Combined class names
 */
const getArrowClasses = (placement) => {
    const placementConfig = PLACEMENT_CONFIG[placement] || PLACEMENT_CONFIG.top;

    const classes = [
        // Base styles
        'absolute',
        'w-2.5',
        'h-2.5',
        'bg-gray-900',

        // Placement
        placementConfig.arrow,

        // Transform origin for smooth animation
        'transition-transform',
        'duration-200',
        'ease-out',
    ].filter(Boolean);

    return classes.join(' ');
};

// ============================================================
// TOOLTIP COMPONENT
// ============================================================

/**
 * Tooltip component with multiple triggers and placements.
 * Used throughout the application for informative hints.
 */
const Tooltip = ({
    children,
    content = '',
    placement = 'top',
    trigger = 'hover',
    delay = 300,
    disabled = false,
    maxWidth = 'max-w-xs',
    className = '',
}) => {
    // State
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Refs
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);
    const isHoveringRef = useRef(false);

    // ============================================================
    // EFFECTS
    // ============================================================

    /**
     * Cleanup timeouts on unmount.
     */
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    /**
     * Handle outside click for click trigger.
     */
    useEffect(() => {
        if (trigger !== 'click' || !isVisible) return;

        const handleOutsideClick = (event) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(event.target) &&
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target)
            ) {
                hideTooltip();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [isVisible, trigger]);

    /**
     * Handle escape key for click trigger.
     */
    useEffect(() => {
        if (trigger !== 'click' || !isVisible) return;

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                hideTooltip();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isVisible, trigger]);

    // ============================================================
    // HANDLERS
    // ============================================================

    /**
     * Shows the tooltip.
     */
    const showTooltip = useCallback(() => {
        if (disabled || !content) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setIsMounted(true);
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        }, delay);
    }, [disabled, content, delay]);

    /**
     * Hides the tooltip.
     */
    const hideTooltip = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setIsVisible(false);
        setTimeout(() => {
            setIsMounted(false);
        }, 200); // Match animation duration
    }, []);

    /**
     * Toggles the tooltip for click trigger.
     */
    const toggleTooltip = useCallback(() => {
        if (isVisible) {
            hideTooltip();
        } else {
            showTooltip();
        }
    }, [isVisible, showTooltip, hideTooltip]);

    /**
     * Handles mouse enter for hover trigger.
     */
    const handleMouseEnter = useCallback(() => {
        if (trigger === 'hover') {
            isHoveringRef.current = true;
            showTooltip();
        }
    }, [trigger, showTooltip]);

    /**
     * Handles mouse leave for hover trigger.
     */
    const handleMouseLeave = useCallback(() => {
        if (trigger === 'hover') {
            isHoveringRef.current = false;
            // Small delay to allow mouse to move to tooltip
            setTimeout(() => {
                if (!isHoveringRef.current) {
                    hideTooltip();
                }
            }, 50);
        }
    }, [trigger, hideTooltip]);

    /**
     * Handles focus for focus trigger.
     */
    const handleFocus = useCallback(() => {
        if (trigger === 'focus') {
            showTooltip();
        }
    }, [trigger, showTooltip]);

    /**
     * Handles blur for focus trigger.
     */
    const handleBlur = useCallback(() => {
        if (trigger === 'focus') {
            hideTooltip();
        }
    }, [trigger, hideTooltip]);

    /**
     * Handles click for click trigger.
     */
    const handleClick = useCallback(() => {
        if (trigger === 'click') {
            toggleTooltip();
        }
    }, [trigger, toggleTooltip]);

    // ============================================================
    // RENDER
    // ============================================================

    // Don't render if no content
    if (!content) {
        return children;
    }

    // Generate classes
    const tooltipClasses = getTooltipClasses(placement, maxWidth, className, isVisible);
    const arrowClasses = getArrowClasses(placement);

    // Unique ID for accessibility
    const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

    // Trigger event handlers based on trigger type
    const triggerProps = {
        ref: triggerRef,
        'aria-describedby': isVisible ? tooltipId : undefined,
    };

    if (trigger === 'hover') {
        triggerProps.onMouseEnter = handleMouseEnter;
        triggerProps.onMouseLeave = handleMouseLeave;
    } else if (trigger === 'focus') {
        triggerProps.onFocus = handleFocus;
        triggerProps.onBlur = handleBlur;
    } else if (trigger === 'click') {
        triggerProps.onClick = handleClick;
    }

    // Clone the child element with trigger props
    const triggerElement = cloneElement(children, triggerProps);

    return (
        <>
            {/* Trigger Element */}
            {triggerElement}

            {/* Tooltip */}
            {isMounted && (
                <div
                    ref={tooltipRef}
                    className={tooltipClasses}
                    role="tooltip"
                    id={tooltipId}
                    aria-hidden={!isVisible}
                    data-testid="tooltip"
                >
                    {/* Arrow */}
                    <div className={arrowClasses} data-testid="tooltip-arrow" />

                    {/* Content */}
                    <span className="relative z-10">{content}</span>
                </div>
            )}
        </>
    );
};

// ============================================================
// PROP TYPES (Optional - uncomment if using PropTypes)
// ============================================================

/*
import PropTypes from 'prop-types';

Tooltip.propTypes = {
  children: PropTypes.element.isRequired,
  content: PropTypes.string,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  trigger: PropTypes.oneOf(['hover', 'click', 'focus']),
  delay: PropTypes.number,
  disabled: PropTypes.bool,
  maxWidth: PropTypes.string,
  className: PropTypes.string,
};
*/

Tooltip.defaultProps = defaultProps;

// ============================================================
// EXPORT
// ============================================================

export default Tooltip;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why a reusable tooltip component is beneficial:
 * 
 * - Consistency: Every tooltip in the application shares the same
 *   appearance, animation, and behavior. Users get a predictable
 *   experience.
 * 
 * - Maintainability: Changes to tooltip styling (colors, animations,
 *   positioning) only need to be made in one file. This reduces bugs
 *   and development time.
 * 
 * - Accessibility: Accessibility features (keyboard support, ARIA
 *   attributes, focus management) are baked into the component.
 *   All tooltips are accessible without extra effort.
 * 
 * - Productivity: Developers don't need to re-implement tooltip logic
 *   for each feature. They simply import and use the component.
 * 
 * - Code Reduction: Reusing a single tooltip component reduces code
 *   duplication significantly across the application.
 * 
 * - Testing: The component can be unit tested once, and all instances
 *   will inherit the correct behavior.
 * 
 * - Performance: The component is optimized with debouncing and
 *   clean event handling, preventing unnecessary re-renders.
 * 
 * 2. Where this tooltip can be used in the Ludo application:
 * 
 * Dice Controls:
 * - Hover over dice: "Click to roll the dice (6 gives extra turn)"
 * - After rolling: "You rolled a 6! Extra turn awarded!"
 * - Disabled dice: "Waiting for your turn"
 * 
 * Tokens:
 * - Hover over token: Shows token number (Token 1, Token 2, etc.)
 * - Token in home: "Click to move this token out"
 * - Token in play: Shows current position (Position: 15)
 * - Finished token: "This token has reached home! ✅"
 * - Captured token: "Token sent back home! 🏠"
 * 
 * Game Board:
 * - Safe cells: "⭐ Safe zone - Tokens cannot be captured here"
 * - Home stretch: "🏠 Entering home stretch"
 * - Start position: "Starting position"
 * 
 * Player Information:
 * - Player avatar: Shows player name and color
 * - Player status: "Online" / "Offline" / "Waiting"
 * - Player score: "Score: 4/4 tokens home"
 * - Player turn: "It's your turn! 🎯"
 * 
 * Game Controls:
 * - End Turn button: "End your turn and pass to next player"
 * - Restart button: "⚠️ Restart the game - all progress will be lost"
 * - Leave button: "🚪 Leave the game"
 * - Settings button: "⚙️ Game settings"
 * 
 * Room Controls:
 * - Room code: "Click to copy room code"
 * - Player count: "Players: 2/4"
 * - Room status: "Room is ready to start" / "Waiting for more players"
 * 
 * Winner & Rankings:
 * - Winner badge: "🏆 Game Winner!"
 * - Ranking badge: "2nd Place"
 * - Statistics: "Total moves: 24"
 * 
 * Game Rules:
 * - Dice info: "Roll a 6 to get an extra turn"
 * - Max sixes: "Maximum 3 consecutive sixes"
 * - Capture rule: "Land on opponent token to send it home"
 * - Safe zones: "⭐ Safe cells protect tokens from capture"
 * 
 * Notifications:
 * - Notification badge: "You have 3 unread messages"
 * - Alert: "⚠️ Your turn is about to timeout"
 * 
 * 3. How additional placements and behaviors can be added later without 
 *    changing existing components:
 * 
 * - The component uses a configuration-based approach. Placements are
 *   defined in the PLACEMENT_CONFIG object.
 * 
 * - To add a new placement (e.g., "top-start", "bottom-end"), you would:
 *   a. Add a new entry to PLACEMENT_CONFIG with the appropriate positioning
 *   b. Add the new placement to the PropTypes (if used)
 *   c. Update the placement prop type in TypeScript (if used)
 * 
 * - To add a new trigger (e.g., "contextmenu" for right-click), you would:
 *   a. Add the new trigger to the trigger prop validation
 *   b. Add event handlers for the new trigger
 *   c. Update the trigger logic in the component
 * 
 * - Existing pages that use the Tooltip component can immediately
 *   use the new placement by passing placement="top-start" as a prop.
 * 
 * - No changes to existing pages are required because the new features
 *   are additive. All existing tooltips continue to work with their
 *   current configurations.
 * 
 * - This follows the Open/Closed Principle: the component is open for
 *   extension (new placements and triggers) but closed for modification
 *   (existing behavior remains unchanged).
 * 
 * Example of adding a new "bottom-start" placement:
 * 
 * // Add to PLACEMENT_CONFIG
 * 'bottom-start': {
 *   position: 'top-full left-0',
 *   arrow: 'top-0 left-3 -translate-y-1/2 rotate-45',
 *   margin: 'mt-2',
 * },
 * 
 * // Usage in any page
 * <Tooltip placement="bottom-start" content="Tooltip content">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * 
 * // No changes needed to existing code
 * <Tooltip placement="top" content="Top tooltip">
 *   <Button>Top</Button>
 * </Tooltip> // Still works
 */