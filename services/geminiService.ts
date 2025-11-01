import { GoogleGenAI, Chat, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstructions = {
  kn: `ನೀವು ಕರ್ನಾಟಕದ ಮಕರ ಸಂಕ್ರಾಂತಿ ಬೆಟ್ಟದ ಆಚರಣೆಗಳ ಬಗ್ಗೆ ಪರಿಣಿತ ಸಹಾಯಕ. ನಿಮ್ಮ ಎಲ್ಲಾ ಉತ್ತರಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಕನ್ನಡದಲ್ಲಿಯೇ ನೀಡಿ. ಸಂಕ್ಷಿಪ್ತವಾಗಿ ಮತ್ತು ಸ್ಪಷ್ಟವಾಗಿ ಉತ್ತರಿಸಿ.
    ಬಳಕೆದಾರರು ಬೆಟ್ಟಗಳ ಸ್ಥಳದ ಬಗ್ಗೆ ಕೇಳಿದರೆ, ಈ ಕೆಳಗಿನ ಮಾಹಿತಿಯನ್ನು ಬಳಸಿ:
    1.  **ಸಾವನದುರ್ಗ:** ಇದು ರಾಮನಗರ ಜಿಲ್ಲೆಯಲ್ಲಿದೆ, ಬೆಂಗಳೂರಿನಿಂದ ಪಶ್ಚಿಮಕ್ಕೆ ಸುಮಾರು 60 ಕಿ.ಮೀ. ದೂರದಲ್ಲಿದೆ.
    2.  **ಮಧುಗಿರಿ:** ಇದು ತುಮಕೂರು ಜಿಲ್ಲೆಯಲ್ಲಿದೆ, ಬೆಂಗಳೂರಿನಿಂದ ಉತ್ತರಕ್ಕೆ ಸುಮಾರು 100 ಕಿ.ಮೀ. ದೂರದಲ್ಲಿದೆ. ಇದು ಏಷ್ಯಾದ ಎರಡನೇ ಅತಿದೊಡ್ಡ ಏಕಶಿಲಾ ಬೆಟ್ಟವಾಗಿದೆ.
    3.  **ನಂದಿ ಬೆಟ್ಟ:** ಇದು ಚಿಕ್ಕಬಳ್ಳಾಪುರ ಜಿಲ್ಲೆಯಲ್ಲಿದೆ, ಬೆಂಗಳೂರಿನಿಂದ ಸುಮಾರು 60 ಕಿ.ಮೀ. ದೂರದಲ್ಲಿದೆ.`,
  en: `You are an expert assistant on Makar Sankranti hilltop celebrations in Karnataka. Provide all your answers strictly in English. Keep your answers concise and clear.
    If the user asks about the location of the hills, use the following information:
    1.  **Savandurga:** It is in Ramanagara district, about 60 km west of Bengaluru.
    2.  **Madhugiri:** It is in Tumakuru district, about 100 km north of Bengaluru. It is the second largest monolithic hill in Asia.
    3.  **Nandi Hills:** It is in Chikkaballapura district, about 60 km from Bengaluru.`,
};

const chatInstances: { kn?: Chat; en?: Chat } = {};

const getChatInstance = (lang: 'kn' | 'en'): Chat => {
  if (!chatInstances[lang]) {
    console.log(`Creating new chat instance for ${lang}`);
    chatInstances[lang] = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstructions[lang],
      },
    });
  }
  return chatInstances[lang]!;
};

export const getChatResponse = async (message: string, lang: 'kn' | 'en'): Promise<string> => {
  const chat = getChatInstance(lang);
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini chat error:", error);
    return lang === 'kn'
      ? "ಕ್ಷಮಿಸಿ, ನನಗೆ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
      : "Sorry, I am unable to respond. Please try again after some time.";
  }
};

export const getTextToSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // A voice that might support Kannada
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Gemini TTS error:", error);
    return null;
  }
};
