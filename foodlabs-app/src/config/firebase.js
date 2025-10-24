// Firebase configuration for FoodLab Production
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Firebase configuration - FORCING NEW API KEY
const firebaseConfig = {
  apiKey: "AIzaSyDOPyTZBRmzoq1j-lItXFyniSlX81_6Tjs",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "872068459643",
  appId: "1:872068459643:web:084af9024162056d49c6de"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Log Firebase configuration for debugging
console.log('🔥 Firebase Config:', {
  apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
})

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Export the app instance
export default app

// Using production Firebase directly

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
