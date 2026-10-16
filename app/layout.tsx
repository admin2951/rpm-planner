import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPM系統",
  description: "個人 RPM 系統",
};

/** 標題襯線 + 內文細體無襯線，中英文各一套 */
const FONTS =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300..600" +
  "&family=Instrument+Serif:ital@0;1" +
  "&family=Noto+Sans+TC:wght@300;400;500;700" +
  "&family=Noto+Serif+TC:wght@400;500;600&display=swap";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
