import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PagePilot",
  description: "Section-driven, performance-first CMS",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <body suppressHydrationWarning>{children}</body>
  </html>
);

export default RootLayout;
