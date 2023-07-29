import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
