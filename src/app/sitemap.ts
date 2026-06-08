import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';
import { listBlogPosts } from '@/services/blog';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, '');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${base}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.8,
    },
  ];

  // Add every published blog post (best-effort — sitemap still works without)
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: posts } = await listBlogPosts({ publishedOnly: true, pageSize: 200 });
    blogRoutes = posts.map(post => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // ignore — blog table may not exist yet
  }

  return [...staticRoutes, ...blogRoutes];
}
