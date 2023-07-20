"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

import { Button } from "@ssb/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ssb/ui/dropdown-menu";
import { LogOutIcon, SettingsIcon, UserCircleIcon } from "@ssb/ui/icons";
import { Skeleton } from "@ssb/ui/skeleton";

export function SiteHeader() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const { replace } = useRouter();

  return (
    <>
      <header className="pointer-events-none fixed top-0 z-40 w-full">
        <div className="m-auto grid grid-cols-[auto_1fr_auto] p-4">
          <div className="pointer-events-auto">
            <Button asChild variant="ghost">
              <Link href={`/`}>SSB</Link>
            </Button>
          </div>
          <div></div>
          <div className="pointer-events-auto flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              {isLoaded ? (
                isSignedIn ? (
                  <>
                    <Button asChild variant="outline">
                      <Link href={`/standups`}>Standups</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <UserCircleIcon />
                          {user.fullName || user.externalAccounts[0]!.firstName}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/account">
                            <SettingsIcon className="mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => signOut().then(() => replace(`/`))}
                        >
                          <LogOutIcon className="mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    {/* <Button variant="outline" asChild className="mr-5">
                      <Link href={`/auth/sign-in`}>Login</Link>
                    </Button> */}
                  </>
                )
              ) : (
                <>
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-28" />{" "}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <div className="mb-36"></div>
    </>
  );
}
