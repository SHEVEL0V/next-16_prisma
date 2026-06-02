import { Metadata } from "next";

interface PageMetadataProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string[];
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export function generatePageMetadata({
  title,
  description,
  canonical,
  ogImage,
  keywords,
}: PageMetadataProps): Metadata {
  return {
    title: `${title} | Board Tasks`,
    description,
    keywords,
    alternates: {
      canonical: canonical || siteUrl,
    },
    openGraph: {
      title: `${title} | Board Tasks`,
      description,
      url: canonical || siteUrl,
      type: "website",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Board Tasks`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export function generateStructuredData(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify(data),
  };
}
