import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'
import { authService, getUserData, hasPermission, getRoleDisplayName } from '../services/auth'
import { USER_ROLES } from '../config/firebase'

// Legacy mock data for backward compatibility (will be removed)
const MOCK_BUSINESSES = [
  {
    id: 'padelbuddy',
    name: 'PadelBuddy',
    password: 'padelbuddy123',
    permissions: ['view_own_orders', 'edit_own_orders', 'change_own_status']
  },
  {
    id: 'sportsshop',  // Mantener para compatibilidad con órdenes antiguas
    name: 'PadelBuddy',
    password: 'padelbuddy123',
    permissions: ['view_own_orders', 'edit_own_orders', 'change_own_status']
  },
  {
    id: 'shop',  // Mantener para compatibilidad
    name: 'PadelBuddy',
    password: 'padelbuddy123',
    permissions: ['view_own_orders', 'edit_own_orders', 'change_own_status']
  },
  {
    id: 'foodlab-tgu',
    name: 'FoodLab TGU',
    password: 'foodlab123',
    permissions: ['view_own_orders', 'edit_own_orders', 'change_own_status']
  },
  {
    id: 'foodlab-sps',
    name: 'FoodLab SPS',
    password: 'foodlab123',
    permissions: ['view_own_orders', 'edit_own_orders', 'change_own_status']
  }
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      role: null,
      permissions: [],
      loginAttempts: 0,
      isBlocked: false,
      blockUntil: null,
      isLoading: false,
      error: null,

      // Acciones Firebase Auth
      login: async (email, password) => {
        const { isBlocked, blockUntil } = get()
        
        // Verificar si está bloqueado
        if (isBlocked && blockUntil && new Date() < new Date(blockUntil)) {
          const remainingTime = Math.ceil((new Date(blockUntil) - new Date()) / (1000 * 60))
          throw new Error(`Cuenta bloqueada. Intenta de nuevo en ${remainingTime} minutos.`)
        }

        set({ isLoading: true, error: null })

        try {
          const result = await authService.signInWithEmail(email, password)
          
          if (result.success) {
            set({
              user: result.user,
              isAuthenticated: true,
              role: result.user.role,
              permissions: result.user.permissions || [],
              loginAttempts: 0,
              isBlocked: false,
              blockUntil: null,
              isLoading: false,
              error: null
            })
            
            return { success: true, user: result.user }
          } else {
            // Login fallido
            const newAttempts = get().loginAttempts + 1
            let isBlocked = false
            let blockUntil = null
            
            // Bloquear después de 3 intentos fallidos
            if (newAttempts >= 3) {
              isBlocked = true
              blockUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
            }
            
            set({
              loginAttempts: newAttempts,
              isBlocked,
              blockUntil,
              isLoading: false,
              error: result.error
            })
            
            throw new Error(result.error || `Credenciales incorrectas. Intentos restantes: ${3 - newAttempts}`)
          }
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Login with Google
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null })

        try {
          const result = await authService.signInWithGoogle()
          
          if (result.success) {
            set({
              user: result.user,
              isAuthenticated: true,
              role: result.user.role,
              permissions: result.user.permissions || [],
              loginAttempts: 0,
              isBlocked: false,
              blockUntil: null,
              isLoading: false,
              error: null
            })
            
            return { success: true, user: result.user }
          } else {
            set({ isLoading: false, error: result.error })
            throw new Error(result.error)
          }
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Create account
      createAccount: async (email, password, userData) => {
        set({ isLoading: true, error: null })

        try {
          const result = await authService.createAccount(email, password, userData)
          
          if (result.success) {
            set({
              user: result.user,
              isAuthenticated: true,
              role: result.user.role,
              permissions: result.user.permissions || [],
              isLoading: false,
              error: null
            })
            
            return { success: true, user: result.user }
          } else {
            set({ isLoading: false, error: result.error })
            throw new Error(result.error)
          }
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      businessLogin: (businessId, password) => {
        const business = MOCK_BUSINESSES.find(b => b.id === businessId && b.password === password)
        
        if (business) {
          set({
            user: {
              id: business.id,
              name: business.name,
              role: 'business',
              businessId: business.id
            },
            isAuthenticated: true,
            role: 'business',
            permissions: business.permissions
          })
          return true
        }
        return false
      },

      logout: async () => {
        try {
          await authService.signOut()
          set({
            user: null,
            isAuthenticated: false,
            role: null,
            permissions: [],
            error: null
          })
        } catch (error) {
          console.error('Error during logout:', error)
          // Force logout even if Firebase fails
          set({
            user: null,
            isAuthenticated: false,
            role: null,
            permissions: [],
            error: null
          })
        }
      },

      checkAuth: async () => {
        const { user, isAuthenticated } = get()
        
        // Verificar si hay un usuario en el estado
        if (user && isAuthenticated) {
          return true
        }
        
        // Verificar Firebase Auth state
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          try {
            const userData = await getUserData(currentUser.uid)
            if (userData) {
              set({
                user: {
                  uid: currentUser.uid,
                  email: currentUser.email,
                  displayName: currentUser.displayName,
                  photoURL: currentUser.photoURL,
                  ...userData
                },
                isAuthenticated: true,
                role: userData.role,
                permissions: userData.permissions || []
              })
              return true
            }
          } catch (error) {
            console.error('Error checking auth:', error)
          }
        }
        
        return false
      },

      // Initialize auth state listener
      initializeAuth: () => {
        authService.onAuthStateChanged((user) => {
          if (user) {
            set({
              user,
              isAuthenticated: true,
              role: user.role,
              permissions: user.permissions || []
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              role: null,
              permissions: []
            })
          }
        })
      },

      hasPermission: (permission) => {
        const { permissions, role } = get()
        return hasPermission(role, permissions, permission)
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (user) {
          try {
            const result = await authService.updateUserProfile(updates)
            if (result.success) {
              set({
                user: { ...user, ...updates }
              })
              return { success: true }
            } else {
              throw new Error(result.error)
            }
          } catch (error) {
            set({ error: error.message })
            throw error
          }
        }
      },

      resetLoginAttempts: () => {
        set({
          loginAttempts: 0,
          isBlocked: false,
          blockUntil: null
        })
      },

      // Funciones de utilidad
      isSuperAdmin: () => {
        const { role } = get()
        return role === USER_ROLES.SUPER_ADMIN
      },

      isAdminNational: () => {
        const { role } = get()
        return role === USER_ROLES.ADMIN_NATIONAL
      },

      isAdminRegional: () => {
        const { role } = get()
        return role === USER_ROLES.ADMIN_REGIONAL
      },

      isBusiness: () => {
        const { role } = get()
        return role === USER_ROLES.BUSINESS
      },

      isCustomer: () => {
        const { role } = get()
        return role === USER_ROLES.CUSTOMER
      },

      // Legacy compatibility
      isAdmin: () => {
        const { role } = get()
        return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN_NATIONAL
      },

      isOperator: () => {
        const { role } = get()
        return role === USER_ROLES.ADMIN_REGIONAL
      },

      canViewOrders: () => {
        return get().hasPermission('view_orders') || get().hasPermission('all')
      },

      canEditOrders: () => {
        return get().hasPermission('edit_orders') || get().hasPermission('all')
      },

      canChangeStatus: () => {
        return get().hasPermission('change_status') || get().hasPermission('all')
      },

      canManageUsers: () => {
        return get().hasPermission('manage_users') || get().hasPermission('all')
      },

      canViewAnalytics: () => {
        return get().hasPermission('view_analytics') || get().hasPermission('all')
      },

      canExportData: () => {
        return get().hasPermission('export_data') || get().hasPermission('all')
      },

      // Información del usuario para logs
      getCurrentUser: () => {
        const { user } = get()
        return user?.uid || user?.id || 'system'
      },

      // Get role display name
      getRoleDisplayName: () => {
        const { role } = get()
        return getRoleDisplayName(role)
      },

      // Validación de sesión
      isSessionValid: () => {
        const { user, isAuthenticated } = get()
        
        if (!user || !isAuthenticated) {
          return false
        }
        
        // Aquí podrías agregar lógica para verificar expiración de sesión
        // Por ahora, simplemente verificamos que exista el usuario
        
        return true
      },

      // Limpiar datos de autenticación
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          permissions: [],
          loginAttempts: 0,
          isBlocked: false,
          blockUntil: null,
          error: null
        })
        
        // Limpiar localStorage
        localStorage.removeItem('foodlabs-auth-storage')
      },

      // Reset password
      resetPassword: async (email) => {
        try {
          const result = await authService.resetPassword(email)
          if (result.success) {
            return { success: true }
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        try {
          const result = await authService.changePassword(currentPassword, newPassword)
          if (result.success) {
            return { success: true }
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      // Obtener información de debug
      getDebugInfo: () => {
        const state = get()
        return {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          role: state.role,
          permissions: state.permissions,
          loginAttempts: state.loginAttempts,
          isBlocked: state.isBlocked,
          blockUntil: state.blockUntil,
          isLoading: state.isLoading,
          error: state.error
        }
      }
    }),
    {
      name: 'foodlabs-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        permissions: state.permissions,
        loginAttempts: state.loginAttempts,
        isBlocked: state.isBlocked,
        blockUntil: state.blockUntil,
        isLoading: state.isLoading,
        error: state.error
      })
    }
  )
)

