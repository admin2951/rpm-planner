import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPM系統",
  description: "個人 RPM 系統",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
