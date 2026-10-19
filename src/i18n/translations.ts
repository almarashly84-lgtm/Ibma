import { ServiceItem, CompanyInfo, NavItem, WorkingHour } from '../types';

// Plain data only (no image imports) so the server can share these defaults.

export const COMPANY_INFO: CompanyInfo = {
  name: 'IBMA Accounting Ltd',
  subtitle: {
    ar: 'خدمات المحاسبة والضرائب الاحترافية للأفراد والشركات في كندا',
    en: 'Professional Tax & Accounting Services for Individuals and Businesses in Canada',
    fr: 'Services professionnels de fiscalité et comptabilité pour particuliers et entreprises'
  },
  address: '30 Concourse Gate Unit 102, Nepean, ON K2E 7V7, Canada',
  phone: '+1 (613) 880-0300',
  phoneClean: '+16138800300',
  whatsappUrl: 'https://wa.me/16138800300',
  email: 'info@ibmaaccounting.ca',
  facebookUrl: 'https://www.facebook.com/ibmaaccounting',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2804.283182858169!2d-75.7262456!3d45.3430154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce068f6bfdae1f%3A0xc3dc8369527ecb82!2s30%20Concourse%20Gate%20unit%20102%2C%20Nepean%2C%20ON%20K2E%207V7!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca',
  workingHours: {
    weekdays: {
      ar: 'الإثنين - الجمعة: 10:00 صباحاً - 6:00 مساءً',
      en: 'Monday - Friday: 10:00 AM - 6:00 PM',
      fr: 'Lundi - Vendredi: 10h00 - 18h00'
    },
    saturday: {
      ar: 'السبت: 10:00 صباحاً - 4:00 مساءً',
      en: 'Saturday: 10:00 AM - 4:00 PM',
      fr: 'Samedi: 10h00 - 16h00'
    },
    sunday: {
      ar: 'الأحد: مغلق',
      en: 'Sunday: Closed',
      fr: 'Dimanche: Fermé'
    }
  }
};

