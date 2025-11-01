import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatResponse, getTextToSpeech } from '../services/geminiService';
import { BackIcon, SendIcon, SpeakerIcon, LoadingIcon, BotIcon, UserIcon, MicrophoneIcon } from './icons';
import type { Language } from '../App';
import { translations } from '../utils/translations';
import LanguageSwitcher from './LanguageSwitcher';


type Message = {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  audioState?: 'none' | 'loading' | 'playing' | 'error';
};

// --- Audio Helper Functions ---
function decode(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / 1; // Mono channel
  const buffer = ctx.createBuffer(1, frameCount, 24000); // 24000 sample rate, 1 channel
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}
// --- End Audio Helper Functions ---

interface ChatbotScreenProps {
  onNavigateBack: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const nandiHillsSunriseSvg = "data:image/svg+xml,%3csvg viewBox='0 0 800 1200' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='skyGradient' x1='0.5' y1='1' x2='0.5' y2='0'%3e%3cstop offset='0%25' stop-color='%23331e36' /%3e%3cstop offset='40%25' stop-color='%23ff5f6d' /%3e%3cstop offset='60%25' stop-color='%23ffc371' /%3e%3cstop offset='100%25' stop-color='%23f5f5f5' /%3e%3c/linearGradient%3e%3cradialGradient id='sunGradient'%3e%3cstop offset='0%25' stop-color='rgba(255, 255, 220, 0.9)' /%3e%3cstop offset='50%25' stop-color='rgba(255, 220, 100, 0.5)' /%3e%3cstop offset='100%25' stop-color='rgba(255, 200, 0, 0)' /%3e%3c/radialGradient%3e%3c/defs%3e%3crect width='800' height='1200' fill='url(%23skyGradient)' /%3e%3ccircle cx='400' cy='600' r='150' fill='url(%23sunGradient)' /%3e%3ccircle cx='400' cy='600' r='80' fill='%23ffffef' /%3e%3cpath d='M -100 1200 L -100 750 C 100 700, 300 800, 500 720 C 700 640, 900 780, 900 780 L 900 1200 Z' fill='%232a1a2b' opacity='0.7' /%3e%3cpath d='M -100 1200 L -100 800 C 150 780, 250 850, 450 820 C 650 790, 750 880, 900 850 L 900 1200 Z' fill='%231c111d' opacity='0.8' /%3e%3cpath d='M -100 1200 L -100 900 C 200 880, 400 950, 600 920 C 800 890, 900 930, 900 930 L 900 1200 Z' fill='%230f0910' /%3e%3c/svg%3e";

const ChatbotScreen: React.FC<ChatbotScreenProps> = ({ onNavigateBack, language, setLanguage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<any>(null); // For SpeechRecognition
  const t = translations[language].chatbot;

  const stopCurrentAudio = useCallback(() => {
    if (activeAudioSourceRef.current) {
      activeAudioSourceRef.current.stop();
      activeAudioSourceRef.current.disconnect();
      activeAudioSourceRef.current = null;
    }
    setMessages(prev => prev.map(msg => ({ ...msg, audioState: msg.audioState === 'playing' ? 'none' : msg.audioState })));
  }, []);
  
  useEffect(() => {
    stopCurrentAudio();
    setMessages([
        { id: 1, sender: 'bot', text: t.initialMessage, audioState: 'none' },
    ]);
  }, [language, t.initialMessage, stopCurrentAudio]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePlayAudio = async (messageId: number, text: string) => {
    stopCurrentAudio();

    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, audioState: 'error' } : msg));
        return;
      }
    }

    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, audioState: 'loading' } : msg));

    try {
      const audioBase64 = await getTextToSpeech(text);
      if (!audioBase64) throw new Error("No audio data received");
      
      const audioBytes = decode(audioBase64);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, audioState: 'none' } : msg));
        activeAudioSourceRef.current = null;
      };
      
      source.start();
      activeAudioSourceRef.current = source;
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, audioState: 'playing' } : msg));
    } catch (error) {
      console.error("Error playing audio:", error);
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, audioState: 'error' } : msg));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    stopCurrentAudio();
    const userMessage: Message = { id: Date.now(), sender: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await getChatResponse(trimmedInput, language);
      const botMessage: Message = { id: Date.now() + 1, sender: 'bot', text: responseText, audioState: 'none' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: t.errorMessage,
        audioState: 'none',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.micAlert);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'kn' ? 'kn-IN' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
        }
      }
      setInputValue(transcript);
      if (event.results[0].isFinal) {
          // Automatically submit when speech recognition is final
          const finalTranscript = event.results[0][0].transcript.trim();
          if(finalTranscript) {
             setInputValue(finalTranscript); // update state to be sure
             // Faking a form submit event
             const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
             // Need to use a timeout to ensure state has updated before submitting
             setTimeout(() => handleSubmit(fakeEvent), 0);
          }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;
    recognitionRef.current.start();
    setIsRecording(true);
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${nandiHillsSunriseSvg}")` }}
            aria-hidden="true"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-amber-900/30 to-transparent" aria-hidden="true"></div>

      <header className="relative z-10 flex items-center justify-between p-4 bg-orange-600/80 backdrop-blur-sm text-white shadow-md">
        <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-orange-700/80">
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold">{t.headerTitle}</h1>
        <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
      </header>
      
      <main ref={chatContainerRef} className="relative z-10 flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && <div className="flex-shrink-0 w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center"><BotIcon /></div>}
            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-amber-600 text-white rounded-br-none' 
                  : 'bg-white text-amber-900 rounded-bl-none shadow-sm'
              }`}>
              <p className="text-md" style={{whiteSpace: 'pre-wrap'}}>{msg.text}</p>
              {msg.sender === 'bot' && (
                <div className="text-right mt-2">
                  <button 
                    onClick={() => handlePlayAudio(msg.id, msg.text)}
                    disabled={msg.audioState === 'loading' || msg.audioState === 'playing'}
                    className="p-1 rounded-full text-amber-600 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t.playAudioAriaLabel}
                  >
                    {msg.audioState === 'loading' ? <LoadingIcon className="animate-spin w-5 h-5"/> : <SpeakerIcon state={msg.audioState === 'playing' ? 'playing' : 'default'} />}
                  </button>
                </div>
              )}
            </div>
            {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center"><UserIcon /></div>}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-end gap-2">
             <div className="flex-shrink-0 w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center"><BotIcon /></div>
            <div className="p-3 rounded-2xl bg-white text-amber-900 rounded-bl-none shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 p-2 sm:p-4 bg-white/80 backdrop-blur-sm border-t border-amber-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="flex-grow p-3 border border-amber-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
           <button
            type="button"
            onClick={handleMicClick}
            className={`p-3 rounded-full flex-shrink-0 transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
            aria-label={isRecording ? t.micStopAriaLabel : t.micStartAriaLabel}
          >
            <MicrophoneIcon />
          </button>
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-orange-600 text-white rounded-full hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed flex-shrink-0"
            aria-label={t.sendAriaLabel}
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatbotScreen;