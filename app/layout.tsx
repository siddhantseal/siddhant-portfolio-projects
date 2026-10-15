import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siddhant Seal | Full Stack Projects",
  description: "Live proof projects for Siddhant Seal: e-commerce and collaborative task management."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
