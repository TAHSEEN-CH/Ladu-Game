// src/components/Common/Loader.jsx

/**
 * Loader Component
 * 
 * Professional, reusable loading indicator for the Ludo application.
 * Supports multiple variants, sizes, and display modes.
 * Fully responsive and accessible.
 */

import React from 'react';

// ============================================================
// PROP TYPES (Runtime validation)
// ============================================================

const propTypes = {
  size: PropTypes?.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes?.oneOf(['spinner', 'dots', 'pulse']),
  text: PropTypes?.string,
  fullscreen: PropTypes?.bool,
  overlay: PropTypes?.bool,
  className: PropTypes?.string,
};

const defaultProps = {
  size: 'md',
  variant: 'spinner',
  text: 'Loading...',
  fullscreen: false,
  overlay: false,
  className: '',
};

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Gets the size classes based on the size prop.
 * @param {string} size - Size identifier
 * @returns {string} Tailwind classes for size
 */
const getSizeClasses = (size) => {
  const sizeMap = {
    sm: {
      wrapper: 'w-8 h-8',
      spinner: 'w-6 h-6 border-2',
      dot: 'w-2 h-2',
      dotGap: 'gap-1',
      pulse: 'w-8 h-8',
      text: 'text-xs',
    },
    md: {
      wrapper: 'w-12 h-12',
      spinner: 'w-10 h-10 border-3',
      dot: 'w-3 h-3',
      dotGap: 'gap-1.5',
      pulse: 'w-12 h-12',
      text: 'text-sm',
    },
    lg: {
      wrapper: 'w-16 h-16',
      spinner: 'w-14 h-14 border-4',
      dot: 'w-4 h-4',
      dotGap: 'gap-2',
      pulse: 'w-16 h-16',
      text: 'text-base',
    },
  };

  return sizeMap[size] || sizeMap.md;
};

/**
 * Gets the variant-specific animation classes.
 * @param {string} variant - Variant identifier
 * @param {string} size - Size identifier
 * @returns {Object} Variant classes
 */
const getVariantClasses = (variant, size) => {
  const sizeClasses = getSizeClasses(size);
  const baseColor = 'border-blue-600';
  const baseBg = 'bg-blue-600';

  const variants = {
    spinner: {
      wrapper: `relative ${sizeClasses.wrapper}`,
      spinner: `
        ${sizeClasses.spinner}
        border-gray-200 
        ${baseColor}
        rounded-full 
        animate-spin 
        border-t-transparent
      `,
    },
    dots: {
      wrapper: `flex items-center justify-center ${sizeClasses.dotGap}`,
      dots: `
        ${sizeClasses.dot}
        ${baseBg}
        rounded-full 
        animate-bounce-dot
      `,
      dotDelay: (index) => `animation-delay-${index * 150}ms`,
    },
    pulse: {
      wrapper: `relative ${sizeClasses.pulse}`,
      pulse: `
        ${sizeClasses.pulse}
        ${baseBg}
        rounded-full 
        animate-pulse-slow
        opacity-70
      `,
    },
  };

  return variants[variant] || variants.spinner;
};

// ============================================================
// LOADER COMPONENT
// ============================================================

/**
 * Loader component for displaying loading states.
 * Supports spinner, dots, and pulse variants with different sizes.
 */
const Loader = ({
  size = 'md',
  variant = 'spinner',
  text = 'Loading...',
  fullscreen = false,
  overlay = false,
  className = '',
}) => {
  // ============================================================
  // COMPUTED CLASSES
  // ============================================================

  const sizeClasses = getSizeClasses(size);
  const variantClasses = getVariantClasses(variant, size);

  // Container classes
  const containerClasses = `
    flex 
    flex-col 
    items-center 
    justify-center 
    gap-3
    ${fullscreen ? 'fixed inset-0' : 'relative'}
    ${overlay ? 'bg-black/50 backdrop-blur-sm' : ''}
    ${className}
  `.trim();

  // Text classes
  const textClasses = `
    ${sizeClasses.text}
    text-gray-600 
    font-medium
    select-none
  `.trim();

  // ============================================================
  // RENDER VARIANTS
  // ============================================================

  /**
   * Renders the spinner variant.
   */
  const renderSpinner = () => (
    <div className={variantClasses.wrapper} role="presentation">
      <div className={variantClasses.spinner} />
    </div>
  );

  /**
   * Renders the dots variant.
   */
  const renderDots = () => {
    const dotCount = 3;
    const dots = Array.from({ length: dotCount }, (_, index) => (
      <div
        key={index}
        className={`
          ${variantClasses.dots}
          ${index === 0 ? 'animation-delay-0' : ''}
          ${index === 1 ? 'animation-delay-150' : ''}
          ${index === 2 ? 'animation-delay-300' : ''}
        `}
        style={{
          animationDelay: `${index * 150}ms`,
        }}
      />
    ));

    return <div className={variantClasses.wrapper}>{dots}</div>;
  };

  /**
   * Renders the pulse variant.
   */
  const renderPulse = () => (
    <div className={variantClasses.wrapper} role="presentation">
      <div className={variantClasses.pulse} />
    </div>
  );

  /**
   * Renders the appropriate loader variant.
   */
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-label={text}
      data-testid="loader"
    >
      {/* Loader */}
      {renderLoader()}

      {/* Loading Text */}
      {text && (
        <p className={textClasses}>
          {text}
        </p>
      )}

      {/* Screen reader only text for accessibility */}
      <span className="sr-only">
        {text || 'Loading content'}
      </span>
    </div>
  );
};

