export const stripHtml = (html?: string | null): string => {
  return html ? html.replace(/<[^>]*>/g, '') : ''
}
