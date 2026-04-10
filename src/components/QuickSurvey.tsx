import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from './FirebaseProvider';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Users, Building2, ChevronRight, CheckCircle2, ArrowLeft, PieChart, TrendingUp, Scale, ClipboardList, ShieldCheck, Sparkles, BookOpen, Briefcase, GraduationCap, Award } from 'lucide-react';
import { cn } from '../lib/utils';

type Role = 'student' | 'parent' | 'business' | null;

export default function QuickSurvey() {
  const { t } = useFirebase();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>(null);
  const [step, setStep] = useState(1); // 1: Role, 2-5: Survey Questions, 6: Success
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleOptionSelect = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!role) return;
    
    setIsSubmitting(true);
    try {
      let roleSpecificData = {};
      if (role === 'student') {
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
      } else if (role === 'parent') {
        roleSpecificData = {
          topConcern: formData.topConcern,
          investmentReadiness: formData.investmentReadiness,
          monthlyDevelopmentBudget: formData.monthlyDevelopmentBudget,
          monitoringPreference: formData.monitoringPreference,
          infoChannel: formData.infoChannel
        };
      } else if (role === 'business') {
        roleSpecificData = {
          hiringNeed: formData.hiringNeed,
          recruitmentBudget: formData.recruitmentBudget,
          trainingField: formData.trainingField,
          mentorCapability: formData.mentorCapability,
          partnershipGoal: formData.partnershipGoal
        };
      }

      await addDoc(collection(db, 'quick_surveys'), {
        role,
        ...roleSpecificData,
        createdAt: Date.now(),
        source: 'landing_page_detailed'
      });
      setStep(6); // Success
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleSelection = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{t('surveyRoleSelect')}</h2>
        <p className="text-gray-500 font-medium">{t('surveyRoleDesc')}</p>
      </div>

      <div className="space-y-4">
        {[
          { id: 'student', icon: User, label: t('student'), desc: t('studentDesc'), color: 'text-[#1877F2]', bg: 'bg-blue-50', border: 'border-blue-100' },
          { id: 'parent', icon: Users, label: t('parent'), desc: t('parentDesc'), color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
          { id: 'business', icon: Building2, label: t('business'), desc: t('businessDesc'), color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleRoleSelect(item.id as Role)}
            className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#1877F2] hover:shadow-md transition-all group text-left"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mr-4", item.bg, item.color)}>
              <item.icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{item.label}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-[#1877F2] transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStudentSurvey = () => (
    <AnimatePresence mode="wait">
      {step === 2 && (
        <motion.div
          key="student-step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-indigo-600 mb-4">
            <PieChart size={24} />
            <h3 className="text-xl font-black">Tài chính & Thu nhập</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Mức lương part-time mong muốn của bạn?</p>
            {['Dưới 500k/tháng', '500k - 1 triệu/tháng', 'Trên 1 triệu/tháng'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('expectedSalary', opt)}
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.expectedSalary === opt 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
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
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.payForShadowing === opt 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
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
                  className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                    formData.shadowingPrice === opt 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
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
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.skillCourseBudget === opt 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            disabled={!formData.expectedSalary || !formData.payForShadowing || !formData.skillCourseBudget || (formData.payForShadowing === 'Có, nếu chất lượng tốt' && !formData.shadowingPrice)}
            onClick={handleNext}
            className="w-full py-4 mt-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors flex justify-center items-center"
          >
            Tiếp theo
          </button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          key="student-step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-pink-600 mb-4">
            <TrendingUp size={24} />
            <h3 className="text-xl font-black">Thị trường & Kỹ năng</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Bạn đang muốn tìm công việc lĩnh vực nào nhất?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Design', 'Video/TikTok', 'Event', 'F&B', 'Gia sư', 'Lập trình'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect('desiredSkill', opt)}
                  className={`p-4 rounded-2xl border-2 text-center font-bold transition-all ${
                    formData.desiredSkill === opt 
                    ? 'border-pink-500 bg-pink-50 text-pink-700' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-pink-200'
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
                  className={`p-4 rounded-2xl border-2 text-center font-bold transition-all ${
                    formData.location === opt 
                    ? 'border-pink-500 bg-pink-50 text-pink-700' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-pink-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!formData.desiredSkill || !formData.location}
            onClick={handleNext}
            className="w-full py-4 mt-6 bg-pink-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-700 transition-colors flex justify-center items-center"
          >
            Tiếp theo
          </button>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          key="student-step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-amber-500 mb-4">
            <Scale size={24} />
            <h3 className="text-xl font-black">Pháp luật & Quyền lợi</h3>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-amber-800 flex items-center gap-2">
              <Sparkles size={16} /> Bạn có biết?
            </h4>
            <p className="text-sm text-amber-900 leading-relaxed">
              Theo <b>Bộ luật Lao động 2019</b>, người lao động từ đủ 15 đến dưới 18 tuổi:
            </p>
            <ul className="text-xs text-amber-800 space-y-1 list-disc pl-4">
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
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.knowsLaborLaw === opt 
                  ? 'border-amber-500 bg-amber-50 text-amber-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-amber-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            disabled={!formData.knowsLaborLaw}
            onClick={handleNext}
            className="w-full py-4 mt-6 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors flex justify-center items-center"
          >
            Tiếp theo
          </button>
        </motion.div>
      )}

      {step === 5 && (
        <motion.div
          key="student-step4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-emerald-500 mb-4">
            <ClipboardList size={24} />
            <h3 className="text-xl font-black">Nền tảng sử dụng</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Bạn thường tìm việc làm qua kênh nào trước đây?</p>
            {['TopCV', 'Việc làm tốt', 'Facebook Groups', 'Bạn bè giới thiệu', 'Chưa từng tìm việc'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('currentPlatform', opt)}
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.currentPlatform === opt 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            disabled={!formData.currentPlatform || isSubmitting}
            onClick={handleSubmit}
            className="w-full py-4 mt-6 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors flex justify-center items-center"
          >
            {isSubmitting ? t('submitting') : t('surveySubmit')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderParentSurvey = () => (
    <AnimatePresence mode="wait">
      {step === 2 && (
        <motion.div
          key="parent-step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Users size={24} />
            <h3 className="text-xl font-black">Mối quan tâm hàng đầu</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Điều gì khiến bạn quan tâm nhất khi con tham gia TeenTask?</p>
            {['Phát triển kỹ năng mềm', 'Kinh nghiệm thực tế', 'Định hướng nghề nghiệp', 'An toàn & Pháp lý'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('topConcern', opt)}
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.topConcern === opt 
                  ? 'border-blue-600 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          
          <button
            disabled={!formData.topConcern}
            onClick={handleNext}
            className="w-full py-4 mt-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex justify-center items-center"
          >
            Tiếp theo
          </button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          key="parent-step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <Sparkles size={24} />
            <h3 className="text-xl font-black">Đầu tư cho tương lai</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Bạn có sẵn sàng đầu tư phí cho các buổi kiến tập chuyên sâu của con?</p>
            {['Sẵn sàng nếu chất lượng tốt', 'Cần cân nhắc mức phí', 'Ưu tiên các hoạt động miễn phí'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('investmentReadiness', opt)}
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.investmentReadiness === opt 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200'
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
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.monthlyDevelopmentBudget === opt 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            disabled={!formData.investmentReadiness || !formData.monthlyDevelopmentBudget}
            onClick={handleNext}
            className="w-full py-4 mt-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors flex justify-center items-center"
          >
            Tiếp theo
          </button>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          key="parent-step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-purple-600 mb-4">
            <ShieldCheck size={24} />
            <h3 className="text-xl font-black">Giám sát & Đồng hành</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Tính năng giám sát nào bạn mong đợi nhất?</p>
            {['Báo cáo tiến độ hàng tuần', 'Lịch trình làm việc chi tiết', 'Đánh giá trực tiếp từ Mentor', 'Xác thực doanh nghiệp'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('monitoringPreference', opt)}
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.monitoringPreference === opt 
                  ? 'border-purple-600 bg-purple-50 text-purple-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            disabled={!formData.monitoringPreference}
            onClick={handleNext}
            className="w-full py-4 mt-6 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors flex justify-center items-center"
          >
            Tiếp theo
          </button>
        </motion.div>
      )}

      {step === 5 && (
        <motion.div
          key="parent-step4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <BookOpen size={24} />
            <h3 className="text-xl font-black">Kênh thông tin</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Bạn thường tìm hiểu thông tin giáo dục qua đâu?</p>
            {['Facebook/Hội nhóm phụ huynh', 'Báo chí chính thống', 'Bạn bè/Người thân', 'Website giáo dục'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('infoChannel', opt)}
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.infoChannel === opt 
                  ? 'border-amber-600 bg-amber-50 text-amber-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-amber-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            disabled={!formData.infoChannel || isSubmitting}
            onClick={handleSubmit}
            className="w-full py-4 mt-6 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 transition-colors flex justify-center items-center"
          >
            {isSubmitting ? t('submitting') : t('surveySubmit')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderBusinessSurvey = () => (
    <AnimatePresence mode="wait">
      {step === 2 && (
        <motion.div
          key="business-step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-indigo-600 mb-4">
            <Briefcase size={24} />
            <h3 className="text-xl font-black">Nhu cầu nhân sự</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Doanh nghiệp có nhu cầu tuyển học sinh/thực tập sinh như thế nào?</p>
            {['Thường xuyên hàng tháng', 'Theo mùa vụ (Hè/Tết)', 'Theo dự án ngắn hạn', 'Chưa có nhu cầu ngay'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('hiringNeed', opt)}
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.hiringNeed === opt 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
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
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.recruitmentBudget === opt 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            disabled={!formData.hiringNeed || !formData.recruitmentBudget}
            onClick={handleNext}
            className="w-full py-4 mt-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors flex justify-center items-center"
          >
            Tiếp theo
          </button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          key="business-step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <GraduationCap size={24} />
            <h3 className="text-xl font-black">Lĩnh vực đào tạo</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Lĩnh vực nào doanh nghiệp có thể hỗ trợ đào tạo tốt nhất?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Marketing/Content', 'IT/Lập trình', 'F&B/Dịch vụ', 'Design/Media', 'Sự kiện', 'Khác'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect('trainingField', opt)}
                  className={`p-4 rounded-2xl border-2 text-center font-bold transition-all ${
                    formData.trainingField === opt 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!formData.trainingField}
            onClick={handleNext}
            className="w-full py-4 mt-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors flex justify-center items-center"
          >
            Tiếp theo
          </button>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          key="business-step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <Users size={24} />
            <h3 className="text-xl font-black">Đội ngũ Mentor</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Khả năng cung cấp Mentor hướng dẫn của doanh nghiệp?</p>
            {['Đã có đội ngũ sẵn sàng', 'Có thể sắp xếp nhân sự', 'Cần TeenTask hỗ trợ đào tạo Mentor', 'Chưa thể cung cấp Mentor'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('mentorCapability', opt)}
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.mentorCapability === opt 
                  ? 'border-amber-600 bg-amber-50 text-amber-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-amber-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            disabled={!formData.mentorCapability}
            onClick={handleNext}
            className="w-full py-4 mt-6 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 transition-colors flex justify-center items-center"
          >
            Tiếp theo
          </button>
        </motion.div>
      )}

      {step === 5 && (
        <motion.div
          key="business-step4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-md mx-auto w-full space-y-6"
        >
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} /> {t('back')}
          </button>
          <div className="flex items-center gap-2 text-pink-600 mb-4">
            <Award size={24} />
            <h3 className="text-xl font-black">Hợp tác lâu dài</h3>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Mong muốn hợp tác lâu dài với Học viện TeenTask?</p>
            {['Cung cấp học bổng kỹ năng', 'Tài trợ các sự kiện học sinh', 'Xây dựng lộ trình tuyển dụng', 'Chỉ tham gia các dự án lẻ'].map(opt => (
              <button
                key={opt}
                onClick={() => handleOptionSelect('partnershipGoal', opt)}
                className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                  formData.partnershipGoal === opt 
                  ? 'border-pink-600 bg-pink-50 text-pink-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-pink-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            disabled={!formData.partnershipGoal || isSubmitting}
            onClick={handleSubmit}
            className="w-full py-4 mt-6 bg-pink-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-700 transition-colors flex justify-center items-center"
          >
            {isSubmitting ? t('submitting') : t('surveySubmit')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderSuccess = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto w-full text-center"
    >
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={48} className="text-emerald-500" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">{t('surveySuccess')}</h2>
      <p className="text-gray-500 font-medium mb-8 leading-relaxed">
        {t('surveySuccessDesc')}
      </p>
      
      <button
        onClick={() => navigate('/profile')}
        className="w-full py-4 bg-[#1877F2] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
      >
        {t('surveyJoinNow')}
      </button>
      <button
        onClick={() => navigate('/')}
        className="w-full py-4 mt-3 bg-white text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
      >
        {t('home')}
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {step === 1 && renderRoleSelection()}
          {role === 'student' && step > 1 && step < 6 && renderStudentSurvey()}
          {role === 'parent' && step > 1 && step < 6 && renderParentSurvey()}
          {role === 'business' && step > 1 && step < 6 && renderBusinessSurvey()}
          {step === 6 && renderSuccess()}
        </AnimatePresence>
      </div>
    </div>
  );
}

