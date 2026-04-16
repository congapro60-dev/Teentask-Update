import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight, Sparkles, TrendingUp, PieChart, Scale, ClipboardList, ShieldCheck, BookOpen, Briefcase, Users, GraduationCap, Award } from 'lucide-react';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, useFirebase } from './FirebaseProvider';
import { useLocation } from 'react-router-dom';

export default function MarketSurveyModal() {
  const { profile } = useFirebase();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState<any>({
    // Student fields
    expectedSalary: '',
    payForShadowing: '',
    shadowingPrice: '',
    skillCourseBudget: '',
    desiredSkill: '',
    location: '',
    currentPlatform: '',
    knowsLaborLaw: '',
    // Parent fields
    topConcern: '',
    investmentReadiness: '',
    monthlyDevelopmentBudget: '',
    monitoringPreference: '',
    infoChannel: '',
    // Business fields
    hiringNeed: '',
    recruitmentBudget: '',
    trainingField: '',
    mentorCapability: '',
    partnershipGoal: ''
  });

  useEffect(() => {
    // Only show for logged in users who haven't completed the survey
    // Boss doesn't need to do survey
    if (profile && profile.marketSurveyCompleted !== true && profile.role !== 'admin' && profile.email !== 'congapro60@gmail.com') {
      if (location.pathname === '/') {
        // Delay slightly so it doesn't pop up instantly on load
        const timer = setTimeout(() => setIsOpen(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [profile, location.pathname]);

  if (!profile || profile.marketSurveyCompleted || profile.role === 'admin' || profile.email === 'congapro60@gmail.com') return null;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleOptionSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (profile.uid === 'demo-user') {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
        }, 3000);
        return;
      }

      // Filter data based on role to save clean data
      let roleSpecificData = {};
      if (profile.role === 'student') {
        roleSpecificData = {
          expectedSalary: formData.expectedSalary,
          payForShadowing: formData.payForShadowing,
          shadowingPrice: formData.shadowingPrice,
          skillCourseBudget: formData.skillCourseBudget,
          desiredSkill: formData.desiredSkill,
          location: formData.location,
          currentPlatform: formData.currentPlatform,
          knowsLaborLaw: formData.knowsLaborLaw
        };
      } else if (profile.role === 'parent') {
        roleSpecificData = {
          topConcern: formData.topConcern,
          investmentReadiness: formData.investmentReadiness,
          monthlyDevelopmentBudget: formData.monthlyDevelopmentBudget,
          monitoringPreference: formData.monitoringPreference,
          infoChannel: formData.infoChannel
        };
      } else if (profile.role === 'business') {
        roleSpecificData = {
          hiringNeed: formData.hiringNeed,
          recruitmentBudget: formData.recruitmentBudget,
          trainingField: formData.trainingField,
          mentorCapability: formData.mentorCapability,
          partnershipGoal: formData.partnershipGoal
        };
      }

      // 1. Save survey data
      await addDoc(collection(db, 'market_surveys'), {
        userId: profile.uid,
        role: profile.role,
        ...roleSpecificData,
        createdAt: serverTimestamp()
      });

      // 2. Mark user as completed
      await updateDoc(doc(db, 'users', profile.uid), {
        marketSurveyCompleted: true
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      const { handleFirestoreError, OperationType } = await import('./FirebaseProvider');
      handleFirestoreError(error, OperationType.WRITE, 'market_surveys');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStudentSurvey = () => (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div
          key="student-step1"
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

          {formData.payForShadowing === 'Có, nếu chất lượng tốt' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-2"
            >
              <p className="font-semibold text-gray-800">Mức phí bạn sẵn sàng chi trả cho 1 buổi kiến tập?</p>
              {['Dưới 100k', '100k - 300k', 'Trên 300k'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect('shadowingPrice', opt)}
                  className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                    formData.shadowingPrice === opt 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}

          <div className="space-y-3 pt-2">
            <p className="font-semibold text-gray-800">Bạn sẵn sàng chi bao nhiêu cho một khóa học kỹ năng chuyên sâu (có chứng chỉ)?</p>
            {['Dưới 200k', '200k - 500k', 'Trên 500k'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('skillCourseBudget', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.skillCourseBudget === opt 
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
          key="student-step2"
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
          key="student-step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-amber-500 mb-4">
            <Scale size={20} />
            <h3 className="font-bold">Pháp luật & Quyền lợi</h3>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-amber-800 flex items-center gap-2">
              <Sparkles size={16} /> Bạn có biết?
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              Theo <b>Bộ luật Lao động 2019</b>, người lao động từ đủ 15 đến dưới 18 tuổi:
            </p>
            <ul className="text-[10px] text-amber-800 space-y-1 list-disc pl-4">
              <li>Thời giờ làm việc không quá 08 giờ/ngày và 40 giờ/tuần.</li>
              <li>Không được làm các công việc nặng nhọc, độc hại, nguy hiểm.</li>
              <li>Phải có sự đồng ý của cha, mẹ hoặc người giám hộ.</li>
              <li>Được hưởng đầy đủ các quyền lợi về lương, nghỉ ngơi và bảo hiểm.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Bạn đã nắm rõ các quy định này chưa?</p>
            {['Đã nắm rõ', 'Chưa biết, cảm ơn TeenTask đã chia sẻ', 'Cần tìm hiểu thêm'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('knowsLaborLaw', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.knowsLaborLaw === opt 
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

      {step === 4 && (
        <motion.div
          key="student-step4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-emerald-500 mb-4">
            <ClipboardList size={20} />
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
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderParentSurvey = () => (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div
          key="parent-step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Users size={20} />
            <h3 className="font-bold">Mối quan tâm hàng đầu</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Điều gì khiến bạn quan tâm nhất khi con tham gia TeenTask?</p>
            {['Phát triển kỹ năng mềm', 'Kinh nghiệm thực tế', 'Định hướng nghề nghiệp', 'An toàn & Pháp lý'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('topConcern', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.topConcern === opt 
                  ? 'border-blue-600 bg-blue-50 text-blue-700' 
                  : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-600'
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
          key="parent-step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <Sparkles size={20} />
            <h3 className="font-bold">Đầu tư cho tương lai</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Bạn có sẵn sàng đầu tư phí cho các buổi kiến tập chuyên sâu của con?</p>
            {['Sẵn sàng nếu chất lượng tốt', 'Cần cân nhắc mức phí', 'Ưu tiên các hoạt động miễn phí'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('investmentReadiness', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.investmentReadiness === opt 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <p className="font-semibold text-gray-800">Ngân sách hàng tháng bạn dự kiến dành cho các hoạt động trải nghiệm thực tế của con?</p>
            {['Dưới 500k', '500k - 2 triệu', 'Trên 2 triệu'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('monthlyDevelopmentBudget', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.monthlyDevelopmentBudget === opt 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          key="parent-step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-purple-600 mb-4">
            <ShieldCheck size={20} />
            <h3 className="font-bold">Giám sát & Đồng hành</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Tính năng giám sát nào bạn mong đợi nhất?</p>
            {['Báo cáo tiến độ hàng tuần', 'Lịch trình làm việc chi tiết', 'Đánh giá trực tiếp từ Mentor', 'Xác thực doanh nghiệp'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('monitoringPreference', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.monitoringPreference === opt 
                  ? 'border-purple-600 bg-purple-50 text-purple-700' 
                  : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          key="parent-step4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <BookOpen size={20} />
            <h3 className="font-bold">Kênh thông tin</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Bạn thường tìm hiểu thông tin giáo dục qua đâu?</p>
            {['Facebook/Hội nhóm phụ huynh', 'Báo chí chính thống', 'Bạn bè/Người thân', 'Website giáo dục'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('infoChannel', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.infoChannel === opt 
                  ? 'border-amber-600 bg-amber-50 text-amber-700' 
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
  );

  const renderBusinessSurvey = () => (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div
          key="business-step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-indigo-600 mb-4">
            <Briefcase size={20} />
            <h3 className="font-bold">Nhu cầu nhân sự</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Doanh nghiệp có nhu cầu tuyển học sinh/thực tập sinh như thế nào?</p>
            {['Thường xuyên hàng tháng', 'Theo mùa vụ (Hè/Tết)', 'Theo dự án ngắn hạn', 'Chưa có nhu cầu ngay'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('hiringNeed', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.hiringNeed === opt 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <p className="font-semibold text-gray-800">Mức phí doanh nghiệp sẵn sàng chi trả để tiếp cận và tuyển dụng nhân tài trẻ chất lượng cao (Premium Matching)?</p>
            {['Dưới 1 triệu/vị trí', '1 - 3 triệu/vị trí', 'Trên 3 triệu/vị trí'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('recruitmentBudget', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.recruitmentBudget === opt 
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
          key="business-step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <GraduationCap size={20} />
            <h3 className="font-bold">Lĩnh vực đào tạo</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Lĩnh vực nào doanh nghiệp có thể hỗ trợ đào tạo tốt nhất?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Marketing/Content', 'IT/Lập trình', 'F&B/Dịch vụ', 'Design/Media', 'Sự kiện', 'Khác'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect('trainingField', opt)}
                  className={`p-3 rounded-xl border-2 text-center font-medium transition-all ${
                    formData.trainingField === opt 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50 text-gray-600'
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
          key="business-step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <Users size={20} />
            <h3 className="font-bold">Đội ngũ Mentor</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Khả năng cung cấp Mentor hướng dẫn của doanh nghiệp?</p>
            {['Đã có đội ngũ sẵn sàng', 'Có thể sắp xếp nhân sự', 'Cần TeenTask hỗ trợ đào tạo Mentor', 'Chưa thể cung cấp Mentor'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('mentorCapability', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.mentorCapability === opt 
                  ? 'border-amber-600 bg-amber-50 text-amber-700' 
                  : 'border-gray-100 hover:border-amber-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          key="business-step4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-pink-600 mb-4">
            <Award size={20} />
            <h3 className="font-bold">Hợp tác lâu dài</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Mong muốn hợp tác lâu dài với Học viện TeenTask?</p>
            {['Cung cấp học bổng kỹ năng', 'Tài trợ các sự kiện học sinh', 'Xây dựng lộ trình tuyển dụng', 'Chỉ tham gia các dự án lẻ'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('partnershipGoal', opt)}
                className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${
                  formData.partnershipGoal === opt 
                  ? 'border-pink-600 bg-pink-50 text-pink-700' 
                  : 'border-gray-100 hover:border-pink-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative"
          >
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center space-y-6"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-900">Tuyệt vời!</h2>
                  <p className="text-gray-600 font-medium">Cảm ơn bạn đã hoàn thành khảo sát. Ý kiến của bạn sẽ giúp TeenTask trở nên hoàn thiện hơn!</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold animate-pulse">
                  <Sparkles size={16} />
                  <span>Đang quay lại trang chủ...</span>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Sparkles className="text-amber-300" />
                    </motion.div>
                    <h2 className="text-2xl font-black tracking-tight">Khảo sát Gen Z (1 phút)</h2>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed font-medium">
                    {profile.role === 'student' && "Giúp TeenTask hiểu bạn hơn để cải thiện các tính năng Thị trường, Tài chính và So sánh!"}
                    {profile.role === 'parent' && "Chia sẻ mong muốn của bạn để TeenTask đồng hành tốt nhất cùng hành trình của con!"}
                    {profile.role === 'business' && "Giúp chúng tôi tối ưu nguồn lực và kết nối nhân tài phù hợp với doanh nghiệp của bạn!"}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mt-8 flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-2 flex-1 rounded-full bg-white/20 overflow-hidden">
                        <motion.div 
                          className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: step >= i ? '100%' : '0%' }}
                          transition={{ duration: 0.5, ease: "circOut" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="p-8 max-h-[50vh] overflow-y-auto custom-scrollbar bg-white">
                  {profile.role === 'student' && renderStudentSurvey()}
                  {profile.role === 'parent' && renderParentSurvey()}
                  {profile.role === 'business' && renderBusinessSurvey()}
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-white">
                  {step > 1 ? (
                    <button 
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-3 text-gray-400 font-bold hover:text-gray-900 transition-colors uppercase tracking-widest text-[10px]"
                    >
                      Quay lại
                    </button>
                  ) : <div></div>}

                  {step < 4 ? (
                    <button 
                      onClick={handleNext}
                      disabled={
                        (profile.role === 'student' && (
                          (step === 1 && (!formData.expectedSalary || !formData.payForShadowing || !formData.skillCourseBudget || (formData.payForShadowing === 'Có, nếu chất lượng tốt' && !formData.shadowingPrice))) ||
                          (step === 2 && (!formData.desiredSkill || !formData.location)) ||
                          (step === 3 && !formData.knowsLaborLaw)
                        )) ||
                        (profile.role === 'parent' && (
                          (step === 1 && !formData.topConcern) ||
                          (step === 2 && (!formData.investmentReadiness || !formData.monthlyDevelopmentBudget)) ||
                          (step === 3 && !formData.monitoringPreference)
                        )) ||
                        (profile.role === 'business' && (
                          (step === 1 && (!formData.hiringNeed || !formData.recruitmentBudget)) ||
                          (step === 2 && !formData.trainingField) ||
                          (step === 3 && !formData.mentorCapability)
                        ))
                      }
                      className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      Tiếp theo <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={
                        (profile.role === 'student' && !formData.currentPlatform) ||
                        (profile.role === 'parent' && !formData.infoChannel) ||
                        (profile.role === 'business' && !formData.partnershipGoal) ||
                        isSubmitting
                      }
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Sparkles size={14} />
                          </motion.div>
                          Đang gửi...
                        </span>
                      ) : (
                        <>Hoàn tất <CheckCircle2 size={16} /></>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
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
