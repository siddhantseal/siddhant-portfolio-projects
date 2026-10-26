import type { Metadata } from "next";
import { Albert_Sans, Alumni_Sans } from "next/font/google";
import "./globals.css";

const bodyFont = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const displayFont = Alumni_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "SealCart | Online Shopping Store",
  description: "A professional e-commerce storefront with product browsing, cart, checkout, and customer pages."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('sealcart-theme')==='dark'){document.documentElement.classList.add('themeDark')}}catch(e){}"
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
