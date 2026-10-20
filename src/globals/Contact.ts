import type { GlobalConfig } from 'payload';
import { revalidateHome } from '../lib/revalidate';

export const Contact: GlobalConfig = {
  slug: 'contact',
  admin: { group: 'Site Content' },
  access: { read: () => true },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    { name: 'sectionMarker', type: 'text', defaultValue: 'Start a project' },
    {
      name: 'heading',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text', required: true, defaultValue: 'Got something to ship?' },
        { name: 'line2Accent', type: 'text', required: true, defaultValue: "Let's talk." },
      ],
    },
    { name: 'lede', type: 'textarea', required: true },
    {
      name: 'scopes',
      type: 'array',
      maxRows: 6,
      admin: { description: 'Scope chip options' },
      fields: [{ name: 'scope', type: 'text', required: true }],
    },
    {
      name: 'formLabels',
      type: 'group',
      fields: [
        { name: 'email', type: 'text', defaultValue: '[ // YOUR EMAIL ]' },
        { name: 'scope', type: 'text', defaultValue: '[ // SCOPE ]' },
        { name: 'brief', type: 'text', defaultValue: '[ // WHAT ARE YOU SHIPPING? ]' },
        { name: 'submit', type: 'text', defaultValue: 'Send the brief' },
        { name: 'emailFallback', type: 'text', defaultValue: 'hello@coderoach.studio' },
      ],
    },
    { name: 'successHeading', type: 'text', defaultValue: 'Thanks, we got your brief.' },
  ],
};
