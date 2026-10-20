import type { GlobalConfig } from 'payload';
import { revalidateHome } from '../lib/revalidate';
import { imageField } from '../fields/imageField';
import { linkField } from '../fields/link';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Site Content' },
  access: { read: () => true },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Studio',
      admin: { description: 'Brand name shown in nav, footer, page titles, and OG.' },
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      admin: { description: 'Default meta description for pages without their own.' },
    },
    imageField({
      name: 'logo',
      description: 'Primary logo (light backgrounds). Used in nav.',
    }),
    imageField({
      name: 'logoDark',
      description: 'Logo variant for dark backgrounds (footer, dark sections). Optional.',
    }),
    imageField({
      name: 'favicon',
      description: 'Site favicon (PNG or SVG, square).',
    }),
    {
      name: 'navStatus',
      type: 'group',
      admin: {
        hidden: true,
        description: 'Legacy: nav status badge (no longer rendered, kept for data continuity).',
      },
      fields: [
        { name: 'label', type: 'text', defaultValue: 'JKT · OPEN Q3' },
      ],
    },
    linkField({
      name: 'navCta',
      description: 'Primary call-to-action in the top nav.',
      defaultLabel: 'Start a discovery',
      defaultHref: '#contact',
    }),
    {
      name: 'footer',
      type: 'group',
      admin: { description: 'Tagline, link columns, and meta line at the bottom of every page.' },
      fields: [
        {
          name: 'tagline',
          type: 'textarea',
          admin: { description: 'Short paragraph next to the logo in footer.' },
        },
        {
          name: 'badge',
          type: 'text',
          defaultValue: 'JKT-1 · OPEN FOR Q3',
          admin: {
            hidden: true,
            description: 'Legacy: footer status badge (no longer rendered, kept for data continuity).',
          },
        },
        {
          name: 'columns',
          type: 'array',
          maxRows: 3,
          admin: { description: 'Up to 3 footer link columns (e.g. NAVIGATE / STUDIO / CONTACT).' },
          fields: [
            { name: 'heading', type: 'text', required: true },
            {
              name: 'links',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          name: 'metaLine',
          type: 'group',
          admin: { description: 'Small mono text below footer columns.' },
          fields: [
            { name: 'left', type: 'text' },
            { name: 'right', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'social',
      type: 'array',
      admin: { description: 'Social profiles (used in footer/contact). Platform = label, e.g. "X", "LinkedIn".' },
      fields: [
        { name: 'platform', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    imageField({
      name: 'ogImage',
      description: 'Default Open Graph image used when a page has no specific OG image.',
    }),
  ],
};
