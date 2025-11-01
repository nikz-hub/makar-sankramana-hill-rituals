import React from 'react';
import { ChatIcon } from './icons';
import type { Language } from '../App';
import { translations } from '../utils/translations';
import LanguageSwitcher from './LanguageSwitcher';


interface InformationScreenProps {
  onNavigateToChat: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const sankrantiImageSvg = "data:image/svg+xml,%3csvg viewBox='0 0 800 400' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='skyGradient' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%23FFC371;' /%3e%3cstop offset='100%25' style='stop-color:%23FF5F6D;' /%3e%3c/linearGradient%3e%3cradialGradient id='sunGradient' cx='50%25' cy='50%25' r='50%25'%3e%3cstop offset='0%25' stop-color='rgba(255,255,150,1)' /%3e%3cstop offset='100%25' stop-color='rgba(255,200,0,0)' /%3e%3c/radialGradient%3e%3c/defs%3e%3crect width='800' height='400' fill='url(%23skyGradient)' /%3e%3ccircle cx='400' cy='250' r='100' fill='url(%23sunGradient)' /%3e%3ccircle cx='400' cy='250' r='40' fill='%23FFFFE0' /%3e%3cpath d='M 0 400 L 0 280 C 100 220, 150 220, 250 260 C 350 300, 400 250, 500 280 C 600 310, 700 270, 800 300 L 800 400 Z' fill='%234A2511' opacity='0.8'/%3e%3cpath d='M 0 400 L 0 320 C 50 300, 150 350, 280 320 C 400 290, 450 340, 550 330 C 650 320, 750 350, 800 340 L 800 400 Z' fill='%236B3519'/%3e%3c/svg%3e";

const InformationScreen: React.FC<InformationScreenProps> = ({ onNavigateToChat, language, setLanguage }) => {
  const t = translations[language].infoScreen;

  return (
    <div className="relative min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-amber-50 overflow-hidden">
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-full max-w-xl h-full max-h-xl bg-gradient-to-br from-yellow-300/60 to-red-500/50 rounded-full blur-3xl opacity-40"
      />
      <LanguageSwitcher language={language} onLanguageChange={setLanguage} className="absolute top-4 right-4 z-20" />

      <header className="relative z-10 text-center mb-6">
        <img
          src={sankrantiImageSvg}
          alt={t.imageAlt}
          className="w-full max-w-3xl mx-auto h-48 md:h-64 object-cover rounded-xl shadow-lg mb-6 border-4 border-white"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-amber-800 tracking-wide">{t.title}</h1>
        <p className="text-lg text-amber-700 mt-2">{t.subtitle}</p>
      </header>

      <main className="relative z-10 flex-grow space-y-8 max-w-4xl mx-auto">
        <section className="bg-white/60 p-6 rounded-xl shadow-md border border-amber-200">
          <h2 className="text-2xl font-semibold text-orange-700 mb-3">{t.introHeader}</h2>
          <p className="text-md leading-relaxed text-justify text-amber-900">
            {t.introText}
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/60 p-6 rounded-xl shadow-md border border-amber-200">
            <h3 className="text-xl font-semibold text-orange-700 mb-3">{t.ritualsHeader}</h3>
            <ul className="list-disc list-inside space-y-2 text-amber-900">
              <li><strong>{t.ritual1.strong}</strong> {t.ritual1.text}</li>
              <li><strong>{t.ritual2.strong}</strong> {t.ritual2.text}</li>
              <li><strong>{t.ritual3.strong}</strong> {t.ritual3.text}</li>
              <li><strong>{t.ritual4.strong}</strong> {t.ritual4.text}</li>
            </ul>
          </div>
          <div className="bg-white/60 p-6 rounded-xl shadow-md border border-amber-200">
            <h3 className="text-xl font-semibold text-orange-700 mb-3">{t.hillsHeader}</h3>
            <p className="text-md leading-relaxed text-amber-900">
             {t.hillsText}
            </p>
          </div>
        </div>
      </main>

      <button
        onClick={onNavigateToChat}
        className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 flex items-center gap-3 z-20"
        aria-label={t.chatbotButtonAriaLabel}
      >
        <ChatIcon />
        <span>{t.chatbotButtonLabel}</span>
      </button>
    </div>
  );
};

export default InformationScreen;