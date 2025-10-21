import { useState, useEffect } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { ShoppingBag, Plus } from 'lucide-react'
import ProductModal from '../components/ProductModal'

const SportsShopPage = () => {
  const { addToCart, getPriceForCurrency, getCurrencySymbol, currency } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Productos de la Shop
  const products = [
    {
      id: 'sp3',
      name: 'PadelBuddy - Phone Mount',
      price: 13.15,  // Precio en USD (base)
      precio_HNL: 325.00,  // Precio exacto en Lempiras (override)
      category: 'sports',
      description: 'Soporte para teléfono con ventosas en forma de raqueta de padel. Perfecto para grabar tus partidos.',
      image: '/images/products/phoneMount-PadelBuddy.jpeg',
      stock: 20,
      isNew: true,
      features: ['12 ventosas', 'Forma de raqueta', 'Para vidrio', 'Grabación HD']
    }
  ]

  const categories = [
    { id: 'all', name: 'Todo', emoji: '🏪' },
    { id: 'sports', name: 'Deportes', emoji: '⚽' },
    { id: 'convenience', name: 'Conveniencia', emoji: '🏬' },
    { id: 'pharmacy', name: 'Farmacias', emoji: '💊' }
  ]

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  // Detectar parámetro de producto en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const productId = urlParams.get('product')
    
    if (productId) {
      const product = products.find(p => p.id === productId)
      if (product) {
        setSelectedProduct(product)
        setIsModalOpen(true)
      }
    }
  }, [])

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description
    }, 'sportsshop')
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <main style={{ paddingBottom: '80px' }}>
      {/* Hero Section - Scrolls with page */}
      <div className="fade-in stagger-1" style={{
        background: '#3b82f6',
        padding: '32px 24px',
        textAlign: 'center',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        marginTop: '-1px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          marginBottom: '12px',
          letterSpacing: '-0.5px',
          color: 'white'
        }}>
          ¡Bienvenido a Shop!
        </h1>
        <p style={{ 
          color: '#bfdbfe', 
          marginBottom: '0',
          fontSize: '15px',
          fontWeight: '500'
        }}>
          Todo para tu deporte favorito
        </p>
      </div>

      {/* Categories */}
      <div className="fade-in stagger-2" style={{ 
        padding: '16px',
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="tap-effect"
              style={{
                padding: '10px 18px',
                borderRadius: '24px',
                border: 'none',
                background: selectedCategory === cat.id 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                  : '#f3f4f6',
                color: selectedCategory === cat.id ? 'white' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedCategory === cat.id ? '600' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: selectedCategory === cat.id 
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                  : 'none',
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
                animation: 'fadeInScale 0.4s ease-out forwards'
              }}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="card fade-in tap-effect"
              onClick={() => handleProductClick(product)}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                padding: 0,
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Product Image */}
              <div style={{ 
                height: '180px',
                backgroundColor: '#f9fafb',
                backgroundImage: `url(${product.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                transition: 'transform 0.3s ease'
              }}>
                {product.isNew && (
                  <span className="badge badge-success" style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '9px',
                    padding: '4px 10px',
                    fontWeight: '800'
                  }}>
                    ✨ NUEVO
                  </span>
                )}
                {product.stock < 10 && (
                  <span className="badge badge-danger" style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontSize: '9px',
                    padding: '4px 10px'
                  }}>
                    ¡Últimos!
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '12px' }}>
                <h3 style={{ 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {product.name}
                </h3>
                <p style={{ 
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {product.description}
                </p>

                {/* Features para productos especiales */}
                {product.features && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '4px', 
                    marginBottom: '8px' 
                  }}>
                    {product.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        style={{
                          fontSize: '9px',
                          backgroundColor: '#e0f2fe',
                          color: '#0277bd',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontWeight: '600'
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
                
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ 
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#3b82f6'
                  }}>
                    {getCurrencySymbol()} {getPriceForCurrency(product).toFixed(2)}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // Evitar que se abra el modal
                      handleAddToCart(product)
                    }}
                    className="ripple"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ 
            textAlign: 'center',
            padding: '48px 16px',
            color: '#6b7280'
          }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
            <p>No hay productos en esta categoría</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </main>
  )
}

export default SportsShopPage

