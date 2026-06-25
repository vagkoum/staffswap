// ─────────────────────────────────────────────────────────────────
// 👉 THIS IS YOUR CUSTOMISATION FILE
//    Edit the values below to define what is traded on your platform
//    No other file needs to be changed.
// ─────────────────────────────────────────────────────────────────

export const TRADE_CONFIG = {
  // The name of your platform
  platformName: 'Chiron',

  // What is a single listing called? (singular and plural)
  listingName: 'listing',
  listingNamePlural: 'listings',

  // The main noun being traded (e.g. "staff", "shift", "service", "skill")
  tradeNoun: 'idea',
  tradeNounPlural: 'ideas',

  // Label for the "what you offer" field
  offerLabel: 'Who or what are you offering?',
  offerPlaceholder: 'e.g. A senior UX designer available for 3 months',

  // Label for the "what you want in return" field
  seekLabel: 'What are you looking for in return?',
  seekPlaceholder: 'e.g. A backend developer with Python experience',

  // Categories users can pick from when posting
  categories: [
    'Design & Creative',
    'Engineering & Tech',
    'Marketing & Content',
    'Operations & Admin',
    'Finance & Legal',
    'Sales & Customer Success',
    'Healthcare',
    'Hospitality & Events',
    'Education & Training',
    'Other',
  ],

  // Availability options
  availabilityOptions: [
    'Immediately',
    '1 week',
    '2 weeks',
    '1 month',
    '2 months',
    '3 months',
    '6 months',
    'Flexible',
  ],

  // Trade type options
  tradeTypes: [
    { value: 'barter', label: 'Barter (no money)' },
    { value: 'paid', label: 'Paid trade' },
    { value: 'both', label: 'Open to both' },
  ],

  // Hero tagline on the home page
  heroTagline: 'Trade talent, not money.',
  heroSubtitle: 'Connect with businesses and individuals to swap staff, skills, and services.',
}
