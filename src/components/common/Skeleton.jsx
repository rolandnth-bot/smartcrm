/**
 * Skeleton loader komponens - loading state megjelenítéshez
 */

import { memo } from 'react';

const Skeleton = memo(({ 
  className = '', 
  variant = 'text', 
  width, 
  height,
  count = 1,
  ...props 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const variants = {
    text: 'h-4',
    title: 'h-6',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24',
    card: 'h-32',
    table: 'h-12',
    circle: 'h-12 w-12 rounded-full'
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  if (count === 1) {
    return (
      <div
        className={`${baseClasses} ${variants[variant] || variants.text} ${className}`}
        style={style}
        aria-label="Betöltés..."
        aria-busy="true"
        role="status"
        {...props}
      />
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${variants[variant] || variants.text} ${className}`}
          style={style}
          aria-label="Betöltés..."
          aria-busy="true"
          role="status"
          {...props}
        />
      ))}
    </>
  );
});

Skeleton.displayName = 'Skeleton';

// Skeleton Card - teljes kártya skeleton
export const SkeletonCard = memo(({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`} aria-label="Betöltés..." aria-busy="true" role="status">
    <Skeleton variant="title" className="mb-4" width="60%" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" width="80%" />
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

// Skeleton Table Row
export const SkeletonTableRow = memo(({ columns = 5 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton variant="text" />
      </td>
    ))}
  </tr>
));

SkeletonTableRow.displayName = 'SkeletonTableRow';

// Skeleton List Item
export const SkeletonListItem = memo(() => (
  <div className="flex items-center gap-4 p-4 border-b dark:border-gray-700" aria-label="Betöltés..." aria-busy="true" role="status">
    <Skeleton variant="avatar" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" />
    </div>
    <Skeleton variant="button" />
  </div>
));

SkeletonListItem.displayName = 'SkeletonListItem';

// Skeleton Stats Card
export const SkeletonStatsCard = memo(() => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center" aria-label="Betöltés..." aria-busy="true" role="status">
    <Skeleton variant="title" className="mx-auto mb-2" width="80px" />
    <Skeleton variant="text" className="mx-auto" width="60%" />
    <Skeleton variant="text" className="mx-auto mt-2" width="40%" />
  </div>
));

SkeletonStatsCard.displayName = 'SkeletonStatsCard';

export { Skeleton };
export default Skeleton;

