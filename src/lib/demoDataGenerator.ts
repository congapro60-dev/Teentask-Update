import { collection, addDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';

export async function seedDemoSurveys(targetTotal: number = 265) {
  const snapshot = await getDocs(query(collection(db, 'quick_surveys'), limit(1)));
  // Only seed if practically empty or requested to add specifically. 
  // For this demo, we'll check if we already have a lot of surveys.
  const currentSnapshot = await getDocs(collection(db, 'quick_surveys'));
  if (currentSnapshot.size >= targetTotal) {
    console.log('Already have enough surveys.');
    return;
  }

  const needed = targetTotal - currentSnapshot.size;
  console.log(`Seeding ${needed} surveys...`);

  const roles = ['student', 'parent', 'business'];
  const locations = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Cần Thơ'];
  const skills = ['Design', 'Video/TikTok', 'Event', 'F&B', 'Gia sư', 'Lập trình'];

  // Weighted random for Ease of Use (average ~4.2)
  // 5 (40%), 4 (45%), 3 (10%), 2 (5%)
  const getEaseOfUse = () => {
    const r = Math.random();
    if (r < 0.45) return 5;
    if (r < 0.90) return 4;
    if (r < 0.95) return 3;
    return 2;
  };

  // Weighted random for NPS (average ~9.1)
  // 10 (40%), 9 (45%), 8 (10%), 7 (5%)
  const getNPS = () => {
    const r = Math.random();
    if (r < 0.45) return 10;
    if (r < 0.90) return 9;
    if (r < 0.95) return 8;
    return 7;
  };

  for (let i = 0; i < needed; i++) {
    // Distribute roles: Student 50%, Parent 35%, Business 15%
    const rRole = Math.random();
    let role = 'student';
    if (rRole < 0.5) role = 'student';
    else if (rRole < 0.85) role = 'parent';
    else role = 'business';

    const meetsNeed = Math.random() < 0.82; // Slightly > 80% to be safe
    const easeOfUse = getEaseOfUse();
    const nps = getNPS();

    // Random date from 14 days ago up to yesterday (April 17, 2026)
    // April 18 is "today", so we subtract at least 1 day's worth of ms
    const oneDayMs = 24 * 60 * 60 * 1000;
    const createdAt = Date.now() - oneDayMs - Math.floor(Math.random() * 13 * oneDayMs);

    let data: any = {
      role,
      easeOfUse,
      nps,
      meetsNeed,
      createdAt,
      source: 'landing_page_detailed',
      isDemoData: true
    };

    if (role === 'student') {
      data.expectedSalary = ['500k - 1 triệu/tháng', 'Trên 1 triệu/tháng'][Math.floor(Math.random() * 2)];
      data.payForShadowing = 'Có, nếu chất lượng tốt';
      data.shadowingPrice = ['100k - 300k', 'Trên 300k'][Math.floor(Math.random() * 2)];
      data.desiredSkill = skills[Math.floor(Math.random() * skills.length)];
      data.location = locations[Math.floor(Math.random() * locations.length)];
      data.knowsLaborLaw = Math.random() < 0.3 ? 'Đã nắm rõ' : 'Chưa biết, cảm ơn TeenTask đã chia sẻ';
    } else if (role === 'parent') {
      data.topConcern = ['Phát triển kỹ năng mềm', 'Kinh nghiệm thực tế', 'Định hướng nghề nghiệp'][Math.floor(Math.random() * 3)];
      data.investmentReadiness = 'Sẵn sàng nếu chất lượng tốt';
      
      // 87% chance for high budget
      if (Math.random() < 0.88) {
        data.monthlyDevelopmentBudget = ['500k - 2 triệu', 'Trên 2 triệu'][Math.floor(Math.random() * 2)];
        data.willingToPayPremium = true; 
      } else {
        data.monthlyDevelopmentBudget = 'Dưới 500k';
        data.willingToPayPremium = false;
      }
      
      data.monitoringPreference = 'Báo cáo tiến độ hàng tuần';
    } else {
      data.hiringNeed = 'Part-time cho Gen Z';
      data.recruitmentBudget = 'Có ngân sách định kỳ';
      data.trainingField = skills[Math.floor(Math.random() * skills.length)];
      data.mentorCapability = 'Sẵn sàng hướng dẫn';
    }

    await addDoc(collection(db, 'quick_surveys'), data);
  }

  console.log('Seeding completed!');
}
