import { useState, useEffect } from 'react';
import { translateDynamicContent } from '../services/translationService';
import { useFirebase } from '../components/FirebaseProvider';

export function useSmartTranslation(text: string) {
  const { language } = useFirebase();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function handleTranslation() {
      if (!text || text.trim() === '') {
        setTranslatedText(text);
        return;
      }

      if (language === 'vi') {
        setTranslatedText(text);
        return;
      }

      setIsTranslating(true);
      try {
        const result = await translateDynamicContent(text, language);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (e) {
        console.error("Translation fail", e);
      } finally {
        if (isMounted) {
          setIsTranslating(false);
        }
      }
    }

    handleTranslation();

    return () => {
      isMounted = false;
    };
  }, [text, language]);

  return { translatedText, isTranslating };
}
