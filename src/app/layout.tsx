import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

// IBM Plex Sans KR genuinely carries Hangul, so it stays — it is the Korean
// locale's typeface, not just a latin face with a KR name. What it cannot do
// is preload: the family ships ~390 unicode-range slices, and letting Next
// emit a <link rel="preload"> for each put 284 preload tags in the document.
// With preload off, the browser fetches only the slices the page's actual
// glyphs need (a handful), which is what unicode-range is for.
const plexKr = IBM_Plex_Sans_KR({
  variable: "--font-plex-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quant Trading — Personal Automated Trading Engine",
  description:
    "A public portfolio of a personal automated trading engine running multiple strategies across Korea and US market hours. Paper-trading results published as measured, unedited.",
};

// Matches the page background in each scheme, so the mobile browser chrome
// never sits against a colour the page does not use.
export const viewport: Viewport = {
  // Light is the default look for every visitor (the page does not follow the
  // OS scheme), so the browser chrome matches the light ground unless the
  // visitor has explicitly chosen dark — which the init script re-stamps.
  themeColor: "#ffffff",
};

// Runs before paint. Two jobs:
//  1. Re-apply an explicitly chosen theme so there is no flash of the wrong
//     one. Light is the default; the OS scheme is deliberately not followed.
//  2. Mark the document as JavaScript-capable, which is what arms the
//     scroll-reveal styles — without it every [data-reveal] block stays fully
//     visible, so a no-JS render is complete rather than blank.
const bootScript = `
(function () {
  var d = document.documentElement;
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      d.setAttribute("data-theme", stored);
      if (stored === "dark") {
        var m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute("content", "#0a0b0d");
      }
    }
  } catch (e) {}
  d.classList.add("reveal-ready");
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexKr.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
