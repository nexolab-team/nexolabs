// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://nexolab-team.github.io',
  base: '/nexolabs',
  markdown: {
    rehypePlugins: [
      // Fix image paths to include base
      () => {
        return (tree) => {
          const visit = (node) => {
            if (node.type === 'element' && node.tagName === 'img' && node.properties && node.properties.src) {
              const src = node.properties.src;
              // Only modify absolute paths that don't already have the base
              if (typeof src === 'string' && src.startsWith('/') && !src.startsWith('/nexolabs/')) {
                node.properties.src = '/nexolabs' + src;
              }
            }
            if (node.children) {
              node.children.forEach(visit);
            }
          };
          visit(tree);
        };
      }
    ]
  }
});
