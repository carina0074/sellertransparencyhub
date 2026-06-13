import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { changelog } from "@/data/changelog";

const BASE_URL = "https://sellertransparency.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/calculator", changefreq: "weekly", priority: "0.9" },
          { path: "/health-check", changefreq: "weekly", priority: "0.9" },
          { path: "/fees", changefreq: "weekly", priority: "0.9" },
          { path: "/suspension-prevention", changefreq: "monthly", priority: "0.8" },
          { path: "/impact-reports", changefreq: "weekly", priority: "0.8" },
          { path: "/insights", changefreq: "weekly", priority: "0.8" },
          { path: "/methodology", changefreq: "monthly", priority: "0.8" },
          { path: "/policy-changes", changefreq: "weekly", priority: "0.8" },
          { path: "/rate-card", changefreq: "weekly", priority: "0.8" },
          { path: "/resources", changefreq: "weekly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          ...changelog.map((e) => ({
            path: `/changelog/${e.slug}`,
            changefreq: "monthly" as const,
            priority: "0.5",
            lastmod: e.updatedAt,
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
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