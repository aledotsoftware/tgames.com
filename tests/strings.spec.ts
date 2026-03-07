import { describe, it, expect } from 'vitest'
import { stripHtml } from '../utils/strings'

describe('stripHtml', () => {
  it('should return empty string for null, undefined, or empty string', () => {
    expect(stripHtml(null)).toBe('')
    expect(stripHtml(undefined)).toBe('')
    expect(stripHtml('')).toBe('')
  })

  it('should return the original string if there is no HTML', () => {
    expect(stripHtml('Hello World')).toBe('Hello World')
    expect(stripHtml('12345')).toBe('12345')
  })

  it('should strip simple HTML tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello')
    expect(stripHtml('<h1>Title</h1>')).toBe('Title')
    expect(stripHtml('<b>Bold text</b>')).toBe('Bold text')
  })

  it('should strip nested HTML tags', () => {
    expect(stripHtml('<div><p>Hello <b>World</b></p></div>')).toBe('Hello World')
  })

  it('should strip self-closing HTML tags', () => {
    expect(stripHtml('Line 1<br/>Line 2')).toBe('Line 1Line 2')
    expect(stripHtml('Line 1<br>Line 2')).toBe('Line 1Line 2')
    expect(stripHtml('Start<hr />End')).toBe('StartEnd')
  })

  it('should strip tags with attributes', () => {
    expect(stripHtml('<a href="https://example.com">Link</a>')).toBe('Link')
    expect(stripHtml('<span class="text-red" data-id="1">Red text</span>')).toBe('Red text')
  })
})
