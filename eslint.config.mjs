import nextVitals from 'eslint-config-next/core-web-vitals';

// Next 16 dropped `next lint`; this is the same rule set as a flat config.
export default [
  ...nextVitals,
  { ignores: ['.next/**', '_legacy/**', 'public/**', 'src/app/(payload)/**', 'src/payload-types.ts'] },
];
