import { useState, useRef, useEffect, memo } from 'react';

/**
 * Tooltip komponens - segítség szövegek megjelenítéséhez
 * 
 * @param {React.ReactNode} children - A tooltip-et tartalmazó elem
 * @param {string} content - A tooltip tartalma
 * @param {string} position - Tooltip pozíció: 'top', 'bottom', 'left', 'right' (default: 'top')
 * @param {number} delay - Késleltetés milliszekundumban (default: 200)
 * @param {boolean} disabled - Tooltip letiltása (default: false)
 */
const Tooltip = memo(({ 
  children, 
  content, 
  position = 'top',
  delay = 200,
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = triggerRect.top + scrollY - tooltipRect.height - 8;
          left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = triggerRect.bottom + scrollY + 8;
          left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.left + scrollX - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.right + scrollX + 8;
          break;
        default:
          top = triggerRect.top + scrollY - tooltipRect.height - 8;
          left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
      }

      // Viewport ellenrzés és korrekció
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < 8) left = 8;
      if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }
      if (top < 8) top = 8;
      if (top + tooltipRect.height > viewportHeight + scrollY - 8) {
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content || disabled) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
        aria-describedby={isVisible ? 'tooltip-content' : undefined}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className={`fixed z-[10000] px-3 py-2 text-sm text-white dark:text-gray-100 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg pointer-events-none whitespace-nowrap ${
            position === 'top' ? 'animate-fade-in-down' :
            position === 'bottom' ? 'animate-fade-in-up' :
            position === 'left' ? 'animate-fade-in-right' :
            'animate-fade-in-left'
          }`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`
          }}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700' :
              'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700'
            }`}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;

