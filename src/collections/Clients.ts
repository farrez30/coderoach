import type { CollectionConfig } from 'payload';
import { imageField } from '../fields/imageField';
import { INDUSTRIES } from '../lib/portfolio/taxonomy';

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['order', 'name', 'logo', 'website'],
    group: 'Content',
    description: 'Trusted-by marquee entries. Upload a logo for each (light variant required, dark optional).',
  },
  // The REST API is public, so an unlisted client (no recorded permission) must not be readable
  // there either; hiding it only in the marquee would still publish its name (ADR 0009).
  access: { read: ({ req }) => (req.user ? true : { listed: { equals: true } }) },
  fields: [
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      index: true,
      admin: { position: 'sidebar', description: 'Sort order in marquee.' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Brand/company name. Used as alt text and as fallback when no logo is uploaded.' },
    },
    imageField({
      name: 'logo',
      description: 'Logo for light backgrounds (typical Hero marquee). Recommended: SVG or transparent PNG, ~80px tall.',
    }),
    imageField({
      name: 'logoDark',
      description: 'Optional logo variant for dark backgrounds.',
    }),
    {
      name: 'website',
      type: 'text',
      admin: { description: 'Optional outbound URL, wraps the logo in an <a>.' },
    },
    {
      name: 'listed',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Shown on the site and in the public API. Set by the landing sync from CLIENTS in src/lib/landing/copy.ts.',
      },
    },
    {
      name: 'industry',
      type: 'select',
      index: true,
      options: INDUSTRIES.map((i) => ({ label: i.label, value: i.value })),
      admin: { position: 'sidebar' },
    },
  ],
};
