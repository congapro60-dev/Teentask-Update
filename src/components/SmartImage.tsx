import React, { useState, useEffect } from 'react';
import { generateImageKeywords } from '../lib/gemini';
import { useFirebase } from './FirebaseProvider';
import { Image as ImageIcon } from 'lucide-react';

interface SmartImageProps {
  title: string;
  className?: string;
  fallbackUrl?: string;
  type?: 'logo' | 'banner';
}

export default function SmartImage({ title, className, fallbackUrl, type = 'logo' }: SmartImageProps) {
  const { profile } = useFirebase();
  const [imageUrl, setImageUrl] = useState<string | null>(fallbackUrl || null);
  const [loading, setLoading] = useState(!fallbackUrl);

  useEffect(() => {
    if (fallbackUrl) return;

    const fetchKeywords = async () => {
      try {
        const keywords = await generateImageKeywords(title, profile?.geminiApiKey);
        const width = type === 'logo' ? 200 : 800;
        const height = type === 'logo' ? 200 : 400;
        setImageUrl(`https://picsum.photos/seed/${keywords}/${width}/${height}`);
      } catch (error) {
        console.error("SmartImage error:", error);
        setImageUrl(`https://picsum.photos/seed/work/400/400`);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, [title, fallbackUrl, profile?.geminiApiKey, type]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center`}>
        <ImageIcon className="text-gray-300" size={24} />
      </div>
    );
  }

  return (
    <img 
      src={imageUrl || ''} 
      alt={title} 
      className={className} 
      referrerPolicy="no-referrer"
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/400/400';
      }}
    />
  );
}
