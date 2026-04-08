import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronRight, MessageSquare, ThumbsUp, X, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    user: 'Nguyễn Minh Anh',
    avatar: 'https://i.pravatar.cc/150?u=1',
    rating: 5,
    comment: 'App cực kỳ hữu ích cho học sinh như mình. Giao diện đẹp và dễ dùng!',
    date: '2 ngày trước',
    likes: 12
  },
  {
    id: '2',
    user: 'Trần Hoàng Nam',
    avatar: 'https://i.pravatar.cc/150?u=2',
    rating: 4,
    comment: 'Nhiều cơ hội kiến tập xịn sò. Mong app có thêm nhiều job ở tỉnh lẻ hơn.',
    date: '1 tuần trước',
    likes: 8
  },
  {
    id: '3',
    user: 'Lê Thu Thảo',
    avatar: 'https://i.pravatar.cc/150?u=3',
    rating: 5,
    comment: 'Tính năng chat với bot rất thông minh, giải đáp thắc mắc nhanh chóng.',
    date: '3 ngày trước',
    likes: 15
  },
  {
    id: '4',
    user: 'Phạm Đức Duy',
    avatar: 'https://i.pravatar.cc/150?u=4',
    rating: 5,
    comment: 'Mình đã tìm được công việc part-time đầu tiên nhờ TeenTask. Cảm ơn đội ngũ!',
    date: '5 ngày trước',
    likes: 24
  }
];

export default function AppRatingWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_REVIEWS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const currentReview = MOCK_REVIEWS[currentIndex];

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Đánh giá ứng dụng</h3>
          <div className="flex items-center gap-1">
            <span className="text-sm font-black text-gray-900">4.8</span>
            <Star size={14} className="text-amber-400" fill="currentColor" />
          </div>
        </div>

        {/* Star Progress Bars (Simplified) */}
        <div className="space-y-2 mb-6">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400 w-2">{star}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full" 
                  style={{ width: `${star === 5 ? 85 : star === 4 ? 10 : 5}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rotating Feedback */}
        <div className="relative min-h-[120px] mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReview.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                  <img src={currentReview.avatar} alt={currentReview.user} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[10px] font-black text-gray-900">{currentReview.user}</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={8} 
                      className={cn(i < currentReview.rating ? "text-amber-400" : "text-gray-200")} 
                      fill="currentColor" 
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium italic leading-relaxed">
                "{currentReview.comment}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 bg-gray-50 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
        >
          Xem tất cả đánh giá
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Reviews Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Đánh giá & Nhận xét</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="text-amber-400" fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-500">4.8 trên 5</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Rating Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-gray-100">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-6xl font-black text-gray-900">4.8</span>
                    <div className="flex gap-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className="text-amber-400" fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">1,248 lượt đánh giá</span>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-500 w-2">{star}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full" 
                            style={{ width: `${star === 5 ? 85 : star === 4 ? 10 : 5}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-8">
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                            <img src={review.avatar} alt={review.user} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-gray-900">{review.user}</h4>
                            <div className="flex gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={10} 
                                  className={cn(i < review.rating ? "text-amber-400" : "text-gray-200")} 
                                  fill="currentColor" 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {review.comment}
                      </p>
                      <div className="flex items-center gap-4 pt-1">
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                          <ThumbsUp size={14} />
                          <span className="text-[10px] font-bold">{review.likes}</span>
                        </button>
                        <button className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                          Phản hồi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Chia sẻ cảm nhận của bạn..."
                      className="w-full py-3 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className="text-gray-300 hover:text-amber-400 cursor-pointer transition-colors" fill="currentColor" />
                    ))}
                  </div>
                </div>
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                  Gửi đánh giá của bạn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
