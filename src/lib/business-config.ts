/**
 * Business Config — dynamically loaded from business.json
 * This is the single source of truth for all client-facing content.
 * Clients edit business.json, run /business-init, and the landing page updates automatically.
 */

import businessData from '../../business.json' with { type: 'json' };

export const businessConfig = {
  // Core business info
  name: businessData.business.name || 'Dann Digital',
  tagline: businessData.business.tagline || 'Help small businesses go digital.',
  description: businessData.business.description || 'Build beautiful websites, capture leads, manage teams.',
  industry: businessData.business.industry || 'Digital Services',
  vertical: businessData.business.vertical || 'general',

  // Branding
  branding: {
    primaryColor: businessData.branding.primaryColor || '#7C5CFF',
    accentColor: businessData.branding.accentColor || '#5B3FE0',
    logoUrl: businessData.branding.logoUrl || null,
  },

  // Contact information
  contact: {
    email: businessData.contact.email || 'hello@example.com',
    phone: businessData.contact.phone || '(555) 123-4567',
    address: businessData.contact.address || '123 Business Street, City, State',
    website: businessData.contact.website || 'https://danndigital.vercel.app',
    googleMapsUrl: businessData.contact.googleMapsUrl || null,
  },

  // Business hours
  hours: businessData.hours || {
    monday: '9:00 AM – 5:00 PM',
    tuesday: '9:00 AM – 5:00 PM',
    wednesday: '9:00 AM – 5:00 PM',
    thursday: '9:00 AM – 5:00 PM',
    friday: '9:00 AM – 5:00 PM',
    saturday: 'Closed',
    sunday: 'Closed',
  },

  // Social links
  socials: {
    twitter: businessData.socials.twitter || null,
    instagram: businessData.socials.instagram || null,
    linkedin: businessData.socials.linkedin || null,
    facebook: businessData.socials.facebook || null,
    youtube: businessData.socials.youtube || null,
  },

  // Social proof metrics (displayed on landing)
  socialProof: {
    rating: businessData.socialProof.rating || '4.9',
    ratingSource: businessData.socialProof.ratingSource || 'Google',
    customers: businessData.socialProof.customers || '500+',
    yearsInBusiness: businessData.socialProof.yearsInBusiness || '10',
  },

  // SEO metadata
  seo: {
    keywords: businessData.seo.keywords || ['small business', 'web design', 'digital presence'],
    ogImage: businessData.seo.ogImage || null,
    twitterHandle: businessData.seo.twitterHandle || null,
  },

  // Deployment info
  deployment: {
    domain: businessData.deployment.domain || null,
    vercelProject: businessData.deployment.vercelProject || null,
    appId: businessData.deployment.appId || 'business-template',
  },

  // Supabase
  supabase: {
    organizationSlug: businessData.supabase.organizationSlug || null,
    projectRef: businessData.supabase.projectRef || null,
  },

  // Feature flags
  features: {
    blog: businessData.features.blog || false,
    gallery: businessData.features.gallery || false,
    testimonials: businessData.features.testimonials || true,
    pricing: businessData.features.pricing || true,
    contactForm: businessData.features.contactForm || true,
    teamPage: businessData.features.teamPage || false,
    analytics: businessData.features.analytics || false,
  },

  // Client info (if this is a white-label setup)
  client: {
    name: businessData.client.name || null,
    email: businessData.client.email || null,
    github: businessData.client.github || null,
  },

  // GitHub URL (for portfolio/creator repos — optional, from env or business.json)
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/Danncode10',
} as const;

export type BusinessConfig = typeof businessConfig;
