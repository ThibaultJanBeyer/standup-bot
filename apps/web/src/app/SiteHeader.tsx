"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

import { Button } from "@ssb/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ssb/ui/dropdown-menu";
import { Skeleton } from "@ssb/ui/skeleton";

import IconLogout from "~icons/lucide/log-out";
import IconMoon from "~icons/lucide/moon";
import IconSettings from "~icons/lucide/settings";
import IconSun from "~icons/lucide/sun";
import IconUserCircle from "~icons/lucide/user-circle";

export function SiteHeader() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const { replace } = useRouter();

  React.useEffect(() => {
    if (isSignedIn)
      fetch("/api/me", {
        method: "GET",
        credentials: "include",
      })
        .then((ok) => console.info("ME", ok))
        .catch((err) => {
          console.error(err);
        });
  }, [isSignedIn]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/`}>SSB</Link>
        </Button>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {isLoaded ? (
              isSignedIn ? (
                <>
                  <Button asChild variant="secondary">
                    <Link href={`/standups`}>Standups</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <IconUserCircle />
                        {user.fullName || user.emailAddresses[0].emailAddress}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/account">
                          <IconSettings className="mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => signOut().then(() => replace(`/`))}
                      >
                        <IconLogout className="mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button asChild>
                    <Link href={`/auth/sign-in`}>Login</Link>
                  </Button>
                </>
              )
            ) : (
              <>
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-28" />{" "}
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <IconSun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <IconMoon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
