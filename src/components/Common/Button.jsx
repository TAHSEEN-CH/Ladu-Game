// src/components/Common/Button.jsx

/**
 * Button Component
 * 
 * Professional, reusable button component for the entire application.
 * Supports multiple variants, sizes, loading states, and icons.
 * Fully accessible and responsive.
 */

import React from 'react';

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Variant configuration mapping.
 * Each variant defines its base, hover, active, focus, and disabled styles.
 */
const VARIANT_CONFIG = {
  primary: {
    base: 'bg-blue-600 text-white border-transparent',
    hover: 'hover:bg-blue-700 hover:shadow-md',
    active: 'active:bg-blue-800 active:scale-[0.98]',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
    disabled: 'disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:shadow-none',
  },
  secondary: {
    base: 'bg-gray-200 text-gray-800 border-transparent',
    hover: 'hover:bg-gray-300 hover:shadow-md',
    active: 'active:bg-gray-400 active:scale-[0.98]',
    focus: 'focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none',
  },
  success: {
    base: 'bg-green-600 text-white border-transparent',
    hover: 'hover:bg-green-700 hover:shadow-md',
    active: 'active:bg-green-800 active:scale-[0.98]',
    focus: 'focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none',
    disabled: 'disabled:bg-green-300 disabled:cursor-not-allowed disabled:hover:shadow-none',
  },
  danger: {
    base: 'bg-red-600 text-white border-transparent',
    hover: 'hover:bg-red-700 hover:shadow-md',
    active: 'active:bg-red-800 active:scale-[0.98]',
    focus: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none',
    disabled: 'disabled:bg-red-300 disabled:cursor-not-allowed disabled:hover:shadow-none',
  },
  warning: {
    base: 'bg-yellow-500 text-white border-transparent',
    hover: 'hover:bg-yellow-600 hover:shadow-md',
    active: 'active:bg-yellow-700 active:scale-[0.98]',
    focus: 'focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:outline-none',
    disabled: 'disabled:bg-yellow-300 disabled:cursor-not-allowed disabled:hover:shadow-none',
  },
  ghost: {
    base: 'bg-transparent text-gray-700 border-transparent',
    hover: 'hover:bg-gray-100 hover:shadow-sm',
    active: 'active:bg-gray-200 active:scale-[0.98]',
    focus: 'focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none',
    disabled: 'disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent',
  },
  outline: {
    base: 'bg-transparent text-blue-600 border-2 border-blue-600',
    hover: 'hover:bg-blue-50 hover:shadow-md',
    active: 'active:bg-blue-100 active:scale-[0.98]',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
    disabled: 'disabled:text-blue-300 disabled:border-blue-300 disabled:cursor-not-allowed disabled:hover:bg-transparent',
  },
};

/**
 * Size configuration mapping.
 * Each size defines padding, font size, and icon spacing.
 */
const SIZE_CONFIG = {
  sm: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-xs',
    iconSize: 'w-3.5 h-3.5',
    gap: 'gap-1',
    spinnerSize: 'w-3 h-3',
  },
  md: {
    padding: 'px-4 py-2',
    fontSize: 'text-sm',
    iconSize: 'w-4 h-4',
    gap: 'gap-1.5',
    spinnerSize: 'w-4 h-4',
  },
  lg: {
    padding: 'px-6 py-3',
    fontSize: 'text-base',
    iconSize: 'w-5 h-5',
    gap: 'gap-2',
    spinnerSize: 'w-5 h-5',
  },
};

/**
 * Default props for the component.
 */
const defaultProps = {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
  className: '',
  onClick: () => {},
};

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Generates the button classes based on props.
 * @param {Object} props - Component props
 * @returns {string} Combined class names
 */
const getButtonClasses = ({
  variant,
  size,
  disabled,
  loading,
  fullWidth,
  className,
}) => {
  const variantStyles = VARIANT_CONFIG[variant] || VARIANT_CONFIG.primary;
  const sizeStyles = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const classes = [
    // Base styles
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'ease-in-out',
    'select-none',
    'whitespace-nowrap',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    
    // Variant styles
    variantStyles.base,
    variantStyles.hover,
    variantStyles.active,
    variantStyles.focus,
    variantStyles.disabled,
    
    // Size styles
    sizeStyles.padding,
    sizeStyles.fontSize,
    sizeStyles.gap,
    
    // Width
    fullWidth ? 'w-full' : '',
    
    // Disabled state
    (disabled || loading) ? 'pointer-events-none' : '',
    
    // Custom className
    className,
  ].filter(Boolean);

  return classes.join(' ');
};

/**
 * Renders the loading spinner.
 * @param {string} size - Button size
 * @returns {JSX.Element} Spinner element
 */
