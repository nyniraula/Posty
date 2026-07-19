/* ──────────────────────────────────────────────────
   Font loader for poster canvas rendering
   Loads the fonts that templates can reference
   ────────────────────────────────────────────────── */

const FONT_URL = "https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap";

let fontsLoaded = false;

/**
 * Load poster fonts required for Konva rendering.
 * Call this before rendering any canvas that uses template fonts.
 */
export async function loadPosterFonts(): Promise<void> {
  if (fontsLoaded) return;

  /* Load Google Fonts via link elements */
  const head = document.head;

  if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    head.appendChild(link);
  }

  /* Wait for fonts to be ready */
  try {
    await document.fonts.ready;
  } catch {
    /* fonts.ready may not resolve in all environments */
  }

  fontsLoaded = true;
}
