import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VipAd {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  badge: string;
  icon: string;
  gradient: string;
  path: string;
}

const VIP_ADS: VipAd[] = [
  {
    id: '1',
    title: 'Khai trương Letefe Coffee',
    description: 'Tuyển 5 bạn quay TikTok chi nhánh Tây Hồ. Thưởng nóng 500k + Voucher Free nước 1 tháng!',
    buttonText: 'Nhận Job Ngay',
    badge: 'TÀI TRỢ VIP',
    icon: '☕',
    gradient: 'from-[#1a1c2c] to-[#4a192c]',
    path: '/jobs'
  },
  {
    id: '2',
    title: 'TheA Local Brand Tuyển Mẫu',
    description: 'Cần 3 bạn mẫu ảnh chụp BST Mùa Hè. Yêu cầu: Năng động, có gu thời trang. Lương 1tr/buổi.',
    buttonText: 'Xem Chi Tiết',
    badge: 'KIẾN TẬP VIP',
    icon: '👕',
    gradient: 'from-[#0f172a] to-[#1e293b]',
    path: '/jobs'
  },
  {
    id: '3',
    title: 'CLB Media Dewey Tuyển Thành Viên',
    description: 'Cơ hội thực chiến truyền thông, quay phim, dựng clip chuyên nghiệp. Nhận chứng chỉ từ CLB.',
    buttonText: 'Tham Gia Ngay',
    badge: 'TÀI TRỢ VIP',
    icon: '🎥',
    gradient: 'from-[#1e1b4b] to-[#312e81]',
    path: '/shadowing'
  }
];

export default function VipAdsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % VIP_ADS.length);
    }, 10000); // 10 seconds per ad

    return () => clearInterval(timer);
  }, []);

  const ad = VIP_ADS[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-[32px] shadow-2xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`relative w-full min-h-[220px] bg-gradient-to-br ${ad.gradient} p-8 flex flex-col justify-center`}
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{ad.badge}</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight leading-tight">
              <span className="mr-3">{ad.icon}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                {ad.title}
              </span>
            </h2>

            <p className="text-white/80 text-sm sm:text-base mb-8 max-w-xl font-medium leading-relaxed">
              {ad.description}
            </p>

            <button
              onClick={() => navigate(ad.path)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all active:scale-95 group/btn"
            >
              {ad.buttonText}
              <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="absolute bottom-6 right-8 flex gap-2">
            {VIP_ADS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
