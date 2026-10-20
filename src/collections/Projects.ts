import type { CollectionConfig } from 'payload';
import { safeHref } from '../lib/portfolio/links';
import { INDUSTRIES, RETIRED_INDUSTRIES } from '../lib/portfolio/taxonomy';
import { revalidateProject } from '../lib/revalidate';
import { autoSlug } from '../lib/slugify';

const media = (name: string, description?: string) => ({
  name,
  type: 'upload' as const,
  relationTo: 'media' as const,
  ...(description ? { admin: { description } } : {}),
});

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'client',
    defaultColumns: ['client', 'kind', 'industry', 'featured', '_status'],
    group: 'Content',
    description: 'Client cases and studio products. One collection, two kinds.',
  },
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
    maxPerDoc: 25,
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { _status: { equals: 'published' } };
    },
  },
  hooks: {
    afterChange: [revalidateProject],
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        // Enforce only ONE featured project at a time (homepage hero card)
        if (data?.featured && (!originalDoc || !originalDoc.featured)) {
          await req.payload.update({
            collection: 'projects',
            where: {
              and: [
                { featured: { equals: true } },
                ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
              ],
            },
            data: { featured: false },
          });
        }
        return data;
      },
    ],
  },
  fields: [
    // ============ SIDEBAR ============
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [autoSlug('client')] },
      admin: {
        position: 'sidebar',
        description: 'URL identifier. Auto-generated from client name.',
      },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'client',
      options: [
        { label: 'Client case study', value: 'client' },
        { label: 'Studio product', value: 'studio' },
        { label: 'Lab (personal project)', value: 'lab' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Client = case study render. Studio = product-landing render.',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Sort order in lists. Lower = earlier.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Renders as homepage feature card. Only one at a time (auto-unset on others).',
      },
    },
    {
      name: 'industry',
      type: 'select',
      index: true,
      // One list with Clients and Coderoach OS (taxonomy.ts). Retired values stay so the enum only grows.
      options: [
        ...INDUSTRIES.map((i) => ({ label: i.label, value: i.value })),
        ...RETIRED_INDUSTRIES.map((v) => ({ label: `${v} (lama)`, value: v })),
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Primary service used. Drives related-projects on Service detail page.',
      },
    },
    {
      name: 'publishedYear',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'e.g. "2024", shown in "[ // SHIPPED 2024 ]" labels.',
      },
    },

    // ============ TABS (main canvas) ============
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          description: 'Core information shown on archive cards and the project header.',
          fields: [
            {
              name: 'client',
              type: 'text',
              required: true,
              admin: { description: 'Client kind: company name. Studio kind: product name.' },
            },
            { name: 'tagline', type: 'text', required: true, admin: { description: 'One-line summary' } },
            {
              name: 'meta',
              type: 'text',
              admin: { description: 'Industry · service tag, e.g. "F&B · INTELLIGENCE"' },
            },
            { name: 'excerpt', type: 'textarea', admin: { description: 'Short summary for archive cards' } },
            {
              name: 'pills',
              type: 'array',
              admin: { description: 'Tech pills shown on archive card / work-row' },
              fields: [{ name: 'pill', type: 'text', required: true }],
            },
            { name: 'richContent', type: 'richText', admin: { description: 'Full case write-up / product story (Lexical).' } },
          ],
        },
        {
          label: 'Featured display',
          description: 'Used only when "Featured" is checked. Renders as the homepage hero card.',
          fields: [
            {
              name: 'featuredDetails',
              type: 'group',
              admin: {
                condition: (_, sib) => Boolean(sib?.featured),
                description: 'Fill these in when this project is the homepage feature.',
              },
              fields: [
                { name: 'badgeLabel', type: 'text', defaultValue: '[ FEATURED · 2026 ]' },
                { name: 'shippedLabel', type: 'text', defaultValue: '[ SHIPPED ]' },
                { name: 'metaLine', type: 'text' },
                { name: 'headline', type: 'textarea' },
                { name: 'description', type: 'textarea' },
                {
                  name: 'metrics',
                  type: 'array',
                  maxRows: 3,
                  fields: [
                    { name: 'num', type: 'text', required: true },
                    { name: 'accent', type: 'text' },
                    { name: 'label', type: 'text', required: true },
                  ],
                },
                {
                  name: 'codePanel',
                  type: 'group',
                  fields: [
                    { name: 'tag', type: 'text', defaultValue: '[ .TS ]' },
                    { name: 'path', type: 'text' },
                    { name: 'lines', type: 'array', fields: [{ name: 'line', type: 'text' }] },
                  ],
                },
                { name: 'stack', type: 'array', fields: [{ name: 'tech', type: 'text', required: true }] },
              ],
            },
          ],
        },
        {
          label: 'Studio product',
          description: 'Only shown when Kind = Studio product.',
          fields: [
            {
              name: 'studio',
              type: 'group',
              admin: {
                condition: (_, sib) => sib?.kind === 'studio',
                description: 'Studio-product specifics.',
              },
              fields: [
                {
                  name: 'vizType',
                  type: 'select',
                  options: [
                    { label: 'Laporta (P&L dashboard)', value: 'laporta' },
                    { label: 'Viralytics (KOL list)', value: 'viralytics' },
                    { label: 'None / generic', value: 'none' },
                  ],
                },
                { name: 'usage', type: 'text', admin: { description: 'e.g. "1.2K OUTLETS"' } },
                {
                  name: 'externalLink',
                  type: 'group',
                  fields: [
                    { name: 'label', type: 'text' },
                    { name: 'href', type: 'text' },
                  ],
                },
                {
                  name: 'bullets',
                  type: 'array',
                  fields: [{ name: 'bullet', type: 'text', required: true }],
                },
              ],
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            {
              name: 'gallery',
              type: 'array',
              admin: { description: 'Screenshots / diagrams' },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Bukti & halaman',
          description:
            'The project page (ADR 0003). Written by scripts/portfolio-sync.ts from projects.ts; every client number, image, and quote needs a recorded permission (ADR 0009).',
          fields: [
            {
              name: 'summary',
              type: 'group',
              admin: { description: 'Problem, solution, result: the first screen of the page.' },
              fields: [
                { name: 'problem', type: 'textarea' },
                { name: 'solution', type: 'textarea' },
                { name: 'result', type: 'textarea' },
              ],
            },
            {
              name: 'showcase',
              type: 'group',
              fields: [
                {
                  name: 'frame',
                  type: 'select',
                  defaultValue: 'laptop',
                  options: ['laptop', 'phone', 'browser'].map((value) => ({ label: value, value })),
                },
                media('screen', 'Hero screenshot inside the device frame.'),
                media('screenPhone', 'Optional phone screenshot beside the laptop.'),
                media('loop', 'Muted 3-6 s preview loop (mp4, at most 600 KB).'),
                media('loopPoster'),
                media('tour', 'Tour recording (mp4, at most 8 MB).'),
                media('tourPoster'),
                media('tourCaptions', 'WebVTT captions for the tour.'),
                { name: 'tourTranscript', type: 'textarea', admin: { description: 'Text alternative for the tour.' } },
                { name: 'demoNote', type: 'text', admin: { description: 'e.g. "Data contoh, bukan data klien."' } },
              ],
            },
            {
              name: 'links',
              type: 'array',
              fields: [
                {
                  name: 'kind',
                  type: 'select',
                  defaultValue: 'live',
                  options: ['live', 'demo', 'archive', 'repo'].map((value) => ({ label: value, value })),
                },
                { name: 'label', type: 'text' },
                {
                  name: 'href',
                  type: 'text',
                  // The page drops anything else anyway (safeHref); this says so while typing.
                  validate: (value: string | null | undefined) =>
                    !value || safeHref(value) !== null || 'Link harus https:// tanpa username/password.',
                },
                { name: 'check', type: 'checkbox', defaultValue: true, admin: { description: 'Probed by the checkLinks job.' } },
                media('snapshot', 'Dated screenshot shown when the link is down.'),
                { name: 'snapshotTakenAt', type: 'date' },
              ],
            },
            {
              name: 'metrics',
              type: 'array',
              admin: { description: 'Sourced numbers (src/lib/portfolio/metrics.ts).' },
              fields: [
                { name: 'key', type: 'text' },
                { name: 'value', type: 'text' },
                { name: 'unit', type: 'text' },
                { name: 'label', type: 'text' },
                { name: 'baselineValue', type: 'text' },
                { name: 'baselineUnit', type: 'text' },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'measured',
                  options: ['measured', 'target'].map((value) => ({ label: value, value })),
                },
                { name: 'measuredAt', type: 'date' },
                { name: 'method', type: 'textarea' },
                { name: 'sourceRef', type: 'text' },
                { name: 'verifyUrl', type: 'text' },
                { name: 'featured', type: 'checkbox', defaultValue: false },
              ],
            },
            {
              name: 'beforeAfter',
              type: 'array',
              fields: [
                { name: 'label', type: 'text' },
                media('before'),
                media('after'),
                { name: 'beforeDate', type: 'date' },
                { name: 'afterDate', type: 'date' },
                { name: 'caption', type: 'text' },
                { name: 'sourceUrl', type: 'text' },
              ],
            },
            {
              name: 'features',
              type: 'array',
              fields: [{ name: 'title', type: 'text' }, { name: 'body', type: 'textarea' }, media('screen')],
            },
            {
              name: 'timeline',
              type: 'array',
              fields: [
                { name: 'date', type: 'text', admin: { description: 'As shown, e.g. "29 Jul 2026".' } },
                { name: 'title', type: 'text' },
                { name: 'detail', type: 'textarea' },
                { name: 'sourceRef', type: 'text' },
              ],
            },
            {
              name: 'darkChapter',
              type: 'group',
              admin: { description: 'At most one dark section per page, never the hero.' },
              fields: [
                { name: 'eyebrow', type: 'text' },
                { name: 'title', type: 'text' },
                { name: 'body', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Testimonial & related',
          fields: [
            {
              name: 'testimonial',
              type: 'group',
              fields: [
                { name: 'quote', type: 'textarea' },
                { name: 'author', type: 'text' },
                { name: 'role', type: 'text' },
                { name: 'company', type: 'text' },
                { name: 'givenAt', type: 'date' },
              ],
            },
            {
              name: 'relatedProjects',
              type: 'relationship',
              relationTo: 'projects',
              hasMany: true,
              admin: { description: 'Manual override. If empty, auto-pick by industry/service.' },
            },
          ],
        },
      ],
    },
  ],
};
