/**
 * Utility per validare e migliorare estrazione NAP (Name, Address, Phone)
 */

/**
 * Valida formato telefono italiano
 */
export function validateItalianPhone(phone: string): boolean {
  if (!phone || phone.length < 8) return false;
  
  // Rimuovi spazi, punti, trattini
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  
  // Pattern telefoni italiani:
  // - Prefisso internazionale: +39 o 0039
  // - Prefissi fissi: 02, 06, 081, etc. (2-4 cifre)
  // - Prefissi mobili: 3xx (331, 333, 340, etc.)
  // - Numero: 6-8 cifre
  
  const patterns = [
    /^(\+39|0039)?[0-9]{9,11}$/, // Formato generale
    /^(\+39|0039)?0[1-9]\d{8,9}$/, // Fissi con 0
    /^(\+39|0039)?3\d{8,9}$/, // Mobili
    /^(\+39|0039)?[1-9]\d{8,9}$/, // Senza 0 iniziale
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Valida formato CAP italiano (5 cifre)
 */
export function validateItalianCAP(cap: string): boolean {
  if (!cap) return false;
  const cleaned = cap.replace(/\s/g, '');
  // CAP italiano: 5 cifre, da 00010 a 98168
  return /^\d{5}$/.test(cleaned) && parseInt(cleaned) >= 10 && parseInt(cleaned) <= 98168;
}

/**
 * Valida formato indirizzo italiano
 */
export function validateItalianAddress(address: string): boolean {
  if (!address || address.length < 10) return false;
  
  // Deve contenere almeno:
  // - Tipo via (via, viale, corso, etc.)
  // - Nome via
  // - Numero civico (opzionale ma comune)
  // - CAP (opzionale ma comune)
  // - Città (opzionale)
  
  const hasViaType = /(via|viale|corso|piazza|piazzale|strada|lungomare|lungo\s+mare|borgo|contrada|frazione|località)/i.test(address);
  const hasNumber = /\d+/.test(address);
  const hasCity = /[a-zàèéìòù]{3,}/i.test(address);
  
  // Almeno tipo via + numero O tipo via + città
  return hasViaType && (hasNumber || hasCity);
}

/**
 * Estrae e valida telefono da testo con contesto
 */
export function extractPhoneWithContext(text: string, context?: string): string | null {
  // Pattern più rigoroso per telefoni italiani
  const phonePatterns = [
    // Formato con prefisso internazionale
    /(\+39|0039)\s?[0-9]{2,3}\s?[0-9]{6,8}/g,
    // Formato fisso italiano (02, 06, 081, etc.)
    /(?:tel|telefono|phone|cell|cellulare)[\s:]*(\+?39\s?)?0?[1-9]\d{1,3}[\s.\-]?\d{6,8}/gi,
    // Formato mobile (3xx)
    /(?:tel|telefono|phone|cell|cellulare)[\s:]*(\+?39\s?)?3\d{2}[\s.\-]?\d{6,7}/gi,
    // Pattern generico ma con contesto (vicino a "tel", "telefono", etc.)
    /(?:tel|telefono|phone|cell|cellulare|chiama)[\s:]*[\s.\-]?(\+?39\s?)?[0-9]{2,3}[\s.\-]?[0-9]{6,8}/gi,
  ];
  
  const combinedText = context ? `${context} ${text}` : text;
  
  for (const pattern of phonePatterns) {
    const matches = combinedText.match(pattern);
    if (matches) {
      for (const match of matches) {
        // Estrai solo il numero
        const phone = match.replace(/(?:tel|telefono|phone|cell|cellulare|chiama)[\s:]*/gi, '').trim();
        if (validateItalianPhone(phone)) {
          return phone;
        }
      }
    }
  }
  
  return null;
}

/**
 * Estrae e valida indirizzo da testo con contesto
 */
export function extractAddressWithContext(text: string, context?: string): string | null {
  const combinedText = context ? `${context} ${text}` : text;
  
  // Pattern più rigoroso: tipo via + nome + numero + CAP + città
  const addressPatterns = [
    // Pattern completo: Via Nome, 123, 20121 Milano
    /(via|viale|corso|piazza|piazzale|strada|lungomare|borgo|contrada)\s+[a-zàèéìòù\s]+(?:,\s*)?n\.?\s*\d+(?:,\s*)?\d{5}\s+[a-zàèéìòù]+/i,
    // Pattern con CAP: Via Nome, 20121
    /(via|viale|corso|piazza|piazzale|strada|lungomare|borgo|contrada)\s+[a-zàèéìòù\s]+(?:,\s*)?\d{5}/i,
    // Pattern base: Via Nome, 123
    /(via|viale|corso|piazza|piazzale|strada|lungomare|borgo|contrada)\s+[a-zàèéìòù\s]+(?:,\s*)?n\.?\s*\d+/i,
  ];
  
  for (const pattern of addressPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      const address = match[0].trim();
      if (validateItalianAddress(address)) {
        return address;
      }
    }
  }
  
  return null;
}

/**
 * Verifica se il testo è in una sezione rilevante (footer, contatti, etc.)
 */
export function isInRelevantSection(element: any, $: any): boolean {
  const parentClasses = $(element).parent().attr('class') || '';
  const parentId = $(element).parent().attr('id') || '';
  const text = $(element).text().toLowerCase();
  
  const relevantKeywords = [
    'footer', 'contatti', 'contacts', 'contact', 'indirizzo', 'address',
    'recapiti', 'dove', 'where', 'sede', 'ufficio', 'office', 'location',
  ];
  
  // Verifica se è in footer o sezione contatti
  const isFooter = $(element).closest('footer, .footer, #footer').length > 0;
  const isContactSection = relevantKeywords.some(keyword => 
    parentClasses.includes(keyword) || 
    parentId.includes(keyword) ||
    text.includes(keyword)
  );
  
  return isFooter || isContactSection;
}

