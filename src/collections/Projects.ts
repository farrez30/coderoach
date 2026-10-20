import type { CollectionConfig } from 'payload';
import { validateCodeLine } from '../lib/codeLine';
import { revalidateProject } from '../lib/revalidate';
import { autoSlug } from '../lib/slugify';

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
      options: [
        { label: 'F&B', value: 'fb' },
        { label: 'Logistics', value: 'logistics' },
        { label: 'Finance', value: 'finance' },
        { label: 'Agency', value: 'agency' },
        { label: 'VC', value: 'vc' },
        { label: 'Manufacturing', value: 'manufacturing' },
        { label: 'Other', value: 'other' },
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
                { name: 'shippedLabel', type: 'text', defaultValue: '[ ✓ SHIPPED ]' },
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
                    {
                      name: 'lines',
                      type: 'array',
                      admin: {
                        description: 'Plain text. Colour a word with <span style="color:#C4C0C5">word</span>, indent with &nbsp;.',
                      },
                      fields: [{ name: 'line', type: 'text', validate: validateCodeLine }],
                    },
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
          label: 'Testimonial & related',
          fields: [
            {
              name: 'testimonial',
              type: 'group',
              fields: [
                { name: 'quote', type: 'textarea' },
                { name: 'author', type: 'text' },
                { name: 'role', type: 'text' },
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
