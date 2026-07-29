// Lawyer registry — 5 demo lawyers for LegalX web

export interface LawyerReview {
  author: string
  rating: number
  text: string
  date: string
}

export interface Lawyer {
  slug: string
  name: string
  initials: string
  avatarBg: string          // hex color for avatar background
  barNumber: string
  verified: boolean
  online: boolean
  specializations: string[]
  primarySpec: string
  experience: number
  location: string
  languages: string[]
  rating: number
  reviewCount: number
  casesHandled: number
  bio: string
  education: { degree: string; institution: string; year: number }[]
  expertise: string[]
  achievements: string[]
  fees: { chat: number; voice: number; video: number }
  reviews: LawyerReview[]
}

export const LAWYERS: Lawyer[] = [
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
    bio: 'Adv. Arjun Sharma is a senior criminal and civil litigator practising at the Delhi High Court and District Courts of Delhi. With over 14 years of courtroom experience, he has defended clients in serious criminal matters, consumer disputes, and civil suits. He is known for his detailed case analysis and client-first communication style.',
    education: [
      { degree: 'LLB', institution: 'Delhi University, Faculty of Law', year: 2009 },
      { degree: 'BA (Political Science)', institution: 'Kirori Mal College, Delhi University', year: 2006 },
    ],
    expertise: ['Criminal Defence', 'FIR Quashing', 'Bail Applications', 'Consumer Forum', 'Civil Suits', 'Police Complaints'],
    achievements: [
      'Delhi High Court Advocate',
      'District Bar Association Member',
      'Delhi Legal Aid Pro Bono Award 2021',
    ],
    fees: { chat: 20, voice: 30, video: 40 },
    reviews: [
      { author: 'Rajiv M.', rating: 5, text: 'Arjun Sir explained my FIR situation in plain language. Very professional and always responsive.', date: '2024-11-12' },
      { author: 'Priya D.', rating: 5, text: 'Got bail within 24 hours. Excellent advocate.', date: '2024-09-20' },
      { author: 'Karan S.', rating: 4, text: 'Good advice on consumer complaint. Could be a bit faster on follow-ups.', date: '2024-07-08' },
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
    bio: "Adv. Priya Mehta is one of Mumbai's most trusted family law advocates with a particular focus on matrimonial disputes, divorce proceedings, and child custody matters. Her empathetic approach and deep knowledge of the Hindu Marriage Act, Special Marriage Act, and Protection of Women from Domestic Violence Act have helped hundreds of families reach fair resolutions.",
    education: [
      { degree: 'LLM (Family Law)', institution: 'University of Mumbai', year: 2015 },
      { degree: 'LLB', institution: 'Government Law College, Mumbai', year: 2013 },
    ],
    expertise: ['Mutual Consent Divorce', 'Contested Divorce', 'Child Custody & Guardianship', 'Maintenance & Alimony', 'Domestic Violence Cases', 'Marriage Registration'],
    achievements: [
      'Bombay High Court Advocate',
      'Empanelled — Maharashtra State Legal Services Authority',
      'Top Women Advocates — Legal Era 2023',
    ],
    fees: { chat: 18, voice: 25, video: 35 },
    reviews: [
      { author: 'Sneha R.', rating: 5, text: "Priya Ma'am handled my divorce with such compassion. She was always available when I needed her.", date: '2024-12-01' },
      { author: 'Alok T.', rating: 5, text: 'Custody matter resolved amicably. Highly recommend.', date: '2024-10-15' },
      { author: 'Mina J.', rating: 5, text: 'Best family lawyer I consulted. Clear, direct, and caring.', date: '2024-08-22' },
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
    bio: "Adv. Rahul Verma is a corporate and startup lawyer based in Bengaluru with 11 years of experience advising founders, investors, and established companies on legal structure, compliance, and contracts. He has advised over 80 startups from seed stage to Series B on term sheets, ESOP policies, founders agreements, and regulatory matters.",
    education: [
      { degree: 'LLM (Corporate Law)', institution: 'National Law School of India University, Bangalore', year: 2013 },
      { degree: 'LLB', institution: 'National Law School of India University, Bangalore', year: 2012 },
    ],
    expertise: ["Founders' Agreements", 'Term Sheet Review', 'ESOP Structuring', 'Commercial Contracts', 'SEBI Compliance', 'Company Incorporation'],
    achievements: [
      'Karnataka Bar Council Member',
      'Advised 80+ startups',
      'Empanelled Startup Mentor — Startup India',
    ],
    fees: { chat: 25, voice: 40, video: 55 },
    reviews: [
      { author: 'Aditya F.', rating: 5, text: 'Rahul reviewed our term sheet overnight. Saved us from a terrible clause.', date: '2024-11-28' },
      { author: 'Pooja M.', rating: 4, text: 'Very knowledgeable on startup law. Explained ESOP clearly.', date: '2024-09-10' },
      { author: 'Siddharth K.', rating: 5, text: 'Best corporate lawyer for early-stage startups.', date: '2024-06-05' },
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
    bio: 'Adv. Deepak Gupta is one of the most experienced cheque bounce and money recovery lawyers in Uttar Pradesh. With 15 years of practice at the Allahabad High Court and district courts, he has handled over 2,200 cases under Section 138 of the Negotiable Instruments Act. His recovery rate is among the highest in the region.',
    education: [
      { degree: 'LLB', institution: 'Lucknow University', year: 2008 },
      { degree: 'BA (Economics)', institution: 'Lucknow University', year: 2005 },
    ],
    expertise: ['Section 138 NI Act', 'Legal Notice Drafting', 'Money Recovery Suits', 'Criminal Complaints', 'Fast Track Court', 'Injunction Applications'],
    achievements: [
      'Allahabad High Court Advocate',
      '2,200+ Section 138 cases handled',
      'UP Bar Council Life Member',
    ],
    fees: { chat: 15, voice: 22, video: 30 },
    reviews: [
      { author: 'Mukesh T.', rating: 5, text: 'Deepak ji recovered our full amount in 4 months. Best cheque bounce lawyer.', date: '2024-11-30' },
      { author: 'Shalini A.', rating: 5, text: 'Very experienced. Legal notice got the payment within days.', date: '2024-10-12' },
      { author: 'Arun G.', rating: 5, text: 'Straightforward and effective. Highly recommended.', date: '2024-09-05' },
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
    bio: 'Adv. Kavya Nair is a property and real estate law advocate practising at the Madras High Court. She represents buyers, sellers, and developers in RERA disputes, title verification, sale deed matters, and debt recovery. Her practical experience in Tamil Nadu\'s property market makes her a reliable advisor for homebuyers and investors.',
    education: [
      { degree: 'LLB', institution: 'School of Excellence in Law, Chennai', year: 2015 },
      { degree: 'BBA (Finance)', institution: 'Loyola College, Chennai', year: 2012 },
    ],
    expertise: ['RERA Complaints', 'Sale Deed Drafting', 'Title Verification', 'Property Disputes', 'Debt Recovery', 'NRI Property Matters'],
    achievements: [
      'Madras High Court Advocate',
      'TNRERA Registered Advocate',
      'Women in Law Award — Tamil Nadu Bar 2022',
    ],
    fees: { chat: 20, voice: 30, video: 42 },
    reviews: [
      { author: 'Balan K.', rating: 5, text: 'Kavya handled our RERA complaint perfectly. Very calm and professional.', date: '2024-12-08' },
      { author: 'Shanthi M.', rating: 4, text: 'Good property lawyer. Helped in resolving title dispute.', date: '2024-10-25' },
      { author: 'Jayesh N.', rating: 5, text: 'Excellent — resolved our NRI property matter quickly.', date: '2024-08-30' },
    ],
  },
]

export const SPECIALIZATIONS = [
  'All',
  'Criminal & Civil Law',
  'Family & Divorce Law',
  'Corporate & Startup Law',
  'Cheque Bounce & Money Recovery',
  'Property & Real Estate Law',
]

export function getLawyer(slug: string): Lawyer | undefined {
  return LAWYERS.find((l) => l.slug === slug)
}
