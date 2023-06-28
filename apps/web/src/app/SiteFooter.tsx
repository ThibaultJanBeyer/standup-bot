import { CopyrightIcon, GithubIcon } from "@ssb/ui/icons";

export function SiteFooter() {
  return (
    <footer className="grid w-full grid-cols-[auto_1fr_auto] gap-10 border-t p-4">
      <div>
        <CopyrightIcon className="inline-block" /> SSB
      </div>
      <div></div>
      <div>
        <a href="https://github.com/ThibaultJanBeyer/simple-standup-bot">
          <GithubIcon className="inline-block" /> Github
        </a>
      </div>
    </footer>
  );
}
