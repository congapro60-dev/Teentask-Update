import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const OLD_DB_ID = 'ai-studio-8294eccb-fe8b-449a-b04e-ab8ce9df0565';
const OLD_API_KEY = 'AIzaSyCBahxjE1i0G9d5DmbuI4LTsHpD5vHRdBc';

async function migrate() {
  console.log('--- BẮT ĐẦU DI TRÚ DỮ LIỆU ---');
  
  // 1. Kết nối DB cũ
  const oldApp = initializeApp({
    ...config,
    apiKey: OLD_API_KEY
  }, 'old_app');
  const oldDb = getFirestore(oldApp, OLD_DB_ID);
  
  // 2. Kết nối DB mới (teentask-premium)
  const newApp = initializeApp(config, 'new_app');
  const newDb = getFirestore(newApp, config.firestoreDatabaseId);

  const collections = ['quick_surveys', 'survey_responses'];
  let totalMigrated = 0;

  for (const colName of collections) {
    console.log(`Đang kiểm tra collection: ${colName}...`);
    const oldColRef = collection(oldDb, colName);
    const snapshot = await getDocs(oldColRef);
    
    if (snapshot.empty) {
      console.log(`- Collection ${colName} trống.`);
      continue;
    }

    console.log(`- Tìm thấy ${snapshot.size} bản ghi. Đang chép...`);
    const batch = writeBatch(newDb);
    
    snapshot.docs.forEach((oldDoc) => {
      const data = oldDoc.data();
      const newDocRef = doc(newDb, colName, oldDoc.id); // Giữ nguyên ID
      batch.set(newDocRef, {
        ...data,
        automatedMigration: true,
        migratedAt: Date.now()
      }, { merge: true });
      totalMigrated++;
    });

    await batch.commit();
    console.log(`- Đã chép xong ${snapshot.size} bản ghi của ${colName}.`);
  }

  console.log(`\n--- HOÀN TẤT ---`);
  console.log(`Tổng số bản ghi đã di trú: ${totalMigrated}`);
  
  process.exit(0);
}

migrate().catch(err => {
  console.error('LỖI DI TRÚ:', err);
  process.exit(1);
});
