import { load } from 'cheerio';

/**
 * Sanitizza HTML per prevenire XSS
 */
export function sanitizeHtml(html: string): string {
  const $ = load(html, {
    xml: {
      decodeEntities: false,
    },
  });

  // Rimuovi script e style tags
  $('script, style, iframe, object, embed, form').remove();

  // Rimuovi attributi pericolosi
  $('*').each((_, el) => {
    const $el = $(el);
    // Rimuovi event handlers (onclick, onerror, etc.)
    if ('attribs' in el && el.attribs) {
      Object.keys(el.attribs).forEach(attr => {
        if (attr.startsWith('on') || attr.toLowerCase().startsWith('javascript:')) {
          $el.removeAttr(attr);
        }
      });
    }
  });

  return $.html();
}

/**
 * Sanitizza testo per output sicuro
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Rimuovi < e >
    .replace(/javascript:/gi, '') // Rimuovi javascript:
    .replace(/on\w+=/gi, ''); // Rimuovi event handlers
}

/**
 * Valida e sanitizza URL per display
 */
export function sanitizeUrlForDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url.replace(/[<>"']/g, '');
  }
}

