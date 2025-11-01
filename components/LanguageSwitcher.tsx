import React from 'react';
import type { Language } from '../App';

interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, onLanguageChange, className = '' }) => {
  const commonButtonClasses = 'px-3 py-1 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75';
  const activeButtonClasses = 'bg-orange-600 text-white shadow-inner';
  const inactiveButtonClasses = 'bg-white/50 hover:bg-white/80 text-amber-800';

  return (
    <div className={`flex items-center space-x-1 p-1 bg-white/30 rounded-lg backdrop-blur-sm ${className}`}>
      <button
        onClick={() => onLanguageChange('kn')}
        className={`${commonButtonClasses} ${language === 'kn' ? activeButtonClasses : inactiveButtonClasses}`}
        aria-pressed={language === 'kn'}
      >
        ಕನ್ನಡ
      </button>
      <button
        onClick={() => onLanguageChange('en')}
        className={`${commonButtonClasses} ${language === 'en' ? activeButtonClasses : inactiveButtonClasses}`}
        aria-pressed={language === 'en'}
      >
        English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
