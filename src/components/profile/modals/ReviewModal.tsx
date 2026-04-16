import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star } from 'lucide-react';
import { Application, Job } from '../../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: (Application & { job?: Job }) | null;
  reviewData: { rating: number; comment: string };
  setReviewData: (data: any) => void;
  handleSubmitReview: (e: React.FormEvent) => Promise<void>;
  submittingReview: boolean;
}

export default function ReviewModal({
  isOpen, onClose, selectedApp, reviewData, setReviewData, handleSubmitReview, submittingReview
}: ReviewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="w-full max-w-md bg-white rounded-t-[40px] p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Đánh giá</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-[#4F46E5]">
                <Star size={40} fill="currentColor" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Trải nghiệm của bạn tại</h3>
              <p className="text-[#4F46E5] font-black text-lg">{selectedApp.job?.businessName}</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className={`p-2 transition-transform active:scale-90 ${reviewData.rating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                  >
                    <Star size={32} fill={reviewData.rating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Nhận xét của bạn</label>
                <textarea
                  required
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-[#4F46E5] min-h-[120px]"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-4 bg-[#4F46E5] text-white rounded-2xl font-black shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {submittingReview ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
