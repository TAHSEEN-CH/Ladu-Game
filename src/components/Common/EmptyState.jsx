// src/components/Common/EmptyState.jsx

/**
 * EmptyState Component
 * 
 * Professional, reusable empty state component for the entire application.
 * Displays when there is no content to show, with optional actions.
 * Supports icons, images, and custom actions.
 */

import React from 'react';

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Size configuration mapping.
 * Each size defines padding, font sizes, spacing, and icon sizes.
 */
const SIZE_CONFIG = {
    sm: {
        container: 'p-6',
        icon: 'w-12 h-12',
        image: 'max-w-32',
        title: 'text-base',
        description: 'text-sm',
        gap: 'gap-3',
        spacing: 'space-y-2',
    },
    md: {
        container: 'p-8',
        icon: 'w-16 h-16',
        image: 'max-w-48',
        title: 'text-xl',
        description: 'text-base',
        gap: 'gap-4',
        spacing: 'space-y-3',
    },
    lg: {
        container: 'p-12',
        icon: 'w-24 h-24',
        image: 'max-w-64',
        title: 'text-2xl',
        description: 'text-lg',
        gap: 'gap-6',
        spacing: 'space-y-4',
    },
};

/**
 * Default props for the component.
 */
const defaultProps = {
    title: '',
    description: '',
    icon: null,
    image: null,
    action: null,
    size: 'md',
    centered: true,
    className: '',
};

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Generates the empty state container classes.
 * @param {string} size - Empty state size
 * @param {boolean} centered - Whether to center content
 * @param {string} className - Additional custom classes
 * @returns {string} Combined class names
 */
const getContainerClasses = (size, centered, className) => {
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    const classes = [
        // Base styles
        'flex',
        'flex-col',
        'rounded-lg',
        'bg-gray-50',
        'border-2',
        'border-dashed',
        'border-gray-200',
        sizeConfig.container,
        sizeConfig.gap,

        // Centering
        centered ? 'items-center text-center' : 'items-start text-left',

        // Custom
        className,
    ].filter(Boolean);

    return classes.join(' ');
};

/**
 * Generates the icon container classes.
 * @param {string} size - Empty state size
 * @returns {string} Combined class names
 */
const getIconClasses = (size) => {
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    const classes = [
        // Base styles
        'flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'bg-blue-100',
        'text-blue-600',
        sizeConfig.icon,
    ].filter(Boolean);

    return classes.join(' ');
};

/**
 * Generates the image classes.
 * @param {string} size - Empty state size
 * @returns {string} Combined class names
 */
const getImageClasses = (size) => {
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    const classes = [
        'w-full',
        'h-auto',
        sizeConfig.image,
        'object-contain',
    ].filter(Boolean);

    return classes.join(' ');
};

/**
 * Generates the title classes.
 * @param {string} size - Empty state size
 * @returns {string} Combined class names
 */
const getTitleClasses = (size) => {
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    const classes = [
        'font-semibold',
        'text-gray-900',
        sizeConfig.title,
    ].filter(Boolean);

    return classes.join(' ');
};

/**
 * Generates the description classes.
 * @param {string} size - Empty state size
 * @returns {string} Combined class names
 */
const getDescriptionClasses = (size) => {
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    const classes = [
        'text-gray-500',
        sizeConfig.description,
    ].filter(Boolean);

    return classes.join(' ');
};

/**
 * Generates the content spacing classes.
 * @param {string} size - Empty state size
 * @returns {string} Combined class names
 */
const getSpacingClasses = (size) => {
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

    const classes = [
        'flex',
        'flex-col',
        sizeConfig.spacing,
    ].filter(Boolean);

    return classes.join(' ');
};

// ============================================================
// EMPTY STATE COMPONENT
// ============================================================

/**
 * EmptyState component for displaying when no content is available.
 * Used throughout the application for empty states, errors, and placeholders.
 */
