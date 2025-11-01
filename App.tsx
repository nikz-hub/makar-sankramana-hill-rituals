import React, { useState } from 'react';
import InformationScreen from './components/InformationScreen';
import ChatbotScreen from './components/ChatbotScreen';

export type Language = 'kn' | 'en';
type Screen = 'info' | 'chat';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('info');
  const [language, setLanguage] = useState<Language>('kn');

  const navigateToChat = () => setScreen('chat');
  const navigateToInfo = () => setScreen('info');

  return (
    <div className="bg-orange-50 min-h-screen text-amber-900">
      {screen === 'info' && <InformationScreen onNavigateToChat={navigateToChat} language={language} setLanguage={setLanguage} />}
      {screen === 'chat' && <ChatbotScreen onNavigateBack={navigateToInfo} language={language} setLanguage={setLanguage} />}
    </div>
  );
};

export default App;