export const WORKING_HOURS: WorkingHour[] = [
  {
    day: { ar: 'الإثنين - الجمعة', en: 'Monday - Friday', fr: 'Lundi - Vendredi' },
    hours: { ar: '10:00 ص - 6:00 م', en: '10:00 AM - 6:00 PM', fr: '10h00 - 18h00' }
  },
  {
    day: { ar: 'السبت', en: 'Saturday', fr: 'Samedi' },
    hours: { ar: '10:00 ص - 4:00 م', en: '10:00 AM - 4:00 PM', fr: '10h00 - 16h00' }
  },
  {
    day: { ar: 'الأحد', en: 'Sunday', fr: 'Dimanche' },
    hours: { ar: 'مغلق', en: 'Closed', fr: 'Fermé' },
    isClosed: true
  }
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' } },
  { id: 'services', label: { ar: 'خدماتنا', en: 'Services', fr: 'Services' } },
  { id: 'self-employed', label: { ar: 'العمل الحر', en: 'Self-Employed', fr: 'Travailleurs Autonomes' } },
  { id: 'about', label: { ar: 'من نحن', en: 'About Principal', fr: 'À Propos' } },
  { id: 'booking', label: { ar: 'حجز موعد', en: 'Book Consultation', fr: 'Prendre Rendez-vous' } },
  { id: 'contact', label: { ar: 'اتصل بنا', en: 'Contact', fr: 'Contact' } }
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'income-tax',
    number: '01',
    iconName: 'FileSpreadsheet',
    title: {
      ar: 'إقرارات ضريبة الدخل (T1 & T2)',
      en: 'Individuals & Corporate Income Tax',
      fr: 'Impôt sur le Revenu (Particuliers & Sociétés)'
    },
    shortDesc: {
      ar: 'إعداد وتقديم الإقرارات الضريبية السنوية للأفراد والشركات الكندية بأعلى استرداد مالي قانوني ممكن.',
      en: 'Accurate annual tax preparation and E-filing for individuals (T1) and Canadian corporations (T2).',
      fr: 'Préparation et transmission électronique des déclarations de revenus des particuliers et sociétés.'
    },
    description: {
      ar: 'إعداد وتقديم الإقرارات الضريبية السنوية للأفراد، والعائلات، والشركات الكندية بأعلى استرداد مالي قانوني ممكن.',
      en: 'Accurate annual tax preparation and E-filing for individuals (T1) and Canadian corporations (T2) maximizing eligible deductions.',
      fr: 'Préparation et transmission électronique des déclarations de revenus des particuliers (T1) et sociétés (T2).'
    },
    benefits: {
      ar: ['استرداد ضريبي قانوني أمثل', 'تقديم إلكتروني مباشر إلى CRA', 'حماية ضد تدقيق الضرائب'],
      en: ['Optimized tax refunds', 'Direct CRA Netfile E-filing', 'Audit protection & support'],
      fr: ['Remboursement optimal', 'Transmission électronique directe ARC', 'Assistance en cas de vérification']
    }
  },
  {
    id: 'bookkeeping',
    number: '02',
    iconName: 'BookOpenCheck',
    title: {
      ar: 'مسك الدفاتر المحاسبية',
      en: 'Professional Bookkeeping',
      fr: 'Tenue de Livres Professionnelle'
    },
    shortDesc: {
      ar: 'تسجيل وتنظيم كافة المعاملات المالية، والفواتير، والمطابقات البنكية الدورية الشهرية والسنوية بدقة لا تقبل الخطأ.',
      en: 'Full-cycle bookkeeping, ledger maintenance, bank & credit card reconciliation.',
      fr: 'Tenue complète des livres comptables, conciliations bancaires et gestion des factures.'
    },
    description: {
      ar: 'تسجيل وتنظيم كافة المعاملات المالية، والفواتير، والمطابقات البنكية الدورية الشهرية والسنوية بدقة لا تقبل الخطأ.',
      en: 'Full-cycle bookkeeping, ledger maintenance, bank & credit card reconciliation using QuickBooks and Xero.',
      fr: 'Tenue complète des livres comptables, conciliations bancaires et gestion des factures.'
    },
    benefits: {
      ar: ['تقارير شهرية واضحة', 'مطابقة بنكية دورية', 'جاهزية تامة للموسم الضريبي'],
      en: ['Clean monthly financials', 'Error-free reconciliations', 'Continuous audit readiness'],
      fr: ['Rapports financiers clairs', 'Conciliations sans erreur', 'Conformité permanente']
    }
  },
  {
    id: 'review-engagements',
    number: '03',
    iconName: 'ClipboardCheck',
    title: {
      ar: 'مهام الفحص والمراجعة المالية',
      en: 'Review Engagements & Assurance',
      fr: 'Missions d\'Examen & Vérification'
    },
    shortDesc: {
      ar: 'فحص ومراجعة القوائم المالية وفقاً لمعايير المحاسبة الكندية لمنح الثقة للبنوك والمستثمرين.',
      en: 'Independent financial review engagements and analytical assurance for banks and lenders.',
      fr: 'Missions d\'examen financier indépendant pour banques et investisseurs.'
    },
    description: {
      ar: 'فحص ومراجعة القوائم المالية وفقاً لمعايير المحاسبة الكندية لمنح الثقة للبنوك والمستثمرين والجهات التمويلية.',
      en: 'Independent financial review engagements and analytical assurance for banks, lenders, and key stakeholders.',
      fr: 'Missions d\'examen financier indépendant pour banques, investisseurs et partenaires.'
    },
    benefits: {
      ar: ['اعتماد رسمي لمعاملات البنوك', 'تقييم دقيق للمخاطر المالية', 'مطابقة لمعايير المحاسبة الكندية'],
      en: ['Bank financing compliance', 'Risk evaluation & insight', 'Canadian accounting standards'],
      fr: ['Conformité bancaire', 'Évaluation des risques', 'Normes comptables canadiennes']
    }
  },
  {
    id: 'business-registration',
    number: '04',
    iconName: 'Building2',
    title: {
      ar: 'تسجيل وتأسيس الشركات',
      en: 'New Business Registration',
      fr: 'Enregistrement & Création d\'Entreprise'
    },
    shortDesc: {
      ar: 'تأسيس وتسجيل الشركات الفيدرالية وفي مقاطعة أونتاريو، واستخراج رقم الأعمال (BN).',
      en: 'Federal & Ontario incorporation, Master Business License, CRA Business Number (BN) setup.',
      fr: 'Constitution fédérale et provinciale (Ontario), obtention du numéro d\'entreprise (NE).'
    },
    description: {
      ar: 'تأسيس وتسجيل الشركات الفيدرالية وفي مقاطعة أونتاريو، واستخراج رقم الأعمال (BN)، وتسجيل الاسم التجاري.',
      en: 'Federal & Ontario incorporation, Master Business License, CRA Business Number (BN) setup and corporate minute books.',
      fr: 'Constitution fédérale et provinciale (Ontario), obtention du numéro d\'entreprise (NE).'
    },
    benefits: {
      ar: ['تأسيس فيدرالي وإقليمي سريع', 'استخراج رقم الأعمال الفوري', 'استشارة الهيكل الضريبي الأمثل'],
      en: ['Fast Ontario & Federal setup', 'Instant CRA BN registration', 'Optimal corporate structure'],
      fr: ['Constitution rapide en Ontario', 'Numéro d\'entreprise immédiat', 'Structure fiscale optimale']
    }
  },
  {
    id: 'business-planning',
    number: '05',
    iconName: 'TrendingUp',
    title: {
      ar: 'التخطيط والاستشارات المالية',
      en: 'Business Advisory & Planning',
      fr: 'Conseil & Planification Financière'
    },
    shortDesc: {
      ar: 'دراسات الجدوى المالية، والتخطيط للنمو، وإعداد الميزانيات التقديرية.',
      en: 'Strategic financial consulting, cash flow forecasts, business plans for financing.',
      fr: 'Conseil stratégique en affaires, prévisions de trésorerie et optimisation fiscale.'
    },
    description: {
      ar: 'دراسات الجدوى المالية، والتخطيط للنمو، وإعداد الميزانيات التقديرية واستراتيجيات خفض العبء الضريبي للشركات.',
      en: 'Strategic financial consulting, cash flow forecasts, business plans for financing, and proactive tax minimization.',
      fr: 'Conseil stratégique en affaires, prévisions de trésorerie et optimisation fiscale.'
    },
    benefits: {
      ar: ['استراتيجيات نمو مدروسة', 'خطط مالية معتمدة للتمويل', 'تخفيض التكاليف التشغيلية'],
      en: ['Actionable growth insights', 'Bank-ready business plans', 'Cost reduction strategies'],
      fr: ['Stratégies de croissance', 'Plans d\'affaires bancables', 'Réduction des coûts']
    }
  },
  {
    id: 'hst-filing',
    number: '06',
    iconName: 'Receipt',
    title: {
      ar: 'إقرارات ضريبة المبيعات (HST/GST)',
      en: 'HST / GST Preparation & Filing',
      fr: 'Déclaration de TPS / TVH'
    },
    shortDesc: {
      ar: 'حساب وإعداد وتقديم إقرارات ضريبة المبيعات المنسقة (HST) واسترداد كامل لـ ITC.',
      en: 'Accurate calculation and filing of Ontario Harmonized Sales Tax (HST/GST) returns.',
      fr: 'Calcul et déclaration de la Taxe sur les Produits et Services (TPS) et TVH.'
    },
    description: {
      ar: 'حساب وإعداد وتقديم إقرارات ضريبة المبيعات المنسقة (HST) الشهرية أو الربع سنوية أو السنوية مع استرداد كامل لـ ITC.',
      en: 'Accurate calculation and filing of Ontario Harmonized Sales Tax (HST/GST) returns with maximum Input Tax Credits (ITC).',
      fr: 'Calcul et déclaration de la Taxe sur les Produits et Services (TPS) et TVH avec récupération de CTI.'
    },
    benefits: {
      ar: ['استرداد كامل لمدفوعات ITC', 'تجنب غرامات التأخير', 'مطابقة دقيقة مع CRA'],
      en: ['Maximized ITC recoveries', 'Zero penalty guarantees', 'Accurate CRA compliance'],
      fr: ['Récupération maximale des CTI', 'Zéro pénalité', 'Conformité totale']
    }
  },
  {
    id: 'payroll-wsib',
    number: '07',
    iconName: 'Users',
    title: {
      ar: 'الرواتب ومستحقات WSIB و ROEs',
      en: 'Payroll, WSIB & ROEs Management',
      fr: 'Paie, CNESST/WSIB & Relevés d\'Emploi'
    },
    shortDesc: {
      ar: 'معالجة الرواتب، وحساب الاستقطاعات، وإصدار قسائم T4 السنوية، وسجلات العمل (ROE).',
      en: 'Comprehensive payroll processing, direct deposits, CRA payroll remittances, T4/ROEs.',
      fr: 'Gestion complète de la paie, déductions à la source, relevés T4 et relevés d\'emploi (RE).'
    },
    description: {
      ar: 'معالجة الرواتب للموظفين، وحساب استقطاعات CPP و EI، وإصدار قسائم T4 السنوية، وسجلات العمل (ROE)، وتقارير WSIB.',
      en: 'Comprehensive payroll processing, direct deposits, CRA payroll remittances, year-end T4/T4A filing, ROEs, and WSIB premiums.',
      fr: 'Gestion complète de la paie, déductions à la source, relevés T4/T4A, relevés d\'emploi (RE) et primes WSIB.'
    },
    benefits: {
      ar: ['إيداع مباشر سريع للرواتب', 'إصدار فوري لـ T4 و ROE', 'امتثال تام لقوانين العمل'],
      en: ['Timely direct deposits', 'Seamless T4 & ROE creation', 'Labor & WSIB compliance'],
      fr: ['Dépôts directs ponctuels', 'Émission T4 & RE sans faute', 'Conformité légale']
    }
  },
  {
    id: 'government-applications',
    number: '08',
    iconName: 'ShieldAlert',
    title: {
      ar: 'المعاملات الحكومية والدعم المالي',
      en: 'Government Applications & Grants',
      fr: 'Demandes & Programmes Gouvernementaux'
    },
    shortDesc: {
      ar: 'التقديم على المنح والبرامج الحكومية الكندية، ومساعدات الأعمال الصغيرة.',
      en: 'Assistance with Canadian government subsidies and small business relief grants.',
      fr: 'Assistance pour subventions canadiennes et programmes d\'aide aux entreprises.'
    },
    description: {
      ar: 'التقديم على المنح والبرامج الحكومية الكندية، ومساعدات الأعمال الصغيرة، وتحديث الملفات مع الهيئات الرسمية.',
      en: 'Assistance with Canadian government subsidies, small business relief grants, and official regulatory filings.',
      fr: 'Assistance pour subventions canadiennes, programmes d\'aide aux entreprises et démarches officielles.'
    },
    benefits: {
      ar: ['تأهيل سريع للبرامج والمنح', 'متابعة رسمية مباشرة', 'توفير الوقت والجهد الإداري'],
      en: ['Grant qualification assistance', 'Direct agency follow-up', 'Save administrative hours'],
      fr: ['Admissibilité aux subventions', 'Suivi rigoureux', 'Gain de temps précieux']
    }
  },
  {
    id: 'cra-representation',
    number: '09',
    iconName: 'Scale',
    title: {
      ar: 'التمثيل المعتمد لدى CRA',
      en: 'Representing with Canada Revenue Agency',
      fr: 'Représentation auprès de l\'ARC'
    },
    shortDesc: {
      ar: 'تمثيلكم الرسمي المعتمد أمام وكالة الإيرادات الكندية (CRA) للتعامل مع التدقيق.',
      en: 'Authorized Level 2 representative handling CRA audits and objection notices.',
      fr: 'Représentant officiel autorisé auprès de l\'Agence du Revenu du Canada (ARC).'
    },
    description: {
      ar: 'تمثيلكم الرسمي المعتمد أمام وكالة الإيرادات الكندية (CRA) للتعامل مع التدقيق، والمراجعات، وتصحيح الإقرارات السابقة.',
      en: 'Authorized Level 2 representative handling CRA audits, objection notices, tax disputes, and historical adjustments.',
      fr: 'Représentant officiel autorisé auprès de l\'Agence du Revenu du Canada (ARC) pour vérifications et contestations.'
    },
    benefits: {
      ar: ['حماية مصالحك أمام CRA', 'تسوية النزاعات الضريبية', 'تخفيف الغرامات والفوائد'],
      en: ['Direct CRA liaison & defense', 'Audit resolution expertise', 'Penalty & interest relief'],
      fr: ['Défense directe auprès de l\'ARC', 'Résolution des différends', 'Allègement des pénalités']
    }
  }
];

