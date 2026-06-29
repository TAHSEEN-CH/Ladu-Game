// src/components/Common/Modal.jsx

/**
 * Modal Component
 * 
 * Professional, reusable modal component for the entire application.
 * Uses React Portals for proper DOM placement.
 * Fully accessible with keyboard navigation and focus trapping.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ============================================================
// CONSTANTS & MAPPINGS
// ============================================================

/**
 * Size configuration mapping.
 * Each size defines the max-width and padding for the modal.
 */
const SIZE_CONFIG = {
  sm: {
    maxWidth: 'max-w-sm',
    padding: 'p-4',
  },
  md: {
    maxWidth: 'max-w-md',
    padding: 'p-6',
  },
  lg: {
    maxWidth: 'max-w-lg',
    padding: 'p-6',
  },
  xl: {
    maxWidth: 'max-w-xl',
    padding: 'p-8',
  },
  full: {
    maxWidth: 'max-w-[90vw] max-h-[90vh]',
    padding: 'p-8',
  },
};

/**
 * Default props for the component.
 */
const defaultProps = {
  isOpen: false,
  onClose: () => {},
  title: '',
  children: null,
  footer: null,
  size: 'md',
  closeOnOverlayClick: true,
  closeOnEsc: true,
  showCloseButton: true,
  className: '',
};

// ============================================================
// PRIVATE HELPERS
// ============================================================

/**
 * Generates the modal overlay classes.
 * @param {string} className - Additional custom classes
 * @returns {string} Combined class names
 */
const getOverlayClasses = (className = '') => {
  const classes = [
    // Positioning
    'fixed',
    'inset-0',
    'z-50',
    
    // Background
    'bg-black/50',
    'backdrop-blur-sm',
    
    // Flex centering
    'flex',
    'items-center',
    'justify-center',
    
    // Animation
    'animate-overlay-in',
    
    // Custom
    className,
  ].filter(Boolean);

  return classes.join(' ');
};

/**
 * Generates the modal container classes.
 * @param {string} size - Modal size
 * @param {string} className - Additional custom classes
 * @returns {string} Combined class names
 */
const getModalClasses = (size, className = '') => {
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  
  const classes = [
    // Base
    'relative',
    'bg-white',
    'rounded-xl',
    'shadow-2xl',
    'w-full',
    
    // Size
    sizeConfig.maxWidth,
    sizeConfig.padding,
    
    // Animation
    'animate-modal-in',
    
    // Custom
    className,
  ].filter(Boolean);

  return classes.join(' ');
};

// ============================================================
// FOCUS TRAP HOOK
// ============================================================

/**
 * Custom hook for trapping focus inside the modal.
 * @param {boolean} isOpen - Whether the modal is open
 * @param {React.RefObject} modalRef - Reference to the modal container
 */
const useFocusTrap = (isOpen, modalRef) => {
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    const previousFocus = document.activeElement;

    // Focus the modal container
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Focus trap handler
    const handleFocusTrap = (event) => {
      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleFocusTrap);

    // Cleanup: restore focus
    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
      if (previousFocus && previousFocus.focus) {
        previousFocus.focus();
      }
    };
  }, [isOpen, modalRef]);
};

// ============================================================
// BODY SCROLL LOCK HOOK
// ============================================================

/**
 * Custom hook for preventing body scroll when modal is open.
 * @param {boolean} isOpen - Whether the modal is open
 */
const useBodyScrollLock = (isOpen) => {
  useEffect(() => {
    if (!isOpen) return;

    // Store original overflow
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Lock scroll
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Cleanup: restore scroll
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);
};

// ============================================================
// ESC KEY CLOSE HOOK
// ============================================================

/**
 * Custom hook for closing modal on Escape key press.
 * @param {boolean} isOpen - Whether the modal is open
 * @param {boolean} closeOnEsc - Whether to close on Escape
 * @param {Function} onClose - Close handler
 */
const useEscapeClose = (isOpen, closeOnEsc, onClose) => {
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);
};

// ============================================================
// MODAL COMPONENT
// ============================================================

/**
 * Modal component with overlay, title, content, and footer sections.
 * Uses React Portals for proper DOM placement and accessibility.
 */