// ============================================================
// PROP TYPES (Optional - remove if not using PropTypes)
// ============================================================

// Uncomment if you have PropTypes installed
/*
Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['spinner', 'dots', 'pulse']),
  text: PropTypes.string,
  fullscreen: PropTypes.bool,
  overlay: PropTypes.bool,
  className: PropTypes.string,
};
*/

Loader.defaultProps = defaultProps;

// ============================================================
// EXPORT
// ============================================================

export default Loader;

// ============================================================
// TAILWIND CSS CUSTOM ANIMATIONS
// ============================================================

/**
 * Add these to your Tailwind CSS configuration file (tailwind.config.js):
 * 
 * module.exports = {
 *   theme: {
 *     extend: {
 *       animation: {
 *         'bounce-dot': 'bounce-dot 1.4s ease-in-out infinite',
 *         'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
 *       },
 *       keyframes: {
 *         'bounce-dot': {
 *           '0%, 80%, 100%': { 
 *             transform: 'scale(0)',
 *             opacity: '0.4',
 *           },
 *           '40%': { 
 *             transform: 'scale(1)',
 *             opacity: '1',
 *           },
 *         },
 *         'pulse-slow': {
 *           '0%, 100%': { 
 *             transform: 'scale(1)',
 *             opacity: '0.7',
 *           },
 *           '50%': { 
 *             transform: 'scale(1.1)',
 *             opacity: '1',
 *           },
 *         },
 *       },
 *       borderWidth: {
 *         '3': '3px',
 *       },
 *     },
 *   },
 *   plugins: [],
 * };
 */

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why reusable loaders are preferable to creating separate loaders 
 *    for each page:
 * 
 * - Consistency: A single loader component ensures uniform loading
 *   experience across the entire application. All loading states
 *   look and behave the same way.
 * 
 * - DRY Principle: Eliminates code duplication. Instead of creating
 *   separate loading components for GameBoard, Dashboard, Profile,
 *   etc., we reuse one component with different props.
 * 
 * - Maintainability: Changes to loader style, animation, or behavior
 *   only need to be made in one place. This reduces bugs and
 *   development time.
 * 
 * - Performance: The component is optimized and only re-renders when
 *   props change. Creating separate loaders would increase bundle size
 *   and runtime overhead.
 * 
 * - Theming: A single loader makes it easier to implement theme changes
 *   (dark mode, brand colors) across all loading states.
 * 
 * 2. Where this loader will be used in the Ludo application:
 * 
 * - GameManager: When the game is initializing or loading a saved game.
 * - LudoBoard: When the board is rendering or updating positions.
 * - Dice: During dice roll animation (replacing with loading state).
 * - PlayersList: When player data is being fetched or updated.
 * - GameStatus: When transitioning between game states.
 * - Fullscreen overlay: When the game is saving or loading from server.
 * - API calls: Wrapping async operations with loading state.
 * - Lazy-loaded components: As a fallback for React.lazy().
 * - Error boundaries: While recovering from errors.
 * 
 * 3. How additional loader variants can be added later without changing 
 *    existing components:
 * 
 * - The component uses a variant prop that maps to different render
 *   functions (renderSpinner, renderDots, renderPulse).
 * 
 * - To add a new variant (e.g., "bar", "skeleton", "wave"), you would:
 *   a. Add the new variant to the PropTypes or TypeScript definition
 *   b. Add the variant to the variants object in getVariantClasses
 *   c. Create a new render function (e.g., renderBar)
 *   d. Add the new case to the switch statement in renderLoader
 * 
 * - Existing components can immediately use the new variant by simply
 *   passing variant="bar" as a prop. No changes to the consuming
 *   components are required.
 * 
 * - The component maintains backward compatibility because the new
 *   variant is additive, not breaking.
 * 
 * - This pattern follows the Open/Closed Principle: open for extension,
 *   closed for modification.
 * 
 * Example of adding a new "bar" variant:
 * 
 * // Add to getVariantClasses
 * bar: {
 *   wrapper: `w-full max-w-md h-1.5 bg-gray-200 rounded-full overflow-hidden`,
 *   bar: `h-full bg-blue-600 rounded-full animate-bar-progress`,
 * },
 * 
 * // Add render function
 * const renderBar = () => (
 *   <div className={variantClasses.wrapper}>
 *     <div className={variantClasses.bar} style={{ width: '0%' }} />
 *   </div>
 * );
 * 
 * // Add to switch
 * case 'bar':
 *   return renderBar();
 * 
 * // Add animation to tailwind.config.js
 * 'bar-progress': {
 *   '0%': { width: '0%' },
 *   '50%': { width: '70%' },
 *   '100%': { width: '100%' },
 * },
 */