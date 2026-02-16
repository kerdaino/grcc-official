// This is the main layout wrapper for the whole site.
// Everything you put here shows on all pages.

import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";



export const metadata: Metadata = {
  title: "Gloryrealm Christian Centre",
  description: "Welcome to Gloryrealm Christian Centre",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome CDN (Option B) */}
        <link
           rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    referrerPolicy="no-referrer"
        />
      </head>

      <body className="bg-white text-slate-900">
        <Navbar />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}

