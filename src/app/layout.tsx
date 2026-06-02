import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board Tasks - Manage Your Projects Efficiently",
  description:
    "Board Tasks is a modern project management tool that helps teams organize, track, and complete tasks efficiently. Built with Next.js and Prisma.",
  keywords: ["project management", "task board", "team collaboration", "productivity"],
  authors: [{ name: "Board Tasks Team" }],
  creator: "Board Tasks",
  publisher: "Board Tasks",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://example.com",
    siteName: "Board Tasks",
    title: "Board Tasks - Manage Your Projects Efficiently",
    description:
      "Board Tasks is a modern project management tool that helps teams organize, track, and complete tasks efficiently.",
    images: [
      {
        url: "https://example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Board Tasks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Board Tasks - Manage Your Projects Efficiently",
    description:
      "Board Tasks is a modern project management tool that helps teams organize, track, and complete tasks efficiently.",
    images: ["https://example.com/og-image.png"],
    creator: "@boardtasks",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  },
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="x-ua-compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://example.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
