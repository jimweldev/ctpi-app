// Shared by the root layout (a Server Component) and lib/font-size.ts.
export const FONT_SIZE_KEY = "ctpi:font-size"

/**
 * Inline <head> script: sets `data-font-size` on <html> before first paint,
 * and `app/globals.css` scales the root font size from it.
 */
export const fontSizeScript = `try{var s=localStorage.getItem("${FONT_SIZE_KEY}");if(s)document.documentElement.dataset.fontSize=s}catch(e){}`
