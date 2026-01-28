import { memo } from 'react';

const Card = memo(({ 
  children, 
  title, 
  subtitle,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer,
  ...props 
}) => {
  return (
    <div 
      className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg transition-shadow duration-200 hover:shadow-xl ${className}`} 
      role="article"
      aria-labelledby={title ? 'card-title' : undefined}
      aria-describedby={subtitle ? 'card-subtitle' : undefined}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`p-6 border-b dark:border-gray-700 ${headerClassName}`}>
          {title && <h3 id="card-title" className="text-xl font-bold text-gray-800 dark:text-gray-200">{title}</h3>}
          {subtitle && <p id="card-subtitle" className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={`${title || subtitle ? 'p-6' : 'p-6'} ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;

