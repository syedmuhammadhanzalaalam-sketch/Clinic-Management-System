"use client";

import { Nav } from "@/components/Nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Nav />
      <main className="container">{children}</main>
    </div>
  );
}
