import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
  console.error('❌ Missing required Firebase configuration. Please check your .env.local file.');
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Test RTDB connection
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase RTDB initialized');
  console.log('📍 Database URL:', firebaseConfig.databaseURL);
  
  let connectionAttempts = 0;
  
  // Monitor connection state
  const connectedRef = ref(rtdb, '.info/connected');
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      console.log('✅ RTDB Connected successfully');
      connectionAttempts = 0;
    } else {
      connectionAttempts++;
      console.log(`❌ RTDB Disconnected (attempt ${connectionAttempts})`);
      
      if (connectionAttempts === 1) {
        console.log('ℹ️  RTDB is trying to connect. This is normal on first load.');
        console.log('ℹ️  If this persists, check:');
        console.log('   1. Internet connection');
        console.log('   2. Firebase Console → Realtime Database is created');
        console.log('   3. Database rules are deployed');
        console.log('   4. Visit http://localhost:9002/test-rtdb to run diagnostics');
      }
    }
  });
}
