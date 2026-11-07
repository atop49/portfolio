import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Chinese display face with a very heavy, poster-like weight. It ships as a
// local asset so the title never depends on a network font request.
const youshe = localFont({
  src: "./fonts/YouSheBiaoTiHei.woff2",
  variable: "--font-youshe",
  weight: "400",
  display: "swap",
  fallback: ["Impact", "sans-serif"],
});

export const metadata: Metadata = {
  title: "个人作品集",
  description: "电影胶片风格的个人作品站",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${jetBrainsMono.variable} ${youshe.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-paper">
        {children}
      </body>
    </html>
  );
}
