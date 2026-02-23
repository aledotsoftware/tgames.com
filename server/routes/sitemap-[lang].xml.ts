export default defineCachedEventHandler(async (event) => {
    const lang = getRouterParam(event, 'lang');

    if (!lang) {
        throw createError({ statusCode: 400, statusMessage: 'Language parameter missing' });
    }

    event.node.res.setHeader('Content-Type', 'application/xml');
    const db = useDB();
    const config = useRuntimeConfig();
    const baseUrl = config.public.siteUrl || DEFAULT_BASE_URL;

    try {
        return await generateSitemap(lang, db, baseUrl);
    } catch (e: any) {
        console.error('Sitemap Error:', e);
        throw createError({ statusCode: 500, statusMessage: e.message });
    }
}, {
    maxAge: 60 * 60 * 6, // 6 hours
    getKey: (event) => `sitemap-${getRouterParam(event, 'lang')}`,
    swr: true,
    name: 'sitemap-lang'
});
