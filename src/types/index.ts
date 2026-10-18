export type Language = 'ar' | 'en' | 'fr';

export interface ServiceItem {
  id: string;
  number: number | string;
  iconName: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  shortDesc?: Record<Language, string>;
  fullDesc?: Record<Language, string>;
  benefits: Record<Language, string[]>;
  category?: 'tax' | 'accounting' | 'corporate' | 'government';
}

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

export interface WorkingHour {
  day: Record<Language, string>;
  hours: Record<Language, string>;
  isClosed?: boolean;
}

export interface CompanyInfo {
  name: string;
  subtitle: Record<Language, string>;
  address: string;
  phone: string;
  phoneClean: string;
  whatsappUrl: string;
  email: string;
  facebookUrl: string;
  ownerPhoto?: string;
  mapEmbedUrl?: string;
  workingHours: {
    weekdays: Record<Language, string>;
    saturday: Record<Language, string>;
    sunday: Record<Language, string>;
  };
}

export interface NavItem {
  id: string;
  label: Record<Language, string>;
}
