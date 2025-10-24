import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { useAppStore } from '../stores/useAppStore'
import { useOrdersStore } from '../stores/useOrdersStore'
import { useWalletStore } from '../stores/useWalletStore'
// import { processOrder } from '../services/payment' // Disabled for now
import { PAYMENT_CONFIG } from '../config/payments'

const CheckoutModal = ({ isOpen, onClose, cartItems, total }) => {
  const { user, isAuthenticated, loginWithGoogle, loginWithEmail, createAccount } = useAuthStore()
  const { businesses, getPriceForCurrency, getCurrencySymbol } = useAppStore()
  const { addOrder } = useOrdersStore()
  const { balance, fetchBalance, error: walletError } = useWalletStore()
  
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
  const DELIVERY_FEE = 99.90

  // Auto-fill form for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        address: user.address || '',
        notes: ''
      })
      // Fetch wallet balance for authenticated users
      fetchBalance(user.uid)
    }
  }, [isAuthenticated, user, fetchBalance])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Calculate total with delivery fee and commission
  const calculateTotal = () => {
    const subtotal = total
    const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0
    const commission = subtotal * PAYMENT_CONFIG.commissions.default.customerFee
    return subtotal + deliveryFee + commission
  }
  
  // Check if user has sufficient balance - DISABLED
  const hasSufficientBalance = () => {
    return true // Always allow checkout
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
    // Saldo validation disabled
    return true
  }

  // Handle guest checkout
  const handleGuestCheckout = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    setError('')
    
    try {
      console.log('🛒 Guest checkout started')
      console.log('📦 Cart items:', cartItems)
      console.log('💰 Total:', total)
      
      // Create order for guest
      const finalTotal = calculateTotal()
      const platformFee = total * PAYMENT_CONFIG.commissions.default.customerFee // 15% platform fee
      const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0
      
      console.log('🧮 Calculated values:', { finalTotal, platformFee, deliveryFee })
      
      // Agrupar items por comercio
      const itemsByComercio = cartItems.reduce((acc, item) => {
        const key = item.comercioId || 'general'
        if (!acc[key]) {
          acc[key] = {
            comercioId: item.comercioId || 'general',
            nombre: item.comercioName || 'Comercio',
            subtotal: 0,
            items: []
          }
        }
        acc[key].items.push(item)
        acc[key].subtotal += (item.precio_HNL || item.price || 0) * item.quantity
        return acc
      }, {})
      
      const orderData = {
        customer: {
          name: formData.name,
          address: deliveryMethod === 'delivery' ? formData.address : 'Take Out',
          isGuest: true
        },
        items: cartItems.map(item => ({
          id: item.id || '',
          nombre: item.name || '',
          precio_HNL: item.precio_HNL || item.price || 0,
          quantity: item.quantity || 1,
          ...(item.comercioId && { comercioId: item.comercioId }),
          ...(item.comercioName && { comercioNombre: item.comercioName }),
          ...(item.selectedVariant && { variante: item.selectedVariant })
        })),
        comercios: Object.values(itemsByComercio),
        pricing: {
          subtotal: total,
          platformFee: platformFee,
          serviceFee: 0,
          deliveryFee: deliveryFee,
          discount: 0,
          total: finalTotal
        },
        status: 'pending',
        notes: formData.notes || '',
        deliveryMethod: deliveryMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{
          action: 'created',
          timestamp: new Date().toISOString(),
          user: 'guest',
          note: 'Orden creada por cliente'
        }]
      }
      
      console.log('📋 Final order data for guest:', orderData)
      await addOrder(orderData)
      
      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage(formData.name, cartItems, total, formData.notes)
      
      // Open WhatsApp
      openWhatsApp(whatsappMessage)
      
      onClose()
    } catch (error) {
      console.error('🚨 Guest checkout error:', error)
      
      // Códigos de error específicos
      let errorCode = 'E000'
      let errorMessage = 'Error desconocido'
      
      if (error.message.includes('invalid data')) {
        errorCode = 'E101'
        errorMessage = 'Datos inválidos en la orden'
      } else if (error.message.includes('permission')) {
        errorCode = 'E102'
        errorMessage = 'Sin permisos para crear orden'
      } else if (error.message.includes('network')) {
        errorCode = 'E103'
        errorMessage = 'Error de conexión'
      } else if (error.message.includes('undefined')) {
        errorCode = 'E104'
        errorMessage = 'Campo requerido faltante'
      } else if (error.message.includes('FirebaseError')) {
        errorCode = 'E105'
        errorMessage = 'Error de Firebase'
      }
      
      const detailedError = `${errorCode}: ${errorMessage} - ${error.message}`
      console.error('🔍 Detailed error:', detailedError)
      setError(`${errorCode}: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle authenticated checkout with wallet
  const handleAuthCheckout = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Create order for authenticated user
      const finalTotal = calculateTotal()
      const commission = total * PAYMENT_CONFIG.commissions.default.customerFee
      const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0
      
      const orderData = {
        customer: {
          name: formData.name,
          address: deliveryMethod === 'delivery' ? formData.address : 'Take Out',
          ...(user.uid && { userId: user.uid }), // Solo incluir si existe
          isGuest: false
        },
        items: cartItems,
        business: { id: 'foodlab', name: 'FoodLab' },
        pricing: {
          subtotal: total,
          commission: commission,
          deliveryFee: deliveryFee,
          discount: 0,
          total: finalTotal
        },
        status: 'pending',
        notes: formData.notes,
        deliveryMethod: deliveryMethod,
        paymentStatus: 'pending_restaurant',
        createdAt: new Date().toISOString()
      }
      
      // Add order to database
      const orderRef = await addOrder(orderData)
      
      // Payment processing disabled - will be handled via WhatsApp transfer
      // await processOrder(orderRef.id, user.uid, 'foodlab', finalTotal)
      
      // Refresh wallet balance (optional)
      // await fetchBalance(user.uid)
      
      // Generate WhatsApp message with user's first name
      const firstName = user.firstName || formData.name.split(' ')[0]
      const whatsappMessage = generateWhatsAppMessage(firstName, cartItems, total, formData.notes)
      
      // Open WhatsApp
      openWhatsApp(whatsappMessage)
      
      onClose()
    } catch (error) {
      console.error('🚨 Auth checkout error:', error)
      
      // Códigos de error específicos
      let errorCode = 'E200'
      let errorMessage = 'Error desconocido en checkout autenticado'
      
      if (error.message.includes('invalid data')) {
        errorCode = 'E201'
        errorMessage = 'Datos inválidos en la orden'
      } else if (error.message.includes('permission')) {
        errorCode = 'E202'
        errorMessage = 'Sin permisos para crear orden'
      } else if (error.message.includes('network')) {
        errorCode = 'E203'
        errorMessage = 'Error de conexión'
      } else if (error.message.includes('undefined')) {
        errorCode = 'E204'
        errorMessage = 'Campo requerido faltante'
      } else if (error.message.includes('FirebaseError')) {
        errorCode = 'E205'
        errorMessage = 'Error de Firebase'
      }
      
      const detailedError = `${errorCode}: ${errorMessage} - ${error.message}`
      console.error('🔍 Detailed auth error:', detailedError)
      setError(`${errorCode}: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Open WhatsApp with mobile-friendly fallbacks
  const openWhatsApp = (message) => {
    const phoneNumber = '50488694777' // Tu número de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    
    console.log('Opening WhatsApp URL:', whatsappUrl) // Debug
    
    // Detect if it's mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // For mobile, try different approaches
      console.log('Mobile detected, using mobile-friendly approach')
      
      // Method 1: Try to open WhatsApp app directly
      const whatsappAppUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
      
      // Create a temporary link and click it
      const link = document.createElement('a')
      link.href = whatsappAppUrl
      link.target = '_blank'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Fallback after a short delay
      setTimeout(() => {
        // If WhatsApp app didn't open, try web version
        window.location.href = whatsappUrl
      }, 1000)
      
    } else {
      // For desktop, use the original method
      try {
        const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          console.log('Popup blocked, redirecting current window')
          window.location.href = whatsappUrl
        }
      } catch (error) {
        console.error('Error opening WhatsApp:', error)
        window.location.href = whatsappUrl
      }
    }
  }

  // Generate WhatsApp message
  const generateWhatsAppMessage = (customerName, items, subtotal, notes) => {
    const finalTotal = calculateTotal()
    const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0
    const commission = subtotal * PAYMENT_CONFIG.commissions.default.customerFee
    
    // Agrupar items por comercio
    const itemsByComercio = items.reduce((acc, item) => {
      const key = item.comercioId || 'general'
      if (!acc[key]) {
        acc[key] = {
          nombre: item.comercioName || 'Comercio',
          items: []
        }
      }
      acc[key].items.push(item)
      return acc
    }, {})
    
    let message = `🛍️ *NUEVO PEDIDO - FoodLabs*\n\n`
    message += `👤 *Cliente:* ${customerName}\n`
    message += `📍 *Dirección:* ${formData.address}\n\n`
    
    // Por cada comercio
    Object.entries(itemsByComercio).forEach(([comercioId, data]) => {
      message += `\n🏪 *${data.nombre}*\n`
      message += `━━━━━━━━━━━━━━━━\n`
      
      data.items.forEach(item => {
        const itemPrice = item.precio_HNL || item.price || 0
        let itemName = item.name
        
        // Add variant info if available
        if (item.selectedVariant) {
          const variantInfo = item.selectedVariant === 'black' ? 'Negro' : 
                             item.selectedVariant === 'bicolor' ? 'Bi-Color' : 
                             item.selectedVariant
          itemName += ` (${variantInfo})`
        }
        
        message += `• ${item.quantity}x ${itemName}\n`
        message += `  L ${itemPrice.toFixed(2)} c/u = L ${(itemPrice * item.quantity).toFixed(2)}\n`
      })
      
      const subtotal = data.items.reduce((sum, item) => 
        sum + ((item.precio_HNL || item.price || 0) * item.quantity), 0
      )
      message += `\n*Subtotal ${data.nombre}:* L ${subtotal.toFixed(2)}\n`
    })
    
    message += `\n━━━━━━━━━━━━━━━━\n`
    message += `💰 *TOTAL:* L ${finalTotal.toFixed(2)}\n`
    
    if (notes) {
      message += `\n📝 *Notas:* ${notes}\n`
    }
    
    message += `\n⏳ *Estado:* Pendiente de confirmación\n`
    message += `\n💳 *Método de pago:* Transferencia bancaria\n`
    message += `\n_Confirmar con cliente y restaurante antes de procesar_`
    
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="text-green-900 text-sm font-bold" style={{ margin: 0 }}>
                    👤 {user.firstName || user.displayName?.split(' ')[0] || 'Usuario'}
                  </p>
                  <p className="text-green-700 text-xs" style={{ fontWeight: '500', margin: '4px 0 0 0' }}>
                    Sesión activa
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="text-green-900 text-sm font-bold" style={{ margin: 0 }}>
                    Saldo: L{balance.toFixed(2)}
                  </p>
                  {/* Saldo validation disabled */}
                </div>
              </div>
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
                      Entrega a domicilio
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#f97316' }}>
                      +L99.90
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
                    Recoger en el local
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
                placeholder="Instrucciones especiales (opcional)"
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
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < cartItems.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                        {item.name}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '13px', marginLeft: '6px' }}>
                        ×{item.quantity}
                      </span>
                    </div>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#111827', 
                      fontSize: '14px',
                      textAlign: 'right',
                      minWidth: '80px'
                    }}>
                      L{(getPriceForCurrency(item) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Subtotal, Commission, and Delivery Fee */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px' 
                }}>
                  <span style={{ fontWeight: '500', color: '#6b7280', fontSize: '14px' }}>Subtotal</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#111827', 
                    fontSize: '14px',
                    textAlign: 'right',
                    minWidth: '80px'
                  }}>
                    L{total.toFixed(2)}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px' 
                }}>
                  <span style={{ fontWeight: '500', color: '#6b7280', fontSize: '14px' }}>
                    Comisión (15%)
                  </span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#3b82f6', 
                    fontSize: '14px',
                    textAlign: 'right',
                    minWidth: '80px'
                  }}>
                    L{(total * PAYMENT_CONFIG.commissions.default.customerFee).toFixed(2)}
                  </span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px' 
                  }}>
                    <span style={{ fontWeight: '500', color: '#6b7280', fontSize: '14px' }}>Entrega a domicilio</span>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#f97316', 
                      fontSize: '14px',
                      textAlign: 'right',
                      minWidth: '80px'
                    }}>
                      L{DELIVERY_FEE.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Total */}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '2px solid #e5e7eb',
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 88, 12, 0.02) 100%)',
                  margin: '0 -16px',
                  padding: '12px 16px',
                  borderRadius: '0 0 12px 12px'
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Total</span>
                <span 
                  style={{ 
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#f97316',
                    textAlign: 'right',
                    minWidth: '100px'
                  }}
                >
                  L{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </form>


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
