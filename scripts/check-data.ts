import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));

async function check() {
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId); // teentask-premium

  const collections = ['quick_surveys', 'survey_responses'];
  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));
    console.log(`- ${colName}: ${snap.size} bản ghi`);
  }
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
