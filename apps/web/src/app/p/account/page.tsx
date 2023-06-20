"use client";

import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="mb-12 flex justify-center pt-12">
      <UserProfile />
    </div>
  );
}
