export const MOCK_JOBS = [
  {
    id: '1',
    businessId: 'business_1',
    businessName: 'The Coffee House',
    title: 'Thiết kế Poster Sự kiện',
    company: 'The Coffee House',
    location: 'Quận 1, TP.HCM',
    salary: '500.000đ',
    salaryValue: 500000,
    deadline: '2025-07-24',
    deadlineDisplay: '24/07',
    type: 'Online',
    tags: ['Design', 'Micro-task'],
    hot: true,
    logo: 'https://picsum.photos/seed/coffee/100/100',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    jobStatus: 'Active',
    responsibilities: [
      'Thiết kế 3 mẫu poster cho sự kiện khai trương chi nhánh mới.',
      'Chỉnh sửa theo phản hồi của quản lý (tối đa 3 lần).',
      'Đảm bảo đúng nhận diện thương hiệu của The Coffee House.'
    ],
    qualifications: [
      'Sử dụng thành thạo Canva hoặc Adobe Illustrator/Photoshop.',
      'Có gu thẩm mỹ hiện đại, trẻ trung.',
      'Đúng hạn và có trách nhiệm.'
    ],
    benefits: [
      'Nhận thù lao ngay sau khi hoàn thành.',
      'Được ghi nhận đóng góp vào dự án thực tế.',
      'Cơ hội cộng tác lâu dài cho các sự kiện sau.'
    ]
  },
  {
    id: '2',
    businessId: 'business_2',
    businessName: 'Kênh 14',
    title: 'Cộng tác viên Viết bài',
    company: 'Kênh 14',
    location: 'Toàn quốc',
    salary: '200.000đ/bài',
    salaryValue: 200000,
    deadline: '2025-07-30',
    deadlineDisplay: '30/07',
    type: 'Online',
    tags: ['Content', 'Writing'],
    hot: false,
    logo: 'https://picsum.photos/seed/news/100/100',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    jobStatus: 'Closed',
    responsibilities: [
      'Viết 2 bài review về các quán cafe hot trend cho giới trẻ.',
      'Chụp ảnh minh họa đi kèm bài viết.',
      'Tối ưu hóa nội dung cho SEO cơ bản.'
    ],
    qualifications: [
      'Kỹ năng viết lách tốt, ngôn ngữ trẻ trung.',
      'Yêu thích khám phá các địa điểm mới.',
      'Có khả năng chụp ảnh bằng điện thoại tốt.'
    ],
    benefits: [
      'Nhuận bút hấp dẫn theo chất lượng bài viết.',
      'Được training kỹ năng viết bài chuẩn SEO.',
      'Cơ hội trở thành cộng tác viên chính thức.'
    ]
  },
  {
    id: '3',
    businessId: 'business_3',
    businessName: 'FPT Software',
    title: 'Hỗ trợ Sự kiện Workshop',
    company: 'FPT Software',
    location: 'Quận 9, TP.HCM',
    salary: '300.000đ/buổi',
    salaryValue: 300000,
    deadline: '2025-08-15',
    deadlineDisplay: '15/08',
    type: 'Offline',
    tags: ['Event', 'Support'],
    hot: false,
    logo: 'https://picsum.photos/seed/fpt/100/100',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    jobStatus: 'Expired',
    responsibilities: [
      'Hỗ trợ check-in cho khách mời tham dự workshop.',
      'Hướng dẫn khách mời vào chỗ ngồi và phát tài liệu.',
      'Hỗ trợ ban tổ chức trong các hoạt động mini-game.'
    ],
    qualifications: [
      'Nhanh nhẹn, giao tiếp tốt.',
      'Ngoại hình ưa nhìn là một lợi thế.',
      'Có thể làm việc theo nhóm.'
    ],
    benefits: [
      'Thù lao theo buổi và hỗ trợ ăn trưa.',
      'Được làm việc trong môi trường chuyên nghiệp.',
      'Nhận giấy chứng nhận hỗ trợ sự kiện từ FPT.'
    ]
  },
  {
    id: '4',
    businessId: 'business_4',
    businessName: 'Grab Việt Nam',
    title: 'Cộng tác viên Dữ liệu',
    company: 'Grab',
    location: 'Quận 7, TP.HCM',
    salary: '400.000đ/ngày',
    salaryValue: 400000,
    deadline: '2025-04-15',
    deadlineDisplay: '15/04',
    type: 'Offline',
    tags: ['Data', 'Tech'],
    hot: true,
    logo: 'https://picsum.photos/seed/grab/100/100',
    color: 'bg-green-50 text-green-600 border-green-100',
    jobStatus: 'Active',
    responsibilities: [
      'Nhập liệu và kiểm tra tính chính xác của dữ liệu bản đồ.',
      'Hỗ trợ đội ngũ kỹ thuật trong việc phân loại dữ liệu.'
    ],
    qualifications: [
      'Cẩn thận, tỉ mỉ.',
      'Sử dụng máy tính cơ bản tốt.'
    ],
    benefits: [
      'Môi trường làm việc năng động.',
      'Thù lao cạnh tranh.'
    ]
  },
  {
    id: '5',
    businessId: 'business_5',
    businessName: 'Shopee',
    title: 'Hỗ trợ Livestream',
    company: 'Shopee',
    location: 'Quận 1, TP.HCM',
    salary: '150.000đ/giờ',
    salaryValue: 150000,
    deadline: '2025-04-12',
    deadlineDisplay: '12/04',
    type: 'Offline',
    tags: ['E-commerce', 'Live'],
    hot: true,
    logo: 'https://picsum.photos/seed/shopee/100/100',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    jobStatus: 'Active',
    responsibilities: [
      'Chuẩn bị sản phẩm cho buổi livestream.',
      'Hỗ trợ MC trong việc tương tác với khách hàng.'
    ],
    qualifications: [
      'Nhanh nhẹn, hoạt ngôn.',
      'Có kiến thức về các sản phẩm hot trên Shopee.'
    ],
    benefits: [
      'Được làm việc với các KOL/KOC nổi tiếng.',
      'Thưởng theo doanh số livestream.'
    ]
  },
];

