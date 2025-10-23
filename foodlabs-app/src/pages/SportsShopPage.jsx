import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { ShoppingBag, Plus, Star, Clock, MapPin } from 'lucide-react'
import ProductModal from '../components/ProductModal'

const SportsShopPage = () => {
  const navigate = useNavigate()
  const { 
    setRestaurants, 
    restaurants, 
    addToCart, 
    getPriceForCurrency, 
    getCurrencySymbol,
    fetchProducts,
    products,
    productsLoading,
    productsError
  } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Shop businesses will be loaded from Firestore
  
  // Cargar productos de shop al iniciar
  useEffect(() => {
    fetchProducts('shop')
  }, [fetchProducts])

  const categories = [
    { id: 'all', name: 'Todo', emoji: '🏪' },
    { id: 'sports', name: 'Deportes', emoji: '⚽' },
    { id: 'convenience', name: 'Conveniencia', emoji: '🏬' },
    { id: 'pharmacy', name: 'Farmacias', emoji: '💊' }
  ]

  // Crear tiendas dinámicamente desde productos de Firestore
  const shopBusinesses = React.useMemo(() => {
    if (!products || products.length === 0) return []
    
    // Agrupar productos por businessId
    const businessMap = new Map()
    
    products.forEach(product => {
      if (!businessMap.has(product.businessId)) {
        businessMap.set(product.businessId, {
          id: product.businessId,
          name: product.businessId === 'padelbuddy' ? 'PadelBuddy' : product.businessId,
          slug: product.businessId,
          type: 'shop',
          category: 'Deportes',
          tier: 'shop',
          rating: 5.0,
          reviewCount: 45,
          deliveryTime: '24-48 hrs',
          deliveryFee: 0,
          address: 'Entregas a domicilio',
          image: product.images?.[0] || '/images/products/padelBuddy/phoneMount_black.jpg',
          logo: product.images?.[0] || '/images/products/padelBuddy/phoneMount_black.jpg',
          isOpen: true,
          menuCategories: []
        })
      }
      
      const business = businessMap.get(product.businessId)
      
      // Agrupar por categoría
      let category = business.menuCategories.find(cat => cat.name === product.category)
      if (!category) {
        category = { name: product.category, items: [] }
        business.menuCategories.push(category)
      }
      
      category.items.push({
        id: product.id,
        name: product.name,
        price: product.price / 25, // Convertir a USD
        precio_HNL: product.price,
        currency: 'HNL',
        description: product.description,
        image: product.images?.[0] || '/images/products/padelBuddy/phoneMount_black.jpg',
        variants: product.variants || [],
        totalStock: product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0,
        isNew: true,
        features: [],
        labels: product.dietaryLabels || []
      })
    })
    
    return Array.from(businessMap.values())
  }, [products])

  // Filtrar tiendas por categoría
  const filteredBusinesses = selectedCategory === 'all' 
    ? shopBusinesses 
    : shopBusinesses.filter(b => {
        // Filtrar por categoría del negocio o si tiene productos de esa categoría
        return b.category === categories.find(c => c.id === selectedCategory)?.name ||
               b.menuCategories?.some(cat => 
                 cat.items?.some(item => item.category === selectedCategory)
               )
      })
  
  // Usar solo productos de Firestore
  const allProducts = products?.filter(p => p.businessType === 'shop' && p.isActive) || []
  
  // Navegar a detalle de tienda
  const handleBusinessClick = (business) => {
    navigate(`/restaurant/${business.slug}`)
  }
  
  // Contar productos de una tienda
  const countProducts = (business) => {
    return business.menuCategories?.reduce((count, category) => {
      return count + (category.items?.length || 0)
    }, 0) || 0
  }
  
  // Handlers para productos
  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }
  
  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      precio_HNL: product.precio_HNL || product.price,
      currency: 'HNL',
      description: product.description,
      image: product.image,
      variants: product.variants
    }, product.businessId || 'sportsshop')
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
          Todo lo que necesitas, a un clic
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

      {/* Content - Dual View */}
      <div style={{ padding: '20px 16px' }}>
        {productsLoading && (
          <div style={{ 
            textAlign: 'center',
            padding: '48px 16px',
            color: '#6b7280'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p>Cargando productos...</p>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        
        {productsError && (
          <div style={{ 
            textAlign: 'center',
            padding: '48px 16px',
            color: '#ef4444'
          }}>
            <p>Error al cargar productos: {productsError}</p>
            <button
              onClick={() => fetchProducts('shop')}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </div>
        )}
        
        {!productsLoading && !productsError && selectedCategory === 'all' ? (
          /* Vista de Productos (Grid 2x2) */
          <>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {allProducts.map((product, index) => (
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
                    transition: 'all 0.3s ease',
                    height: '320px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ 
                    height: '180px',
                    backgroundColor: '#f9fafb',
                    backgroundImage: `url(${product.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
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
                    {(product.totalStock || product.stock) < 10 && (
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

                  <div style={{ 
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}>
                    {/* Content area - grows to fill space */}
                    <div style={{ flex: 1 }}>
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
                        {product.businessName}
                      </p>
                      
                      <div style={{ 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#3b82f6',
                        marginBottom: '12px'
                      }}>
                        {getCurrencySymbol()} {getPriceForCurrency(product).toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Fixed bottom section - always visible */}
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: '8px',
                      borderTop: '1px solid #f3f4f6'
                    }}>
                      {/* Quantity selector */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Implement quantity decrease
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: '#f3f4f6',
                            color: '#6b7280',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600'
                          }}
                        >
                          −
                        </button>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#111827',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}>
                          1
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Implement quantity increase
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: '#f3f4f6',
                            color: '#6b7280',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600'
                          }}
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Add to cart button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
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

            {allProducts.length === 0 && (
              <div style={{ 
                textAlign: 'center',
                padding: '48px 16px',
                color: '#6b7280'
              }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
                <p>No hay productos disponibles</p>
              </div>
            )}
          </>
        ) : (
          /* Vista de Tiendas (Lista) */
          <>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {filteredBusinesses.map((business, index) => {
                const productCount = countProducts(business)
                
                return (
                  <div
                    key={business.id}
                    onClick={() => handleBusinessClick(business)}
                    className="card fade-in tap-effect"
                    style={{
                      padding: '20px',
                      background: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      animationDelay: `${index * 0.1}s`,
                      opacity: 0
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        backgroundImage: `url(${business.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}></div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '6px'
                        }}>
                          {business.name}
                        </h3>
                        
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={14} style={{ fill: '#fbbf24', color: '#fbbf24' }} />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                              {business.rating}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} style={{ color: '#6b7280' }} />
                            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                              {business.deliveryTime}
                            </span>
                          </div>
                        </div>
                        
                        {business.address && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            marginBottom: '8px'
                          }}>
                            <MapPin size={14} style={{ color: '#3b82f6' }} />
                            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                              {business.address}
                            </span>
                          </div>
                        )}
                        
                        <div className="badge" style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#dbeafe',
                          color: '#3b82f6',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          <ShoppingBag size={12} />
                          {productCount} {productCount === 1 ? 'producto' : 'productos'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredBusinesses.length === 0 && (
              <div style={{ 
                textAlign: 'center',
                padding: '48px 16px',
                color: '#6b7280'
              }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
                <p>No hay tiendas en esta categoría</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Próximamente agregaremos más opciones
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
        restaurantId="sportsshop"
      />
    </main>
  )
}

export default SportsShopPage

