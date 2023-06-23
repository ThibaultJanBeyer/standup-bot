import IconCopyright from "~icons/lucide/copyright";

export function SiteFooter() {
  return (
    <footer className="w-full border-t py-4">
      <div className="container flex items-center gap-1 text-sm text-muted-foreground">
        <IconCopyright /> SSB
      </div>
    </footer>
  );
}
