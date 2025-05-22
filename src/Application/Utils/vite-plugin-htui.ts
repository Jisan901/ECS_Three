import type { Plugin } from 'vite';

export default function htuiPlugin(): Plugin {
  return {
    name: 'htui-plugin',
    transform(src: string, id: string) {
      if (id.endsWith('.htui')) {
        return {
          code: `
            const template = document.createElement('template');
            template.innerHTML = ${JSON.stringify(src)};
            export default template.content.firstChild;
          `,
          map: null,
        };
      }
    },
  };
}
