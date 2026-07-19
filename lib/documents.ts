// Central service/document registry.
// Each slug maps to one route: /documents/[slug] and /request/[slug]

export interface DocumentFaq {
  q: string
  a: string
}

export interface RequiredDoc {
  id: string
  name: string
  desc: string
  required: boolean
  acceptedFormats: string
  iconKey: 'pan' | 'aadhaar' | 'biz-cert' | 'id-proof' | 'address' | 'bank' | 'auth-letter' | 'rent' | 'photo' | 'noc' | 'food-list' | 'logo' | 'pan-card' | 'udyam' | 'biz-proof'
}

export interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'number' | 'textarea'
  placeholder?: string
  options?: string[]
  required: boolean
  group: string
}

export interface DocumentPricing {
  drafting: number
  govtDuty: string
  platformFee: number
  total: string
}

export interface LegalDocument {
  slug: string
  title: string
  shortDesc: string
  tagline: string
  price: string
  duration: string
  legalAct: string
  definition: string
  definitionQuote: string
  definitionSource: string
  keyPoints: string[]
  benefits: string[]
  features: string[]
  faqs: DocumentFaq[]
  requiredDocs: RequiredDoc[]
  formFields: FormField[]
  pricing: DocumentPricing
  estimatedTime: string
}

export const DOCUMENTS: LegalDocument[] = [
  // ─── GST Filing ─────────────────────────────────────────────────────────────
  {
    slug: 'gst-registration',
    title: 'GST Registration',
    shortDesc: 'Register your business under GST and get your GSTIN within 7 working days.',
    tagline: 'Apply Online',
    price: 'From ₹1,499',
    duration: '7–10 working days',
    legalAct: 'Central Goods and Services Tax Act, 2017',
    estimatedTime: '~7 minutes',
    definition:
      'GST (Goods and Services Tax) Registration is mandatory for businesses with a turnover exceeding ₹40 lakh (₹20 lakh for service providers). It provides your business with a unique 15-digit GSTIN that enables you to collect tax from customers, claim input tax credit, and transact legally across India.',
    definitionQuote:
      '"Every supplier shall be liable to be registered under this Act in the State or Union territory from where he makes a taxable supply of goods or services." — CGST Act, 2017, Section 22',
    definitionSource: 'Central Goods and Services Tax Act, 2017',
    features: [
      'Mandatory for businesses above ₹40L turnover',
      'Enables Input Tax Credit (ITC) claims',
      'Required for e-commerce platform sales',
    ],
    keyPoints: [
      'Threshold limit — ₹40 lakh for goods, ₹20 lakh for services (₹10 lakh in special states)',
      'Composition Scheme — available for businesses up to ₹1.5 crore turnover',
      'GSTIN — unique 15-digit registration number issued by the GST portal',
      'Input Tax Credit — offset your purchase GST against your output GST liability',
      'Returns filing — GSTR-1, GSTR-3B to be filed monthly or quarterly',
      'Penalty for non-registration — ₹10,000 or 10% of tax due, whichever is higher',
    ],
    pricing: {
      drafting: 1499,
      govtDuty: 'Nil (Government fee waived)',
      platformFee: 0,
      total: '₹1,499',
    },
    benefits: [
      'Legally collect GST from customers and issue tax invoices',
      'Claim Input Tax Credit (ITC) on purchases to reduce tax burden',
      'Sell across all states without legal restrictions on inter-state trade',
      'List and sell on e-commerce platforms like Amazon, Flipkart, and Meesho',
      'Enhance business credibility with government-verified GSTIN',
      'Access government tenders and contracts that require GST registration',
    ],
    requiredDocs: [
      { id: 'pan', name: 'PAN Card of Applicant / Proprietor', desc: 'Permanent Account Number card of the business owner or authorized signatory.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'pan' },
      { id: 'aadhaar', name: 'Aadhaar Card', desc: 'Aadhaar of the proprietor, partners, or directors.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'aadhaar' },
      { id: 'biz-proof', name: 'Business Registration / Incorporation Certificate', desc: 'Partnership deed, Certificate of Incorporation, or any registration proof.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'biz-cert' },
      { id: 'director-id', name: 'Identity & Address Proof of Promoters / Directors', desc: 'Voter ID, Passport, or Driving Licence of all directors or partners.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'id-proof' },
      { id: 'biz-address', name: 'Address Proof of Place of Business', desc: 'Electricity bill, water bill, or property tax receipt of the principal place of business.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'address' },
      { id: 'bank-stmt', name: 'Bank Account Statement / Cancelled Cheque', desc: 'Bank statement or cancelled cheque showing your business bank account.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'bank' },
      { id: 'auth-letter', name: 'Letter of Authorization / Board Resolution', desc: 'Required for companies and LLPs to authorize a person for GST registration.', required: false, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'auth-letter' },
      { id: 'rent-agr', name: 'Rent Agreement (if PPOB is rented)', desc: 'Rental agreement of the principal place of business if the premises are not owned.', required: false, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'rent' },
    ],
    formFields: [
      { id: 'biz-name', label: 'Business / Trade Name', type: 'text', placeholder: 'Legal name of your business', required: true, group: 'Business Details' },
      { id: 'biz-type', label: 'Constitution of Business', type: 'select', options: ['Proprietorship', 'Partnership Firm', 'Private Limited Company', 'LLP', 'Hindu Undivided Family (HUF)', 'Trust / Society', 'Other'], required: true, group: 'Business Details' },
      { id: 'biz-category', label: 'Nature of Business', type: 'select', options: ['Manufacturer', 'Trader / Retailer / Wholesaler', 'Service Provider', 'E-commerce Operator', 'Works Contractor', 'Other'], required: true, group: 'Business Details' },
      { id: 'biz-address-field', label: 'Principal Place of Business Address', type: 'textarea', placeholder: 'Full address including pin code', required: true, group: 'Business Details' },
      { id: 'owner-name', label: 'Applicant / Proprietor Full Name', type: 'text', placeholder: 'As on PAN card', required: true, group: 'Applicant Details' },
      { id: 'owner-pan', label: 'PAN Number', type: 'text', placeholder: 'ABCDE1234F', required: true, group: 'Applicant Details' },
      { id: 'owner-aadhaar', label: 'Aadhaar Number', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true, group: 'Applicant Details' },
      { id: 'owner-mobile', label: 'Registered Mobile Number', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: true, group: 'Applicant Details' },
      { id: 'owner-email', label: 'Email Address', type: 'email', placeholder: 'business@example.com', required: true, group: 'Applicant Details' },
      { id: 'turnover', label: 'Approximate Annual Turnover', type: 'select', options: ['Below ₹20 lakh', '₹20–40 lakh', '₹40 lakh – 1 crore', '₹1 crore – 5 crore', 'Above ₹5 crore'], required: true, group: 'Additional Details' },
      { id: 'state', label: 'State of Registration', type: 'select', options: ['Bihar', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Jharkhand', 'Other'], required: true, group: 'Additional Details' },
    ],
    faqs: [
      { q: 'Who must register for GST?', a: 'Any business with an aggregate annual turnover exceeding ₹40 lakh for goods (₹20 lakh for services) must register. Certain businesses like e-commerce operators and inter-state suppliers must register regardless of turnover.' },
      { q: 'How long does GST registration take?', a: 'If documents are in order, GST registration is typically granted within 7 working days. The portal may ask for additional information, which can extend the timeline.' },
      { q: 'What is a GSTIN?', a: 'GSTIN is a 15-digit unique identification number assigned to every GST-registered entity. The first two digits indicate the state code, the next 10 are the PAN, and the last three identify the business type and check digit.' },
      { q: 'Can I apply for GST registration voluntarily?', a: 'Yes. Businesses below the threshold can voluntarily register for GST to avail Input Tax Credit and appear more credible to other registered businesses.' },
    ],
  },

  // ─── FSSAI Registration ──────────────────────────────────────────────────────
  {
    slug: 'fssai-registration',
    title: 'FSSAI Food License',
    shortDesc: 'Get your mandatory food business license from FSSAI to operate legally.',
    tagline: 'Apply Online',
    price: 'From ₹1,999',
    duration: '30–60 days',
    legalAct: 'Food Safety and Standards Act, 2006',
    estimatedTime: '~8 minutes',
    definition:
      'FSSAI (Food Safety and Standards Authority of India) registration or license is mandatory for all food business operators (FBOs) in India — including manufacturers, processors, traders, restaurants, and home-based food businesses. It ensures that food products meet quality and safety standards.',
    definitionQuote:
      '"No person shall commence or carry on any food business except under a licence." — Food Safety and Standards Act, 2006, Section 31',
    definitionSource: 'Food Safety and Standards Act, 2006',
    features: [
      'Mandatory for all food businesses in India',
      'Boosts consumer trust and brand credibility',
      'Required for selling on Swiggy, Zomato, Amazon',
    ],
    keyPoints: [
      'Basic Registration — for FBOs with turnover below ₹12 lakh (Form A)',
      'State License — for turnover ₹12 lakh to ₹20 crore (Form B)',
      'Central License — for turnover above ₹20 crore, exporters, and large manufacturers',
      'Validity — 1 to 5 years, renewable before expiry',
      'Penalty for non-compliance — up to ₹5 lakh fine and business closure',
      'Mandatory display — 14-digit FSSAI license number on all food products and premises',
    ],
    pricing: {
      drafting: 1999,
      govtDuty: 'Included in package',
      platformFee: 0,
      total: '₹1,999',
    },
    benefits: [
      'Operate your food business fully legally under Indian law',
      'Build consumer trust with the official FSSAI logo on your products',
      'Sell on Swiggy, Zomato, Amazon Fresh and other delivery platforms',
      'Expand to new states and markets with a valid food license',
      'Avoid penalties up to ₹5 lakh and business closure orders',
      'Access government food-sector subsidies and schemes',
    ],
    requiredDocs: [
      { id: 'passport-photo', name: 'Passport-size Photograph of Applicant', desc: 'Recent passport-size photograph of the food business operator.', required: true, acceptedFormats: 'JPG, PNG (Max 2MB)', iconKey: 'photo' },
      { id: 'id-proof', name: 'Identity Proof', desc: 'Aadhaar card, Voter ID, or PAN card of the applicant.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'id-proof' },
      { id: 'address-proof', name: 'Address Proof of Business Premises', desc: 'Electricity bill, rent agreement, or property tax receipt of the food business location.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'address' },
      { id: 'noc-owner', name: 'NOC from Property Owner (if rented)', desc: 'No Objection Certificate from the building owner if the premises are rented.', required: false, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'noc' },
      { id: 'biz-constitution', name: 'Business Constitution Document', desc: 'Partnership deed, Certificate of Incorporation, or MOA/AOA for companies.', required: false, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'biz-cert' },
      { id: 'food-list', name: 'List of Food Products to be Manufactured / Sold', desc: 'Required for State and Central license applications.', required: false, acceptedFormats: 'PDF, DOCX (Max 5MB)', iconKey: 'food-list' },
    ],
    formFields: [
      { id: 'fbo-name', label: 'Food Business Operator (FBO) Name', type: 'text', placeholder: 'Individual or company name', required: true, group: 'Business Details' },
      { id: 'biz-type', label: 'Type of Food Business', type: 'select', options: ['Restaurant / Dhaba / Café', 'Home-based Food Business', 'Food Manufacturer / Processor', 'Trader / Retailer / Wholesaler', 'Food Importer / Exporter', 'Cloud Kitchen / Delivery', 'Catering Service', 'Sweet Shop / Bakery'], required: true, group: 'Business Details' },
      { id: 'license-type', label: 'License Type Required', type: 'select', options: ['Basic Registration (Turnover < ₹12L)', 'State License (Turnover ₹12L – ₹20Cr)', 'Central License (Turnover > ₹20Cr or Exporter)'], required: true, group: 'Business Details' },
      { id: 'biz-address', label: 'Address of Food Business Premises', type: 'textarea', placeholder: 'Full address with pin code', required: true, group: 'Business Details' },
      { id: 'applicant-name', label: 'Applicant Full Name', type: 'text', placeholder: 'As on Aadhaar card', required: true, group: 'Applicant Details' },
      { id: 'applicant-mobile', label: 'Mobile Number', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: true, group: 'Applicant Details' },
      { id: 'applicant-email', label: 'Email Address', type: 'email', placeholder: 'contact@example.com', required: true, group: 'Applicant Details' },
      { id: 'state', label: 'State', type: 'select', options: ['Bihar', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Jharkhand', 'Other'], required: true, group: 'Applicant Details' },
    ],
    faqs: [
      { q: 'Is FSSAI registration mandatory?', a: 'Yes. Under the Food Safety and Standards Act, 2006, every food business operator must register or obtain a license from FSSAI before commencing operations.' },
      { q: 'What is the difference between Registration and License?', a: 'Basic Registration is for small FBOs with turnover below ₹12 lakh. State License is for mid-sized operators (₹12 lakh to ₹20 crore). Central License is for large manufacturers, exporters, and multi-state operators.' },
      { q: 'How long is an FSSAI license valid?', a: 'An FSSAI license can be obtained for 1 to 5 years. It must be renewed before expiry to avoid penalties and business disruption.' },
      { q: 'Can I sell on food delivery apps without FSSAI?', a: 'No. Swiggy, Zomato, and Amazon require a valid FSSAI registration number for onboarding. All food products sold online must display the 14-digit FSSAI number.' },
    ],
  },

  // ─── Trademark Registration ──────────────────────────────────────────────────
  {
    slug: 'trademark-registration',
    title: 'Trademark Registration',
    shortDesc: 'Protect your brand name, logo, and slogan with legal trademark protection.',
    tagline: 'Apply Online',
    price: 'From ₹6,999',
    duration: '18–24 months',
    legalAct: 'Trade Marks Act, 1999',
    estimatedTime: '~10 minutes',
    definition:
      'Trademark Registration gives you exclusive legal rights over your brand name, logo, slogan, or any distinctive mark that identifies your goods and services. A registered trademark (® symbol) provides nationwide protection and enables you to take legal action against infringers.',
    definitionQuote:
      '"A trade mark means a mark capable of being represented graphically and which is capable of distinguishing the goods or services of one person from those of others." — Trade Marks Act, 1999, Section 2(zb)',
    definitionSource: 'Trade Marks Act, 1999',
    features: [
      'Exclusive rights to your brand name & logo',
      'Legal protection against copycats and infringers',
      '™ symbol right on filing, ® on registration',
    ],
    keyPoints: [
      'Classes — 45 trademark classes; register in the class relevant to your business',
      'Search — mandatory prior-art search before filing to avoid conflicts',
      'Priority — first-to-file system; earlier filings have stronger rights',
      'Duration — initial protection for 10 years, renewable indefinitely every 10 years',
      'Grounds for rejection — descriptive marks, generic words, conflict with existing marks',
      'Enforcement — registered trademark holder can sue for damages and seek injunction',
    ],
    pricing: {
      drafting: 6999,
      govtDuty: '₹4,500 per class (individuals/startups: ₹4,500; others: ₹9,000)',
      platformFee: 0,
      total: '₹6,999+',
    },
    benefits: [
      'Exclusive legal ownership of your brand name, logo, or slogan in India',
      'Use the ™ symbol immediately after filing your application',
      'Use the ® symbol upon full registration — strong market signal',
      'Sue for damages and seek injunctions against infringers and copycats',
      'License or franchise your brand to generate royalty revenue',
      'Protect your brand on e-commerce platforms under IP infringement policies',
    ],
    requiredDocs: [
      { id: 'applicant-id', name: "Applicant's Aadhaar / ID Proof", desc: 'Aadhaar card, Passport, or Voter ID of the trademark applicant.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'aadhaar' },
      { id: 'brand-logo', name: 'Brand Logo / Trademark Image', desc: 'High-resolution image of the logo or brand mark. JPEG format, 8cm x 8cm, 72 DPI.', required: true, acceptedFormats: 'JPG only (Max 2MB, 8cm×8cm)', iconKey: 'logo' },
      { id: 'biz-proof', name: 'Business Registration Proof', desc: 'Certificate of Incorporation, GST registration, or any government registration document.', required: false, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'biz-proof' },
      { id: 'pan', name: 'PAN Card', desc: 'PAN card of the individual or company for verification.', required: true, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'pan-card' },
      { id: 'udyam', name: 'Udyam / MSME Registration Certificate', desc: 'Required if applying as a startup or MSME to avail discounted government fee (₹4,500 instead of ₹9,000).', required: false, acceptedFormats: 'PDF, JPG, PNG (Max 5MB)', iconKey: 'udyam' },
    ],
    formFields: [
      { id: 'brand-name', label: 'Brand / Trademark Name', type: 'text', placeholder: 'The exact name to be trademarked', required: true, group: 'Trademark Details' },
      { id: 'brand-desc', label: 'Description of Goods / Services', type: 'textarea', placeholder: 'What products or services does this brand cover? e.g. Clothing, footwear, and headgear.', required: true, group: 'Trademark Details' },
      { id: 'tm-class', label: 'Trademark Class', type: 'select', options: ['Class 1 – Chemicals', 'Class 3 – Cosmetics & Cleaning Products', 'Class 5 – Pharmaceuticals', 'Class 9 – Software & Electronics', 'Class 16 – Stationery & Paper Goods', 'Class 25 – Clothing & Apparel', 'Class 29 – Meat, Fish, Dairy', 'Class 30 – Staple Foods (Atta, Tea, etc.)', 'Class 32 – Beverages (Non-alcoholic)', 'Class 35 – Advertising & Business Services', 'Class 36 – Finance & Insurance', 'Class 41 – Education & Entertainment', 'Class 42 – IT & Software Services', 'Class 43 – Food & Beverage Services', 'Class 44 – Medical & Veterinary Services', 'Other (please specify in description)'], required: true, group: 'Trademark Details' },
      { id: 'applicant-type', label: 'Applicant Type', type: 'select', options: ['Individual', 'Startup / MSME (registered)', 'Private Limited Company', 'LLP', 'Partnership Firm', 'Other'], required: true, group: 'Applicant Details' },
      { id: 'applicant-name', label: 'Applicant Full Name / Company Name', type: 'text', placeholder: 'Legal name as on registration', required: true, group: 'Applicant Details' },
      { id: 'applicant-address', label: 'Applicant Address', type: 'textarea', placeholder: 'Full registered address', required: true, group: 'Applicant Details' },
      { id: 'applicant-email', label: 'Email Address', type: 'email', placeholder: 'contact@yourbrand.com', required: true, group: 'Applicant Details' },
      { id: 'applicant-mobile', label: 'Mobile Number', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: true, group: 'Applicant Details' },
      { id: 'state', label: 'State of Business', type: 'select', options: ['Bihar', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Jharkhand', 'Other'], required: true, group: 'Applicant Details' },
    ],
    faqs: [
      { q: 'What can be trademarked in India?', a: 'Any distinctive mark that identifies the source of goods or services — including brand names, logos, slogans, shapes, and colors — can be trademarked, provided it is not descriptive, generic, or identical to an existing mark.' },
      { q: 'How long does trademark registration take?', a: 'The complete process takes 18–24 months. However, you can use the ™ symbol immediately on filing. The ® symbol can only be used after full registration.' },
      { q: 'What is a trademark class?', a: 'The international Nice Classification divides goods and services into 45 classes. Your trademark is protected only in the class(es) you apply for. A separate fee applies for each class.' },
      { q: 'What happens if my trademark is opposed?', a: 'After publication in the Trademark Journal, third parties have 4 months to oppose. If opposed, our legal team manages the opposition proceedings on your behalf.' },
    ],
  },
]

export function getDocument(slug: string): LegalDocument | undefined {
  return DOCUMENTS.find((d) => d.slug === slug)
}