const Modal = ({
  isOpen = false,
  onClose = () => {},
  title = '',
  children = null,
  footer = null,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
}) => {
  // Refs
  const modalRef = useRef(null);

  // Hooks for accessibility and behavior
  useFocusTrap(isOpen, modalRef);
  useBodyScrollLock(isOpen);
  useEscapeClose(isOpen, closeOnEsc, onClose);

  // ============================================================
  // HANDLERS
  // ============================================================

  /**
   * Handles overlay click to close modal.
   */
  const handleOverlayClick = useCallback((event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  /**
   * Handles close button click.
   */
  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // ============================================================
  // RENDER
  // ============================================================

  // Don't render if modal is closed
  if (!isOpen) return null;

  // Generate classes
  const overlayClasses = getOverlayClasses();
  const modalClasses = getModalClasses(size, className);

  // Create portal
  return createPortal(
    <div
      className={overlayClasses}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      data-testid="modal-overlay"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className={modalClasses}
        tabIndex={-1}
        role="document"
        data-testid="modal-container"
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleCloseClick}
            aria-label="Close modal"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Modal Header */}
        {title && (
          <div className="mb-4 pr-8">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              {title}
            </h2>
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>

      {/* Tailwind CSS Custom Animations */}
      <style jsx>{`
        @keyframes overlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-overlay-in {
          animation: overlayIn 0.2s ease-out;
        }

        .animate-modal-in {
          animation: modalIn 0.25s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
};

// ============================================================
// PROP TYPES (Optional - uncomment if using PropTypes)
// ============================================================

/*
import PropTypes from 'prop-types';

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  closeOnOverlayClick: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string,
};
*/

Modal.defaultProps = defaultProps;

// ============================================================
// EXPORT
// ============================================================

export default Modal;

// ============================================================
// EXPLANATION
// ============================================================

/**
 * 1. Why React Portals are used for modals:
 * 
 * - DOM Placement: Portals allow the modal to be rendered outside
 *   the normal React component tree, directly into document.body.
 *   This prevents the modal from being affected by parent styles
 *   (overflow: hidden, z-index conflicts, transforms, etc.).
 * 
 * - Accessibility: Modals are typically high-level UI elements that
 *   should overlay all content. Portals ensure the modal is at the
 *   top of the DOM hierarchy, making it easier to manage focus
 *   trapping and screen reader navigation.
 * 
 * - Z-Index Management: By rendering to the body, the modal can
 *   maintain a consistent z-index without competing with parent
 *   stacking contexts.
 * 
 * - Event Handling: Portal rendering ensures that overlay clicks
 *   and keyboard events work as expected, without interference
 *   from parent event handlers.
 * 
 * - Clean Separation: The modal's DOM structure is independent of
 *   the component that triggers it, making it easier to manage
 *   and style.
 * 
 * 2. Why a reusable modal is better than creating separate modals 
 *    for each feature:
 * 
 * - Consistency: Every modal in the application shares the same
 *   appearance, animation, and behavior. Users get a predictable
 *   experience.
 * 
 * - Maintainability: Changes to modal styling (colors, animations,
 *   sizes) only need to be made in one file. This reduces bugs
 *   and development time.
 * 
 * - Accessibility: Accessibility features (focus trapping, keyboard
 *   navigation, ARIA attributes, scroll locking) are baked into the
 *   component. All modals are accessible without extra effort.
 * 
 * - Productivity: Developers don't need to re-implement modal logic
 *   for each feature. They simply import and use the component.
 * 
 * - Code Reduction: Reusing a single modal component reduces code
 *   duplication significantly across the application.
 * 
 * - Testing: The component can be unit tested once, and all instances
 *   will inherit the correct behavior.
 * 
 * 3. Where this modal will be used in the Ludo application:
 * 
 * - Leave Game Confirmation: When a player clicks "Leave Game",
 *   a modal appears asking "Are you sure you want to leave?"
 *   with Confirm/Cancel buttons.
 * 
 * - Restart Game Confirmation: Similar to leave, confirming a
 *   restart to prevent accidental game reset.
 * 
 * - Game Over / Winner Announcement: When a player wins, a modal
 *   displays "🎉 Player X Wins!" with player statistics and a
 *   "Play Again" button.
 * 
 * - Settings: Modal for game settings (sound, theme, animations,
 *   rules configuration) without navigating away from the game.
 * 
 * - Dice Roll History: Modal showing detailed history of dice rolls
 *   and moves for the current game.
 * 
 * - Player Info: Modal displaying detailed player statistics,
 *   token positions, and progress.
 * 
 * - Rules Help: Modal showing game rules, how to play, and
 *   special rules (sixes, captures, safe zones).
 * 
 * - Pause Game: When a player pauses the game, a modal overlay
 *   appears showing "Game Paused" with resume options.
 * 
 * - Token Selection: A modal or sub-modal for selecting which
 *   token to move when multiple tokens are available.
 * 
 * - Error Messages: Displaying error messages in a modal when
 *   something goes wrong (e.g., "Network error", "Invalid move").
 * 
 * - Invite Friends: Modal for generating and sharing game invite
 *   links for multiplayer sessions.
 * 
 * - Profile: Modal for viewing and editing player profile within
 *   the game context without leaving the page.
 */