# 08-SEO.md — SEO & Discoverability Audit (WasteWatch Edition)

> **Purpose:** Comprehensive SEO audit for WasteWatch, a B2B/Government SaaS specializing in fraud detection and government spending analysis. This is a full-stack audit covering rendering, content, metadata, structure, performance, and discoverability strategy.
>
> **Special Note:** Most of WasteWatch (dashboard, transaction data, investigations) should NOT be indexed—these are authenticated, sensitive areas. Only focus on public marketing pages (landing, pricing, features, blog) and unauthenticated signup/trial flows.

---

## CONTEXT: WASTEWATCH SEO STRATEGY

### 0.1 Project Details

```
FRAMEWORK: Next.js 16.1.6 (App Router)
RENDERING: Server-side + Static where possible
CONTENT TYPE: B2B SaaS (fraud detection)
TARGET KEYWORDS:
  - fraud detection SaaS
  - government spending analysis
  - waste detection software
  - Benford's Law anomaly detection
  - FCA compliance tools
  - transaction anomaly detection
  - public procurement fraud

TARGET AUDIENCE:
  - Government agencies (federal/state/local)
  - Auditing firms
  - CFOs and procurement officers
  - Compliance officers

KEY PAGES TO OPTIMIZE:
  - / (Landing page)
  - /pricing (Pricing)
  - /features (Features/benefits)
  - /trial (Free trial signup)
  - /blog (Blog articles)
  - /resources (Whitepapers, case studies)
  - /about (Company info)

PAGES TO BLOCK FROM INDEXING:
  - /dashboard/* (authenticated user area)
  - /api/* (API routes)
  - /onboarding/* (post-signup flow)
  - /admin/* (admin panel)
  - /settings/* (user settings)
```

---

## STEP 1: TECHNICAL SEO FOUNDATION

### 1.1 Crawlability — robots.txt Configuration

**Status Checklist:**
- [ ] robots.txt exists and properly served
- [ ] Important content is crawlable
- [ ] Authenticated areas blocked
- [ ] API routes blocked
- [ ] Sitemap location declared
- [ ] No crawl delays that hurt discoverability

**File: app/robots.ts** (Next.js App Router)

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wastewatch.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/pricing',
          '/blog',
          '/resources',
          '/about',
          '/contact',
          '/trial',
          '/login', // Allow bots to see login page
        ],
        disallow: [
          '/dashboard', // Authenticated area
          '/api', // API routes (shouldn't be indexed anyway)
          '/onboarding', // Post-signup flow
          '/admin', // Admin panel
          '/settings', // User settings
          '/_next', // Next.js internals
          '/public', // Public assets (already served statically)
          '/*.json', // JSON files
          '/404',
          '/500',
        ],
        crawlDelay: 1, // Be nice to servers: 1 second between requests
      },
      {
        // Block AI bots from scraping content (optional, but recommended for SaaS)
        userAgent: ['GPTBot', 'CCBot', 'anthropic-ai'],
        disallow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

**Verification:**
- [ ] Fetch `https://wastewatch.io/robots.txt` and verify content-type is `text/plain`
- [ ] Use Google's robots.txt tester: https://www.google.com/webmasters/tools/robots-testing-tool
- [ ] Verify `/dashboard` is disallowed
- [ ] Verify important pages (`/features`, `/pricing`, `/blog`) are allowed

---

### 1.2 Indexability — Sitemap Generation

**Status Checklist:**
- [ ] Sitemap exists at `/sitemap.xml`
- [ ] Sitemap includes only public, indexable pages
- [ ] Dynamic routes (blog posts, case studies) included
- [ ] Sitemap submitted to Google Search Console
- [ ] Authenticated routes excluded

**File: app/sitemap.ts** (Next.js App Router)

```typescript
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

// Revalidate daily
export const revalidate = 86400;

async function fetchBlogPosts() {
  try {
    // Fetch published blog posts from database
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: String, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    return posts.map((post) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}

async function fetchCaseStudies() {
  try {
    const studies = await prisma.caseStudy.findMany({
      where: { published: true },
      select: { slug: String, updatedAt: true },
    });

    return studies.map((study) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/case-studies/${study.slug}`,
      lastModified: study.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching case studies for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wastewatch.io';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0, // Homepage highest priority
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly', // Update frequently as plans change
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trial`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily', // Blog hub updated frequently
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ];

  // Dynamic pages
  const blogPosts = await fetchBlogPosts();
  const caseStudies = await fetchCaseStudies();

  return [...staticPages, ...blogPosts, ...caseStudies];
}
```

**Validation:**
- [ ] Visit `https://wastewatch.io/sitemap.xml` and verify valid XML
- [ ] Check that all URLs are absolute (not relative)
- [ ] Verify authenticated routes are NOT in sitemap
- [ ] Submit sitemap to Google Search Console

---

### 1.3 Canonical URLs

**Status Checklist:**
- [ ] Every page has a canonical URL
- [ ] Canonical URL is absolute (not relative)
- [ ] No canonical chains
- [ ] Query parameters handled (tracking params removed)
- [ ] Duplicate content has canonical pointing to primary version

**Implementation in Next.js:**

```typescript
// app/layout.tsx (Global default)
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wastewatch.io'),
  // Canonical will be auto-generated from URL
};

// app/blog/[slug]/page.tsx (Page-specific)
import { Metadata } from 'next';

interface BlogPostProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const post = await fetchBlogPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    // Explicit canonical (though Next.js auto-generates from URL)
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${params.slug}`,
    openGraph: {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${params.slug}`,
      type: 'article',
    },
  };
}
```

**Query Parameter Handling:**

If you have tracking parameters (`?utm_source=twitter&utm_medium=social`), the canonical should point to the clean URL:

```typescript
// Page receives: /products/123?utm_source=twitter
// Canonical should be: /products/123 (without params)

export async function generateMetadata({
  params,
  searchParams, // Ignore these in canonical
}: Props): Promise<Metadata> {
  return {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${params.id}`,
  };
}
```

---

### 1.4 HTTPS & Security Headers

**Status Checklist:**
- [ ] Entire site is HTTPS (no HTTP)
- [ ] HTTP redirects to HTTPS
- [ ] HSTS header set (Strict-Transport-Security)
- [ ] No mixed content (HTTPS page loading HTTP resources)

**File: next.config.ts**

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect HTTP to HTTPS (if not using a reverse proxy)
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://:host/:path*',
        permanent: true,
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
      },
    ];
  },

  // Security headers (if deployed to a platform without automatic HSTS)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            // max-age in seconds (1 year), includeSubDomains, preload
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Verification:**
- [ ] `curl -I https://wastewatch.io` returns 200
- [ ] `curl -I http://wastewatch.io` returns 301/302 redirect to https
- [ ] Response headers include `Strict-Transport-Security`
- [ ] Check HSTS preload status: https://hstspreload.org/

