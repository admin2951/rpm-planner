import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPM系統",
  description: "個人 RPM 系統",
};

/** 英文與數字用緊排的 grotesk，中文用 Noto Sans TC */
const FONTS =
  "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400..600" +
  "&family=Noto+Sans+TC:wght@400;500&display=swap";

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
