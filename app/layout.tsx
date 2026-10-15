import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SealCart | Online Shopping Store",
  description: "A professional e-commerce storefront with product browsing, cart, checkout, and customer pages."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
