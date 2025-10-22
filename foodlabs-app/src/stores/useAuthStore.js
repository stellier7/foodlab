import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'

// Usuarios mock para testing
const MOCK_USERS = [
  {
    id: 'admin-001',
    email: 'admin@foodlabs.com',
    password: 'admin123',
    name: 'Santiago Tellier',
    role: 'admin',
    permissions: ['all']
  },
  {
    id: 'operator-001',
    email: 'operator@foodlabs.com',
    password: 'operator123',
    name: 'Operador FoodLabs',
    role: 'operator',
    permissions: ['view_orders', 'edit_orders', 'change_status']
  }
]

// Comercios con credenciales
const MOCK_BUSINESSES = [
  {
    id: 'shop',
    name: 'Shop',
    password: 'shop123',
    permissions: ['view_own_orders', 'edit_own_orders', 'change_own_status']
  },
  {
    id: 'sportsshop',  // Mantener para compatibilidad con órdenes antiguas
    name: 'Shop',
    password: 'shop123',
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

      // Acciones
      login: async (email, password) => {
        const { isBlocked, blockUntil } = get()
        
        // Verificar si está bloqueado
        if (isBlocked && blockUntil && new Date() < new Date(blockUntil)) {
          const remainingTime = Math.ceil((new Date(blockUntil) - new Date()) / (1000 * 60))
          throw new Error(`Cuenta bloqueada. Intenta de nuevo en ${remainingTime} minutos.`)
        }

        // Buscar usuario
        const user = MOCK_USERS.find(u => u.email === email && u.password === password)
        
        if (user) {
          // Login exitoso
          set({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            },
            isAuthenticated: true,
            role: user.role,
            permissions: user.permissions,
            loginAttempts: 0,
            isBlocked: false,
            blockUntil: null
          })
          
          return { success: true, user: user }
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
            blockUntil
          })
          
          throw new Error(`Credenciales incorrectas. Intentos restantes: ${3 - newAttempts}`)
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

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          permissions: []
        })
      },

      checkAuth: () => {
        const { user, isAuthenticated } = get()
        
        // Verificar si hay un usuario en el estado
        if (user && isAuthenticated) {
          return true
        }
        
        // Verificar localStorage (fallback)
        const stored = localStorage.getItem('foodlabs-auth-storage')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed.state?.user && parsed.state?.isAuthenticated) {
              set({
                user: parsed.state.user,
                isAuthenticated: parsed.state.isAuthenticated,
                role: parsed.state.role,
                permissions: parsed.state.permissions
              })
              return true
            }
          } catch (error) {
            console.error('Error parsing auth storage:', error)
          }
        }
        
        return false
      },

      hasPermission: (permission) => {
        const { permissions, role } = get()
        
        // Admin tiene todos los permisos
        if (role === 'admin' || permissions.includes('all')) {
          return true
        }
        
        // Verificar permiso específico
        return permissions.includes(permission)
      },

      updateProfile: (updates) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...updates }
          })
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
      isAdmin: () => {
        const { role } = get()
        return role === 'admin'
      },

      isOperator: () => {
        const { role } = get()
        return role === 'operator'
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
        return user?.id || 'system'
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
          blockUntil: null
        })
        
        // Limpiar localStorage
        localStorage.removeItem('foodlabs-auth-storage')
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
          blockUntil: state.blockUntil
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
        blockUntil: state.blockUntil
      })
    }
  )
)

// Hook personalizado para verificar autenticación
export const useRequireAuth = () => {
  const { isAuthenticated, checkAuth } = useAuthStore()
  
  // Verificar autenticación al montar el componente
  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth()
    }
  }, [isAuthenticated, checkAuth])
  
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
  const { hasPermission, isAdmin, isOperator } = useAuthStore()
  
  return {
    hasPermission,
    isAdmin: isAdmin(),
    isOperator: isOperator(),
    canViewOrders: () => hasPermission('view_orders') || hasPermission('all'),
    canEditOrders: () => hasPermission('edit_orders') || hasPermission('all'),
    canChangeStatus: () => hasPermission('change_status') || hasPermission('all'),
    canManageUsers: () => hasPermission('manage_users') || hasPermission('all'),
    canViewAnalytics: () => hasPermission('view_analytics') || hasPermission('all'),
    canExportData: () => hasPermission('export_data') || hasPermission('all')
  }
}
