"use client";

import LMSSidebar from "./LMSSidebar";

export default function LMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <LMSSidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}