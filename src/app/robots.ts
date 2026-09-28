import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/features", "/about", "/pricing", "/contact", "/login", "/signup"],
        disallow: ["/admin/", "/dashboard/", "/api/"],
      },
    ],
    sitemap: "https://cyberguard-ai.vercel.app/sitemap.xml",
  };
}
