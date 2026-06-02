import React from "react";

interface SchemaProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
