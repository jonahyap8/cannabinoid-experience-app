import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cannabinoid Experience Creator",
  description:
    "Blend strains. Explore terpene profiles. Predict experiences. For informational purposes only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
