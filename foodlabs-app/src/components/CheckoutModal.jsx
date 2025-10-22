import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { useAppStore } from '../stores/useAppStore'
import { useOrdersStore } from '../stores/useOrdersStore'

const CheckoutModal = ({ isOpen, onClose, cartItems, total }) => {
  const { user, isAuthenticated, loginWithGoogle, loginWithEmail, createAccount } = useAuthStore()
  const { businesses } = useAppStore()
  const { addOrder } = useOrdersStore()
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    notes: ''
  })
  
  const [deliveryMethod, setDeliveryMethod] = useState('delivery') // 'delivery' or 'takeout'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  
  // Delivery fee constant
  const DELIVERY_FEE = 100

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

  // Calculate total with delivery fee
  const calculateTotal = () => {
    const subtotal = total
    const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0
    return subtotal + deliveryFee
  }

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return false
    }
    if (deliveryMethod === 'delivery' && !formData.address.trim()) {
      setError('La dirección es requerida para delivery')
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
      const finalTotal = calculateTotal()
      const orderData = {
        customer: {
          name: formData.name,
          address: deliveryMethod === 'delivery' ? formData.address : 'Take Out',
          userId: null,
          isGuest: true
        },
        items: cartItems,
        subtotal: total,
        deliveryFee: deliveryMethod === 'delivery' ? DELIVERY_FEE : 0,
        deliveryMethod: deliveryMethod,
        total: finalTotal,
        status: 'pending',
        notes: formData.notes,
        business: { id: 'foodlab', name: 'FoodLab' },
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
      const finalTotal = calculateTotal()
      const orderData = {
        customer: {
          name: formData.name,
          address: deliveryMethod === 'delivery' ? formData.address : 'Take Out',
          userId: user.uid,
          isGuest: false
        },
        items: cartItems,
        subtotal: total,
        deliveryFee: deliveryMethod === 'delivery' ? DELIVERY_FEE : 0,
        deliveryMethod: deliveryMethod,
        total: finalTotal,
        status: 'pending',
        notes: formData.notes,
        business: { id: 'foodlab', name: 'FoodLab' },
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
  const generateWhatsAppMessage = (customerName, items, subtotal, notes) => {
    const finalTotal = calculateTotal()
    const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0
    
    let message = `¡Hola! Soy ${customerName} y quiero hacer un pedido:\n\n`
    
    items.forEach(item => {
      message += `• ${item.name} x${item.quantity} - L${(item.price * item.quantity).toFixed(2)}\n`
    })
    
    message += `\n💰 Subtotal: L${subtotal.toFixed(2)}`
    
    if (deliveryMethod === 'delivery') {
      message += `\n🚗 Delivery: L${deliveryFee.toFixed(2)}`
      message += `\n📍 Dirección: ${formData.address}`
    } else {
      message += `\n🏪 Take Out (recoger en tienda)`
    }
    
    message += `\n\n💵 Total: L${finalTotal.toFixed(2)}`
    
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

  // Handle email login
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await loginWithEmail(loginData.email, loginData.password)
      if (result.success) {
        setShowLogin(false)
        setLoginData({ email: '', password: '' })
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      setError('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
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
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h2 
            style={{ 
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '-0.3px',
              margin: 0,
              color: '#111827'
            }}
          >
            Confirmar Pedido
          </h2>
          <button
            onClick={onClose}
            className="tap-effect"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              color: '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              lineHeight: '1'
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
            padding: '20px'
          }}
        >
          {/* Login prompt for guests - ONLY if not authenticated */}
          {!isAuthenticated && (
            <div 
              style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
            >
              <p className="text-gray-700 text-sm" style={{ fontWeight: '500', margin: '0 0 10px 0' }}>
                ¿Ya tienes cuenta?
              </p>
              <button 
                onClick={() => setShowLogin(!showLogin)}
                className="tap-effect"
                style={{
                  background: 'white',
                  color: '#3b82f6',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {showLogin ? 'Cancelar' : 'Iniciar Sesión'}
              </button>
            </div>
          )}

          {/* Inline Login Form */}
          {!isAuthenticated && showLogin && (
            <div 
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0', color: '#111827' }}>
                Iniciar Sesión
              </h3>
              
              {/* Google Sign-in */}
              <button
                onClick={handleGoogleLogin}
                className="tap-effect"
                style={{
                  width: '100%',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                <span style={{ margin: '0 12px', fontSize: '12px', color: '#6b7280' }}>o</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  className="focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  className="focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: isLoading ? '#9ca3af' : '#f97316',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', margin: '12px 0 0 0' }}>
                ¿No tienes cuenta? <button type="button" onClick={() => setShowSignUp(true)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Regístrate</button>
              </p>
            </div>
          )}

          {/* Auth badge for logged in users - ONLY if authenticated */}
          {isAuthenticated && user && (
            <div 
              style={{
                background: '#d1fae5',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                border: '1px solid #6ee7b7'
              }}
            >
              <p className="text-green-900 text-sm font-bold" style={{ margin: 0 }}>
                👤 {user.firstName || user.displayName?.split(' ')[0] || 'Usuario'}
              </p>
              <p className="text-green-700 text-xs" style={{ fontWeight: '500', margin: '4px 0 0 0' }}>
                Sesión activa
              </p>
            </div>
          )}

          {/* Delivery Method Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label 
              className="block text-xs font-semibold text-gray-600 mb-2" 
              style={{ letterSpacing: '0.3px' }}
            >
              Método de entrega
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Delivery Option */}
              <label
                className="tap-effect"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                  border: deliveryMethod === 'delivery' ? '2px solid #f97316' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: deliveryMethod === 'delivery' ? '#fff7ed' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="delivery"
                  checked={deliveryMethod === 'delivery'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  style={{ marginTop: '2px', marginRight: '10px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      🚗 Delivery
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#f97316' }}>
                      +L100
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                    📍 Distancias largas pueden tener costo adicional
                  </p>
                </div>
              </label>

              {/* Take Out Option */}
              <label
                className="tap-effect"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  border: deliveryMethod === 'takeout' ? '2px solid #10b981' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: deliveryMethod === 'takeout' ? '#ecfdf5' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="takeout"
                  checked={deliveryMethod === 'takeout'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  style={{ marginTop: '0px', marginRight: '10px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    🏪 Take Out (recoger)
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981', marginLeft: '6px' }}>
                    Gratis
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              style={{
                background: '#fee2e2',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '16px',
                border: '1px solid #fca5a5'
              }}
            >
              <p className="text-red-800 text-xs font-bold" style={{ margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Name */}
            <div>
              <label 
                className="block text-xs font-semibold text-gray-600 mb-1" 
                style={{ letterSpacing: '0.3px' }}
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
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '11px 14px',
                  fontSize: '15px',
                  fontWeight: '400',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                className="focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            {/* Address - Only for delivery */}
            {deliveryMethod === 'delivery' && (
              <div>
                <label 
                  className="block text-xs font-semibold text-gray-600 mb-1" 
                  style={{ letterSpacing: '0.3px' }}
                >
                  Dirección de entrega
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '11px 14px',
                    fontSize: '15px',
                    fontWeight: '400',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '70px',
                    fontFamily: 'inherit'
                  }}
                  className="focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Col. Palmira, Tegucigalpa"
                  required
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label 
                className="block text-xs font-semibold text-gray-600 mb-1" 
                style={{ letterSpacing: '0.3px' }}
              >
                Notas adicionales (opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '11px 14px',
                  fontSize: '15px',
                  fontWeight: '400',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '70px',
                  fontFamily: 'inherit'
                }}
                className="focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="Instrucciones especiales..."
              />
            </div>

            {/* Order Summary */}
            <div 
              style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                marginTop: '6px'
              }}
            >
              <h3 
                className="text-xs font-semibold text-gray-600 mb-2" 
                style={{ letterSpacing: '0.3px' }}
              >
                Resumen del pedido
              </h3>
              <div style={{ marginBottom: '12px' }}>
                {cartItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between text-sm"
                    style={{
                      padding: '6px 0',
                      borderBottom: index < cartItems.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    <span style={{ fontWeight: '400', color: '#6b7280', flex: 1 }}>
                      {item.name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      L{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Subtotal and Delivery Fee */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px', marginBottom: '10px' }}>
                <div className="flex justify-between text-sm" style={{ marginBottom: '6px' }}>
                  <span style={{ fontWeight: '500', color: '#6b7280' }}>Subtotal</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>L{total.toFixed(2)}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between text-sm" style={{ marginBottom: '6px' }}>
                    <span style={{ fontWeight: '500', color: '#6b7280' }}>🚗 Delivery</span>
                    <span style={{ fontWeight: '600', color: '#f97316' }}>L{DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              {/* Total */}
              <div 
                className="flex justify-between items-center"
                style={{
                  paddingTop: '10px',
                  borderTop: '2px solid #e5e7eb'
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Total</span>
                <span 
                  style={{ 
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#f97316'
                  }}
                >
                  L{calculateTotal().toFixed(2)}
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

        {/* Footer with Total */}
        <div 
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
            background: 'white'
          }}
        >
          {/* Total Display - Always Visible */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              padding: '12px 16px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              Total
            </span>
            <span 
              style={{ 
                fontSize: '24px',
                fontWeight: '700',
                color: '#f97316'
              }}
            >
              L{calculateTotal().toFixed(2)}
            </span>
          </div>

          <button
            onClick={isAuthenticated ? handleAuthCheckout : handleGuestCheckout}
            disabled={isLoading}
            className="tap-effect"
            style={{
              width: '100%',
              background: isLoading ? '#9ca3af' : '#10b981',
              color: 'white',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isLoading ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? (
              <>
                <div 
                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                  style={{ borderWidth: '2px' }}
                ></div>
                Procesando...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
