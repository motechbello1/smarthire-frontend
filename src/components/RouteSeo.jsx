import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Per-page SEO for this single-page app. index.html holds the default tags
// that crawlers and link previews see first; this component updates the
// title, description, canonical URL, social tags and robots rule on every
// route change, so each page has its own values.

const SITE_URL = 'https://smarthire-frontend-gamma.vercel.app';
const SITE_NAME = 'SmartHire AI';

const PAGES = {
  '/': {
    title: 'SmartHire AI | Intelligent CV Screening for Nigerian Recruitment',
    description:
      'SmartHire AI screens and ranks CVs against your job requirements, so Nigerian recruiters and HR teams can shortlist the best candidates quickly.',
    index: true,
  },
  '/register': {
    title: 'Create an Account | SmartHire AI',
    description:
      'Sign up for SmartHire AI to upload CVs, post job requirements and get ranked candidate shortlists for your hiring.',
    index: true,
  },
  '/login': {
    title: 'Log In | SmartHire AI',
    description:
      'Log in to SmartHire AI to manage your jobs, upload CVs and view ranked candidate shortlists.',
    index: true,
  },
  '/forgot-password': {
    title: 'Reset Your Password | SmartHire AI',
    description: 'Request a password reset link for your SmartHire AI account.',
    index: false,
  },
  '/reset-password': {
    title: 'Choose a New Password | SmartHire AI',
    description: 'Set a new password for your SmartHire AI account.',
    index: false,
  },
  '/verify-email': {
    title: 'Verify Your Email | SmartHire AI',
    description: 'Confirm your email address to finish setting up your SmartHire AI account.',
    index: false,
  },
  '/dashboard': {
    title: 'Dashboard | SmartHire AI',
    description: 'Your SmartHire AI recruitment dashboard.',
    index: false,
  },
  '/cvs': {
    title: 'CV Management | SmartHire AI',
    description: 'Upload and manage candidate CVs.',
    index: false,
  },
  '/jobs': {
    title: 'Job Openings | SmartHire AI',
    description: 'Create and manage job openings and their requirements.',
    index: false,
  },
  '/rankings': {
    title: 'Candidate Rankings | SmartHire AI',
    description: 'See candidates ranked against each job.',
    index: false,
  },
};

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = PAGES[pathname] || PAGES['/'];
    const url = SITE_URL + (pathname === '/' ? '/' : pathname);

    document.title = page.title;
    setMeta('name', 'description', page.description);
    setMeta('name', 'robots', page.index ? 'index, follow' : 'noindex, nofollow');
    setCanonical(url);

    setMeta('property', 'og:title', page.title);
    setMeta('property', 'og:description', page.description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('name', 'twitter:title', page.title);
    setMeta('name', 'twitter:description', page.description);
  }, [pathname]);

  return null;
}
