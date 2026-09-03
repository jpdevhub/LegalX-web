import { ApiLawyer, apiGetLawyers, apiGetLawyer } from './api'

// Re-export the ApiLawyer type as Lawyer for backwards compatibility
export type { ApiLawyer as Lawyer }

// Re-export for use in ApiLawyer reviews/education types
export type { LawyerReview, LawyerEducation } from './api'

export const SPECIALIZATIONS = [
  'All',
  'Criminal & Civil Law',
  'Family & Divorce Law',
  'Corporate & Startup Law',
  'Cheque Bounce & Money Recovery',
  'Property & Real Estate Law',
]

// ── Mock data fallback (used when backend is offline / during build) ──────────
const MOCK_LAWYERS: ApiLawyer[] = [
  {
    slug: 'adv-arjun-sharma',
    name: 'Adv. Arjun Sharma',
    initials: 'AS',
    avatarBg: '#1a3a5c',
    barNumber: 'D/2009/12345',
    verified: true,
    online: true,
    primarySpec: 'Criminal & Civil Law',
    specializations: ['Criminal Law', 'Civil Litigation', 'Consumer Court'],
    experience: 14,
    location: 'New Delhi',
    languages: ['Hindi', 'English'],
    rating: 4.8,
    reviewCount: 312,
    casesHandled: 1840,
    bio: 'Adv. Arjun Sharma is a senior criminal and civil litigator practising at the Delhi High Court and District Courts of Delhi. With over 14 years of courtroom experience, he has defended clients in serious criminal matters, consumer disputes, and civil suits.',
    education: [
      { degree: 'LLB', institution: 'Delhi University, Faculty of Law', year: 2009 },
      { degree: 'BA (Political Science)', institution: 'Kirori Mal College, Delhi University', year: 2006 },
    ],
    expertise: ['Criminal Defence', 'FIR Quashing', 'Bail Applications', 'Consumer Forum', 'Civil Suits'],
    achievements: ['Delhi High Court Advocate', 'District Bar Association Member', 'Delhi Legal Aid Pro Bono Award 2021'],
    fees: { chat: 20, voice: 30, video: 40 },
    reviews: [
      { author: 'Rajiv M.', rating: 5, text: 'Arjun Sir explained my FIR situation in plain language. Very professional.', date: '2024-11-12' },
      { author: 'Priya D.', rating: 5, text: 'Got bail within 24 hours. Excellent advocate.', date: '2024-09-20' },
    ],
  },
  {
    slug: 'adv-priya-mehta',
    name: 'Adv. Priya Mehta',
    initials: 'PM',
    avatarBg: '#7b2d3e',
    barNumber: 'M/2014/78901',
    verified: true,
    online: true,
    primarySpec: 'Family & Divorce Law',
    specializations: ['Family Law', 'Divorce & Matrimonial', 'Child Custody', 'Domestic Violence'],
    experience: 9,
    location: 'Mumbai',
    languages: ['Hindi', 'English', 'Marathi'],
    rating: 4.9,
    reviewCount: 489,
    casesHandled: 980,
    bio: "Adv. Priya Mehta is one of Mumbai's most trusted family law advocates. Her empathetic approach and deep knowledge of the Hindu Marriage Act have helped hundreds of families reach fair resolutions.",
    education: [
      { degree: 'LLM (Family Law)', institution: 'University of Mumbai', year: 2015 },
      { degree: 'LLB', institution: 'Government Law College, Mumbai', year: 2013 },
    ],
    expertise: ['Mutual Consent Divorce', 'Contested Divorce', 'Child Custody', 'Maintenance & Alimony', 'Domestic Violence Cases'],
    achievements: ['Bombay High Court Advocate', 'Empanelled — Maharashtra SLSA', 'Top Women Advocates — Legal Era 2023'],
    fees: { chat: 18, voice: 25, video: 35 },
    reviews: [
      { author: 'Sneha R.', rating: 5, text: "Priya Ma'am handled my divorce with such compassion. Always available.", date: '2024-12-01' },
      { author: 'Alok T.', rating: 5, text: 'Custody matter resolved amicably. Highly recommend.', date: '2024-10-15' },
    ],
  },
  {
    slug: 'adv-rahul-verma',
    name: 'Adv. Rahul Verma',
    initials: 'RV',
    avatarBg: '#2d3561',
    barNumber: 'K/2012/45678',
    verified: true,
    online: false,
    primarySpec: 'Corporate & Startup Law',
    specializations: ['Corporate Law', 'Startup Legal', 'Contract Drafting', 'SEBI Compliance'],
    experience: 11,
    location: 'Bengaluru',
    languages: ['English', 'Hindi', 'Kannada'],
    rating: 4.7,
    reviewCount: 203,
    casesHandled: 650,
    bio: 'Adv. Rahul Verma is a corporate and startup lawyer based in Bengaluru. He has advised over 80 startups from seed stage to Series B on term sheets, ESOP policies, founders agreements, and regulatory matters.',
    education: [
      { degree: 'LLM (Corporate Law)', institution: 'National Law School of India University, Bangalore', year: 2013 },
      { degree: 'LLB', institution: 'National Law School of India University, Bangalore', year: 2012 },
    ],
    expertise: ["Founders' Agreements", 'Term Sheet Review', 'ESOP Structuring', 'Commercial Contracts', 'SEBI Compliance'],
    achievements: ['Karnataka Bar Council Member', 'Advised 80+ startups', 'Empanelled Startup Mentor — Startup India'],
    fees: { chat: 25, voice: 40, video: 55 },
    reviews: [
      { author: 'Aditya F.', rating: 5, text: 'Rahul reviewed our term sheet overnight. Saved us from a terrible clause.', date: '2024-11-28' },
      { author: 'Pooja M.', rating: 4, text: 'Very knowledgeable on startup law. Explained ESOP clearly.', date: '2024-09-10' },
    ],
  },
  {
    slug: 'adv-deepak-gupta',
    name: 'Adv. Deepak Gupta',
    initials: 'DG',
    avatarBg: '#4a2c0a',
    barNumber: 'L/2008/11234',
    verified: true,
    online: true,
    primarySpec: 'Cheque Bounce & Money Recovery',
    specializations: ['Cheque Bounce', 'NI Act Section 138', 'Money Recovery', 'Civil Suits'],
    experience: 15,
    location: 'Lucknow',
    languages: ['Hindi', 'English'],
    rating: 4.9,
    reviewCount: 534,
    casesHandled: 2200,
    bio: 'Adv. Deepak Gupta is one of the most experienced cheque bounce and money recovery lawyers in Uttar Pradesh with 15 years of practice and over 2,200 cases under Section 138.',
    education: [
      { degree: 'LLB', institution: 'Lucknow University', year: 2008 },
    ],
    expertise: ['Section 138 NI Act', 'Legal Notice Drafting', 'Money Recovery Suits', 'Criminal Complaints', 'Fast Track Court'],
    achievements: ['Allahabad High Court Advocate', '2,200+ Section 138 cases handled', 'UP Bar Council Life Member'],
    fees: { chat: 15, voice: 22, video: 30 },
    reviews: [
      { author: 'Mukesh T.', rating: 5, text: 'Deepak ji recovered our full amount in 4 months. Best cheque bounce lawyer.', date: '2024-11-30' },
    ],
  },
  {
    slug: 'adv-kavya-nair',
    name: 'Adv. Kavya Nair',
    initials: 'KN',
    avatarBg: '#2a4a3e',
    barNumber: 'T/2015/89012',
    verified: true,
    online: false,
    primarySpec: 'Property & Real Estate Law',
    specializations: ['Property Law', 'RERA Disputes', 'Debt Recovery', 'Loan Disputes'],
    experience: 8,
    location: 'Chennai',
    languages: ['English', 'Tamil', 'Malayalam'],
    rating: 4.7,
    reviewCount: 184,
    casesHandled: 620,
    bio: "Adv. Kavya Nair is a property and real estate law advocate at the Madras High Court, representing buyers, sellers, and developers in RERA disputes and title matters.",
    education: [
      { degree: 'LLB', institution: 'School of Excellence in Law, Chennai', year: 2015 },
    ],
    expertise: ['RERA Complaints', 'Sale Deed Drafting', 'Title Verification', 'Property Disputes', 'NRI Property Matters'],
    achievements: ['Madras High Court Advocate', 'TNRERA Registered Advocate', 'Women in Law Award — Tamil Nadu Bar 2022'],
    fees: { chat: 20, voice: 30, video: 42 },
    reviews: [
      { author: 'Balan K.', rating: 5, text: 'Kavya handled our RERA complaint perfectly. Very calm and professional.', date: '2024-12-08' },
    ],
  },
]

/**
 * The demo advocates above are a development convenience only.
 *
 * Serving them in production is a real hazard: a visitor sees a lawyer who does
 * not exist, opens their profile, and tries to book a consultation with them.
 * Outside development the backend is the only source, and an empty result is
 * reported honestly as empty.
 */
const ALLOW_MOCKS = process.env.NODE_ENV === 'development'

/**
 * Fetch all lawyers. No Supabase or credentials involved in the frontend.
 */
export async function getLawyers(): Promise<ApiLawyer[]> {
  try {
    const lawyers = await apiGetLawyers()
    if (lawyers && lawyers.length > 0) return lawyers
  } catch (err) {
    console.warn('[getLawyers] Backend unavailable.', err)
  }
  return ALLOW_MOCKS ? MOCK_LAWYERS : []
}

/**
 * Fetch a single lawyer by slug.
 */
export async function getLawyer(slug: string): Promise<ApiLawyer | undefined> {
  try {
    const lawyer = await apiGetLawyer(slug)
    if (lawyer) return lawyer
  } catch {
    // Backend offline — fall through.
  }
  return ALLOW_MOCKS ? MOCK_LAWYERS.find((l) => l.slug === slug) : undefined
}
