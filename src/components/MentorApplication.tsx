import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from './FirebaseProvider';
import { GraduationCap, Briefcase, Award, CheckCircle } from 'lucide-react';

export default function MentorApplication() {
  const { profile, updateProfile } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    yearsOfExperience: 1,
    field: '',
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    try {
      await updateProfile({
        mentorStatus: 'pending',
        mentorProfile: formData
      });
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting mentor application:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (success || profile?.mentorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Đã gửi yêu cầu!</h2>
          <p className="text-gray-600 mb-8">
            Cảm ơn bạn đã đăng ký trở thành Mentor. Ban quản trị TeenTask sẽ xem xét hồ sơ và phản hồi trong thời gian sớm nhất.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Quay lại
          </button>
        </motion.div>
      </div>
    );
  }

  if (profile?.isMentor || profile?.mentorStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Bạn đã là Mentor!</h2>
          <p className="text-gray-600 mb-8">
            Tài khoản của bạn đã được cấp quyền Mentor. Bạn có thể tạo các buổi Kiến tập (Job Shadowing) để chia sẻ kinh nghiệm.
          </p>
          <a 
            href="/shadowing-manage"
            className="block w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Quản lý Kiến tập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Đăng ký trở thành Mentor</h1>
          <p className="text-gray-600">Chia sẻ kinh nghiệm, định hướng nghề nghiệp và truyền cảm hứng cho thế hệ trẻ.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Chức danh hiện tại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="VD: Senior Software Engineer, Giám đốc Marketing..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Công ty / Nơi công tác</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Tên công ty hoặc tổ chức"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Lĩnh vực chuyên môn</label>
                  <input
                    type="text"
                    required
                    value={formData.field}
                    onChange={(e) => setFormData({...formData, field: e.target.value})}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="VD: Công nghệ thông tin, Kinh tế..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Số năm kinh nghiệm</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value)})}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giới thiệu bản thân (Bio)</label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Chia sẻ ngắn gọn về hành trình sự nghiệp và lý do bạn muốn trở thành Mentor..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Gửi yêu cầu đăng ký'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
