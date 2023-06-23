import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex justify-center pt-12">{children}</div>;
}
