import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../utils/sanitize';

describe('sanitizeHtml', () => {
  it('should return empty string for null or undefined', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });

  it('should allow safe tags', () => {
    const html = '<p><b>Bold</b> and <i>italic</i></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('should strip malicious tags like script', () => {
    const html = '<script>alert("xss")</script><p>safe text</p>';
    expect(sanitizeHtml(html)).toBe('<p>safe text</p>');
  });

  it('should strip malicious attributes like onload or javascript: urls', () => {
    const html = '<a href="javascript:alert(\'xss\')">Click</a><img src="x" onerror="alert(1)">';
    expect(sanitizeHtml(html)).toBe('<a>Click</a><img src="x">');
  });

  it('should allow valid attributes on allowed tags', () => {
    const html = '<a href="https://example.com" class="link">Example</a>';
    expect(sanitizeHtml(html)).toBe(html);
  });
});
