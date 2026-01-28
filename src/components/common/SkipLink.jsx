import { memo, useCallback } from 'react';

/**
 * Skip Link komponens - Accessibility javítás
 * Lehetővé teszi a billentyűzet felhasználók számára, hogy átugorják a navigációt
 * és közvetlenül a fő tartalomhoz jussanak.
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
      aria-label="Ugrás a fő tartalomhoz"
    >
      Ugrás a fő tartalomhoz
    </button>
  );
});

SkipLink.displayName = 'SkipLink';

export default SkipLink;

