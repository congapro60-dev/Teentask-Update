import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Fallback config for development/AI Studio
let firebaseConfig: any = {};

try {
  // Try to load from the JSON file first (AI Studio default)
  // We use a dynamic import to avoid build errors if the file is missing
  // @ts-ignore
  const config = await import('../firebase-applet-config.json');
  firebaseConfig = config.default || config;
} catch (e) {
  // ignore
}

// Override with environment variables if available (for Render/Production)
const env = (import.meta as any).env;
const envConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId
};

// Merge configs: prefer env variables if they exist
const finalConfig = {
  ...firebaseConfig,
  ...(envConfig.apiKey ? envConfig : {})
};

// Ensure we have at least a project ID to avoid crash
if (!finalConfig.projectId && !finalConfig.apiKey) {
  console.error("Firebase configuration is missing! Please set environment variables or provide firebase-applet-config.json");
}

const app = getApps().length === 0 ? initializeApp(finalConfig) : getApp();
export const db = getFirestore(app, finalConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Test connection to Firestore
async function testConnection() {
  if (!finalConfig.projectId) return;
  // If we are already in demo mode, skip testing connection to save quota and avoid logs.
  if (typeof window !== 'undefined' && localStorage.getItem('isDemoMode') === 'true') {
    return;
  }
  
  try {
    // Attempt to fetch a non-existent doc from server to test connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log(`Firestore connection test successful (Database: ${finalConfig.firestoreDatabaseId || '(default)'})`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('the client is offline')) {
      console.warn(`Firestore configuration warning: The client is offline. 
Current Database ID: ${finalConfig.firestoreDatabaseId || '(default)'}
Please check if this database exists in your Firebase Console and if rules allow access.`);
    } else if (errorMsg.toLowerCase().includes('quota') || errorMsg.includes('resource-exhausted')) {
      console.warn("Firestore Quota Exceeded! The project has used up its free daily read units.");
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show_demo_selection'));
      }
    } else {
      console.warn("Firestore connection check info:", errorMsg);
    }
  }
}

testConnection();
