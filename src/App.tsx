import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { HeroOrbit3D } from './components/HeroOrbit3D';
import { SelfEmployedSection } from './components/SelfEmployedSection';
import { ExpertiseBusinessSection } from './components/ExpertiseBusinessSection';
import { TaxCampaignSection } from './components/TaxCampaignSection';
import { ServicesSection } from './components/ServicesSection';
import { GoogleReviewsMarquee } from './components/GoogleReviewsMarquee';
import { ServiceModal } from './components/ServiceModal';
import { BookingSection } from './components/BookingSection';
import { AboutOwnerSection } from './components/AboutOwnerSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingContactBar } from './components/FloatingContactBar';
import { ServiceItem } from './types';
import { SERVICES_LIST } from './i18n/translations';

export const AppContent: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [preselectedBookingService, setPreselectedBookingService] = useState<ServiceItem | null>(null);

  const handleOpenBooking = (service?: ServiceItem) => {
    if (service) {
      setPreselectedBookingService(service);
    }
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#0B0E14] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <a href="#main-content" className="skip-link">Skip to main content / انتقل إلى المحتوى / Aller au contenu</a>
      {/* Sticky Navigation Bar with Official Logo */}
      <Navbar onOpenBooking={() => handleOpenBooking()} />

      {/* Main Page Flow */}
      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* 1. Hero Section with Official 3D Logo & Orbiting Services */}
        <HeroOrbit3D
          onSelectService={(service) => setSelectedService(service)}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* 2. Services for Self-Employed Section */}
        <SelfEmployedSection onOpenBooking={() => handleOpenBooking()} />

        {/* 3. Our Expertise Meet All Your Business Needs Section */}
        <ExpertiseBusinessSection
          onOpenBooking={(srvName) => {
            const matched = SERVICES_LIST.find((s) => s.title.ar === srvName || s.title.en === srvName);
            handleOpenBooking(matched);
          }}
        />

        {/* 4. Need a Hand with Your Taxes?! Campaign Section */}
        <TaxCampaignSection onOpenBooking={() => handleOpenBooking()} />

        {/* 5. 9 Accounting Services 3-Column Compact Grid Section */}
        <ServicesSection
          onSelectService={(service) => setSelectedService(service)}
          onBookService={(service) => handleOpenBooking(service)}
        />

        {/* 6. Google Reviews Smooth Infinite Marquee Section */}
        <GoogleReviewsMarquee />

        {/* 7. Direct Appointment Booking Section (Compact) */}
        <BookingSection
          preselectedService={preselectedBookingService}
          onClearPreselectedService={() => setPreselectedBookingService(null)}
        />

        {/* 8. Biography & Credentials of Accountant Ibrahim Section */}
        <AboutOwnerSection onOpenBooking={() => handleOpenBooking()} />

        {/* 9. Compact Office Location, Hours & Direct Contact Section */}
        <ContactSection />
      </main>

      {/* Footer with Designer Credit & CRA Badges */}
      <Footer />

      {/* Left-Side Floating Social Capsule & Bottom Fixed Contact Bar */}
      <FloatingContactBar onOpenBooking={() => handleOpenBooking()} />

      {/* Interactive Service Details & Zoom Modal */}
      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onBookService={(service) => handleOpenBooking(service)}
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
