export default defineCachedEventHandler(async (event) => {
    event.node.res.setHeader('Content-Type', 'application/xml');
    const config = useRuntimeConfig();
    const baseUrl = config.public.siteUrl || DEFAULT_BASE_URL;
    return generateSitemapIndex(SUPPORTED_LOCALES, baseUrl);
}, {
    maxAge: 60 * 60 * 6, // 6 hours
    name: 'sitemap-index',
    swr: true
});
