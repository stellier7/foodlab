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
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { USER_ROLES, SUPER_ADMIN_EMAILS, COUNTRIES, REGIONS } from '../config/firebase'

// Definir permisos por rol
export const ROLE_PERMISSIONS = {
  super_admin: {
    canCreateSuperAdmin: false,
    canCreateNationalAdmin: true,
    canCreateRegionalAdmin: true,
    canCreateBusiness: true,
    canCreateDriver: true,
    canCreateProducts: true,
    canManageAllComercios: true,
    canManageAllProducts: true,
    canManageAllOrders: true,
    canManageAllDrivers: true
  },
  admin_national: {
    canCreateSuperAdmin: false,
    canCreateNationalAdmin: false,
    canCreateRegionalAdmin: true,
    canCreateBusiness: true,
    canCreateDriver: true,
    canCreateProducts: true,
    canManageAllComercios: true,
    canManageAllProducts: true,
    canManageAllOrders: true,
    canManageAllDrivers: true
  },
  admin_regional: {
    canCreateSuperAdmin: false,
    canCreateNationalAdmin: false,
    canCreateRegionalAdmin: false,
    canCreateBusiness: true,
    canCreateDriver: true,
    canCreateProducts: true,
    canManageRegionalComercios: true,
    canManageRegionalProducts: true,
    canManageRegionalOrders: true,
    canManageRegionalDrivers: true
  },
  business: {
    canCreateProducts: true,
    canManageOwnProducts: true,
    canManageOwnOrders: true
  },
  driver: {
    canViewAssignedOrders: true,
    canUpdateDeliveryStatus: true,
    canViewOwnDeliveryHistory: true,
    canManageAvailability: true
  },
  customer: {
    canViewProducts: true,
    canPlaceOrders: true,
    canViewOwnOrders: true
  }
}

export const checkPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole]
  return permissions ? permissions[permission] : false
}

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
      console.log('🔐 Intentando login con:', email)
      console.log('🔑 Firebase config:', {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
      })
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Login exitoso en Firebase Auth:', userCredential.user.uid)
      
      const user = userCredential.user
      
      // Get user data from Firestore
      console.log('📄 Buscando datos en Firestore para UID:', user.uid)
      const userData = await getUserData(user.uid)
      console.log('📊 Datos de Firestore:', userData)
      
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
      console.error('❌ Error en signInWithEmail:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
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
// PASSWORD FUNCTIONS
// ========================================

// Generate temporary password
export const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Regenerate password for existing user
export const regeneratePassword = async (email) => {
  try {
    // Generate new temporary password
    const newPassword = generateTemporaryPassword()
    
    // Update password in Firebase Auth (requires admin privileges)
    // Note: This would typically be done server-side with admin SDK
    // For now, we'll return the new password to be set manually
    
    // Update Firestore to mark password change required
    const userQuery = await getDocs(query(collection(db, 'users'), where('email', '==', email)))
    
    if (userQuery.empty) {
      throw new Error('Usuario no encontrado')
    }
    
    const userDoc = userQuery.docs[0]
    await updateDoc(doc(db, 'users', userDoc.id), {
      requirePasswordChange: true,
      updatedAt: new Date().toISOString()
    })
    
    return { 
      success: true, 
      tempPassword: newPassword,
      userId: userDoc.id 
    }
  } catch (error) {
    console.error('Error regenerating password:', error)
    return { success: false, error: error.message }
  }
}

// ========================================
// USER DATA FUNCTIONS
// ========================================

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    console.log('🔍 getUserData - Buscando usuario con UID:', uid)
    const userRef = doc(db, 'users', uid)
    console.log('📄 getUserData - Referencia de documento creada:', userRef.path)
    
    const userSnap = await getDoc(userRef)
    console.log('📊 getUserData - Snapshot obtenido:', userSnap.exists())
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      console.log('✅ getUserData - Datos encontrados:', userData)
      return userData
    } else {
      console.log('❌ getUserData - Usuario NO existe en Firestore')
      return null
    }
  } catch (error) {
    console.error('💥 getUserData - Error obteniendo datos de usuario:', error)
    console.error('💥 getUserData - Error code:', error.code)
    console.error('💥 getUserData - Error message:', error.message)
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
    'auth/user-not-found': 'Usuario no encontrado. Verifica el email o contacta al administrador',
    'auth/wrong-password': 'Contraseña incorrecta. Verifica tu contraseña',
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'Correo electrónico inválido. Verifica el formato',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada. Contacta al administrador',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Espera unos minutos',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Login cancelado por el usuario',
    'auth/cancelled-popup-request': 'Login cancelado',
    'auth/invalid-credential': 'Credenciales inválidas. Verifica email y contraseña',
    'auth/operation-not-allowed': 'Operación no permitida. Contacta al administrador'
  }
  
  return errorMessages[errorCode] || 'Error de autenticación. Verifica tus credenciales'
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

// ========================================
// USER CREATION WITH ROLES
// ========================================

/**
 * Crear usuario con rol específico
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.password - Contraseña del usuario
 * @param {string} userData.role - Rol del usuario
 * @param {string} userData.displayName - Nombre del usuario
 * @param {string} userData.comercioId - ID del comercio (si es business)
 * @param {string} userData.region - Región (si es admin_regional)
 * @param {string} userData.country - País
 * @returns {Promise<Object>} Resultado de la creación
 */
export const createUserWithRole = async (userData) => {
  const { email, password, role, displayName, comercioId, region, country, generateTempPassword = false } = userData
  
  try {
    let finalPassword = password
    let tempPassword = null
    
    // Si se solicita generar contraseña temporal, generar una automáticamente
    if (generateTempPassword) {
      tempPassword = generateTemporaryPassword()
      finalPassword = tempPassword
    }
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, finalPassword)
    const user = userCredential.user
    
    // Actualizar perfil
    await updateProfile(user, { displayName })
    
    // Crear documento en Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      requirePasswordChange: generateTempPassword || false // Marcar si debe cambiar contraseña
    }
    
    // Agregar campos específicos según el rol
    if (role === 'business' && comercioId) {
      userDoc.businessId = comercioId
      userDoc.comercioId = comercioId
    }
    
    if (role === 'admin_regional' && region) {
      userDoc.region = region
    }
    
    if (country) {
      userDoc.country = country
    }
    
    await setDoc(doc(db, 'users', user.uid), userDoc)
    
    return { 
      success: true, 
      user: userDoc,
      tempPassword: tempPassword // Retornar contraseña temporal si se generó
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message }
  }
}
