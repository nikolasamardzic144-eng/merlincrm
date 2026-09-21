import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Servis CRM",
  description: "Kontrolni panel za praćenje klijenata i servisa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
