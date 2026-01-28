import { memo } from 'react';
import Button from './Button';
import { Plus, Search, Filter } from './Icons';

const EmptyState = memo(({ 
  icon: Icon = Search, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`} role="status" aria-live="polite">
      <div className="mb-4 text-gray-400 dark:text-gray-500 text-6xl" aria-hidden="true">
        {Icon && <Icon />}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// Speciális üres állapot komponensek
export const EmptyStateWithFilter = memo(({ 
  title, 
  description, 
  onClearFilter,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`} role="status" aria-live="polite">
      <div className="mb-4 text-gray-400 dark:text-gray-500 text-6xl" aria-hidden="true">
        <Filter />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">{description}</p>
      )}
      {onClearFilter && (
        <Button onClick={onClearFilter} variant="outline">
          Szűrők törlése
        </Button>
      )}
    </div>
  );
});

EmptyStateWithFilter.displayName = 'EmptyStateWithFilter';

export default EmptyState;

