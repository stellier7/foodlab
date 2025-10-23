// Firebase configuration for FoodLab Production
import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Export the app instance
export default app

// Development mode - connect to emulators if needed
if (import.meta.env.DEV) {
  // Use Firebase emulators for development
  try {
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectAuthEmulator(auth, 'http://localhost:9099')
    connectStorageEmulator(storage, 'localhost', 9199)
    console.log('🔥 Firebase emulators connected')
  } catch (error) {
    // Emulators already connected or not available
    console.log('Firebase emulators not available, using production')
  }
}

// User roles system
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_NATIONAL: 'admin_national', 
  ADMIN_REGIONAL: 'admin_regional',
  BUSINESS: 'business',
  CUSTOMER: 'customer'
}

// Super admin emails
export const SUPER_ADMIN_EMAILS = [
  'santiago@foodlab.store',
  'admin@foodlab.store'
]

// Countries and regions
export const COUNTRIES = {
  HONDURAS: 'honduras',
  GUATEMALA: 'guatemala', 
  SALVADOR: 'salvador'
}

export const REGIONS = {
  TGU: 'TGU', // Tegucigalpa
  SPS: 'SPS', // San Pedro Sula
  GUA: 'GUA', // Guatemala City
  ANT: 'ANT', // Antigua
  SLV: 'SLV', // San Salvador
  SMA: 'SMA'  // Santa Ana
}
