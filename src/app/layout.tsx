import type { Metadata } from "next";
import "temporal-polyfill/full/global";
import "./globals.css";

export const metadata: Metadata = {
  title: "atelier — Your commerce workspace",
  description: "Create your online store. Manage everything in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
