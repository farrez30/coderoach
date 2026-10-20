import type { Block } from 'payload';

export const StudioBlock: Block = {
  slug: 'studio',
  labels: { singular: 'Studio / about', plural: 'Studio blocks' },
  fields: [
    { name: 'sectionMarker', type: 'text', defaultValue: '[ 05 / 07 ] · Studio' },
    { name: 'heading', type: 'text', required: true },
    { name: 'lede', type: 'textarea', required: true },
    {
      name: 'stats',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'num', type: 'text', required: true },
        { name: 'accent', type: 'text' },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'pullQuote',
      type: 'group',
      admin: { description: 'Optional studio note / pull quote shown below stats.' },
      fields: [
        { name: 'quote', type: 'textarea' },
        { name: 'attribution', type: 'text', admin: { description: 'e.g. "Coderoach Studio · Operating note"' } },
      ],
    },
    {
      name: 'tenets',
      type: 'relationship',
      relationTo: 'tenets',
      hasMany: true,
      admin: { description: 'Principles shown on the right side. If empty, shows all tenets sorted by order.' },
    },
    {
      name: 'fullStudioLink',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'See the full studio' },
        { name: 'href', type: 'text', defaultValue: '/studio' },
      ],
    },
  ],
};
