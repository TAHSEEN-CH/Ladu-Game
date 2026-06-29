// src/components/Common/Badge.jsx

/**
 * Badge Component
 * 
 * Professional, reusable badge component for the entire application.
 * Supports multiple variants, sizes, status indicators, and icons.
 * Lightweight and fully accessible.
 */

import React from 'react';

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Variant configuration mapping.
 * Each variant defines background, text, border, and dot colors.
 */
const VARIANT_CONFIG = {
    primary: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-600',
        hover: 'hover:bg-blue-200',
    },
    secondary: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        dot: 'bg-gray-600',
        hover: 'hover:bg-gray-200',
    },
    success: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        dot: 'bg-green-600',
        hover: 'hover:bg-green-200',
    },
    danger: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        dot: 'bg-red-600',
        hover: 'hover:bg-red-200',
    },
    warning: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        dot: 'bg-yellow-600',
        hover: 'hover:bg-yellow-200',
    },
    info: {
        bg: 'bg-cyan-100',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        dot: 'bg-cyan-600',
        hover: 'hover:bg-cyan-200',
    },
    neutral: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-300',
        dot: 'bg-gray-400',
        hover: 'hover:bg-gray-100',
    },
};

/**
 * Size configuration mapping.
 * Each size defines padding, font size, icon size, and dot size.
 */
const SIZE_CONFIG = {
    sm: {
        padding: 'px-2 py-0.5',
        fontSize: 'text-xs',
        iconSize: 'w-3 h-3',
        dotSize: 'w-1.5 h-1.5',
        gap: 'gap-1',
        borderRadius: 'rounded',
    },
    md: {
        padding: 'px-2.5 py-1',
        fontSize: 'text-sm',
        iconSize: 'w-4 h-4',
        dotSize: 'w-2 h-2',
        gap: 'gap-1.5',
        borderRadius: 'rounded-md',
    },
    lg: {
        padding: 'px-3 py-1.5',
        fontSize: 'text-base',
        iconSize: 'w-5 h-5',
        dotSize: 'w-2.5 h-2.5',
        gap: 'gap-2',
        borderRadius: 'rounded-lg',
    },
};

/**
 * Default props for the component.
 */
const defaultProps = {
    variant: 'neutral',
    size: 'md',
    rounded: false,
    dot: false,
    icon: null,
    className: '',
};

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Generates the badge classes based on props.
 * @param {Object} props - Component props
 * @returns {string} Combined class names
 */
const getBadgeClasses = ({
    variant,
    size,
    rounded,
    className,
}) => {
    const variantStyles = VARIANT_CONFIG[variant] || VARIANT_CONFIG.neutral;
    const sizeStyles = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    const classes = [
        // Base styles
        'inline-flex',
        'items-center',
        'font-medium',
        'transition-all',
        'duration-200',
        'ease-in-out',
        'select-none',
        'whitespace-nowrap',

        // Variant styles
        variantStyles.bg,
        variantStyles.text,
        variantStyles.border,
        variantStyles.hover,

        // Size styles
        sizeStyles.padding,
        sizeStyles.fontSize,
        sizeStyles.gap,
        sizeStyles.borderRadius,

        // Border
        'border',

        // Rounded (full pill shape)
        rounded ? 'rounded-full' : '',

        // Custom
        className,
    ].filter(Boolean);

    return classes.join(' ');
};

/**
 * Renders the status dot.
 * @param {string} variant - Badge variant
 * @param {string} size - Badge size
 * @returns {JSX.Element} Dot element
 */
const renderDot = (variant, size) => {
    const variantStyles = VARIANT_CONFIG[variant] || VARIANT_CONFIG.neutral;
    const sizeStyles = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    return (
        <span
            className={`
        ${sizeStyles.dotSize}
        ${variantStyles.dot}
        rounded-full
        shrink-0
        inline-block
        animate-pulse
      `}
            aria-hidden="true"
        />
    );
};

/**
 * Renders the icon.
 * @param {React.ReactNode} icon - Icon element
 * @param {string} size - Badge size
 * @returns {JSX.Element} Icon with size applied
 */
const renderIcon = (icon, size) => {
    if (!icon) return null;

    const sizeStyles = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    // Clone the icon and add size classes
    return React.cloneElement(icon, {
        className: `${sizeStyles.iconSize} shrink-0 ${icon.props.className || ''}`,
        'aria-hidden': 'true',
    });
};

// ============================================================
// BADGE COMPONENT
// ============================================================

/**
 * Badge component with variant, size, and optional indicators.
 * Used for labels, status indicators, and tags throughout the application.
 */
const Badge = ({
    children,
    variant = 'neutral',
    size = 'md',
    rounded = false,
    dot = false,
    icon = null,
    className = '',
    ...restProps
}) => {
    // Get computed classes
    const badgeClasses = getBadgeClasses({
        variant,
        size,
        rounded,
        className,
    });

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <span
            className={badgeClasses}
            role="status"
            {...restProps}
        >
            {/* Status Dot */}
            {dot && renderDot(variant, size)}

            {/* Icon */}
            {icon && renderIcon(icon, size)}

            {/* Badge Text */}
            {children && (
                <span className="relative">
                    {children}
                </span>
            )}

            {/* Screen reader only text for accessibility */}
            {!children && (
                <span className="sr-only">Status indicator</span>
            )}
        </span>
    );
};

