/**
 * إعداد Firebase و Firestore
 * يتم تهيئة الاتصال بقاعدة البيانات السحابية مع دعم وضع عدم الاتصال
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  enableIndexedDbPersistence,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// مفاتيح Firebase الخاصة بالمشروع
const firebaseConfig = {
  apiKey: "AIzaSyCWeW3zRr1Bd30DnRy2SNN9bF1BNPS45WI",
  authDomain: "studio-7402484998-5170a.firebaseapp.com",
  projectId: "studio-7402484998-5170a",
  storageBucket: "studio-7402484998-5170a.firebasestorage.app",
  messagingSenderId: "566124283185",
  appId: "1:566124283185:web:4b48c0f9b988bc7053dc10"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تهيئة Firestore
export const db = getFirestore(app);

// تفعيل التخزين المؤقت للعمل بدون إنترنت
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('[Firebase] التطبيق مفتوح في تبويب آخر. التخزين المؤقت معطل.');
  } else if (err.code === 'unimplemented') {
    console.warn('[Firebase] المتصفح لا يدعم التخزين المؤقت.');
  }
});

/**
 * تحويل البريد الإلكتروني إلى معرّف آمن للمستندات
 */
export function emailToDocId(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// تصدير جميع وظائف Firestore المطلوبة
export {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
};

export default app;
