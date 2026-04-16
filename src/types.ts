export type UserRole = 'student' | 'parent' | 'business' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: UserRole;
  dob?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  parentEmail?: string;
  trustScore: number;
  bio?: string;
  skills: string[];
  interests?: string[];
  experience?: string[];
  careerGoal?: string[];
  savedJobs?: string[];
  savedShadowing?: string[];
  createdAt: number;
  
  // Verification fields
  isVerified?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'unverified';
  fullName?: string;
  idNumber?: string;
  idCardPhoto?: string;
  verificationSubmittedAt?: number;
  
  // Student specific
  class?: string;
  school?: string;
  achievements?: string[];
  portfolioLinks?: { title: string; url: string }[];
  location?: string;
  phone?: string;
  parentalVerification?: 'pending' | 'verified' | 'rejected';
  marketSurveyCompleted?: boolean;
  
  // Parent specific
  occupation?: string;
  workplaceName?: string;
  workplaceAddress?: string;
  isMentor?: boolean;
  mentorStatus?: 'pending' | 'approved' | 'rejected';
  mentorProfile?: {
    title: string;
    company: string;
    yearsOfExperience: number;
    field: string;
    bio: string;
  };
  
  // Business specific
  representativeName?: string;
  businessName?: string;
  businessLogo?: string;
  businessAddress?: string;
  businessField?: string;
  orgType?: 'business' | 'school' | 'teacher' | 'ngo';
  linkedInStatus?: 'pending' | 'verified' | 'rejected';
  linkedInUrl?: string;
  industry?: string;
  website?: string;
  companySize?: string;
  foundedYear?: number;

  // Financial & VIP fields
  balance: number;
  isVip: boolean;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  friends?: string[];
  following?: string[];
  followers?: string[];
  cvId?: string;
  lastCheckIn?: string;
  claimedTasks?: string[];
  tutorialCompleted?: { [role: string]: boolean };
  geminiApiKey?: string;
  paymentCode?: string;
  savedCourses?: string[];
  language?: 'vi' | 'en';
}

export interface CV {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  education: {
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: string[];
  projects: {
    title: string;
    description: string;
    link?: string;
  }[];
  languages: string[];
  photoURL?: string;
  templateId?: string;
  isExclusive?: boolean;
  lastUpdated: number;
}

export interface ShadowingBooking {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  company: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: number;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromPhoto?: string;
  fromRole: UserRole;
  toId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface Relationship {
  id: string;
  userId: string;
  userName?: string;
  userPhoto?: string;
  relatedUserId: string;
  relatedUserName: string;
  relatedUserPhoto?: string;
  type: 'Family' | 'Professional';
  title: string; // 'Father', 'Mother', 'Son', 'Daughter', 'Director', 'Manager', etc.
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface Job {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  businessOrgType?: string;
  title: string;
  description: string;
  salary: string;
  salaryValue?: number;
  slotsTotal: number;
  slotsFilled: number;
  deadline: number;
  location: string;
  type: 'online' | 'offline';
  category: string;
  status: 'active' | 'closed';
  isApproved: boolean;
  tags: string[];
  qualifications?: string[];
  benefits?: string[];
  isInternal?: boolean;
  schoolName?: string;
  isParentTask?: boolean;
  createdAt: number;
}

export interface Advertisement {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  imageUrl: string;
  price: number;
  registeredCount: number;
  totalSlots: number;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: number;
}

export interface ShadowingEvent {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorTitle: string;
  mentorPhoto?: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  date: number;
  time?: string;
  price: number;
  slotsTotal: number;
  slotsRemaining: number;
  location: string;
  category: string;
  type: '1-1' | 'workshop';
  status: 'upcoming' | 'ongoing' | 'completed' | 'closed';
  level: 'Cơ bản' | 'Nâng cao' | 'Chuyên sâu';
  requirements?: string[];
  benefits?: string[];
  createdAt: number;
  tier?: 'explorer' | 'insider' | 'elite';
  tierLabel?: string;
  durationHours?: number;
  maxStudents?: number;
  perks?: string[];
  customPerks?: string[];
  roadmap?: { step: string; description: string; isCompleted?: boolean }[];
  includesLunch?: boolean;
  includesCertificate?: boolean;
  includesBadge?: boolean;
  includesLinkedIn?: boolean;
  includesGiftBag?: boolean;
  mentorLevel?: 'senior' | 'manager' | 'clevel';
}

export interface PracticalTask {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  durationDays: number;
  requiredOutput: string; // e.g., "File PDF báo cáo", "Link Figma"
  skillsGained: string[];
  maxStudents: number;
  currentStudents: number;
  status: 'active' | 'closed';
  createdAt: number;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  outputUrl: string;
  feedback?: string;
  status: 'pending' | 'reviewed';
  submittedAt: number;
}

export interface Application {
  id: string;
  jobId: string;
  businessId: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentSchool?: string;
  studentClass?: string;
  parentEmail?: string;
  guardianId?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  guardianRelation?: string;
  isManualGuardian?: boolean;
  portfolioUrl?: string;
  coverLetter?: string;
  status?: string;
  parentStatus: 'pending' | 'approved' | 'rejected';
  finalStatus: 'pending' | 'accepted' | 'rejected' | 'completed';
  approvalChannel?: 'parent' | 'teacher';
  teacherEmail?: string;
  teacherName?: string;
  teacherStatus?: 'pending' | 'approved' | 'rejected';
  parentNotified?: boolean;
  createdAt: number;
}

export interface Review {
  id: string;
  businessId: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  rating: number;
  comment: string;
  jobId: string;
  jobTitle: string;
  createdAt: number;
}

export interface ShadowingFeedback {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  mentorId: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  applicationId?: string;
  createdAt: number;
  read: boolean;
}

export interface Rating {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  jobId?: string;
  score: number;
  comment?: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  participants: string[];
  participantDetails: {
    [uid: string]: {
      displayName: string;
      photoURL?: string;
      role: string;
    };
  };
  lastMessage?: string;
  lastMessageAt?: number;
  relatedTo?: {
    type: 'job' | 'shadowing';
    id: string;
    title: string;
  };
  createdAt: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'reward';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: number;
}

export interface NameChangeRequest {
  id: string;
  userId: string;
  currentName: string;
  newName: string;
  reason: string;
  proofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number;
  adminComment?: string;
}
