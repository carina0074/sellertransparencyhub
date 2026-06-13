import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { changelog } from "@/data/changelog";

const BASE_URL = "https://sellertransparency.com";

interface SitemapEntry {
  url: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { url: `${BASE_URL}/`, changefreq: "weekly", priority: "1.0" },
          { url: `${BASE_URL}/calculator`, changefreq: "weekly", priority: "0.9" },
          { url: `${BASE_URL}/health-check`, changefreq: "weekly", priority: "0.9" },
          { url: `${BASE_URL}/fees`, changefreq: "weekly", priority: "0.9" },
          { url: `${BASE_URL}/suspension-prevention`, changefreq: "monthly", priority: "0.8" },
          { url: `${BASE_URL}/impact-reports`, changefreq: "weekly", priority: "0.8" },
          { url: `${BASE_URL}/insights`, changefreq: "weekly", priority: "0.8" },
          { url: `${BASE_URL}/methodology`, changefreq: "monthly", priority: "0.8" },
          { url: `${BASE_URL}/policy-changes`, changefreq: "weekly", priority: "0.8" },
          { url: `${BASE_URL}/rate-card`, changefreq: "weekly", priority: "0.8" },
          { url: `${BASE_URL}/resources`, changefreq: "weekly", priority: "0.7" },
          { url: `${BASE_URL}/about`, changefreq: "monthly", priority: "0.6" },
          ...changelog.map((e) => ({
            url: `${BASE_URL}/changelog/${e.slug}`,
            changefreq: "monthly" as const,
            priority: "0.5",
            lastmod: e.updatedAt,
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${e.url}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});