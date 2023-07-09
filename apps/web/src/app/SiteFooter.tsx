import { CopyrightIcon, GithubIcon } from "@ssb/ui/icons";

export function SiteFooter() {
  return (
    <footer className="fixed bottom-0 z-40 grid w-full grid-cols-[auto_1fr_auto] gap-10 p-4 text-xs">
      <div>
        <CopyrightIcon className="inline-block h-3 w-3" /> SSB
      </div>
      <div></div>
      <div>
        <a href="https://github.com/ThibaultJanBeyer/simple-standup-bot">
          <GithubIcon className="inline-block h-3 w-3" /> Github
        </a>
      </div>
    </footer>
  );
}
