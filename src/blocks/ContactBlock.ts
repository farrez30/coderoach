import type { Block } from 'payload';

export const ContactBlock: Block = {
  slug: 'contact',
  labels: { singular: 'Contact form', plural: 'Contact forms' },
  fields: [
    {
      name: 'sectionMarker',
      type: 'text',
      defaultValue: '[ CONTACT ]',
      admin: { description: 'Small mono label above heading.' },
    },
    {
      name: 'heading',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text', required: true, admin: { description: 'First line (plain).' } },
        { name: 'line2Accent', type: 'text', required: true, admin: { description: 'Second line (electric blue accent).' } },
      ],
    },
    {
      name: 'lede',
      type: 'textarea',
      required: true,
      admin: { description: 'Subheadline beneath the form heading.' },
    },
    {
      name: 'scopes',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      admin: { description: 'Project type chips users can select.' },
      fields: [{ name: 'scope', type: 'text', required: true }],
    },
    {
      name: 'formLabels',
      type: 'group',
      admin: { description: 'Form field labels, keep short.' },
      fields: [
        { name: 'submit', type: 'text', defaultValue: 'Send the brief' },
        { name: 'emailFallback', type: 'text', defaultValue: 'hello@example.com', admin: { description: 'Shown as "or email …"' } },
      ],
    },
    {
      name: 'successHeading',
      type: 'text',
      defaultValue: 'Thanks, we got your brief.',
    },
  ],
};
