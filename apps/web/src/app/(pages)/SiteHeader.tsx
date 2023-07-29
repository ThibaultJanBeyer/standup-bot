"use client";

import * as React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@ssb/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ssb/ui/dropdown-menu";
import { LogOutIcon, UserCircleIcon } from "@ssb/ui/icons";
import { Skeleton } from "@ssb/ui/skeleton";

export function SiteHeader() {
  const { data, status } = useSession();
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
              {status === "loading" ? (
                <>
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-28" />{" "}
                </>
              ) : data?.user ? (
                <>
                  <Button asChild variant="outline">
                    <Link href={`/standups`}>Standups</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <UserCircleIcon />
                        {data.user.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => signOut()}>
                        <LogOutIcon className="mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => signIn("slack")}
                  className="mr-5"
                >
                  Login with Slack
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <div className="mb-36"></div>
    </>
  );
}
