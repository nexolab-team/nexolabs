import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const writeups = await getCollection('writeups');
  
  return rss({
    title: 'NexoLabs Writeups',
    description: 'Technical breakdowns of CTF challenges, vulnerability analyses, and exploitation techniques',
    site: context.site || 'https://nexolabs.com',
    items: writeups
      .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
      .map((writeup) => ({
        title: writeup.data.title,
        pubDate: new Date(writeup.data.date),
        description: writeup.data.description || '',
        link: `/writeups/${writeup.slug}/`,
        categories: [writeup.data.category, writeup.data.difficulty, ...(writeup.data.tags || [])],
        author: writeup.data.author,
      })),
    customData: `<language>en-us</language>`,
  });
}
