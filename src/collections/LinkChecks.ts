import type { CollectionConfig } from 'payload';

/**
 * One row per probe of a project's link (ADR 0007). Written only by the checkLinks job through the
 * Local API, read only in the admin and by the server-rendered project page. Not versioned: a
 * probe every few hours would otherwise push real edits out of the version history.
 */
export const LinkChecks: CollectionConfig = {
  slug: 'link-checks',
  admin: {
    useAsTitle: 'url',
    defaultColumns: ['url', 'status', 'httpStatus', 'reason', 'checkedAt'],
    group: 'System',
    description: 'Live-link history for /work. Written by the checkLinks job; pruned after 90 days.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  graphQL: false,
  lockDocuments: false,
  fields: [
    { name: 'url', type: 'text', required: true, index: true },
    { name: 'project', type: 'relationship', relationTo: 'projects', index: true },
    {
      name: 'linkKind',
      type: 'select',
      options: ['live', 'demo', 'archive', 'repo'].map((value) => ({ label: value, value })),
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Hidup', value: 'hidup' },
        { label: 'Login', value: 'login' },
        { label: 'Mati', value: 'mati' },
      ],
    },
    { name: 'httpStatus', type: 'number' },
    { name: 'reason', type: 'text', admin: { description: 'Why it is mati or login (http-404, dns, timeout, blocked-…).' } },
    { name: 'finalUrl', type: 'text', admin: { description: 'Origin + path where the link ended up (no query string).' } },
    { name: 'title', type: 'text' },
    { name: 'durationMs', type: 'number' },
    { name: 'checkedAt', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
  ],
};
