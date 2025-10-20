import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Heart, Calendar, Users, Star, Leaf } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import ProductModal from '../components/ProductModal'

const FitLabsPage = () => {
  const { restaurants, setLoading, setRestaurants } = useAppStore()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  // Filter all products with "Fit" label from all restaurants
  const fitProducts = restaurants.flatMap(restaurant => {
    if (!restaurant.menuCategories) return []
    
    return restaurant.menuCategories.flatMap(category =>
      (category.items || [])
        .filter(item => item.labels && item.labels.includes('Fit'))
        .map(item => ({
          ...item,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          category: category.name
        }))
    )
  })

  const openProductModal = (product) => {
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
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '32px 24px',
        textAlign: 'center',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        marginTop: '-1px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <Heart size={32} style={{ color: 'white', fill: 'white' }} />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            marginBottom: '0',
            letterSpacing: '-0.5px',
            color: 'white'
          }}>
            ¡Opciones Fit!
          </h1>
        </div>
        <p style={{ 
          color: '#a7f3d0', 
          marginBottom: '0',
          fontSize: '15px',
          fontWeight: '500'
        }}>
          Productos saludables de todos nuestros restaurantes
        </p>
      </div>

      {/* Fit Products Section */}
      <div style={{ padding: '20px 16px' }}>
        <div className="fade-in stagger-2" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: '700', 
            color: '#111827',
            letterSpacing: '-0.3px'
          }}>
            Productos Fit
          </h2>
          <div className="badge" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: '#fed7aa',
            color: '#f97316',
            padding: '6px 12px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '11px'
          }}>
            <Heart size={12} style={{ fill: '#f97316' }} />
            <span>{fitProducts.length} opciones</span>
          </div>
        </div>

        {fitProducts.length === 0 ? (
          <div className="card fade-in stagger-3" style={{ 
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            <Leaf size={48} style={{ margin: '0 auto 12px', color: '#10b981', strokeWidth: 1.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>
              No hay productos fit disponibles
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Pronto agregaremos opciones saludables para ti
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {fitProducts.map((product, index) => (
              <div
                key={`${product.restaurantId}-${product.id}-${index}`}
                onClick={() => openProductModal(product)}
                className="card fade-in tap-effect"
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  animationDelay: `${index * 0.05}s`
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    right: '4px',
                    background: 'rgba(16, 185, 129, 0.95)',
                    color: 'white',
                    padding: '3px 6px',
                    borderRadius: '6px',
                    fontSize: '9px',
                    fontWeight: '700',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px'
                  }}>
                    <Heart size={9} style={{ fill: 'white' }} />
                    FIT
                  </div>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '2px'
                    }}>
                      {product.name}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: '#10b981',
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>
                      {product.restaurantName}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '0',
                      lineHeight: '1.3'
                    }}>
                      {product.description}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#111827'
                    }}>
                      {useAppStore.getState().getCurrencySymbol()} {useAppStore.getState().convertPrice(product.basePrice || product.price).toFixed(2)}
                    </span>
                    {product.labels && product.labels.length > 1 && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {product.labels.filter(l => l !== 'Fit').slice(0, 2).map((label, idx) => (
                          <span 
                            key={idx}
                            style={{
                              fontSize: '10px',
                              padding: '3px 6px',
                              borderRadius: '6px',
                              backgroundColor: label === 'Vegano' ? '#d1fae5' : '#e0f2fe',
                              color: label === 'Vegano' ? '#059669' : '#0369a1',
                              fontWeight: '600'
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          restaurantId={selectedProduct.restaurantId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </main>
  )
}

export default FitLabsPage