const renderSpinner = (size) => {
  const sizeStyles = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  
  return (
    <svg
      className={`${sizeStyles.spinnerSize} animate-spin shrink-0`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Renders an icon.
 * @param {React.ReactNode} icon - Icon element
 * @param {string} size - Button size
 * @param {string} position - 'left' or 'right'
 * @returns {JSX.Element} Icon element with size applied
 */
const renderIcon = (icon, size, position) => {
  if (!icon) return null;
  
  const sizeStyles = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const iconClassName = `${sizeStyles.iconSize} shrink-0`;
  
  // Clone the icon and add size classes
  return React.cloneElement(icon, {
    className: `${iconClassName} ${icon.props.className || ''}`,
    'aria-hidden': 'true',
  });
};

// ============================================================
// BUTTON COMPONENT
// ============================================================

/**
 * Button component with variant, size, and loading support.
 * Used throughout the application for consistent UI.
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  onClick = () => {},
  className = '',
  ...restProps
}) => {
  // Determine if button is actually disabled
  const isDisabled = disabled || loading;

  // Get computed classes
  const buttonClasses = getButtonClasses({
    variant,
    size,
    disabled: isDisabled,
    loading,
    fullWidth,
    className,
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      onClick={onClick}
      {...restProps}
    >
      {/* Loading Spinner */}
      {loading && renderSpinner(size)}

      {/* Left Icon */}
      {!loading && leftIcon && renderIcon(leftIcon, size, 'left')}

      {/* Button Text */}
      {children && (
        <span className="relative">
          {children}
        </span>
      )}

      {/* Right Icon */}
      {!loading && rightIcon && renderIcon(rightIcon, size, 'right')}

      {/* Screen reader text for loading state */}
      {loading && (
        <span className="sr-only">Loading...</span>
      )}
    </button>
  );
};

// ============================================================
// PROP TYPES (Optional - uncomment if using PropTypes)
// ============================================================

/*
import PropTypes from 'prop-types';

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'ghost', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
};
*/

Button.defaultProps = defaultProps;

// ============================================================
// EXPORT
// ============================================================

export default Button;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why a reusable button component is better than using native 
 *    buttons throughout the project:
 * 
 * - Consistency: Every button in the application shares the same
 *   styling, behavior, and accessibility features. Users get a
 *   predictable experience regardless of where they are in the app.
 * 
 * - Maintainability: Changes to button styling (colors, padding,
 *   animations) only need to be made in one file. This reduces bugs
 *   and saves developer time.
 * 
 * - Productivity: Developers don't need to remember or copy-paste
 *   Tailwind classes for every button. They simply import and use
 *   the component with props.
 * 
 * - Accessibility: Accessibility features (keyboard navigation, ARIA
 *   attributes, focus states) are baked into the component. This
 *   ensures all buttons are accessible without extra effort.
 * 
 * - Testing: The component can be unit tested once, and all instances
 *   will inherit the correct behavior.
 * 
 * - Design System: A button component is the foundation of a design
 *   system. It ensures brand consistency and makes it easy to apply
 *   theme changes across the entire application.
 * 
 * 2. How this component improves consistency across the application:
 * 
 * - Visual Consistency: All buttons use the same color palette,
 *   spacing, typography, and hover/active states.
 * 
 * - Behavioral Consistency: All buttons have the same interaction
 *   patterns (click, hover, focus, disabled, loading).
 * 
 * - Semantic Consistency: Variants (primary, secondary, danger, etc.)
 *   have clear meanings that are consistent throughout the app.
 *   Primary buttons always represent the main action, danger buttons
 *   always represent destructive actions.
 * 
 * - Responsive Consistency: All buttons respond the same way to
 *   different screen sizes and device interactions.
 * 
 * - Error Prevention: Developers can't accidentally create inconsistent
 *   buttons because they're forced to use the component's API.
 * 
 * 3. How new variants can be added later without modifying existing 
 *    pages:
 * 
 * - The component uses a configuration-based approach. All variants
 *   are defined in the VARIANT_CONFIG object.
 * 
 * - To add a new variant (e.g., "info" or "dark"), you would:
 *   a. Add a new entry to VARIANT_CONFIG with the appropriate styles
 *   b. Add the new variant to the PropTypes (if used)
 *   c. Update the variant prop type in TypeScript (if used)
 * 
 * - Existing pages that use the Button component can immediately
 *   use the new variant by passing variant="info" as a prop.
 * 
 * - No changes to existing pages are required because the new variant
 *   is additive. All existing instances continue to work with their
 *   current variants.
 * 
 * - This follows the Open/Closed Principle: the component is open for
 *   extension (new variants) but closed for modification (existing
 *   behavior remains unchanged).
 * 
 * Example of adding a new "info" variant:
 * 
 * // Add to VARIANT_CONFIG
 * info: {
 *   base: 'bg-cyan-600 text-white border-transparent',
 *   hover: 'hover:bg-cyan-700 hover:shadow-md',
 *   active: 'active:bg-cyan-800 active:scale-[0.98]',
 *   focus: 'focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:outline-none',
 *   disabled: 'disabled:bg-cyan-300 disabled:cursor-not-allowed',
 * },
 * 
 * // Usage in any page
 * <Button variant="info">Info Button</Button>
 * 
 * // No changes needed to existing code
 * <Button variant="primary">Primary</Button> // Still works
 * <Button variant="danger">Danger</Button> // Still works
 */