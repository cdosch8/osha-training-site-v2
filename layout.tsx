import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OSHA Online Training",
  description: "Forklift • MEWP • Competent Person online training",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">{children}</body>
    </html>
  );
}