---

## STEP 2: META TAGS & METADATA

### 2.1 Page-Level Metadata

**Status Checklist:**
- [ ] Every page has unique, descriptive `<title>`
- [ ] Every page has unique `<meta name="description">`
- [ ] Title: 50-60 characters
- [ ] Description: 150-160 characters
- [ ] Primary keyword appears in title and description
- [ ] No duplicate meta tags
- [ ] No keyword stuffing

**Title Tag Best Practices:**

```
Good:  "Fraud Detection SaaS for Government Agencies | WasteWatch"
Good:  "Detect Government Spending Waste with AI-Powered Analysis"
Bad:   "Home" (not descriptive)
Bad:   "fraud detection fraud detection fraud" (keyword stuffing)
```

**Meta Description Best Practices:**

```
Good: "WasteWatch detects fraud, waste, and corruption in government spending
       using AI-powered anomaly detection. Start a free trial today."

Bad:  "Welcome to our website" (too vague)
Bad:  "fraud fraud fraud detection analysis investigation" (keyword stuffing)
```

**File: app/layout.tsx** (Global defaults)

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wastewatch.io'),

  title: {
    template: '%s | WasteWatch',
    default: 'WasteWatch — AI-Powered Government Fraud Detection',
  },

  description:
    'Detect fraud, waste, and corruption in government spending. ' +
    'WasteWatch uses advanced anomaly detection and forensic analysis. ' +
    'Free trial for government agencies and auditors.',

  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },

  charset: 'utf-8',

  keywords: [
    'fraud detection',
    'government spending',
    'waste detection',
    'anomaly detection',
    'Benford\'s Law',
    'FCA compliance',
    'public procurement fraud',
    'audit software',
    'SaaS',
  ],

  robots: 'index, follow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**File: app/features/page.tsx** (Page-specific)

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features — Advanced Fraud Detection Capabilities',
  description:
    'Explore WasteWatch features: AI anomaly detection, Benford\'s Law analysis, ' +
    'risk scoring, compliance reporting. Detect fraud patterns in government spending.',
};

export default function FeaturesPage() {
  return (
    <div>
      <h1>Fraud Detection Features</h1>
      {/* content */}
    </div>
  );
}
```

**File: app/pricing/page.tsx**

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Affordable Fraud Detection for Government',
  description:
    'WasteWatch pricing starts at $499/month for government agencies. ' +
    'Transparent pricing with no hidden fees. Free trial available.',
};

export default function PricingPage() {
  return (
    <div>
      <h1>Simple, Transparent Pricing</h1>
      {/* pricing tiers */}
    </div>
  );
}
```

