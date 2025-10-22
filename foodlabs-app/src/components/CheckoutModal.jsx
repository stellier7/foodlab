import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { useAppStore } from '../stores/useAppStore'
import { useOrdersStore } from '../stores/useOrdersStore'

const CheckoutModal = ({ isOpen, onClose, cartItems, total }) => {
  const { user, isAuthenticated, loginWithGoogle, createAccount } = useAuthStore()
  const { businesses } = useAppStore()
  const { addOrder } = useOrdersStore()
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    notes: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  // Auto-fill form for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        address: user.address || '',
        notes: ''
      })
    }
  }, [isAuthenticated, user])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return false
    }
    if (!formData.address.trim()) {
      setError('La dirección es requerida')
      return false
    }
    return true
  }

  // Handle guest checkout
  const handleGuestCheckout = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Create order for guest
      const orderData = {
        customer: {
          name: formData.name,
          address: formData.address,
          userId: null,
          isGuest: true
        },
        items: cartItems,
        total,
        status: 'pending',
        notes: formData.notes,
        business: businesses[0] || { id: 'foodlab', name: 'FoodLab' },
        createdAt: new Date().toISOString()
      }
      
      await addOrder(orderData)
      
      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage(formData.name, cartItems, total, formData.notes)
      
      // Open WhatsApp
      const whatsappUrl = `https://wa.me/50488694777?text=${encodeURIComponent(whatsappMessage)}`
      window.open(whatsappUrl, '_blank')
      
      onClose()
    } catch (error) {
      setError('Error al crear la orden. Intenta de nuevo.')
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle authenticated checkout
  const handleAuthCheckout = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Update user profile if data changed
      if (user.address !== formData.address) {
        // Update user data in Firestore
        // This would be implemented in the auth service
      }
      
      // Create order for authenticated user
      const orderData = {
        customer: {
          name: formData.name,
          address: formData.address,
          userId: user.uid,
          isGuest: false
        },
        items: cartItems,
        total,
        status: 'pending',
        notes: formData.notes,
        business: businesses[0] || { id: 'foodlab', name: 'FoodLab' },
        createdAt: new Date().toISOString()
      }
      
      await addOrder(orderData)
      
      // Generate WhatsApp message with user's first name
      const firstName = user.firstName || formData.name.split(' ')[0]
      const whatsappMessage = generateWhatsAppMessage(firstName, cartItems, total, formData.notes)
      
      // Open WhatsApp
      const whatsappUrl = `https://wa.me/50488694777?text=${encodeURIComponent(whatsappMessage)}`
      window.open(whatsappUrl, '_blank')
      
      onClose()
    } catch (error) {
      setError('Error al crear la orden. Intenta de nuevo.')
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate WhatsApp message
  const generateWhatsAppMessage = (customerName, items, total, notes) => {
    let message = `¡Hola! Soy ${customerName} y quiero hacer un pedido:\n\n`
    
    items.forEach(item => {
      message += `• ${item.name} x${item.quantity} - L${item.price * item.quantity}\n`
    })
    
    message += `\n💰 Total: L${total}`
    
    message += `\n\n📍 Dirección: ${formData.address}`
    
    if (notes) {
      message += `\n\n📝 Notas: ${notes}`
    }
    
    return message
  }

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle()
      if (result.success) {
        setShowLogin(false)
        setShowSignUp(false)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Error al iniciar sesión con Google')
    }
  }

  // Handle email signup
  const handleEmailSignup = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')
    const name = formData.get('name')
    
    try {
      const result = await createAccount(email, password, { displayName: name })
      if (result.success) {
        setShowSignUp(false)
        setShowLogin(false)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Error al crear la cuenta')
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="slide-in-bottom"
        style={{
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div 
          className="flex justify-between items-center p-6"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px'
          }}
        >
          <div>
            <h2 className="text-xl font-bold text-white" style={{ letterSpacing: '-0.5px' }}>
              {isAuthenticated ? '✅ Confirmar Pedido' : '🛒 Completa tu Pedido'}
            </h2>
            <p className="text-white text-sm mt-1" style={{ opacity: 0.9 }}>
              {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 transition-all"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '300'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '24px'
          }}
        >
          {isAuthenticated && user ? (
            <div 
              className="mb-4"
              style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px' }}>👤</span>
                <p className="text-green-900 font-bold text-sm" style={{ margin: 0 }}>
                  ¡Hola {user.firstName || user.displayName?.split(' ')[0] || 'Usuario'}!
                </p>
              </div>
              <p className="text-green-700 text-xs" style={{ fontWeight: '500', margin: 0 }}>
                ✅ Sesión activa - Tus datos están guardados
              </p>
            </div>
          ) : (
            <div 
              className="mb-4"
              style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
              }}
            >
              <p className="text-blue-900 text-xs" style={{ fontWeight: '600', margin: 0 }}>
                💡 ¿Ya tienes cuenta? 
                <button 
                  onClick={() => setShowLogin(true)}
                  className="text-blue-600 hover:text-blue-800 ml-1 underline font-bold"
                >
                  Iniciar Sesión
                </button>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div 
              className="mb-3"
              style={{
                background: '#fee2e2',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #fca5a5'
              }}
            >
              <p className="text-red-800 text-xs font-bold" style={{ margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name */}
            <div>
              <label 
                className="block text-xs font-bold text-gray-700 mb-2" 
                style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}
              >
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                className="focus:bg-white focus:border-orange-500"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label 
                className="block text-xs font-bold text-gray-700 mb-2" 
                style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}
              >
                Dirección de entrega
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                className="focus:bg-white focus:border-orange-500"
                placeholder="Col. Palmira, Tegucigalpa"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label 
                className="block text-xs font-bold text-gray-700 mb-2" 
                style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}
              >
                Notas adicionales (opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
                className="focus:bg-white focus:border-orange-500"
                placeholder="Instrucciones especiales..."
              />
            </div>

            {/* Order Summary */}
            <div 
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                marginTop: '8px'
              }}
            >
              <h3 
                className="text-xs font-bold text-gray-700 mb-3" 
                style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}
              >
                Resumen del pedido
              </h3>
              <div style={{ marginBottom: '16px' }}>
                {cartItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between text-sm"
                    style={{
                      padding: '10px 0',
                      borderBottom: index < cartItems.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                  >
                    <span style={{ fontWeight: '500', color: '#6b7280', flex: 1 }}>
                      {item.name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      L{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div 
                className="flex justify-between items-center"
                style={{
                  paddingTop: '16px',
                  borderTop: '2px solid #f3f4f6'
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Total</span>
                <span 
                  style={{ 
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#f97316'
                  }}
                >
                  L{total.toFixed(2)}
                </span>
              </div>
            </div>
          </form>

          {/* Login Modal */}
          {showLogin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold mb-4">Iniciar Sesión</h3>
                
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-3 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </button>
                
                <button
                  onClick={() => setShowSignUp(true)}
                  className="w-full text-blue-600 hover:text-blue-800 text-sm"
                >
                  ¿No tienes cuenta? Crear una
                </button>
                
                <button
                  onClick={() => setShowLogin(false)}
                  className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Sign Up Modal */}
          {showSignUp && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold mb-4">Crear Cuenta</h3>
                
                <form onSubmit={handleEmailSignup} className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre completo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña (mín. 6 caracteres)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                    minLength="6"
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Crear Cuenta
                  </button>
                </form>
                
                <button
                  onClick={() => setShowSignUp(false)}
                  className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          style={{
            padding: '20px 24px',
            borderTop: '1px solid #e5e7eb',
            background: 'white'
          }}
        >
          <button
            onClick={isAuthenticated ? handleAuthCheckout : handleGuestCheckout}
            disabled={isLoading}
            className="tap-effect"
            style={{
              width: '100%',
              background: isLoading ? '#9ca3af' : '#10b981',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: isLoading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? (
              <>
                <div 
                  className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                  style={{ borderWidth: '2px' }}
                ></div>
                Procesando...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Pedir por WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal
