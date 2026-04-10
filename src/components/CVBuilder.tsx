import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Save, Download, Plus, Trash2, 
  User, Mail, Phone, MapPin, Briefcase, 
  GraduationCap, Award, Globe, Languages, 
  CheckCircle2, Loader2, FileText, Sparkles,
  Camera, Upload, X, Layout, Crown, Gem, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from './FirebaseProvider';
import { CV } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';

const TEMPLATES = [
  { id: 'basic', name: 'Cơ bản', icon: FileText, vip: false, price: 0 },
  { id: 'advanced', name: 'Nâng cao', icon: Crown, vip: true, price: 0 },
  { id: 'exclusive', name: 'Độc quyền', icon: Gem, vip: true, price: 50000 },
];

export default function CVBuilder() {
  const navigate = useNavigate();
  const { profile, saveCV, getCV } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const cvRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<CV>>({
    fullName: profile?.displayName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.location || '',
    summary: '',
    education: [],
    experience: [],
    skills: profile?.skills || [],
    projects: [],
    languages: [],
    photoURL: profile?.photoURL || ''
  });

  useEffect(() => {
    const fetchCV = async () => {
      if (profile?.cvId) {
        const data = await getCV(profile.cvId);
        if (data) {
          setFormData(data);
          if (data.templateId) {
            setSelectedTemplate(data.templateId);
          }
        }
      }
      setLoading(false);
    };
    fetchCV();
  }, [profile?.cvId, getCV]);

  const handleAIAutoFill = async () => {
    if (!profile?.isVip) {
      alert('Tính năng này chỉ dành cho thành viên VIP!');
      return;
    }

    setGenerating(true);
    try {
      const apiKey = profile?.geminiApiKey || process.env.GEMINI_API_KEY || '';

      if (!apiKey) {
        throw new Error('Không tìm thấy API Key.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Bạn là một chuyên gia viết CV chuyên nghiệp. Dựa trên thông tin người dùng cung cấp (Họ tên: ${formData.fullName}, Email: ${formData.email}, Kỹ năng: ${formData.skills?.join(', ')}), hãy tạo một bản tóm tắt bản thân ấn tượng, đề xuất 2 kinh nghiệm làm việc giả định phù hợp với lứa tuổi học sinh/sinh viên, 2 dự án cá nhân và 2 thông tin học vấn. 
      Trả về kết quả dưới dạng JSON với cấu trúc:
      {
        "summary": "string",
        "education": [{"school": "string", "degree": "string", "startDate": "string", "endDate": "string", "description": "string"}],
        "experience": [{"company": "string", "position": "string", "startDate": "string", "endDate": "string", "description": "string"}],
        "projects": [{"title": "string", "description": "string", "link": "string"}]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    school: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    position: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    link: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const aiData = JSON.parse(response.text);
      setFormData(prev => ({
        ...prev,
        summary: aiData.summary || prev.summary,
        education: [...(prev.education || []), ...(aiData.education || [])],
        experience: [...(prev.experience || []), ...(aiData.experience || [])],
        projects: [...(prev.projects || []), ...(aiData.projects || [])]
      }));
      
      alert('AI đã tạo nội dung gợi ý thành công!');
    } catch (error) {
      console.error('AI Generation error:', error);
      alert('Có lỗi xảy ra khi sử dụng AI. Vui lòng thử lại sau.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCV({ ...formData, templateId: selectedTemplate });
      alert('Đã lưu CV thành công!');
    } catch (error) {
      console.error('Error saving CV:', error);
      alert('Có lỗi xảy ra khi lưu CV.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvRef.current) return;
    
    setSaving(true);
    try {
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CV_${formData.fullName?.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Có lỗi xảy ra khi tải PDF.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('Dung lượng ảnh không được vượt quá 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...(prev.education || []), { school: '', degree: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education?.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...(prev.experience || []), { company: '', position: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience?.filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { title: '', description: '', link: '' }]
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 text-[#1877F2] animate-spin" />
      </div>
    );
  }

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#1877F2]">
        <Icon size={18} />
      </div>
      <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
    </div>
  );

  const InputField = ({ label, value, onChange, placeholder, type = "text", multiline = false }: any) => (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-[#1877F2] focus:ring-4 focus:ring-blue-50 transition-all outline-none min-h-[100px] resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-[#1877F2] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Trình tạo CV</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            {showPreview ? 'Chỉnh sửa' : 'Xem trước'}
          </button>
          {showPreview && (
            <button 
              onClick={handleDownloadPDF}
              disabled={saving}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-100 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Tải PDF
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#1877F2] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!showPreview ? (
          <div className="space-y-8">
            {/* Template Selection */}
            <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <SectionTitle icon={Layout} title="Chọn mẫu CV" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      if (tpl.vip && !profile?.isVip) {
                        alert('Mẫu này chỉ dành cho thành viên VIP!');
                        return;
                      }
                      setSelectedTemplate(tpl.id);
                    }}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden",
                      selectedTemplate === tpl.id 
                        ? "border-[#1877F2] bg-blue-50" 
                        : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    {tpl.vip && (
                      <div className="absolute top-0 right-0 p-1 bg-amber-400 text-white rounded-bl-xl">
                        <Star size={10} fill="currentColor" />
                      </div>
                    )}
                    <tpl.icon size={24} className={selectedTemplate === tpl.id ? "text-[#1877F2]" : "text-gray-400"} />
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-900">{tpl.name}</p>
                      <p className="text-[10px] font-bold text-gray-400">
                        {tpl.price > 0 ? `${tpl.price.toLocaleString('vi-VN')}đ` : (tpl.vip ? 'VIP Miễn phí' : 'Miễn phí')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* AI Auto-fill */}
            {profile?.isVip && (
              <section className="bg-gradient-to-r from-[#1877F2] to-[#4F46E5] p-6 rounded-[32px] shadow-xl text-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <Sparkles size={24} className="text-amber-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">AI CV Builder</h3>
                      <p className="text-xs text-white/80 font-medium">Tự động điền thông tin CV bằng trí tuệ nhân tạo</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleAIAutoFill}
                    disabled={generating}
                    className="px-6 py-3 bg-white text-[#1877F2] rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Tạo ngay
                  </button>
                </div>
              </section>
            )}

            {/* Basic Info */}
            <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <SectionTitle icon={User} title="Thông tin cơ bản" />
              
              {/* Photo Upload */}
              <div className="mb-8 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[40px] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-primary/50">
                    {formData.photoURL ? (
                      <img src={formData.photoURL} alt="CV Portrait" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Camera size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ảnh chân dung</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                  >
                    <Upload size={18} />
                  </button>
                  {formData.photoURL && (
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, photoURL: '' }))}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Tải lên ảnh chân dung chuyên nghiệp (Tối đa 1MB)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <InputField label="Họ và tên" value={formData.fullName} onChange={(v: string) => setFormData({...formData, fullName: v})} placeholder="Nguyễn Văn A" />
                <InputField label="Email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} placeholder="example@gmail.com" type="email" />
                <InputField label="Số điện thoại" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} placeholder="0123 456 789" />
                <InputField label="Địa chỉ" value={formData.address} onChange={(v: string) => setFormData({...formData, address: v})} placeholder="Hà Nội, Việt Nam" />
              </div>
              <InputField label="Giới thiệu bản thân" value={formData.summary} onChange={(v: string) => setFormData({...formData, summary: v})} placeholder="Tóm tắt ngắn gọn về bản thân, mục tiêu nghề nghiệp..." multiline />
            </section>

            {/* Education */}
            <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <SectionTitle icon={GraduationCap} title="Học vấn" />
                <button onClick={addEducation} className="p-2 bg-blue-50 text-[#1877F2] rounded-xl hover:bg-blue-100 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-6">
                {formData.education?.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl relative group">
                    <button 
                      onClick={() => removeEducation(idx)}
                      className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                      <InputField label="Trường học" value={edu.school} onChange={(v: string) => {
                        const newEdu = [...(formData.education || [])];
                        newEdu[idx].school = v;
                        setFormData({...formData, education: newEdu});
                      }} placeholder="THPT Phan Đình Phùng" />
                      <InputField label="Bằng cấp / Khối lớp" value={edu.degree} onChange={(v: string) => {
                        const newEdu = [...(formData.education || [])];
                        newEdu[idx].degree = v;
                        setFormData({...formData, education: newEdu});
                      }} placeholder="Lớp 11A1" />
                      <InputField label="Ngày bắt đầu" value={edu.startDate} onChange={(v: string) => {
                        const newEdu = [...(formData.education || [])];
                        newEdu[idx].startDate = v;
                        setFormData({...formData, education: newEdu});
                      }} placeholder="09/2022" />
                      <InputField label="Ngày kết thúc" value={edu.endDate} onChange={(v: string) => {
                        const newEdu = [...(formData.education || [])];
                        newEdu[idx].endDate = v;
                        setFormData({...formData, education: newEdu});
                      }} placeholder="Hiện tại" />
                    </div>
                    <InputField label="Mô tả thêm" value={edu.description} onChange={(v: string) => {
                      const newEdu = [...(formData.education || [])];
                      newEdu[idx].description = v;
                      setFormData({...formData, education: newEdu});
                    }} placeholder="Thành tích học tập, các môn học tiêu biểu..." multiline />
                  </div>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <SectionTitle icon={Briefcase} title="Kinh nghiệm làm việc" />
                <button onClick={addExperience} className="p-2 bg-blue-50 text-[#1877F2] rounded-xl hover:bg-blue-100 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-6">
                {formData.experience?.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl relative group">
                    <button 
                      onClick={() => removeExperience(idx)}
                      className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                      <InputField label="Công ty / Tổ chức" value={exp.company} onChange={(v: string) => {
                        const newExp = [...(formData.experience || [])];
                        newExp[idx].company = v;
                        setFormData({...formData, experience: newExp});
                      }} placeholder="The Coffee House" />
                      <InputField label="Vị trí" value={exp.position} onChange={(v: string) => {
                        const newExp = [...(formData.experience || [])];
                        newExp[idx].position = v;
                        setFormData({...formData, experience: newExp});
                      }} placeholder="Nhân viên phục vụ" />
                      <InputField label="Ngày bắt đầu" value={exp.startDate} onChange={(v: string) => {
                        const newExp = [...(formData.experience || [])];
                        newExp[idx].startDate = v;
                        setFormData({...formData, experience: newExp});
                      }} placeholder="06/2023" />
                      <InputField label="Ngày kết thúc" value={exp.endDate} onChange={(v: string) => {
                        const newExp = [...(formData.experience || [])];
                        newExp[idx].endDate = v;
                        setFormData({...formData, experience: newExp});
                      }} placeholder="08/2023" />
                    </div>
                    <InputField label="Mô tả công việc" value={exp.description} onChange={(v: string) => {
                      const newExp = [...(formData.experience || [])];
                      newExp[idx].description = v;
                      setFormData({...formData, experience: newExp});
                    }} placeholder="Các nhiệm vụ chính, kết quả đạt được..." multiline />
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <SectionTitle icon={Award} title="Kỹ năng" />
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills?.map((skill, idx) => (
                  <div key={idx} className="px-3 py-1.5 bg-blue-50 text-[#1877F2] text-xs font-bold rounded-xl flex items-center gap-2">
                    {skill}
                    <button onClick={() => setFormData({...formData, skills: formData.skills?.filter((_, i) => i !== idx)})}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Thêm kỹ năng mới..." 
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#1877F2]"
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter' && e.target.value) {
                      setFormData({...formData, skills: [...(formData.skills || []), e.target.value]});
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </section>

            {/* Projects */}
            <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <SectionTitle icon={Globe} title="Dự án cá nhân" />
                <button onClick={addProject} className="p-2 bg-blue-50 text-[#1877F2] rounded-xl hover:bg-blue-100 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-6">
                {formData.projects?.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl relative group">
                    <button 
                      onClick={() => removeProject(idx)}
                      className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <InputField label="Tên dự án" value={proj.title} onChange={(v: string) => {
                      const newProj = [...(formData.projects || [])];
                      newProj[idx].title = v;
                      setFormData({...formData, projects: newProj});
                    }} placeholder="Website bán hàng cá nhân" />
                    <InputField label="Link dự án (nếu có)" value={proj.link} onChange={(v: string) => {
                      const newProj = [...(formData.projects || [])];
                      newProj[idx].link = v;
                      setFormData({...formData, projects: newProj});
                    }} placeholder="https://github.com/..." />
                    <InputField label="Mô tả dự án" value={proj.description} onChange={(v: string) => {
                      const newProj = [...(formData.projects || [])];
                      newProj[idx].description = v;
                      setFormData({...formData, projects: newProj});
                    }} placeholder="Công nghệ sử dụng, vai trò của bạn..." multiline />
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            {/* CV Preview Section */}
            <div className="bg-white shadow-2xl rounded-none md:rounded-lg overflow-hidden border border-gray-200" ref={cvRef}>
              {selectedTemplate === 'basic' && (
                <div className="flex flex-col md:flex-row min-h-[1123px]">
                  {/* Sidebar */}
                  <div className="w-full md:w-1/3 bg-[#1e293b] text-white p-8">
                    <div className="mb-8">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mx-auto mb-4 bg-gray-700">
                        <img src={formData.photoURL || 'https://i.pravatar.cc/300'} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <h2 className="text-xl font-bold text-center uppercase tracking-wider">{formData.fullName}</h2>
                      <p className="text-center text-blue-400 text-sm font-medium mt-1">Học sinh / Sinh viên</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4 text-white/50">Liên hệ</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-xs">
                            <Mail size={14} className="text-blue-400 shrink-0" />
                            <span className="break-all">{formData.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <Phone size={14} className="text-blue-400 shrink-0" />
                            <span>{formData.phone}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <MapPin size={14} className="text-blue-400 shrink-0" />
                            <span>{formData.address}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2 mb-4 text-white/50">Kỹ năng</h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills?.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-white/10 rounded text-[10px] font-medium">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 bg-white p-10 text-gray-800">
                    <div className="mb-10">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1877F2] mb-4 flex items-center gap-2">
                        <User size={18} />
                        Giới thiệu bản thân
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-600">{formData.summary || 'Chưa có thông tin giới thiệu.'}</p>
                    </div>

                    <div className="mb-10">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1877F2] mb-6 flex items-center gap-2">
                        <GraduationCap size={18} />
                        Học vấn
                      </h3>
                      <div className="space-y-6">
                        {formData.education?.map((edu, i) => (
                          <div key={i} className="relative pl-6 border-l-2 border-gray-100">
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#1877F2]"></div>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-gray-900">{edu.school}</h4>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">{edu.startDate} - {edu.endDate}</span>
                            </div>
                            <p className="text-xs font-bold text-[#1877F2] mb-2">{edu.degree}</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{edu.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-10">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1877F2] mb-6 flex items-center gap-2">
                        <Briefcase size={18} />
                        Kinh nghiệm làm việc
                      </h3>
                      <div className="space-y-6">
                        {formData.experience?.map((exp, i) => (
                          <div key={i} className="relative pl-6 border-l-2 border-gray-100">
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#1877F2]"></div>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-gray-900">{exp.company}</h4>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <p className="text-xs font-bold text-[#1877F2] mb-2">{exp.position}</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1877F2] mb-6 flex items-center gap-2">
                        <Globe size={18} />
                        Dự án tiêu biểu
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {formData.projects?.map((proj, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{proj.title}</h4>
                            {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline mb-2 block">{proj.link}</a>}
                            <p className="text-xs text-gray-600 leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === 'advanced' && (
                <div className="min-h-[1123px] bg-white p-12">
                  <div className="flex items-center gap-8 mb-12 border-b-4 border-gray-900 pb-8">
                    <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={formData.photoURL || 'https://i.pravatar.cc/300'} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-2">{formData.fullName}</h2>
                      <p className="text-xl font-bold text-[#1877F2] uppercase tracking-widest mb-4">Học sinh / Sinh viên</p>
                      <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                        <span className="flex items-center gap-2"><Mail size={16} /> {formData.email}</span>
                        <span className="flex items-center gap-2"><Phone size={16} /> {formData.phone}</span>
                        <span className="flex items-center gap-2"><MapPin size={16} /> {formData.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-12">
                    <div className="col-span-2 space-y-12">
                      <section>
                        <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-[#1877F2] pl-4 mb-6">Kinh nghiệm</h3>
                        <div className="space-y-8">
                          {formData.experience?.map((exp, i) => (
                            <div key={i}>
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="text-lg font-black text-gray-900">{exp.company}</h4>
                                <span className="text-xs font-bold text-gray-400">{exp.startDate} - {exp.endDate}</span>
                              </div>
                              <p className="text-sm font-bold text-[#1877F2] mb-3">{exp.position}</p>
                              <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-[#1877F2] pl-4 mb-6">Học vấn</h3>
                        <div className="space-y-8">
                          {formData.education?.map((edu, i) => (
                            <div key={i}>
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="text-lg font-black text-gray-900">{edu.school}</h4>
                                <span className="text-xs font-bold text-gray-400">{edu.startDate} - {edu.endDate}</span>
                              </div>
                              <p className="text-sm font-bold text-[#1877F2] mb-3">{edu.degree}</p>
                              <p className="text-sm text-gray-600 leading-relaxed">{edu.description}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-12">
                      <section>
                        <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-[#1877F2] pl-4 mb-6">Tóm tắt</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{formData.summary}</p>
                      </section>

                      <section>
                        <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-[#1877F2] pl-4 mb-6">Kỹ năng</h3>
                        <div className="space-y-2">
                          {formData.skills?.map((skill, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#1877F2] rounded-full"></div>
                              <span className="text-sm font-bold text-gray-700">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-[#1877F2] pl-4 mb-6">Dự án</h3>
                        <div className="space-y-4">
                          {formData.projects?.map((proj, i) => (
                            <div key={i}>
                              <h4 className="text-sm font-black text-gray-900">{proj.title}</h4>
                              <p className="text-xs text-gray-500 line-clamp-2">{proj.description}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === 'exclusive' && (
                <div className="min-h-[1123px] bg-[#0f172a] text-white p-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full -ml-48 -mb-48"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-20">
                      <div>
                        <h2 className="text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">{formData.fullName}</h2>
                        <div className="flex items-center gap-4">
                          <span className="px-4 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-full">VIP Exclusive</span>
                          <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">Học sinh / Sinh viên</span>
                        </div>
                      </div>
                      <div className="w-48 h-48 rounded-[48px] overflow-hidden border-4 border-white/10 rotate-3 shadow-2xl">
                        <img src={formData.photoURL || 'https://i.pravatar.cc/300'} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-16">
                      <div className="col-span-4 space-y-12">
                        <section>
                          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Thông tin</h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400"><Mail size={18} /></div>
                              <span className="text-sm font-medium text-white/70">{formData.email}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400"><Phone size={18} /></div>
                              <span className="text-sm font-medium text-white/70">{formData.phone}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400"><MapPin size={18} /></div>
                              <span className="text-sm font-medium text-white/70">{formData.address}</span>
                            </div>
                          </div>
                        </section>

                        <section>
                          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Kỹ năng</h3>
                          <div className="flex flex-wrap gap-2">
                            {formData.skills?.map((skill, i) => (
                              <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors">{skill}</span>
                            ))}
                          </div>
                        </section>
                      </div>

                      <div className="col-span-8 space-y-16">
                        <section>
                          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-8">Kinh nghiệm</h3>
                          <div className="space-y-10">
                            {formData.experience?.map((exp, i) => (
                              <div key={i} className="group">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{exp.company}</h4>
                                  <span className="text-xs font-bold text-white/30">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <p className="text-sm font-bold text-blue-500/80 mb-4">{exp.position}</p>
                                <p className="text-sm text-white/50 leading-relaxed">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section>
                          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-8">Học vấn</h3>
                          <div className="space-y-10">
                            {formData.education?.map((edu, i) => (
                              <div key={i}>
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-xl font-black text-white">{edu.school}</h4>
                                  <span className="text-xs font-bold text-white/30">{edu.startDate} - {edu.endDate}</span>
                                </div>
                                <p className="text-sm font-bold text-blue-500/80 mb-4">{edu.degree}</p>
                                <p className="text-sm text-white/50 leading-relaxed">{edu.description}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4 pt-8">
              <button 
                onClick={handleDownloadPDF}
                disabled={saving}
                className="px-8 py-4 bg-[#1877F2] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-transform active:scale-95 flex items-center gap-3"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Tải xuống PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Indicator */}
      <AnimatePresence>
        {(saving || generating) && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-full shadow-2xl flex items-center gap-3 z-50"
          >
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs font-bold">{saving ? 'Đang lưu...' : 'AI đang tạo nội dung...'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
