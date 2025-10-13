import { useState } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { X, Plus, Minus, Star, Shield, Truck, CheckCircle } from 'lucide-react'

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useAppStore()
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description
      }, 'sportsshop')
    }
    onClose()
  }

  return (
    <div className="fade-in" style={{
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
    }}>
      <div className="slide-in-bottom" style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          position: 'relative',
          height: '300px',
          backgroundImage: `url(${product.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="tap-effect"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <X size={24} strokeWidth={2} />
          </button>

          {/* Badges */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {product.isNew && (
              <span className="badge badge-success" style={{
                fontSize: '10px',
                padding: '6px 12px',
                fontWeight: '800'
              }}>
                ✨ NUEVO
              </span>
            )}
            {product.stock < 10 && (
              <span className="badge badge-danger" style={{
                fontSize: '10px',
                padding: '6px 12px'
              }}>
                ¡Últimos!
              </span>
            )}
          </div>

          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.3))'
          }}></div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Title and Price */}
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              {product.name}
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#3b82f6',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ${product.price}
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#fef3c7',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                <Star size={14} style={{ fill: '#fbbf24', color: '#fbbf24' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#92400e' }}>
                  4.8
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            {product.description}
          </p>

          {/* Features */}
          {product.features && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '12px'
              }}>
                🎯 Características
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {product.features.map((feature, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '12px',
                    border: '1px solid #e0f2fe'
                  }}>
                    <CheckCircle size={16} style={{ color: '#10b981' }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0277bd'
                    }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            padding: '12px',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #bbf7d0'
          }}>
            <CheckCircle size={20} style={{ color: '#10b981' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#15803d'
            }}>
              {product.stock > 10 ? `${product.stock} disponibles` : `Solo ${product.stock} disponibles`}
            </span>
          </div>

          {/* Quantity Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '16px'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827'
            }}>
              Cantidad:
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="tap-effect"
                style={{
                  width: '40px',
                  height: '40px',
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
                <Minus size={20} strokeWidth={2.5} />
              </button>
              <span style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#111827',
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="tap-effect"
                style={{
                  width: '40px',
                  height: '40px',
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
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={handleAddToCart}
              className="btn-primary ripple"
              style={{
                flex: 1,
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              Agregar al Carrito
            </button>
          </div>

          {/* Shipping Info */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Truck size={20} style={{ color: '#f97316' }} />
            <div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#92400e'
              }}>
                Envío gratis en compras +$100
              </span>
              <p style={{
                fontSize: '12px',
                color: '#92400e',
                margin: '2px 0 0 0'
              }}>
                Tiempo estimado: 2-3 días hábiles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
