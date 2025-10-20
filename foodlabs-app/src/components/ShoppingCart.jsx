import { useState } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { useOrdersStore } from '../stores/useOrdersStore'
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, X, MessageCircle } from 'lucide-react'

const ShoppingCart = () => {
  const { cart, cartTotal, addToCart, removeFromCart, clearCart, calculateFees, convertPrice, getCurrencySymbol } = useAppStore()
  const { addOrder } = useOrdersStore()
  const [isOpen, setIsOpen] = useState(false)

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const fees = calculateFees(cartTotal)

  const handleCheckout = () => {
    if (cart.length === 0) return
    
    // Detectar el negocio principal
    const hasFoodItems = cart.some(item => item.restaurantId && item.restaurantId !== 'sportsshop')
    const hasSportsItems = cart.some(item => item.restaurantId === 'sportsshop')
    
    // Crear orden en el store
    const newOrder = {
      customer: {
        name: '[Tu nombre]',
        phone: '+504 8869-4777',
        address: '[Tu dirección]'
      },
      items: cart,
      business: {
        id: hasSportsItems ? 'sportsshop' : (cart[0]?.restaurantId || 'general'),
        name: hasSportsItems ? 'Shop' : (cart[0]?.restaurantName || 'FoodLabs')
      },
      pricing: {
        subtotal: fees.subtotal,
        platformFee: fees.platformFee,
        serviceFee: fees.serviceFee,
        deliveryFee: fees.deliveryFee,
        discount: 0,
        total: fees.grandTotal
      },
      status: 'pending',
      paymentMethod: null,
      notes: ''
    }
    
    // Agregar orden al store
    addOrder(newOrder)
    
    // Generar mensaje de WhatsApp
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/50488694777?text=${encodeURIComponent(message)}`
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank')
    
    // Limpiar carrito
    clearCart()
    setIsOpen(false)
  }

  const generateWhatsAppMessage = () => {
    // Detectar si hay items de diferentes secciones
    const hasFoodItems = cart.some(item => item.restaurantId && item.restaurantId !== 'sportsshop')
    const hasSportsItems = cart.some(item => item.restaurantId === 'sportsshop')
    
    let message = ''
    
    if (hasFoodItems && hasSportsItems) {
      message = `🛍️ *NUEVO PEDIDO - Labs Platform*\n\n`
    } else if (hasSportsItems) {
      message = `🏆 *NUEVO PEDIDO - Shop*\n\n`
    } else {
      message = `🍽️ *NUEVO PEDIDO - FoodLabs*\n\n`
    }
    
    message += `👤 *Cliente:* [Tu nombre]\n`
    message += `📍 *Dirección:* [Tu dirección]\n\n`
    message += `📋 *Pedido:*\n`
    
    // Agrupar por restaurante/sección
    const groupedBySource = cart.reduce((acc, item) => {
      const sourceId = item.restaurantId || 'general'
      if (!acc[sourceId]) {
        acc[sourceId] = []
      }
      acc[sourceId].push(item)
      return acc
    }, {})

    Object.entries(groupedBySource).forEach(([sourceId, items]) => {
      if (sourceId === 'sportsshop') {
        message += `\n🏆 *Shop*\n`
      } else {
        const sourceName = items[0].restaurantName || 'Restaurante'
        message += `\n🏪 *${sourceName}*\n`
      }
      
      items.forEach(item => {
        const itemTotal = convertPrice(item.price * item.quantity)
        message += `• ${item.name} x${item.quantity} - ${getCurrencySymbol()}${itemTotal.toFixed(2)}\n`
        
        // Información especial para productos destacados
        if (item.id === 'sp3') {
          message += `  📱 PadelBuddy - Soporte para teléfono con ventosas\n`
          message += `  🎾 Forma de raqueta de padel - ¡Perfecto para grabar!\n`
        }
      })
    })

    message += `\n💰 *Resumen:*\n`
    message += `Subtotal: ${getCurrencySymbol()}${convertPrice(fees.subtotal).toFixed(2)}\n`
    message += `FoodLab: ${getCurrencySymbol()}${convertPrice(fees.platformFee).toFixed(2)}\n`
    message += `*Total: ${getCurrencySymbol()}${convertPrice(fees.grandTotal).toFixed(2)}*\n\n`
    message += `💳 *Método de pago:* Efectivo/Transferencia/Tarjeta\n\n`
    
    if (hasFoodItems && hasSportsItems) {
      message += `¡Gracias por elegir Labs Platform! 🚀`
    } else if (hasSportsItems) {
      message += `¡Gracias por elegir Shop! 🏆`
    } else {
      message += `¡Gracias por elegir FoodLabs! 🚀`
    }

    return message
  }

  if (cartItemsCount === 0 && !isOpen) {
    return null
  }

  return (
    <>
      {/* Cart Button */}
      {cartItemsCount > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fab ripple"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: 'white',
            padding: '18px',
            borderRadius: '50%',
            boxShadow: '0 12px 28px rgba(249, 115, 22, 0.4)',
            border: 'none',
            cursor: 'pointer',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ShoppingCartIcon size={26} strokeWidth={2.5} />
          {cartItemsCount > 0 && (
            <span className="badge badge-danger" style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              fontSize: '11px',
              fontWeight: '800',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid white'
            }}>
              {cartItemsCount}
            </span>
          )}
        </button>
      )}

      {/* Cart Modal */}
      {isOpen && (
        <div 
          className="fade-in" 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end'
          }}
        >
          <div 
            className="slide-in-bottom" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              width: '100%',
              maxHeight: '85vh',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
            }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
                  Carrito
                </h2>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', fontWeight: '500' }}>
                  {cartItemsCount} {cartItemsCount === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="tap-effect"
                style={{
                  padding: '10px',
                  color: '#9ca3af',
                  border: 'none',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Cart Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                  <ShoppingCartIcon size={56} style={{ margin: '0 auto 16px', color: '#d1d5db', strokeWidth: 1.5 }} />
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>Tu carrito está vacío</p>
                </div>
              ) : (
                <div>
                  {cart.map((item, index) => (
                    <div 
                      key={item.variantKey || `${item.id}-${item.restaurantId}-${index}`}
                      className="card fade-in tap-effect"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px', 
                        marginBottom: '12px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                        animationDelay: `${index * 0.05}s`,
                        opacity: 0
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: '700', color: '#111827', margin: 0, fontSize: '15px' }}>{item.name}</h4>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '6px 0', fontWeight: '500' }}>
                          {getCurrencySymbol()} {convertPrice(item.price).toFixed(2)} c/u
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => removeFromCart(item.variantKey || item.id, item.restaurantId)}
                          className="tap-effect"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <span style={{ 
                          width: '36px', 
                          textAlign: 'center', 
                          fontWeight: '700',
                          fontSize: '16px',
                          color: '#111827'
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item, item.restaurantId)}
                          className="tap-effect ripple"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                          }}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div style={{ 
                borderTop: '1px solid rgba(0, 0, 0, 0.06)', 
                padding: '20px',
                background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal:</span>
                    <span style={{ color: '#111827' }}>{getCurrencySymbol()} {convertPrice(fees.subtotal).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                    <span>FoodLab:</span>
                    <span>{getCurrencySymbol()} {convertPrice(fees.platformFee).toFixed(2)}</span>
                  </div>
                  <div className="card" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: '800', 
                    fontSize: '20px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
                    border: '2px solid rgba(249, 115, 22, 0.2)',
                    marginTop: '16px'
                  }}>
                    <span style={{ color: '#111827' }}>Total:</span>
                    <span style={{ 
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {getCurrencySymbol()} {convertPrice(fees.grandTotal).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary ripple"
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    padding: '16px',
                    fontSize: '16px'
                  }}
                >
                  <MessageCircle size={22} strokeWidth={2.5} />
                  Pedir por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ShoppingCart