import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'System',
    description: 'Images, plus mp4/webm video and WebVTT captions for the portfolio (ADR 0006). Image variants are generated on upload.',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Alt text for accessibility / SEO. Required.' } },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'text/vtt'],
    // nosniff is on for every response, and browsers drop a <track> served as text/plain.
    modifyResponseHeaders: ({ headers }) => {
      if (headers.get('content-type')?.startsWith('text/plain') && headers.get('content-disposition')?.includes('.vtt')) {
        headers.set('content-type', 'text/vtt; charset=utf-8');
      }
      return headers;
    },
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      { name: 'thumbnail', width: 240, height: 240, position: 'centre' },
      { name: 'card', width: 720 },
      { name: 'screen', width: 1080 },
      { name: 'hero', width: 1600 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
  },
};