// Hook personalizado para verificar autenticación
export const useRequireAuth = () => {
  const { isAuthenticated, checkAuth, initializeAuth } = useAuthStore()
  
  // Initialize auth listener and check auth on mount
  useEffect(() => {
    initializeAuth()
    if (!isAuthenticated) {
      checkAuth()
    }
  }, [isAuthenticated, checkAuth, initializeAuth])
  
  return isAuthenticated
}

// Hook para obtener información del usuario actual
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuthStore()
  
  return {
    user: isAuthenticated ? user : null,
    isAuthenticated,
    name: user?.name || 'Usuario',
    email: user?.email || '',
    role: user?.role || 'guest'
  }
}

// Hook para verificar permisos
export const usePermissions = () => {
  const { 
    hasPermission, 
    isSuperAdmin, 
    isAdminNational, 
    isAdminRegional, 
    isBusiness, 
    isCustomer,
    isAdmin, 
    isOperator 
  } = useAuthStore()
  
  return {
    hasPermission,
    isSuperAdmin: isSuperAdmin(),
    isAdminNational: isAdminNational(),
    isAdminRegional: isAdminRegional(),
    isBusiness: isBusiness(),
    isCustomer: isCustomer(),
    isAdmin: isAdmin(),
    isOperator: isOperator(),
    canViewOrders: () => hasPermission('view_orders') || hasPermission('all'),
    canEditOrders: () => hasPermission('edit_orders') || hasPermission('all'),
    canChangeStatus: () => hasPermission('change_status') || hasPermission('all'),
    canManageUsers: () => hasPermission('manage_users') || hasPermission('all'),
    canViewAnalytics: () => hasPermission('view_analytics') || hasPermission('all'),
    canExportData: () => hasPermission('export_data') || hasPermission('all'),
    canManageBusinesses: () => hasPermission('manage_businesses') || hasPermission('all'),
    canManageInventory: () => hasPermission('manage_inventory') || hasPermission('all')
  }
}
