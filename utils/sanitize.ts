import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'img'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'src', 'alt', 'class']
  });
}
