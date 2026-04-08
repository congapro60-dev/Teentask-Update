import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight, Sparkles, TrendingUp, PieChart, Scale, ClipboardList } from 'lucide-react';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, useFirebase } from './FirebaseProvider';
import { useLocation } from 'react-router-dom';

export default function MarketSurveyModal() {
  const { profile } = useFirebase();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    expectedSalary: '',
    payForShadowing: '',
    desiredSkill: '',
    location: '',
    currentPlatform: ''
  });

  useEffect(() => {
    // Only show for logged in users who haven't completed the survey
    if (profile && profile.marketSurveyCompleted !== true) {
      if (location.pathname === '/') {
        // Delay slightly so it doesn't pop up instantly on load
        const timer = setTimeout(() => setIsOpen(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [profile, location.pathname]);

  if (!profile || profile.marketSurveyCompleted) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleOptionSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save survey data
      await addDoc(collection(db, 'market_surveys'), {
        userId: profile.uid,
        role: profile.role,
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. Mark user as completed
      await updateDoc(doc(db, 'users', profile.uid), {
        marketSurveyCompleted: true
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting survey:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-yellow-300" />
                <h2 className="text-xl font-black">Khảo sát nhanh (1 phút)</h2>
              </div>
              <p className="text-indigo-100 text-sm">
                Giúp TeenTask hiểu bạn hơn để cải thiện các tính năng Thị trường, Tài chính và So sánh!
              </p>
              
              {/* Progress Bar */}
              <div className="mt-6 flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden">
                    <motion.div 
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: step >= i ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 text-indigo-600 mb-4">
                      <PieChart size={20} />
                      <h3 className="font-bold">Tài chính & Thu nhập</h3>
                    </div>

                    <div className="space-y-3">
                      <p className="font-semibold text-gray-800">Mức lương part-time mong muốn của bạn?</p>
                      {['Dưới 500k/tháng', '500k - 1 triệu/tháng', 'Trên 1 triệu/tháng'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleOptionSelect('expectedSalary', opt)}
                          className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                            formData.expectedSalary === opt 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <p className="font-semibold text-gray-800">Bạn có sẵn sàng trả phí nhỏ để tham gia Job Shadowing (trải nghiệm nghề nghiệp) không?</p>
                      {['Có, nếu chất lượng tốt', 'Không, tôi chỉ muốn miễn phí'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleOptionSelect('payForShadowing', opt)}
                          className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                            formData.payForShadowing === opt 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 text-pink-600 mb-4">
                      <TrendingUp size={20} />
                      <h3 className="font-bold">Thị trường & Kỹ năng</h3>
                    </div>

                    <div className="space-y-3">
                      <p className="font-semibold text-gray-800">Bạn đang muốn tìm công việc lĩnh vực nào nhất?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['Design', 'Video/TikTok', 'Event', 'F&B', 'Gia sư', 'Lập trình'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleOptionSelect('desiredSkill', opt)}
                            className={`p-3 rounded-xl border-2 text-center font-medium transition-all ${
                              formData.desiredSkill === opt 
                              ? 'border-pink-500 bg-pink-50 text-pink-700' 
                              : 'border-gray-100 hover:border-pink-200 hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="font-semibold text-gray-800">Bạn đang sống ở đâu?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Cần Thơ', 'Khác'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleOptionSelect('location', opt)}
                            className={`p-3 rounded-xl border-2 text-center font-medium transition-all ${
                              formData.location === opt 
                              ? 'border-pink-500 bg-pink-50 text-pink-700' 
                              : 'border-gray-100 hover:border-pink-200 hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 text-amber-500 mb-4">
                      <Scale size={20} />
                      <h3 className="font-bold">Nền tảng sử dụng</h3>
                    </div>

                    <div className="space-y-3">
                      <p className="font-semibold text-gray-800">Bạn thường tìm việc làm qua kênh nào trước đây?</p>
                      {['TopCV', 'Việc làm tốt', 'Facebook Groups', 'Bạn bè giới thiệu', 'Chưa từng tìm việc'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleOptionSelect('currentPlatform', opt)}
                          className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                            formData.currentPlatform === opt 
                            ? 'border-amber-500 bg-amber-50 text-amber-700' 
                            : 'border-gray-100 hover:border-amber-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer Actions */}
              <div className="mt-8 flex justify-between items-center">
                {step > 1 ? (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Quay lại
                  </button>
                ) : <div></div>}

                {step < 3 ? (
                  <button 
                    onClick={handleNext}
                    disabled={
                      (step === 1 && (!formData.expectedSalary || !formData.payForShadowing)) ||
                      (step === 2 && (!formData.desiredSkill || !formData.location))
                    }
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp theo <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={!formData.currentPlatform || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? 'Đang gửi...' : (
                      <>Hoàn tất <CheckCircle2 size={18} /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Floating Button when Modal is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-28 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="relative">
              <ClipboardList size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </div>
            <span className="font-bold text-sm">Khảo sát nhận quà</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
