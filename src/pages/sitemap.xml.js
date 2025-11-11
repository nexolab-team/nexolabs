import { getCollection } from 'astro:content';

export async function get() {
  const site = import.meta.env.SITE || '';
  const pages = [
    '/',
    '/writeups',
    '/about',
    '/achievements',
    '/rss.xml'
  ];

  const writeups = await getCollection('writeups');

  const urls = writeups.map(w => ({
    loc: `${site}/writeups/${w.slug}`,
    lastmod: w.data.date
  }));

  const allUrls = pages.map(p => ({ loc: `${site}${p}`, lastmod: null })).concat(urls);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    ${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}\n  </url>`).join('\n')}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, must-revalidate'
    }
  });
}
