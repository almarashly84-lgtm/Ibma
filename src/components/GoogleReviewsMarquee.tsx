import React from 'react';
import { ExternalLink, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SITE } from '../content/apply';

// No rating or testimonial is presented as verified without an attributable source.
export const GoogleReviewsMarquee: React.FC = () => {
  const { language } = useLanguage();
  const copy = {
    ar: { title: 'آراء العملاء على Google', text: 'اطّلع على التقييمات مباشرة من صفحة النشاط على Google.', button: 'عرض صفحة Google' },
    en: { title: 'Customer feedback on Google', text: 'Read customer reviews directly on the Google business page.', button: 'View Google business page' },
    fr: { title: 'Avis clients sur Google', text: 'Consultez les avis directement sur la fiche Google de l’entreprise.', button: 'Consulter la fiche Google' },
  }[language];
  if (!SITE.contact.googleReviewsUrl) return null;
  return (
    <section id="reviews" className="py-12 sm:py-16 bg-[#070A0F] border-t border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <MessageCircle className="w-8 h-8 text-amber-400 mx-auto" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{copy.title}</h2>
        <p className="text-sm text-slate-300">{copy.text}</p>
        <a href={SITE.contact.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-amber-400 text-black hover:bg-amber-300">
          {copy.button}<ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};