export const MOCK_SHADOWING = [
  {
    id: '1',
    mentorId: 'mentor_1',
    mentorName: 'Nguyễn An',
    title: 'Xây dựng Thương hiệu Cá nhân',
    mentor: 'Nguyễn An',
    role: 'Creative Director',
    company: 'FPT Software',
    price: '990.000đ',
    date: '15/08/2025',
    slots: 2,
    totalSlots: 5,
    category: 'Marketing',
    image: 'https://picsum.photos/seed/marketing/800/400',
    color: 'from-blue-500 to-indigo-600',
    description: 'Khám phá cách xây dựng thương hiệu cá nhân mạnh mẽ trong kỷ nguyên số cùng chuyên gia hàng đầu.',
    linkedInStatus: 'verified'
  },
  {
    id: '2',
    mentorId: 'mentor_2',
    mentorName: 'Trần Bình',
    title: 'Một ngày làm UI/UX Designer',
    mentor: 'Trần Bình',
    role: 'Senior Designer',
    company: 'VinGroup',
    price: '1.200.000đ',
    date: '20/08/2025',
    slots: 1,
    totalSlots: 3,
    category: 'Design',
    image: 'https://picsum.photos/seed/design/800/400',
    color: 'from-purple-500 to-pink-600',
    description: 'Trải nghiệm quy trình thiết kế sản phẩm thực tế tại một trong những tập đoàn lớn nhất Việt Nam.',
    linkedInStatus: 'verified'
  },
  {
    id: '3',
    mentorId: 'mentor_3',
    mentorName: 'Lê Hoàng',
    title: 'Quản trị dự án Agile',
    mentor: 'Lê Hoàng',
    role: 'Project Manager',
    company: 'VNG',
    price: '850.000đ',
    date: '25/08/2025',
    slots: 4,
    totalSlots: 10,
    category: 'Management',
    image: 'https://picsum.photos/seed/management/800/400',
    color: 'from-emerald-500 to-teal-600',
    description: 'Học cách vận hành dự án theo phương pháp Agile/Scrum hiện đại.',
    linkedInStatus: 'pending'
  }
];
