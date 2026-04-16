import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LinkedInModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  linkedInUrl: string;
  setLinkedInUrl: (url: string) => void;
  linkedInConfirm: boolean;
  setLinkedInConfirm: (confirm: boolean) => void;
  handleLinkedInSubmit: () => Promise<void>;
}

export default function LinkedInModal({
  isOpen, onClose, t, linkedInUrl, setLinkedInUrl, linkedInConfirm, setLinkedInConfirm, handleLinkedInSubmit
}: LinkedInModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#0077B5] text-white">
              <h3 className="text-xl font-black flex items-center gap-2">
                <div className="w-6 h-6 bg-white text-[#0077B5] rounded flex items-center justify-center font-bold text-xs">in</div>
                {t('linkedInModalTitle')}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 font-medium">{t('linkedInModalDesc')}</p>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{t('linkedInUrl')}</label>
                <input
                  type="url"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  placeholder={t('linkedInUrlPlaceholder')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20 outline-none transition-all"
                />
              </div>

              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={linkedInConfirm}
                  onChange={(e) => setLinkedInConfirm(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#0077B5] rounded border-gray-300 focus:ring-[#0077B5]"
                />
                <span className="text-sm font-medium text-gray-700">{t('linkedInConfirm')}</span>
              </label>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleLinkedInSubmit}
                  disabled={!linkedInUrl || !linkedInConfirm}
                  className="flex-1 py-3 bg-[#0077B5] text-white rounded-xl font-bold hover:bg-[#006097] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('linkedInSubmit')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
