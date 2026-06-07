import { useEffect, useRef } from 'react';

/**
 * Reusable React hook to trap keyboard focus within a modal / dialog container.
 * Also handles close callbacks when the Escape key is pressed.
 * 
 * @param active Whether the modal / dialog is active and trapping focus.
 * @param onClose Optional callback invoked when the Escape key is pressed.
 */
export function useFocusTrap(active: boolean, onClose?: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;

    // Helper to find all elements that can receive focus
    const getFocusableElements = () => {
      return element.querySelectorAll<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
      );
    };

    // Find and focus the first element initially
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small timeout to allow transition animations to finish before taking focus
      const timer = setTimeout(() => {
        focusableElements[0].focus();
      }, 50);
      return () => clearTimeout(timer);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes the active overlay
      if (e.key === 'Escape') {
        if (onClose) {
          onClose();
          e.preventDefault();
        }
        return;
      }

      // Tab key navigation trapping
      if (e.key === 'Tab') {
        const currentFocusables = getFocusableElements();
        if (currentFocusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = currentFocusables[0];
        const lastElement = currentFocusables[currentFocusables.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: Wrap from first to last element
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab: Wrap from last to first element
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Save previously focused element to restore it on cleanup
    const previouslyFocused = document.activeElement as HTMLElement;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        // Delay focus restoration slightly to prevent focus/blur event conflicts during unmount
        setTimeout(() => {
          previouslyFocused.focus();
        }, 10);
      }
    };
  }, [active, onClose]);

  return ref;
}
