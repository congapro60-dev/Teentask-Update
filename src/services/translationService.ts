import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '' });

const translationCache: Record<string, string> = {};

export async function translateDynamicContent(text: string, targetLanguage: 'vi' | 'en'): Promise<string> {
  if (!text || text.trim() === '') return text;
  
  // If target is Vietnamese, return original
  if (targetLanguage === 'vi') return text;

  // Simple heuristic: if text looks like it's already English (mostly ASCII, common words)
  // For now we assume source is Vietnamese as per user requirement.

  const cacheKey = `${text.substring(0, 100)}_${targetLanguage}`; // Key by first 100 chars + lang
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional translator for a youth career platform called TeenTask. 
      Translate the following Vietnamese text to natural English. 
      Maintain the professional yet energetic tone suitable for teenagers and businesses.
      Return ONLY the translated string. Do not add quotes, explanations, or prefixes.
      
      Text to translate: ${text}`,
    });

    const translatedText = response.text?.trim() || text;
    translationCache[cacheKey] = translatedText;
    return translatedText;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return text;
  }
}