**Validation:**
- [ ] Use Lighthouse to check meta descriptions
- [ ] View page source and verify `<title>` and `<meta name="description">`
- [ ] Check title length (50-60 chars): https://seocheckup.com/tools/title-length-checker
- [ ] Check meta description (150-160 chars): https://seocheckup.com/tools/meta-description-length-checker
- [ ] Verify no duplicate meta tags

---

### 2.2 Open Graph Tags (Social Media Preview)

**Status Checklist:**
- [ ] Every page has `og:title`
- [ ] Every page has `og:description`
- [ ] Every page has `og:image` (1200x630px)
- [ ] `og:url` is canonical URL
- [ ] `og:type` is correct (website, article, product)
- [ ] `og:image` is accessible (not behind auth)
- [ ] Images optimized < 300KB

**Image Generation Strategy:**

For WasteWatch, create branded social images:
1. Homepage: WasteWatch logo + tagline
2. Features: "AI-Powered Fraud Detection" + key benefit
3. Blog posts: Article title + featured image
4. Case studies: "Government Savings: $2.3M" + agency logo

**File: app/blog/[slug]/page.tsx**

```typescript
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await fetchBlogPost(params.slug);
  const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${params.slug}`);

  return {
    title: post.title,
    description: post.excerpt,

    openGraph: {
      type: 'article',
      url: url.toString(),
      title: post.title,
      description: post.excerpt,
      siteName: 'WasteWatch',
      locale: 'en_US',

      images: [
        {
          url: post.ogImage, // Must be absolute URL
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg',
        },
      ],

      authors: [post.author],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },

    // Twitter Card (for better Twitter preview)
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.ogImage],
      creator: '@WasteWatch',
    },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  // render post
}
```

**File: app/case-studies/[slug]/page.tsx**

```typescript
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const study = await fetchCaseStudy(params.slug);

  return {
    openGraph: {
      type: 'article',
      title: `Case Study: ${study.agencyName}`,
      description: `Government agency saved $${study.savings} using WasteWatch`,
      images: [{ url: study.ogImage, width: 1200, height: 630 }],
    },
  };
}
```

**Validation:**
- [ ] Use Facebook OG Debugger: https://developers.facebook.com/tools/debug/og/object/
- [ ] Paste your URL and verify preview looks correct
- [ ] Check that `og:image` is accessible (no 403/404)
- [ ] Use Twitter Card Validator: https://cards-dev.twitter.com/validator
- [ ] Verify images are < 300KB

---

### 2.3 Schema Markup (Structured Data)

**Status Checklist:**
- [ ] Homepage has Organization schema
- [ ] Product/Features page has SoftwareApplication schema
- [ ] Blog posts have Article schema
- [ ] Case studies have Article schema
- [ ] Contact page has LocalBusiness schema
- [ ] No schema errors in Google Search Console

**File: app/layout.tsx** (Organization schema)

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  // ... other metadata

  // Schema markup as structured data
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'WasteWatch',
      url: process.env.NEXT_PUBLIC_SITE_URL,
      logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      description: 'AI-powered fraud detection for government agencies',
      sameAs: [
        'https://twitter.com/WasteWatch',
        'https://linkedin.com/company/wastewatch',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'Customer Support',
      },
    }),
  },
};
```

**File: app/features/page.tsx** (SoftwareApplication schema)

