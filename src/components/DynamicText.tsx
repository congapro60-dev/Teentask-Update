import React from 'react';
import { useSmartTranslation } from '../hooks/useSmartTranslation';
import { motion, AnimatePresence } from 'motion/react';

interface DynamicTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'p';
}

export default function DynamicText({ text, className, as: Component = 'span' }: DynamicTextProps) {
  const { translatedText, isTranslating } = useSmartTranslation(text);

  return (
    <Component className={className}>
      <AnimatePresence mode="wait">
        <motion.span
          key={translatedText}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.5 }}
          transition={{ duration: 0.2 }}
          className={isTranslating ? 'animate-pulse' : ''}
        >
          {translatedText}
        </motion.span>
      </AnimatePresence>
    </Component>
  );
}