const EmptyState = ({
    title = '',
    description = '',
    icon = null,
    image = null,
    action = null,
    size = 'md',
    centered = true,
    className = '',
}) => {
    // Get computed classes
    const containerClasses = getContainerClasses(size, centered, className);
    const iconClasses = getIconClasses(size);
    const imageClasses = getImageClasses(size);
    const titleClasses = getTitleClasses(size);
    const descriptionClasses = getDescriptionClasses(size);
    const spacingClasses = getSpacingClasses(size);

    // ============================================================
    // RENDER
    // ============================================================

    // If no content to show, don't render
    if (!title && !description && !icon && !image) {
        return null;
    }

    return (
        <div
            className={containerClasses}
            role="status"
            aria-label={title || 'Empty state'}
            data-testid="empty-state"
        >
            {/* Icon or Image */}
            {image && (
                <div className="shrink-0">
                    <img
                        src={image}
                        alt={title || 'Empty state illustration'}
                        className={imageClasses}
                        loading="lazy"
                    />
                </div>
            )}

            {icon && !image && (
                <div className={iconClasses} aria-hidden="true">
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className={spacingClasses}>
                {title && (
                    <h3 className={titleClasses}>
                        {title}
                    </h3>
                )}

                {description && (
                    <p className={descriptionClasses}>
                        {description}
                    </p>
                )}
            </div>

            {/* Action */}
            {action && (
                <div className="mt-2 shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
};

// ============================================================
// PROP TYPES (Optional - uncomment if using PropTypes)
// ============================================================

/*
import PropTypes from 'prop-types';

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.node,
  image: PropTypes.string,
  action: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  centered: PropTypes.bool,
  className: PropTypes.string,
};
*/

EmptyState.defaultProps = defaultProps;

// ============================================================
// EXPORT
// ============================================================

export default EmptyState;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why a reusable EmptyState component improves user experience:
 * 
 * - Consistent Messaging: All empty states have a consistent visual
 *   language, making it clear to users when there's no content
 *   to display and what they can do about it.
 * 
 * - Professional Appearance: A well-designed empty state with proper
 *   spacing, typography, and optional icons/images creates a polished
 *   feel and reduces user frustration.
 * 
 * - Clear Guidance: Empty states often include actions (buttons, links)
 *   that guide users on what to do next, reducing confusion and
 *   improving user flow.
 * 
 * - Reduced Cognitive Load: Users don't have to figure out why a
 *   page is empty - the empty state explains it clearly.
 * 
 * - Brand Consistency: All empty states maintain brand guidelines,
 *   creating a cohesive experience across the application.
 * 
 * - Emotional Design: Well-crafted empty states with friendly icons
 *   or illustrations can create positive emotional responses even
 *   when content is missing.
 * 
 * - Accessibility: Semantic HTML and proper ARIA roles ensure that
 *   empty states are accessible to all users.
 * 
 * 2. Where this component can be used in the Ludo application:
 * 
 * No Players in Room:
 * - "👥 No Players Yet"
 *   "Share the room code or wait for players to join"
 *   Action: "Copy Room Code" / "Invite Friends"
 * 
 * No Game History:
 * - "📊 No Game History"
 *   "Your past games will appear here"
 *   Action: "Start a New Game"
 * 
 * No Messages:
 * - "💬 No Messages"
 *   "Start a conversation with other players"
 *   Action: "Send Message"
 * 
 * No Notifications:
 * - "🔔 All Caught Up"
 *   "You have no new notifications"
 * 
 * Search Results:
 * - "🔍 No Results Found"
 *   "Try adjusting your search terms or filters"
 *   Action: "Clear Filters"
 * 
 * Disconnected State:
 * - "📡 Connection Lost"
 *   "You've been disconnected from the game"
 *   Action: "Reconnect"
 * 
 * Game Over:
 * - "🏁 Game Over"
 *   "The game has ended. Start a new game to play again"
 *   Action: "New Game"
 * 
 * No Active Games:
 * - "🎯 No Active Games"
 *   "Create a new game or join an existing one"
 *   Action: "Create Game" / "Join Game"
 * 
 * No Saved Games:
 * - "💾 No Saved Games"
 *   "Your saved games will appear here"
 *   Action: "Save Current Game"
 * 
 * No Achievements:
 * - "🏆 No Achievements Yet"
 *   "Play more games to unlock achievements"
 *   Action: "Play Now"
 * 
 * No Friends Online:
 * - "👤 No Friends Online"
 *   "Invite your friends to play together"
 *   Action: "Invite Friends"
 * 
 * No Tournament Results:
 * - "🏅 No Tournament Results"
 *   "Participate in tournaments to see results here"
 *   Action: "Join Tournament"
 * 
 * No Leaderboard Data:
 * - "📈 No Leaderboard Data"
 *   "Play games to appear on the leaderboard"
 *   Action: "Start Playing"
 * 
 * No Room History:
 * - "📋 No Room History"
 *   "Rooms you've joined or created will appear here"
 * 
 * Settings Empty:
 * - "⚙️ No Settings Available"
 *   "Game settings will appear here"
 * 
 * 3. How additional layouts and illustrations can be added later without 
 *    changing existing pages:
 * 
 * - The component uses a flexible structure with optional props
 *   (icon, image, action) that can be customized per use case.
 * 
 * - To add a new layout (e.g., "horizontal", "compact"), you would:
 *   a. Add a new layout prop
 *   b. Add layout-specific classes to the component
 *   c. Update the PropTypes (if used)
 * 
 * - To add new illustrations, you can:
 *   a. Create a central illustration library
 *   b. Pass the illustration URL via the image prop
 *   c. Or create a mapping of illustration names to URLs
 * 
 * - To add new content patterns, you can:
 *   a. Create wrapper components for specific use cases
 *   b. Example: EmptyPlayers, EmptyHistory, EmptySearch
 *   c. These can reuse the EmptyState component with pre-configured props
 * 
 * - Existing pages that use the EmptyState component can immediately
 *   use new layouts or illustrations by passing the new props.
 * 
 * - No changes to existing pages are required because the new features
 *   are additive. All existing empty states continue to work with
 *   their current configurations.
 * 
 * - This follows the Open/Closed Principle: the component is open for
 *   extension (new layouts, illustrations, content patterns) but
 *   closed for modification (existing behavior remains unchanged).
 * 
 * Example of adding a new "horizontal" layout:
 * 
 * // Add to props
 * layout: 'vertical' | 'horizontal'
 * 
 * // Add layout classes
 * const getLayoutClasses = (layout) => {
 *   if (layout === 'horizontal') {
 *     return 'flex-row items-center gap-6';
 *   }
 *   return 'flex-col items-center text-center';
 * };
 * 
 * // Usage in any page
 * <EmptyState
 *   layout="horizontal"
 *   title="No Players"
 *   description="Invite friends to play"
 *   icon={<UserPlusIcon />}
 *   action={<Button>Invite</Button>}
 * />
 * 
 * // No changes needed to existing code
 * <EmptyState
 *   title="No History"
 *   description="Your games will appear here"
 * />
 * // Still works with default vertical layout
 */