// ============================================================
// PROP TYPES (Optional - uncomment if using PropTypes)
// ============================================================

/*
import PropTypes from 'prop-types';

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'neutral']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  rounded: PropTypes.bool,
  dot: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
};
*/

Badge.defaultProps = defaultProps;

// ============================================================
// EXPORT
// ============================================================

export default Badge;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why reusable badges improve UI consistency:
 * 
 * - Visual Uniformity: All badges share the same color palette,
 *   typography, spacing, and interaction states. Users quickly
 *   learn to recognize badge meaning from its appearance.
 * 
 * - Semantic Meaning: Variants have consistent meanings across the
 *   application. A success badge always means "successful" or
 *   "completed", danger always means "error" or "critical".
 * 
 * - Maintainability: Changes to badge styling (colors, padding,
 *   animations) only need to be made in one file. This reduces bugs
 *   and development time.
 * 
 * - Brand Consistency: Badges maintain brand guidelines consistently
 *   across all pages and features.
 * 
 * - Predictable Behavior: All badges have the same hover states,
 *   transitions, and accessibility features, creating a polished
 *   user experience.
 * 
 * - Scalability: As the application grows, new badges automatically
 *   inherit the established design system.
 * 
 * 2. Where this badge can be used in the Ludo application:
 * 
 * Player Status:
 * - "Online" / "Offline" badges with status dots in players list
 * - "Waiting" badge for players who haven't rolled yet
 * - "Ready" badge for players ready to start
 * - "Connected" badge showing network connection status
 * 
 * Game State:
 * - "Active" / "Inactive" badge on game rooms
 * - "Waiting for players" badge in room list
 * - "In Progress" badge on active games
 * - "Completed" / "Finished" badge on ended games
 * 
 * Winner & Rankings:
 * - "🏆 Winner" badge on winning player's avatar
 * - "2nd Place", "3rd Place" badges on podium
 * - "⭐ MVP" badge for highest scoring player
 * - "👑 King" badge for tournament winner
 * 
 * Room Info:
 * - "Public" / "Private" badge on room cards
 * - "Full" badge when room is at max capacity
 * - "Open" badge when room is accepting players
 * - "Tournament" badge on competitive game rooms
 * 
 * Dice & Moves:
 * - "🎲 Bonus" badge when a player rolls a six
 * - "Extra Turn" badge indicator
 * - "🔥 Streak" badge for consecutive sixes
 * - "💫 Special" badge for special moves
 * 
 * Token Status:
 * - "Home" badge on tokens in starting position
 * - "Active" badge on tokens in play
 * - "Finished" badge on tokens that reached home
 * - "Captured" badge on tokens sent back home
 * 
 * Connection & Network:
 * - "Connected" / "Disconnected" badge
 * - "Syncing" badge during state synchronization
 * - "Reconnecting" badge when connection is lost
 * 
 * Profile & Settings:
 * - "Verified" badge on user profiles
 * - "Pro" / "Premium" badge for subscribed users
 * - "New" badge on new features or updates
 * - "Beta" badge on experimental features
 * 
 * Notification & Alerts:
 * - "New" badge with count on notifications
 * - "Unread" badge on messages
 * - "Urgent" badge on critical notifications
 * 
 * 3. How additional badge variants can be added later without changing 
 *    existing components:
 * 
 * - The component uses a configuration-based approach. All variants
 *   are defined in the VARIANT_CONFIG object.
 * 
 * - To add a new variant (e.g., "dark" or "gold"), you would:
 *   a. Add a new entry to VARIANT_CONFIG with the appropriate styles
 *   b. Add the new variant to the PropTypes (if used)
 *   c. Update the variant prop type in TypeScript (if used)
 * 
 * - Existing pages that use the Badge component can immediately
 *   use the new variant by passing variant="dark" as a prop.
 * 
 * - No changes to existing pages are required because the new variant
 *   is additive. All existing badges continue to work with their
 *   current variants.
 * 
 * - This follows the Open/Closed Principle: the component is open for
 *   extension (new variants) but closed for modification (existing
 *   behavior remains unchanged).
 * 
 * Example of adding a new "gold" variant:
 * 
 * // Add to VARIANT_CONFIG
 * gold: {
 *   bg: 'bg-amber-100',
 *   text: 'text-amber-800',
 *   border: 'border-amber-200',
 *   dot: 'bg-amber-600',
 *   hover: 'hover:bg-amber-200',
 * },
 * 
 * // Usage in any page
 * <Badge variant="gold">Gold Badge</Badge>
 * 
 * // No changes needed to existing code
 * <Badge variant="success">Success</Badge> // Still works
 * <Badge variant="danger">Danger</Badge> // Still works
 */