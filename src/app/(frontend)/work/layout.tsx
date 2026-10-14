/**
 * /work renders the catalog (children) and, on a soft navigation to a project, the project in an
 * overlay on top of it (@modal). The URL is the project's own, so it can be shared, and Back closes
 * the overlay onto the same grid position. A hard load of /work/<slug> renders the full page.
 */
export default function WorkLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
