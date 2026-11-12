import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPM系統",
  description: "個人 RPM 系統",
};

/** 大標 Epilogue、中文 Noto Sans TC（Google Fonts）；內文 Switzer（Fontshare） */
const FONTS =
  "https://fonts.googleapis.com/css2?family=Epilogue:wght@500;600;700" +
  "&family=Noto+Sans+TC:wght@400;500;700&display=swap";
const SWITZER = "https://api.fontshare.com/v2/css?f[]=switzer@400,500,600&display=swap";

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
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="stylesheet" href={SWITZER} />
      </head>
      <body>{children}</body>
    </html>
  );
}