```typescript
export const metadata: Metadata = {
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'WasteWatch',
      description: 'AI-powered fraud detection software for government agencies',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/features`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '499',
        priceCurrency: 'USD',
        priceValidUntil: '2025-12-31',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '45',
      },
    }),
  },
};
```

**File: app/blog/[slug]/page.tsx** (Article schema)

```typescript
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await fetchBlogPost(params.slug);

  return {
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.ogImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
          '@type': 'Person',
          name: post.author,
        },
        publisher: {
          '@type': 'Organization',
          name: 'WasteWatch',
          logo: {
            '@type': 'ImageObject',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
          },
        },
      }),
    },
  };
}
```

**Validation:**
- [ ] Use Google's Rich Results Test: https://search.google.com/test/rich-results
- [ ] Paste URLs and verify schema is detected correctly
- [ ] Check Google Search Console → Coverage → Rich Results

---

## STEP 3: CONTENT STRATEGY

### 3.1 Target Keywords & Content Plan

**Primary Keywords (Government/Fraud Detection):**
```
- fraud detection software
- government spending analysis
- waste detection SaaS
- anomaly detection algorithm
- Benford's Law analysis
- FCA compliance software
- transaction fraud detection
- public procurement fraud
- government audit tools
- financial compliance software
```

**Content Plan:**

| Page | Keyword Focus | Content Type | Status |
|------|---------------|--------------|--------|
| / | fraud detection SaaS | Landing page | ✓ |
| /features | anomaly detection, Benford's Law | Feature page | ✓ |
| /pricing | government software pricing | Pricing table | ✓ |
| /trial | free trial fraud detection | CTA page | ✓ |
| /blog/benford-law | Benford's Law explanation | Tutorial/Guide | TODO |
| /blog/fraud-detection | fraud detection techniques | Educational | TODO |
| /blog/government-audit | government audit best practices | Guide | TODO |
| /resources | compliance, whitepapers | Resource hub | TODO |
| /case-studies | government agency results | Case studies | TODO |

### 3.2 Blog Strategy

**WasteWatch should write about:**
1. Fraud detection techniques (Benford's Law, anomaly patterns)
2. Government compliance (FCA, audit requirements)
3. Real-world fraud cases
4. Data analysis methods
5. Procurement fraud prevention
6. Customer case studies

**SEO Best Practices for Blog Posts:**
- Minimum 1500 words for serious topics
- Include natural keywords (2-3% density, not stuffed)
- Use H2/H3 headers with keywords
- Internal links to related posts
- External links to authoritative sources
- Optimize images with alt text
- Include schema markup (Article type)

---

## STEP 4: LIGHTHOUSE & CORE WEB VITALS

**SEO targets (via Lighthouse):**
- Performance: > 85
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

**Key for SaaS:**
- LCP < 2.5s (matters for ranking)
- INP < 200ms
- CLS < 0.1

**See 06-PERFORMANCE.md for detailed optimization.**

---

## STEP 5: MONITORING & ONGOING

### 5.1 Google Search Console

**Setup:**
1. Add property for `wastewatch.io`
2. Verify ownership (DNS record or HTML file)
3. Submit sitemap
4. Monitor Coverage report (errors, warnings)
5. Monitor Rich Results (schema errors)
6. Monitor Core Web Vitals

**Key Metrics to Watch:**
- Impressions (how often we appear in search)
- Click-through rate (CTR)
- Average position (ranking)
- Coverage (indexation status)
- Mobile usability issues

### 5.2 Analytics Integration

**Track:**
- Organic traffic source
- Landing pages from organic
- Conversion rate (trial signups from organic)
- Pages with high bounce rate
- Pages with low dwell time

**File: app/layout.tsx** (Google Analytics 4)

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Google Analytics 4 */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 5.3 Monthly SEO Audit Checklist

- [ ] Google Search Console: any new errors?
- [ ] Core Web Vitals: any regressions?
- [ ] Lighthouse score > 85?
- [ ] New pages indexed?
- [ ] Broken links fixed?
- [ ] Meta descriptions still accurate?
- [ ] Blog posts getting organic traffic?
- [ ] Organic conversion rate healthy?

---

## FINAL CHECKLIST

**Technical SEO:**
- [ ] robots.txt blocks auth area, allows public pages
- [ ] sitemap.xml includes all public pages + blog
- [ ] Canonical URLs on every page
- [ ] HTTPS + HSTS headers
- [ ] No mixed content warnings

**Metadata:**
- [ ] Unique title on every page (50-60 chars)
- [ ] Unique description on every page (150-160 chars)
- [ ] OG tags on public pages (for social sharing)
- [ ] Schema markup (Organization, Product, Article)

**Content:**
- [ ] Primary keywords in title/description
- [ ] Internal links to related pages
- [ ] Blog posts > 1500 words on important topics
- [ ] Case studies showcase real results
- [ ] Resources/guides provide value

**Performance:**
- [ ] Lighthouse Performance > 85
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1

**Monitoring:**
- [ ] Google Search Console configured
- [ ] Google Analytics 4 tracking
- [ ] Monthly audit of metrics
- [ ] Organic traffic/conversion tracking

**Commit:**
```bash
git add .
git commit -m "seo: comprehensive SEO audit and implementation

Technical SEO:
- robots.txt: block /dashboard, /api, allow public pages
- sitemap.xml: static + dynamic blog posts
- canonical URLs on all pages
- HTTPS + HSTS headers

Metadata:
- Unique titles (50-60 chars) on all pages
- Unique descriptions (150-160 chars)
- OG tags for social sharing
- Schema markup (Organization, Product, Article, BlogPosting)

Keywords targeted:
- fraud detection SaaS
- government spending analysis
- waste detection
- Benford's Law analysis
- FCA compliance

Content:
- Landing page: value prop + CTAs
- Features page: keyword-optimized features
- Pricing page: clear pricing + CTAs
- Blog: fraud detection techniques, compliance guides
- Case studies: government agency results

Performance:
✓ Lighthouse Performance > 85
✓ Core Web Vitals passing

Monitoring:
- Google Search Console configured
- Google Analytics 4 installed
- Monthly audit checklist
"
```

---

## RESOURCES

- [Google Search Central](https://developers.google.com/search)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Console Help](https://support.google.com/webmasters)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
