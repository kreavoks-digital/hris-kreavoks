/**
 * Client-safe HTML Sanitizer
 * Removes dangerous tags (<script>, <iframe>, <object>, <embed>, etc.)
 * and dangerous attributes (on*, javascript:, vbscript:) to prevent XSS.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // Return plain string if in SSR/Node environment
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const allowedTags = new Set([
      'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'span', 'div', 'img', 'a', 'blockquote', 'code', 'pre'
    ]);

    const allowedAttributes: Record<string, Set<string>> = {
      '*': new Set(['class', 'style', 'title', 'id']),
      'a': new Set(['href', 'target', 'rel']),
      'img': new Set(['src', 'alt', 'width', 'height', 'loading'])
    };

    function cleanNode(node: Node) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          const tagName = el.tagName.toLowerCase();

          if (!allowedTags.has(tagName)) {
            // Remove disallowed element
            el.remove();
            continue;
          }

          // Strip dangerous attributes
          const attributes = Array.from(el.attributes);
          for (const attr of attributes) {
            const attrName = attr.name.toLowerCase();
            const attrVal = attr.value.trim().toLowerCase();

            // Disallow event handlers like onclick, onload, onerror
            if (attrName.startsWith('on')) {
              el.removeAttribute(attr.name);
              continue;
            }

            // Disallow javascript: / vbscript: / data: URIs in href or src
            if ((attrName === 'href' || attrName === 'src') && 
                (attrVal.startsWith('javascript:') || attrVal.startsWith('vbscript:') || (attrVal.startsWith('data:') && !attrVal.startsWith('data:image/')))) {
              el.removeAttribute(attr.name);
              continue;
            }

            // Check against allowed attributes
            const globalAllowed = allowedAttributes['*'];
            const tagAllowed = allowedAttributes[tagName];
            const isAllowed = globalAllowed?.has(attrName) || tagAllowed?.has(attrName);

            if (!isAllowed) {
              el.removeAttribute(attr.name);
            }
          }

          // If it's a link, enforce noopener noreferrer
          if (tagName === 'a') {
            el.setAttribute('rel', 'noopener noreferrer');
          }

          cleanNode(el);
        } else if (child.nodeType === Node.COMMENT_NODE) {
          child.remove();
        }
      }
    }

    cleanNode(doc.body);
    return doc.body.innerHTML;
  } catch {
    // Fallback safe escape
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
