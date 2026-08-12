import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppHeader } from "@/components/shell/app-header";

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
    <html lang="en">
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <div className="flex min-h-dvh">
            <AppSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <AppHeader />
              <main id="main" className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-6 py-6 lg:px-8">{children}</div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