export const UI_TEXT = {
  nav: {
    home: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' },
    selfEmployed: { ar: 'أصحاب العمل الحر', en: 'Self-Employed', fr: 'Travailleurs Autonomes' },
    services: { ar: 'الخدمات', en: 'Services', fr: 'Services' },
    about: { ar: 'عن المالك', en: 'About Principal', fr: 'À Propos' },
    booking: { ar: 'احجز موعد', en: 'Book Appointment', fr: 'Prendre Rendez-vous' },
    contact: { ar: 'اتصل بنا', en: 'Contact Us', fr: 'Contact' },
    callNow: { ar: 'اتصل الآن', en: 'Call Now', fr: 'Appelez' }
  },
  hero: {
    badge: {
      ar: 'المكتب المعتمد في أوتاوا ونيبيان • أونتاريو، كندا',
      en: 'Authorized Accounting & Tax Firm in Ottawa & Nepean • Ontario, Canada',
      fr: 'Cabinet comptable et fiscal agréé à Ottawa et Nepean • Ontario, Canada'
    },
    title: {
      ar: 'شريكك المالي الموثوق لتحقيق النجاح المحاسبي والضريبي',
      en: 'Your Trusted Partner for Financial and Tax Excellence',
      fr: 'Votre partenaire de confiance pour l\'excellence comptable et fiscale'
    },
    subtitle: {
      ar: 'نقدم حلولاً متكاملة للأفراد وأصحاب المهن الحرة والشركات. انقر على أي خدمة في المدار المحيط بالشعار للتعرف على التفاصيل وحجز موعدك فوراً.',
      en: 'Comprehensive accounting & tax solutions for individuals, self-employed, and corporations. Click any service in the orbit to explore and book instantly.',
      fr: 'Solutions comptables et fiscales complètes. Cliquez sur un service en orbite pour explorer et réserver immédiatement.'
    },
    orbitHint: {
      ar: 'مدار الخدمات التفاعلي • اضغط على أي أيقونة للاطلاع على التفاصيل والحجز المباشر',
      en: 'Interactive 3D Service Orbit • Click any icon for detailed overview & booking',
      fr: 'Orbite 3D interactive • Cliquez sur une icône pour voir les détails et réserver'
    },
    exploreBtn: {
      ar: 'استعراض كافة الخدمات',
      en: 'Explore All Services',
      fr: 'Explorer les Services'
    },
    bookBtn: {
      ar: 'احجز موعدك الآن',
      en: 'Book Your Consultation',
      fr: 'Réserver une Consultation'
    }
  },
  selfEmployed: {
    badge: {
      ar: 'خدمات مخصصة للعاملين لحسابهم الخاص',
      en: 'Tailored for Freelancers & Independent Contractors',
      fr: 'Dédié aux Travailleurs Autonomes'
    },
    title: {
      ar: 'خدمات أصحاب الأعمال الحرة (Self-Employed)',
      en: 'Services for Self-Employed',
      fr: 'Services pour Travailleurs Autonomes'
    },
    slogan: {
      ar: 'ركز على عملك وعملائك، ونحن نتكفل بدفاترك المحاسبية!',
      en: 'Focus on your work and customers, and we will take care of your books!',
      fr: 'Concentrez-vous sur vos clients et votre métier, nous gérons vos livres comptables!'
    },
    points: [
      { ar: 'التسجيل الجديد للأعمال (New Registration)', en: 'New Business Registration', fr: 'Nouvel enregistrement d\'entreprise' },
      { ar: 'مسك الدفاتر المحاسبية (Bookkeeping)', en: 'Professional Bookkeeping', fr: 'Tenue de livres' },
      { ar: 'إعداد الإقرارات الضريبية (Tax Preparation)', en: 'Tax Preparation & E-Filing', fr: 'Préparation fiscale' },
      { ar: 'إدارة متطلبات واشتراكات WSIB', en: 'WSIB Compliance & Reporting', fr: 'Conformité WSIB' },
      { ar: 'التمثيل المعتمد لدى CRA', en: 'Authorized CRA Representation', fr: 'Représentation auprès de l\'ARC' }
    ],
    audiencesTitle: {
      ar: 'نخدم مختلف قطاعات العمل الحر في كندا:',
      en: 'Serving diverse independent sectors across Canada:',
      fr: 'Au service de divers secteurs autonomes au Canada:'
    },
    audiences: [
      { ar: 'الأطباء والكوادر الصحية', en: 'Doctors & Healthcare Pros', fr: 'Médecins & Professionnels de santé' },
      { ar: 'المقاولون وأصحاب المهن الحرفية', en: 'Contractors & Tradespeople', fr: 'Entrepreneurs & Gens de métier' },
      { ar: 'سائقو الشاحنات والنقل', en: 'Truck & Logistics Drivers', fr: 'Chauffeurs routiers & Transport' },
      { ar: 'المستشارون ورواد الأعمال', en: 'Consultants & Professionals', fr: 'Consultants & Professionnels' }
    ],
    cta: {
      ar: 'احجز استشارة العمل الحر',
      en: 'Book Self-Employed Consult',
      fr: 'Réserver pour travailleur autonome'
    }
  },
  taxCampaign: {
    title: {
      ar: 'هل تحتاج إلى مساعدة في ضرائبك؟! دعنا نجعل الأمر سهلاً!',
      en: 'Need a hand with your taxes?! Let us make things easy!',
      fr: 'Besoin d\'aide avec vos impôts?! Laissez-nous vous simplifier la vie!'
    },
    subtitle: {
      ar: 'لا تدع المواعيد الضريبية المعقدة تشكل عبئاً عليك. خبراء IBMA يتولون مراجعة وتقديم ملفاتك الضريبية بأعلى دقة واحترافية.',
      en: 'Avoid tax season stress. Our licensed accountants ensure maximum deductions and seamless E-filing with the CRA.',
      fr: 'Évitez le stress fiscal. Nos spécialistes maximisent vos déductions et garantissent une conformité sans faille.'
    },
    cta: {
      ar: 'احجز موعدك الآن (Book Now)',
      en: 'Book Your Appointment Now',
      fr: 'Prenez Rendez-vous Maintenant'
    }
  },
  services: {
    badge: {
      ar: 'للأفراد وأصحاب العمل الحر والشركات',
      en: 'For individuals, self-employed and businesses',
      fr: 'Pour particuliers, travailleurs autonomes et entreprises'
    },
    title: {
      ar: 'خدمات IBMA والحلول المتكاملة',
      en: 'IBMA Services & Integrated Solutions',
      fr: 'Services IBMA et solutions intégrées'
    },
    subtitle: {
      ar: 'اضغط على أي خدمة لعرض تفاصيلها ومزاياها وحجز موعدك مباشرة.',
      en: 'Tap any service to see its details and benefits, and book your appointment directly.',
      fr: 'Touchez un service pour voir ses détails et ses avantages, et réserver directement.'
    },
    detailsBtn: {
      ar: 'تفاصيل الخدمة',
      en: 'Service Details',
      fr: 'Détails du Service'
    },
    bookServiceBtn: {
      ar: 'احجز موعداً لهذه الخدمة',
      en: 'Book for This Service',
      fr: 'Réserver ce Service'
    }
  },
  owner: {
    badge: {
      ar: 'القيادة المهنية والخبرة الكندية',
      en: 'Executive Leadership & Expertise',
      fr: 'Direction & Expertise Professionnelle'
    },
    title: {
      ar: 'المحاسب إبراهيم • خبرة أكثر من 15 سنة في المحاسبة المالية والضرائب',
      en: 'Accountant Ibrahim • Over 15 Years of Financial & Tax Accounting Experience',
      fr: 'Comptable Ibrahim • Plus de 15 ans d\'expérience en comptabilité financière et fiscalité'
    },
    name: {
      ar: 'المحاسب إبراهيم',
      en: 'Accountant Ibrahim',
      fr: 'Comptable Ibrahim'
    },
    role: {
      ar: 'خبرة أكثر من 15 سنة في المحاسبة المالية والضرائب • المؤسس لـ IBMA Accounting Ltd',
      en: 'Over 15 Years of Financial & Tax Accounting Experience • Founder, IBMA Accounting Ltd',
      fr: 'Plus de 15 ans d\'expérience en comptabilité financière et fiscalité • Fondateur, IBMA Accounting Ltd'
    },
    verifiedBadge: {
      ar: 'معتمد رسمياً من CRA ومحاسب معتمد في أونتاريو',
      en: 'Officially Authorized CRA E-Filer & Ontario Representative',
      fr: 'Représentant officiel agréé ARC & Ontario'
    },
    bioP1: {
      ar: 'يتمتع المحاسب إبراهيم بخبرة مهنية راسخة تمتد لأكثر من 15 عاماً في المحاسبة المالية وإعداد وتخطيط الضرائب الكندية الفيدرالية والإقليمية في مقاطعة أونتاريو. قاد بنجاح مئات الشركات والأفراد وأصحاب الأعمال الحرة نحو الامتثال الضريبي الكامل والتخطيط المالي المحكم، مع تخصص متقدم في التمثيل المعتمد أمام وكالة الإيرادات الكندية (CRA).',
      en: 'Accountant Ibrahim brings over 15 years of distinguished Canadian financial accounting and tax expertise across Ontario and federal jurisdictions. He has successfully guided hundreds of corporations, small businesses, and self-employed professionals toward optimal financial health and total CRA compliance, with specialized authorized representation before the Canada Revenue Agency.',
      fr: 'Comptable Ibrahim possède plus de 15 ans d\'expérience approfondie dans le système fiscal et comptable canadien en Ontario et au fédéral. Il a accompagné avec succès des centaines d\'entreprises, d\'indépendants et de particuliers vers la conformité totale auprès de l\'Agence du revenu du Canada (ARC).'
    },
    bioP2: {
      ar: 'تحت إدارته المباشرة، يلتزم مكتب IBMA بتقديم استشارات محاسبية وضريبية دقيقة تضمن تحقيق أقصى وفورات ضريبية قانونية وحماية أموال ومصالح العملاء، مع مرافقة شاملة في تأسيس الشركات ومسك الدفاتر وتمثيل الحالات الضريبية المعقدة.',
      en: 'Under his direct management, IBMA Accounting Ltd delivers precision-driven accounting and strategic tax planning that maximizes legitimate tax savings while safeguarding client assets, providing end-to-end guidance from business incorporation to complex audit representation.',
      fr: 'Sous sa direction, le cabinet IBMA garantit une rigueur exemplaire, des stratégies d\'optimisation fiscale proactives et une défense solide lors des vérifications gouvernementales pour assurer la prospérité pérenne de vos affaires.'
    },
    stats: [
      { label: { ar: 'سنوات من الخبرة الكندية', en: 'Years Canadian Experience', fr: 'Années d\'expérience' }, val: '15+' },
      { label: { ar: 'إقرار ضريبي ناجح', en: 'Successful Tax Filings', fr: 'Déclarations fiscales réussies' }, val: '2,500+' },
      { label: { ar: 'عميل وشركة راضية', en: 'Corporate & Individual Clients', fr: 'Clients satisfaits' }, val: '850+' },
      { label: { ar: 'نسبة رضا العملاء', en: 'Client Satisfaction Rate', fr: 'Taux de satisfaction' }, val: '99.4%' }
    ],
    consultBtn: {
      ar: 'طلب استشارة مباشرة مع المحاسب إبراهيم',
      en: 'Book Direct Consultation with Accountant Ibrahim',
      fr: 'Prendre rendez-vous avec Comptable Ibrahim'
    }
  },
  booking: {
    badge: {
      ar: 'حجز فوري ومباشر',
      en: 'Instant Online Booking',
      fr: 'Réservation Immédiate en Ligne'
    },
    title: {
      ar: 'احجز موعد استشارتك المحاسبية أو الضريبية',
      en: 'Schedule Your Accounting or Tax Consultation',
      fr: 'Planifiez Votre Consultation Comptable ou Fiscale'
    },
    desc: {
      ar: 'املأ النموذج أدناه لتثبيت موعدك وسيتواصل معك فريقنا خلال ساعات العمل لتأكيد كافة التفاصيل.',
      en: 'Fill out the form below to lock in your appointment. Our team will contact you promptly to confirm.',
      fr: 'Remplissez le formulaire ci-dessous. Notre équipe vous contactera rapidement pour confirmer.'
    },
    subtitle: {
      ar: 'املأ النموذج أدناه لتثبيت موعدك وسيتواصل معك فريقنا خلال ساعات العمل لتأكيد كافة التفاصيل.',
      en: 'Fill out the form below to lock in your appointment. Our team will contact you promptly to confirm.',
      fr: 'Remplissez le formulaire ci-dessous. Notre équipe vous contactera rapidement pour confirmer.'
    },
    nameLabel: { ar: 'الاسم الكامل', en: 'Full Name', fr: 'Nom complet' },
    namePlaceholder: { ar: 'مثال: محمد أحمد', en: 'e.g. John Doe', fr: 'ex: Jean Dupont' },
    phoneLabel: { ar: 'رقم الهاتف', en: 'Phone Number', fr: 'Numéro de téléphone' },
    phonePlaceholder: { ar: '+1 (613) ...', en: '+1 (613) ...', fr: '+1 (613) ...' },
    emailLabel: { ar: 'البريد الإلكتروني', en: 'Email Address', fr: 'Adresse courriel' },
    emailPlaceholder: { ar: 'name@example.com', en: 'name@example.com', fr: 'nom@exemple.com' },
    serviceLabel: { ar: 'الخدمة المطلوبة', en: 'Select Service', fr: 'Service requis' },
    selectPlaceholder: { ar: '-- اختر الخدمة المحاسبية --', en: '-- Select Accounting Service --', fr: '-- Sélectionner un Service --' },
    dateLabel: { ar: 'التاريخ المفضل', en: 'Preferred Date', fr: 'Date souhaitée' },
    timeLabel: { ar: 'الوقت المناسب', en: 'Preferred Time', fr: 'Heure souhaitée' },
    notesLabel: { ar: 'ملاحظات أو تفاصيل إضافية', en: 'Additional Notes or Questions', fr: 'Notes ou Détails Supplémentaires' },
    notesPlaceholder: {
      ar: 'اكتب بإيجاز عن طبيعة استفسارك أو وضع شركتك الضريبي...',
      en: 'Briefly describe your business needs or tax inquiries...',
      fr: 'Décrivez brièvement vos besoins ou vos questions fiscales...'
    },
    submitBtn: {
      ar: 'تأكيد وإرسال طلب الحجز',
      en: 'Confirm & Submit Booking Request',
      fr: 'Confirmer & Envoyer la Demande'
    },
    submitting: {
      ar: 'جارٍ تسجيل الحجز...',
      en: 'Submitting booking...',
      fr: 'Envoi en cours...'
    },
    successTitle: {
      ar: 'تم استلام طلب حجزك بنجاح!',
      en: 'Appointment Request Submitted Successfully!',
      fr: 'Demande de rendez-vous reçue avec succès!'
    },
    successMsg: {
      ar: 'شكراً لتواصلك مع IBMA Accounting Ltd. تم حفظ بيانات حجزك وسيتواصل معك مستشارنا لتأكيد الموعد.',
      en: 'Thank you for choosing IBMA Accounting Ltd. Your booking has been received and our team will follow up promptly.',
      fr: 'Merci d\'avoir choisi IBMA Accounting Ltd. Nous avons bien reçu votre demande et nous vous contacterons sous peu.'
    },
    bookAnother: {
      ar: 'حجز موعد آخر',
      en: 'Book Another Appointment',
      fr: 'Réserver un autre rendez-vous'
    },
    callDirectNotice: {
      ar: 'أو اتصل بنا مباشرة على: ',
      en: 'Or call our Ottawa office directly: ',
      fr: 'Ou contactez directement notre bureau: '
    }
  },
  contact: {
    badge: {
      ar: 'تواصل مباشر ومقرنا الرسمي',
      en: 'Get in Touch & Official Location',
      fr: 'Contactez-nous & Siège Officiel'
    },
    title: {
      ar: 'معلومات التواصل وموقع المكتب',
      en: 'Contact Details & Office Location',
      fr: 'Coordonnées & Emplacement du Cabinet'
    },
    subtitle: {
      ar: 'يسعدنا استقبالكم في مقرنا الكائن في نيبيان / أوتاوا، أو خدمتكم عن بعد عبر الهاتف والإنترنت.',
      en: 'We look forward to welcoming you at our Nepean / Ottawa office or assisting you remotely.',
      fr: 'Nous serions ravis de vous accueillir à notre bureau de Nepean / Ottawa ou de vous servir à distance.'
    },
    addressTitle: { ar: 'عنوان المكتب', en: 'Office Address', fr: 'Adresse du Bureau' },
    phoneTitle: { ar: 'الهاتف والواتساب', en: 'Phone & WhatsApp', fr: 'Téléphone & WhatsApp' },
    emailTitle: { ar: 'البريد الإلكتروني', en: 'Official Email', fr: 'Courriel Officiel' },
    hoursTitle: { ar: 'ساعات العمل الرسمية', en: 'Business Hours', fr: 'Heures d\'Ouverture' },
    directionsBtn: { ar: 'الاتجاهات على الخريطة', en: 'Get Driving Directions', fr: 'Itinéraire sur la carte' },
    copyAddress: { ar: 'نسخ العنوان', en: 'Copy address', fr: 'Copier l’adresse' },
    copyEmail: { ar: 'نسخ البريد الإلكتروني', en: 'Copy email address', fr: 'Copier le courriel' },
    copyShort: { ar: 'نسخ', en: 'Copy', fr: 'Copier' },
    emailCopied: { ar: 'تم نسخ البريد الإلكتروني', en: 'Email address copied', fr: 'Courriel copié' },
    emailCopyError: { ar: 'تعذّر النسخ. يمكنك تحديد البريد الإلكتروني ونسخه يدويًا.', en: 'Could not copy. Select the email address and copy it manually.', fr: 'Copie impossible. Sélectionnez le courriel et copiez-le manuellement.' },
    copied: { ar: 'تم نسخ العنوان', en: 'Address copied', fr: 'Adresse copiée' },
    copyError: { ar: 'تعذّر النسخ. يمكنك تحديد العنوان ونسخه يدويًا.', en: 'Could not copy. Select the address and copy it manually.', fr: 'Copie impossible. Sélectionnez l’adresse et copiez-la manuellement.' },
    callBtn: { ar: 'اتصال', en: 'Call', fr: 'Appeler' },
    whatsappBtn: { ar: 'واتساب', en: 'WhatsApp', fr: 'WhatsApp' },
    todayStatusOpen: { ar: 'مفتوح الآن', en: 'Open Now', fr: 'Ouvert maintenant' },
    todayStatusClosed: { ar: 'مغلق الآن', en: 'Closed Now', fr: 'Fermé maintenant' }
  },
  floating: {
    whatsapp: { ar: 'محادثة واتساب فورية', en: 'Instant WhatsApp Chat', fr: 'Chat WhatsApp Immédiat' },
    call: { ar: 'اتصال هاتفي مباشر', en: 'Call Office Now', fr: 'Appeler le Bureau' },
    email: { ar: 'مراسلة عبر البريد', en: 'Send an Email', fr: 'Envoyer un Courriel' },
    book: { ar: 'حجز موعد استشارة', en: 'Book Consultation', fr: 'Prendre Rendez-vous' },
    facebook: { ar: 'صفحة فيسبوك الرسمية', en: 'Official Facebook Page', fr: 'Page Facebook Officielle' }
  },
  modal: {
    headerTag: { ar: 'خدمة محاسبية معتمدة', en: 'Certified Accounting Service', fr: 'Service Comptable Agréé' },
    overview: { ar: 'نظرة عامة على الخدمة', en: 'Service Overview', fr: 'Aperçu du Service' },
    benefits: { ar: 'المزايا والقيمة المضافة لشركتك', en: 'Key Business Advantages', fr: 'Avantages Clés' },
    keyAdvantages: { ar: 'المزايا الرئيسية', en: 'Key Business Advantages', fr: 'Avantages Clés' },
    bookBtn: { ar: 'احجز موعداً لهذه الخدمة الآن', en: 'Book for This Service Now', fr: 'Réserver pour ce service' },
    instantBook: { ar: 'احجز الآن', en: 'Book Now', fr: 'Réserver' },
    closeBtn: { ar: 'إغلاق', en: 'Close', fr: 'Fermer' },
    close: { ar: 'إغلاق', en: 'Close', fr: 'Fermer' }
  },
  footer: {
    rights: {
      ar: 'جميع الحقوق محفوظة لـ IBMA Accounting Ltd.',
      en: 'All Rights Reserved. IBMA Accounting Ltd.',
      fr: 'Tous droits réservés. IBMA Accounting Ltd.'
    },
    locationBadge: {
      ar: 'أوتاوا - نيبيان، أونتاريو، كندا',
      en: 'Ottawa - Nepean, Ontario, Canada',
      fr: 'Ottawa - Nepean, Ontario, Canada'
    },
    designerSignature: {
      ar: 'هذا الموقع صمم بواسطة',
      en: 'This website was designed by',
      fr: 'Ce site a été conçu par'
    }
  }
};
