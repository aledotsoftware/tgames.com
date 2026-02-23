export const SUPPORTED_LOCALES = [
  'en', 'es', 'it', 'ar', 'zh', 'de', 'fr', 'hi', 'ja', 'ko', 'nl', 'pt', 'ru', 'sv', 'tr'
];

export const DEFAULT_BASE_URL = 'https://tudexgames.com';

export function generateSitemapIndex(locales: string[] = SUPPORTED_LOCALES, baseUrl: string = DEFAULT_BASE_URL): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const locale of locales) {
        xml += '  <sitemap>\n';
        xml += `    <loc>${baseUrl}/sitemap-${locale}.xml</loc>\n`;
        xml += '  </sitemap>\n';
    }

    xml += '</sitemapindex>';
    return xml;
}

export async function generateSitemap(lang: string, db: any, baseUrl: string = DEFAULT_BASE_URL): Promise<string> {
    // Basic validation
    if (!SUPPORTED_LOCALES.includes(lang)) {
        throw new Error(`Unsupported language: ${lang}`);
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    try {
        // Query to fetch published games
        // We select slug.
        const [rows] = await db.execute(
            `SELECT slug FROM games WHERE published = 1`
        );

        for (const game of rows) {
             xml += '  <url>\n';
             // URL structure: https://tudexgames.com/{lang}/game/{slug}
             // Based on nuxt.config.ts strategy: 'prefix', all locales have prefix.
             xml += `    <loc>${baseUrl}/${lang}/game/${game.slug}</loc>\n`;
             xml += '  </url>\n';
        }
    } catch (error: any) {
        console.error(`Error generating sitemap for ${lang}:`, error);
        throw error;
    }

    xml += '</urlset>';
    return xml;
}
