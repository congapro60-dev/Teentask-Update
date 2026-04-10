import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Camera, Upload, CheckCircle2, ArrowRight, User, Calendar, GraduationCap, Building2, Briefcase, MapPin, X as CloseIcon, Check } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { PREDEFINED_SKILLS } from '../constants';

interface VerificationFlowProps {
  onClose?: () => void;
}

export default function VerificationFlow({ onClose }: VerificationFlowProps) {
  const { profile, updateProfile, t } = useFirebase();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Common fields
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dob, setDob] = useState('');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Student specific
  const [studentClass, setStudentClass] = useState('');
  const [school, setSchool] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Parent specific
  const [occupation, setOccupation] = useState('');
  const [workplaceName, setWorkplaceName] = useState('');
  const [workplaceAddress, setWorkplaceAddress] = useState('');

  // Business specific
  const [representativeName, setRepresentativeName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessField, setBusinessField] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      setScanStatus(t('loading'));
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPhoto(reader.result as string);
        setScanStatus(t('scanning'));
        setTimeout(() => {
          setScanStatus(t('scanSuccess') + ' ✅');
          setTimeout(() => setIsScanning(false), 1000);
        }, 2000); // Simulate scanning
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (profile?.role === 'student') {
      if (!fullName) newErrors.fullName = t('errorFullName');
      if (!dob) newErrors.dob = t('errorDob');
      if (!studentClass) newErrors.studentClass = t('errorClass');
      if (!school) newErrors.school = t('errorSchool');
      if (!idNumber) newErrors.idNumber = t('errorIdNumber');
    }
    // Add other roles validation as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!idPhoto) return;
    setSubmitting(true);
    try {
      const verificationData: any = {
        idCardPhoto: idPhoto,
        verificationStatus: 'pending',
        isVerified: false,
        verificationSubmittedAt: Date.now()
      };

      if (profile?.role === 'student') {
        Object.assign(verificationData, { 
          fullName, 
          dob, 
          class: studentClass, 
          school, 
          idNumber,
          skills: selectedSkills 
        });
      } else if (profile?.role === 'parent') {
        Object.assign(verificationData, { occupation, dob, workplaceName, workplaceAddress });
      } else if (profile?.role === 'business') {
        Object.assign(verificationData, { representativeName, businessName, businessAddress, businessField });
      } else if (profile?.role === 'admin') {
        Object.assign(verificationData, { fullName, dob, idNumber });
      }

      await updateProfile(verificationData);
      setStep(4);
    } catch (error) {
      console.error("Error submitting verification:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const isStep1Valid = () => {
    if (profile?.role === 'student') {
      return fullName && dob && studentClass && school && idNumber;
    } else if (profile?.role === 'parent') {
      return occupation && dob && workplaceName && workplaceAddress;
    } else if (profile?.role === 'business') {
      return representativeName && businessName && businessAddress && businessField;
    } else if (profile?.role === 'admin') {
      return fullName && dob && idNumber;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors z-50"
        >
          <CloseIcon size={24} />
        </button>
      )}
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Step Indicator */}
        {step < 4 && (
          <div className="mb-12">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-indigo-600' : 'text-gray-300'}`}>
                  {s === 1 ? t('info') : s === 2 ? t('documents') : t('confirm')}
                </span>
              ))}
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
                className="h-full bg-indigo-600 rounded-full"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">{t('verificationTitle')}</h2>
              <p className="text-gray-500">{t('verificationDesc')}</p>
            </div>

            <div className="space-y-4">
              {profile?.role === 'admin' && (
                <>
                  <InputField label={t('fullName')} value={fullName} onChange={setFullName} icon={User} placeholder="Nguyễn Văn A" />
                  <InputField label={t('dob')} value={dob} onChange={setDob} icon={Calendar} type="date" />
                  <InputField label={t('idNumber')} value={idNumber} onChange={setIdNumber} icon={ShieldCheck} placeholder="0123456789" />
                </>
              )}

              {profile?.role === 'student' && (
                <>
                  <InputField label={t('fullName')} value={fullName} onChange={setFullName} icon={User} placeholder="Nguyễn Văn A" error={errors.fullName} />
                  <InputField label={t('dob')} value={dob} onChange={setDob} icon={Calendar} type="date" error={errors.dob} />
                  <InputField label={t('class')} value={studentClass} onChange={setStudentClass} icon={GraduationCap} placeholder="12A1" error={errors.studentClass} />
                  <InputField label={t('school')} value={school} onChange={setSchool} icon={Building2} placeholder="THPT Chu Văn An" error={errors.school} />
                  <InputField label={t('idNumber')} value={idNumber} onChange={setIdNumber} icon={ShieldCheck} placeholder="0123456789" error={errors.idNumber} />
                  
                  <div className="pt-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">{t('yourSkills')}</label>
                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2 bg-gray-50 rounded-2xl no-scrollbar">
                      {PREDEFINED_SKILLS.map(skill => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            onClick={() => {
                              setSelectedSkills(prev => 
                                prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 border ${
                              isSelected 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'
                            }`}
                          >
                            {skill}
                            {isSelected && <Check size={10} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {profile?.role === 'parent' && (
                <>
                  <InputField label={t('occupation')} value={occupation} onChange={setOccupation} icon={Briefcase} placeholder="Kỹ sư" />
                  <InputField label={t('dob')} value={dob} onChange={setDob} icon={Calendar} type="date" />
                  <InputField label={t('workplaceName')} value={workplaceName} onChange={setWorkplaceName} icon={Building2} placeholder="Công ty ABC" />
                  <InputField label={t('workplaceAddress')} value={workplaceAddress} onChange={setWorkplaceAddress} icon={MapPin} placeholder="123 Đường Láng, Hà Nội" />
                </>
              )}

              {profile?.role === 'business' && (
                <>
                  <InputField label={t('representativeName')} value={representativeName} onChange={setRepresentativeName} icon={User} placeholder="Nguyễn Văn B" />
                  <InputField label={t('businessName')} value={businessName} onChange={setBusinessName} icon={Building2} placeholder="Công ty TNHH TeenTask" />
                  <InputField label={t('businessAddress')} value={businessAddress} onChange={setBusinessAddress} icon={MapPin} placeholder="456 Cầu Giấy, Hà Nội" />
                  <InputField label={t('businessField')} value={businessField} onChange={setBusinessField} icon={Briefcase} placeholder="Công nghệ thông tin" />
                </>
              )}
            </div>

            <button
              disabled={!isStep1Valid()}
              onClick={handleNext}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {t('next')}
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-900 mb-2">{t('idPhoto')}</h2>
              <p className="text-gray-500">{t('idPhotoDesc')}</p>
            </div>

            <div className="relative aspect-[3/2] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden">
              {idPhoto ? (
                <>
                  <img src={idPhoto} alt="ID Card" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                      <motion.div 
                        initial={{ top: 0 }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)] z-10"
                      />
                      <p className="text-white text-xs font-bold mt-4 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                        {scanStatus}
                      </p>
                    </div>
                  )}
                  {!isScanning && (
                    <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-bold mb-4 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                        {scanStatus}
                      </p>
                      <button 
                        onClick={() => setIdPhoto(null)}
                        className="p-4 bg-white text-gray-900 rounded-full shadow-xl"
                      >
                        <Camera size={24} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-4 w-full h-full justify-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-gray-900 block">{t('uploadPhoto')}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{t('photoGuideline')}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <h4 className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">{t('dos')}</h4>
                <ul className="text-[9px] text-emerald-700 space-y-1 font-bold">
                  <li className="flex items-center gap-1">✅ {t('goodLight')}</li>
                  <li className="flex items-center gap-1">✅ {t('clearText')}</li>
                  <li className="flex items-center gap-1">✅ {t('seeCorners')}</li>
                </ul>
              </div>
              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
                <h4 className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-2">{t('donts')}</h4>
                <ul className="text-[9px] text-rose-700 space-y-1 font-bold">
                  <li className="flex items-center gap-1">❌ {t('glare')}</li>
                  <li className="flex items-center gap-1">❌ {t('blurry')}</li>
                  <li className="flex items-center gap-1">❌ {t('covered')}</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-2xl font-bold"
              >
                {t('back')}
              </button>
              <button
                disabled={!idPhoto || submitting}
                onClick={() => setStep(3)}
                className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {t('next')}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-900 mb-2">{t('reviewInfo')}</h2>
              <p className="text-gray-500">{t('reviewDesc')}</p>
            </div>

            <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('fullName')}</p>
                  <p className="text-sm font-bold text-gray-900">{fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('dob')}</p>
                  <p className="text-sm font-bold text-gray-900">{dob}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('idNumber')}</p>
                  <p className="text-sm font-bold text-gray-900">{idNumber}</p>
                </div>
                {profile?.role === 'student' && (
                  <>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('class')}</p>
                      <p className="text-sm font-bold text-gray-900">{studentClass}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('school')}</p>
                      <p className="text-sm font-bold text-gray-900">{school}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('idPhoto')}</p>
                <div className="aspect-[3/2] rounded-2xl overflow-hidden border border-gray-200">
                  <img src={idPhoto || ''} alt="Review ID" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-2xl font-bold"
              >
                {t('editInfo')}
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? t('submitting') : t('confirmSubmit')}
                <Check size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">{t('success')}</h2>
            <p className="text-gray-500">{t('successDesc')}</p>
            <button
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  window.location.reload();
                }
              }}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100"
            >
              {t('enterApp')}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, icon: Icon, placeholder, type = "text", error }: any) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-4 pl-12 bg-gray-50 border-2 rounded-2xl focus:bg-white outline-none transition-all ${
            error ? 'border-rose-500 bg-rose-50/30' : 'border-transparent focus:border-indigo-600/20'
          }`}
        />
      </div>
      {error && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{error}</p>}
    </div>
  );
}
