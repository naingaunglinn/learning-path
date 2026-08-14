import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppHeader } from "@/components/shell/app-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Career Command Center",
    template: "%s · Career Command Center",
  },
  description:
    "Weekly planning and resume-evidence mining for the 18-month EU relocation plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Skip to content
          </a>
          {/* App frame: dark shell with the content as a rounded sheet floating
              on it. Desktop scrolls inside the sheet; mobile stays full-bleed
              with normal document scroll. */}
          <div className="flex min-h-dvh bg-background md:h-dvh md:overflow-hidden md:bg-sidebar md:p-2">
            <AppSidebar />
            <div className="flex min-w-0 flex-1 flex-col bg-background md:h-full md:overflow-hidden md:rounded-2xl">
              <AppHeader />
              <main id="main" className="flex-1 md:min-h-0 md:overflow-y-auto">
                <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8">{children}</div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
