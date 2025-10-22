// Firebase Authentication service for FoodLab
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { USER_ROLES, SUPER_ADMIN_EMAILS, COUNTRIES, REGIONS } from '../config/firebase'

// Google provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

export const authService = {
  // Sign in with email and password
  signInWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Get user data from Firestore
      const userData = await getUserData(user.uid)
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...userData
        }
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      }
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Check if user exists in our system
      let userData = await getUserData(user.uid)
      
      // If new user, create profile
      if (!userData) {
        userData = await createUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: USER_ROLES.CUSTOMER,
          country: COUNTRIES.HONDURAS,
          region: REGIONS.TGU
        })
      }
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...userData
        }
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      }
    }
  },

  // Create account with email and password
  createAccount: async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Create user profile
      const profile = await createUserProfile(user.uid, {
        email: user.email,
        ...userData,
        role: USER_ROLES.CUSTOMER
      })
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          ...profile
        }
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      }
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await getUserData(user.uid)
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...userData
        })
      } else {
        callback(null)
      }
    })
  },

  // Update user profile
  updateUserProfile: async (updates) => {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user logged in')
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: updates.displayName,
        photoURL: updates.photoURL
      })
      
      // Update Firestore profile
      await updateUserData(user.uid, updates)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      }
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      }
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user logged in')
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Update password
      await updatePassword(user, newPassword)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.code)
      }
    }
  }
}

// ========================================
// USER DATA FUNCTIONS
// ========================================

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data()
    }
    return null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

// Create user profile in Firestore
export const createUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid)
    
    // Determine role based on email
    let role = userData.role || USER_ROLES.CUSTOMER
    
    if (SUPER_ADMIN_EMAILS.includes(userData.email)) {
      role = USER_ROLES.SUPER_ADMIN
    }
    
    // Extract name parts from displayName
    const { firstName, lastName } = extractNameParts(userData.displayName)
    
    const profileData = {
      uid,
      email: userData.email,
      displayName: userData.displayName || '',
      firstName,
      lastName,
      photoURL: userData.photoURL || '',
      role,
      country: userData.country || COUNTRIES.HONDURAS,
      region: userData.region || REGIONS.TGU,
      businessId: userData.businessId || null,
      permissions: getPermissionsByRole(role),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }
    
    await setDoc(userRef, profileData)
    return profileData
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

// Update user data in Firestore
export const updateUserData = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating user data:', error)
    throw error
  }
}

// ========================================
// ROLE AND PERMISSION FUNCTIONS
// ========================================

// Get permissions by role
export const getPermissionsByRole = (role) => {
  const permissions = {
    [USER_ROLES.SUPER_ADMIN]: [
      'all',
      'manage_users',
      'manage_businesses',
      'view_all_orders',
      'edit_all_orders',
      'view_analytics',
      'export_data',
      'manage_inventory',
      'manage_products'
    ],
    [USER_ROLES.ADMIN_NATIONAL]: [
      'view_orders',
      'edit_orders',
      'change_status',
      'view_analytics',
      'export_data',
      'manage_businesses',
      'manage_inventory'
    ],
    [USER_ROLES.ADMIN_REGIONAL]: [
      'view_orders',
      'edit_orders',
      'change_status',
      'view_analytics',
      'manage_inventory'
    ],
    [USER_ROLES.BUSINESS]: [
      'view_own_orders',
      'edit_own_orders',
      'change_own_status',
      'manage_own_inventory'
    ],
    [USER_ROLES.CUSTOMER]: [
      'view_own_orders',
      'create_orders'
    ]
  }
  
  return permissions[role] || []
}

// Check if user has permission
export const hasPermission = (userRole, userPermissions, permission) => {
  if (userRole === USER_ROLES.SUPER_ADMIN || userPermissions?.includes('all')) {
    return true
  }
  
  return userPermissions?.includes(permission) || false
}

// Check if user can access business data
export const canAccessBusiness = (userRole, userBusinessId, targetBusinessId) => {
  if (userRole === USER_ROLES.SUPER_ADMIN || userRole === USER_ROLES.ADMIN_NATIONAL || userRole === USER_ROLES.ADMIN_REGIONAL) {
    return true
  }
  
  if (userRole === USER_ROLES.BUSINESS) {
    return userBusinessId === targetBusinessId
  }
  
  return false
}

// ========================================
// NAME EXTRACTION FUNCTIONS
// ========================================

// Extract first and last name from displayName
export const extractNameParts = (displayName) => {
  if (!displayName || typeof displayName !== 'string') {
    return { firstName: '', lastName: '' }
  }
  
  const nameParts = displayName.trim().split(' ')
  
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' }
  }
  
  if (nameParts.length === 2) {
    return { firstName: nameParts[0], lastName: nameParts[1] }
  }
  
  // For names with 3+ parts, first is firstName, rest is lastName
  return {
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(' ')
  }
}

// Format full name from parts
export const formatFullName = (firstName, lastName) => {
  if (!firstName && !lastName) return ''
  if (!lastName) return firstName
  return `${firstName} ${lastName}`
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Get user-friendly error messages
export const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Ventana de login cerrada',
    'auth/cancelled-popup-request': 'Login cancelado'
  }
  
  return errorMessages[errorCode] || 'Error de autenticación. Intenta de nuevo'
}

// Validate user role
export const validateUserRole = (userRole, requiredRole) => {
  const roleHierarchy = {
    [USER_ROLES.SUPER_ADMIN]: 5,
    [USER_ROLES.ADMIN_NATIONAL]: 4,
    [USER_ROLES.ADMIN_REGIONAL]: 3,
    [USER_ROLES.BUSINESS]: 2,
    [USER_ROLES.CUSTOMER]: 1
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.SUPER_ADMIN]: 'Super Administrador',
    [USER_ROLES.ADMIN_NATIONAL]: 'Administrador Nacional',
    [USER_ROLES.ADMIN_REGIONAL]: 'Administrador Regional',
    [USER_ROLES.BUSINESS]: 'Comercio',
    [USER_ROLES.CUSTOMER]: 'Cliente'
  }
  
  return roleNames[role] || 'Usuario'
}
