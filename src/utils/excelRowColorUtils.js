/**
 * Excel sor háttérszín (ARGB)  lead szín megfeleltetés.
 * zöld = meleg, piros = Késbb, szürke = Nem aktuális, fekete = elveszett.
 */

/**
 * ARGB hex string (pl. 'FF92D050' vagy '92D050')  R,G,B 0255.
 * @param {string} argb
 * @returns {{ r: number, g: number, b: number } | null}
 */
function parseArgb(argb) {
  if (!argb || typeof argb !== 'string') return null;
  const hex = argb.replace(/^#/, '').replace(/^FF/i, '').padStart(6, '0');
  if (hex.length < 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Excel cell fill (ExcelJS)  'zöld' | 'piros' | 'szürke' | 'fekete' | null.
 * Prioritás: fekete  szürke  zöld/piros.
 * @param {object} fill - cell.fill (fgColor/bgColor, argb)
 * @returns {string | null}
 */
export function excelFillToLeadColor(fill) {
  if (!fill || typeof fill !== 'object') return null;
  const src = fill.fgColor || fill.bgColor;
  if (!src) return null;
  const argb = src.argb || src;
  const rgb = parseArgb(argb);
  if (!rgb) return null;
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  const span = max - min;

  if (avg < 0x40) return 'fekete';
  if (span < 50) return 'szürke';
  if (g > r && g > b) return 'zöld';
  if (r > g && r > b) return 'piros';
  return null;
}
