import { useState, useEffect } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { X, Plus, Minus, Star, Shield, CheckCircle, Share2, Leaf, Sprout, Fish, Heart as FitIcon } from 'lucide-react'

// Label configuration
const LABEL_CONFIG = {
  'Vegano': { icon: Leaf, color: '#10b981', bgColor: '#d1fae5', label: 'Vegano' },
  'Vegetariano': { icon: Sprout, color: '#059669', bgColor: '#a7f3d0', label: 'Vegetariano' },
  'Pescaradiano': { icon: Fish, color: '#0ea5e9', bgColor: '#e0f2fe', label: 'Pescaradiano' },
  'Fit': { icon: FitIcon, color: '#f97316', bgColor: '#fed7aa', label: 'Fit' }
}

const ProductModal = ({ product, isOpen, onClose, restaurantId = 'shop' }) => {
  const { addToCart, getPriceForCurrency, convertPrice, getCurrencySymbol } = useAppStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [withCombo, setWithCombo] = useState(false)

  // Initialize selected size and variant when product changes
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].value)
    } else {
      setSelectedSize(null)
    }
    
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0].id)
    } else {
      setSelectedVariant(null)
    }
    
    setWithCombo(false)
    setQuantity(1)
  }, [product])

  if (!isOpen || !product) return null

  // Calculate current price based on selections
  const getCurrentPrice = () => {
    // Use precio_HNL if available, otherwise use price
    let price = product.precio_HNL || product.basePrice || product.price
    
    // Add size modifier if applicable
    if (selectedSize && product.sizes) {
      const size = product.sizes.find(s => s.value === selectedSize)
      if (size && size.priceModifier) {
        price += size.priceModifier
      }
    }
    
    // Add combo price if selected
    if (withCombo && product.comboOptions?.price) {
      price += product.comboOptions.price
    }
    
    return price
  }

  // Get current image based on variant and combo selection
  const getCurrentImage = () => {
    if (withCombo && product.comboOptions?.includesImage) {
      return product.comboOptions.includesImage
    }
    
    // If variant is selected, use variant image
    if (selectedVariant && product.variants) {
      const variant = product.variants.find(v => v.id === selectedVariant)
      if (variant) {
        return variant.image
      }
    }
    
    return product.image
  }

  // Get size and variant labels for display
  const getSizeLabel = () => {
    if (!selectedSize || !product.sizes) return ''
    const size = product.sizes.find(s => s.value === selectedSize)
    return size ? ` - ${size.label}` : ''
  }

  const getVariantLabel = () => {
    if (!selectedVariant || !product.variants) return ''
    const variant = product.variants.find(v => v.id === selectedVariant)
    return variant ? ` - ${variant.name}` : ''
  }

  const handleAddToCart = () => {
    const finalPrice = getCurrentPrice()
    const displayName = `${product.name}${getVariantLabel()}${getSizeLabel()}${withCombo ? ' con Combo' : ''}`
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: displayName,
        price: finalPrice,
        precio_HNL: finalPrice,  // Ensure precio_HNL is set for cart calculation
        description: product.description,
        selectedSize: selectedSize,
        selectedVariant: selectedVariant,
        withCombo: withCombo,
        image: getCurrentImage()
      }, restaurantId)
    }
    onClose()
  }

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/shop?product=${product.id}`
    const shareText = `¡Mira este producto: ${product.name} por ${getCurrencySymbol()}${getPriceForCurrency(product).toFixed(2)}!`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl
        })
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText} ${productUrl}`)
        alert('¡Link copiado al portapapeles!')
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText} ${productUrl}`)
      alert('¡Link copiado al portapapeles!')
    }
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
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          position: 'relative',
          height: '300px',
          backgroundImage: `url(${getCurrentImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'all 0.3s ease'
        }}>
          {/* Action Buttons */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            gap: '8px'
          }}>
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="tap-effect"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              title="Compartir producto"
            >
              <Share2 size={18} strokeWidth={2} />
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="tap-effect"
              style={{
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
          </div>

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
        <div style={{ 
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
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
                backgroundClip: 'text',
                transition: 'all 0.3s ease'
              }}>
                {getCurrencySymbol()} {getPriceForCurrency({ ...product, price: getCurrentPrice() }).toFixed(2)}
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
            marginBottom: '16px'
          }}>
            {product.description}
          </p>

          {/* Labels dietarios */}
          {product.labels && product.labels.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {product.labels.map((label, idx) => {
                const config = LABEL_CONFIG[label]
                if (!config) return null
                const Icon = config.icon
                return (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: config.bgColor,
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: config.color,
                      border: `2px solid ${config.color}20`
                    }}
                  >
                    <Icon size={16} strokeWidth={2.5} />
                    {config.label}
                  </div>
                )
              })}
            </div>
          )}

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Color:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(product.variants.length, 2)}, 1fr)`,
                gap: '12px'
              }}>
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className="tap-effect"
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: selectedVariant === variant.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      backgroundColor: selectedVariant === variant.id ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      backgroundImage: `url(${variant.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '2px solid #e5e7eb'
                    }}></div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: selectedVariant === variant.id ? '#3b82f6' : '#111827'
                    }}>
                      {variant.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: selectedVariant === variant.id ? '#2563eb' : '#6b7280'
                    }}>
                      {variant.stock} disponibles
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Tamaño:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(product.sizes.length, 3)}, 1fr)`,
                gap: '8px'
              }}>
                {product.sizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className="tap-effect"
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedSize === size.value ? '2px solid #f97316' : '2px solid #e5e7eb',
                      backgroundColor: selectedSize === size.value ? '#fff7ed' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: selectedSize === size.value ? '#f97316' : '#111827',
                      marginBottom: '4px'
                    }}>
                      {size.label}
                    </div>
                    {size.priceModifier !== 0 && (
                      <div style={{
                        fontSize: '12px',
                        color: selectedSize === size.value ? '#ea580c' : '#6b7280'
                      }}>
                        {size.priceModifier > 0 ? '+' : ''}{getCurrencySymbol()} {convertPrice(size.priceModifier).toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Combo Option */}
          {product.comboOptions?.available && (
            <div style={{ marginBottom: '24px' }}>
              <div
                onClick={() => setWithCombo(!withCombo)}
                className="tap-effect"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: withCombo ? '2px solid #f97316' : '2px solid #e5e7eb',
                  backgroundColor: withCombo ? '#fff7ed' : '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: withCombo ? '#f97316' : '#111827',
                    marginBottom: '4px'
                  }}>
                    Agregar Combo
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: withCombo ? '#ea580c' : '#6b7280'
                  }}>
                    {product.comboOptions.description || 'Incluye papas y bebida'}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: withCombo ? '#f97316' : '#6b7280'
                  }}>
                    +{getCurrencySymbol()} {convertPrice(product.comboOptions.price).toFixed(2)}
                  </span>
                  <div style={{
                    width: '48px',
                    height: '28px',
                    borderRadius: '14px',
                    backgroundColor: withCombo ? '#f97316' : '#d1d5db',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: withCombo ? '22px' : '2px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}></div>
                  </div>
                </div>
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
              {(product.totalStock || product.stock) > 10 ? `${product.totalStock || product.stock} disponibles` : `Solo ${product.totalStock || product.stock} disponibles`}
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
                onClick={() => setQuantity(Math.min(product.totalStock || product.stock, quantity + 1))}
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
        </div>

        {/* Fixed Footer with Action Button */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <button
            onClick={handleAddToCart}
            className="btn-primary ripple"
            style={{
              width: '100%',
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
      </div>
    </div>
  )
}

export default ProductModal
