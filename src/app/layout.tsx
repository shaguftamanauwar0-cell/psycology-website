import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const siteUrl = "https://psycology-website.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Shagufta Manauwar — A Safe Space to Be Heard",
  description:
    "Private listening and reflection sessions with Shagufta, a psychology student. A safe, respectful, non-judgmental space to talk things through. Free. Confidential. Not therapy.",
  keywords: [
    "listening sessions",
    "psychology student",
    "safe space",
    "reflection",
    "non-judgmental",
    "free consultation",
    "Shagufta Manauwar",
  ],
  authors: [{ name: "Shagufta Manauwar" }],
  openGraph: {
    title: "Shagufta Manauwar — A Safe Space to Be Heard",
    description:
      "Private listening and reflection sessions. A safe, respectful, non-judgmental space to talk. Free and confidential.",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Shagufta Manauwar — A Safe Space to Be Heard",
    description:
      "Private listening and reflection sessions. A safe, respectful, non-judgmental space to talk.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-body">
        {children}
      </body>
    </html>
  );
}
