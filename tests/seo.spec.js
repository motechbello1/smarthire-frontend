import { test, expect } from '@playwright/test';

// Automated SEO checks: every public page must have its own title,
// a useful description, a correct canonical URL and the right robots rule.

const SITE = 'https://smarthire-frontend-gamma.vercel.app';

const PUBLIC_PAGES = ['/', '/register', '/login'];
const NOINDEX_PAGES = ['/forgot-password', '/reset-password', '/verify-email'];

async function seoTags(page) {
  return page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    robots: document.querySelector('meta[name="robots"]')?.content || '',
    ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
    ogUrl: document.querySelector('meta[property="og:url"]')?.content || '',
  }));
}

test('public pages have unique titles, good descriptions and correct canonicals', async ({ page }) => {
  const titles = new Set();
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/$' : path}`));
    const tags = await seoTags(page);

    expect(tags.title, `title on ${path}`).toContain('SmartHire AI');
    expect(titles.has(tags.title), `duplicate title on ${path}`).toBe(false);
    titles.add(tags.title);

    expect(tags.description.length, `description length on ${path}`).toBeGreaterThanOrEqual(50);
    expect(tags.description.length, `description length on ${path}`).toBeLessThanOrEqual(160);

    const url = SITE + (path === '/' ? '/' : path);
    expect(tags.canonical).toBe(url);
    expect(tags.ogUrl).toBe(url);
    expect(tags.ogTitle).toBe(tags.title);
    expect(tags.robots).toBe('index, follow');
  }
});

test('one-time account pages are kept out of search results', async ({ page }) => {
  for (const path of NOINDEX_PAGES) {
    await page.goto(path);
    const tags = await seoTags(page);
    expect(tags.robots, `robots on ${path}`).toBe('noindex, nofollow');
  }
});

test('private pages send logged-out visitors to the login page', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('home page has exactly one H1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('home page has social preview tags and structured data', async ({ page, request }) => {
  await page.goto('/');
  const og = await page.evaluate(() => ({
    image: document.querySelector('meta[property="og:image"]')?.content,
    card: document.querySelector('meta[name="twitter:card"]')?.content,
    jsonLd: document.querySelector('script[type="application/ld+json"]')?.textContent,
  }));
  expect(og.card).toBe('summary_large_image');
  expect(og.image).toBe(`${SITE}/og-image.png`);
  const data = JSON.parse(og.jsonLd);
  expect(data['@type']).toBe('WebApplication');
  expect(data.name).toBe('SmartHire AI');

  const img = await request.get('/og-image.png');
  expect(img.status()).toBe(200);
  expect(img.headers()['content-type']).toContain('image/png');
});

test('robots.txt and sitemap.xml are served and agree', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  const r = await robots.text();
  expect(r).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  for (const p of ['/dashboard', '/cvs', '/jobs', '/rankings']) {
    expect(r).toContain(`Disallow: ${p}`);
  }

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const s = await sitemap.text();
  for (const path of PUBLIC_PAGES) {
    expect(s).toContain(`<loc>${SITE}${path === '/' ? '/' : path}</loc>`);
  }
});
