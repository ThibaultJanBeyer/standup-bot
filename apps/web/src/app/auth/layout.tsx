export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-[100vh] w-full items-center align-middle">
      {children}
    </div>
  );
}
