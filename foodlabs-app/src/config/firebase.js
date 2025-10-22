// Firebase configuration for FoodLab Production
import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjMXyjuIvRNMIfiMNP0t2FzmalpXc2dVU",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "872068459643",
  appId: "1:872068459643:web:0d25decab6aa606749c6de"
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
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectFirestoreEmulator(db, 'localhost', 8080)
  // connectAuthEmulator(auth, 'http://localhost:9099')
  // connectStorageEmulator(storage, 'localhost', 9199)
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
