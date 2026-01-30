import { memo, useCallback } from 'react';

/**
 * Skip Link komponens - Accessibility javítás
 * Lehetvé teszi a billentyzet felhasználók számára, hogy átugorják a navigációt
 * és közvetlenül a f tartalomhoz jussanak.
 * Gomb + scrollIntoView (HashRouter miatt nem használunk href="#main-content"-ot).
 */
const SkipLink = memo(() => {
  const handleClick = useCallback((e) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Ugrás a f tartalomhoz"
    >
      Ugrás a f tartalomhoz
    </button>
  );
});

SkipLink.displayName = 'SkipLink';

export default SkipLink;

