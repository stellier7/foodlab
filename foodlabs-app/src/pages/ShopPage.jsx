import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { getActiveComercios } from '../services/comercios'
import { getProductsByComercio } from '../services/products'
import { ShoppingBag, Plus, Star, Clock, MapPin, Store } from 'lucide-react'
import ProductModal from '../components/ProductModal'
import DietaryLabels from '../components/DietaryLabels'

const ShopPage = () => {
  const navigate = useNavigate()
  const { 
    addToCart, 
    getPriceForCurrency, 
    getCurrencySymbol,
    location,
    isLoading,
    error
  } = useAppStore()
  
  const [tiendas, setTiendas] = useState([])
  const [isLoadingTiendas, setIsLoadingTiendas] = useState(true)
  const [tiendasError, setTiendasError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Cargar tiendas activas
  useEffect(() => {
    const loadTiendas = async () => {
      try {
        setIsLoadingTiendas(true)
        setTiendasError(null)
        
        // Obtener solo tiendas activas
        const comercios = await getActiveComercios('tienda')
        
        // Obtener productos para cada tienda
        const tiendasConProductos = await Promise.all(
          comercios.map(async (comercio) => {
            try {
              const productos = await getProductsByComercio(comercio.id)
              // Solo productos aprobados y publicados
              const productosAprobados = productos.filter(p => p.status === 'aprobado' && p.isPublished)
              
              return {
                ...comercio,
                name: comercio.nombre, // Mapear nombre para la tarjeta
                image: comercio.configuracion?.logo || null, // Mapear logo para la tarjeta
                products: productosAprobados.map(producto => ({
                  id: producto.id,
                  name: producto.nombre,
                  description: producto.descripcion,
                  price: producto.precio_HNL || producto.precio,
                  precio_HNL: producto.precio_HNL || producto.precio,
                  currency: producto.moneda || 'HNL',
                  image: producto.imagenes?.[0] || null,
                  dietaryLabels: producto.etiquetasDietarias || [],
                  category: producto.categoria,
                  isAvailable: producto.estaActivo,
                  stock: producto.stock
                })),
                productCount: productosAprobados.length
              }
            } catch (error) {
              console.error(`Error loading products for ${comercio.nombre}:`, error)
              return {
                ...comercio,
                name: comercio.nombre, // Mapear nombre para la tarjeta
                image: comercio.configuracion?.logo || null, // Mapear logo para la tarjeta
                products: [],
                productCount: 0
              }
            }
          })
        )
        
        setTiendas(tiendasConProductos)
        console.log(`🏪 Tiendas cargadas:`, tiendasConProductos.length)
        console.log(`📋 Lista de tiendas:`, tiendasConProductos.map(t => ({ id: t.id, nombre: t.nombre, productCount: t.productCount })))
      } catch (error) {
        console.error('Error loading tiendas:', error)
        setTiendasError('Error al cargar las tiendas')
      } finally {
        setIsLoadingTiendas(false)
      }
    }

    loadTiendas()
  }, [])

  const categories = [
    { id: 'all', name: 'Todo', emoji: '🏪' },
    { id: 'Accesorios', name: 'Accesorios', emoji: '🎯' },
    { id: 'Conveniencia', name: 'Conveniencia', emoji: '🏬' },
    { id: 'Farmacias', name: 'Farmacias', emoji: '💊' }
  ]

  // Filtrar tiendas por categoría y ubicación
    const filteredBusinesses = useMemo(() => {
      if (!tiendas || tiendas.length === 0) return []
      
      // Primero filtrar por ubicación
      let filteredByLocation = tiendas
      if (location && location.city) {
        filteredByLocation = tiendas.filter(tienda => {
          const comercioLocation = tienda.location
          if (!comercioLocation || !comercioLocation.city) {
            return false // No mostrar comercios sin ubicación
          }
          
          // Comparar por código de ciudad (ej: 'TGU', 'SPS')
          return comercioLocation.city === location.city
        })
        
        console.log(`🔍 ShopPage - Filtrado por ciudad ${location.city}:`, filteredByLocation.length, 'de', tiendas.length)
      }
      
      // Luego filtrar por categoría
      if (selectedCategory === 'all') {
        console.log(`🔍 ShopPage - Mostrando todas las categorías:`, filteredByLocation.length)
        return filteredByLocation
      }
      
      const filteredByCategory = filteredByLocation.filter(tienda => {
        // Filtrar por categoría del negocio (incluso si no tiene productos)
        return tienda.categoria === selectedCategory
      })
      
      console.log(`🔍 ShopPage - Filtrado por categoría ${selectedCategory}:`, filteredByCategory.length)
      return filteredByCategory
    }, [tiendas, selectedCategory, location])

  // Obtener todos los productos de todas las tiendas
  const allProducts = useMemo(() => {
    if (!tiendas || tiendas.length === 0) return []
    
    return tiendas.flatMap(tienda => tienda.products || [])
  }, [tiendas])
  
  // Navegar a detalle de tienda
  const handleBusinessClick = (business) => {
    navigate(`/tienda/${business.slug}`, { state: { from: 'shop' } })
  }
  
  // Contar productos de una tienda
  const countProducts = (business) => {
    return business.productCount || 0
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
      precio_HNL: product.price,
      currency: product.currency,
      description: product.description,
      image: product.image,
      variants: product.variants
    }, product.businessId || 'sportsshop')
  }
  
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  if (isLoadingTiendas) {
    return (
      <main style={{ paddingBottom: '80px' }}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando tiendas...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
    )
  }

  if (tiendasError) {
    return (
      <main style={{ paddingBottom: '80px' }}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
          <p>Error al cargar las tiendas: {tiendasError}</p>
        </div>
      </main>
    )
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
        {isLoadingTiendas && (
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
        
        {tiendasError && (
          <div style={{ 
            textAlign: 'center',
            padding: '48px 16px',
            color: '#ef4444'
          }}>
            <p>Error al cargar productos: {tiendasError}</p>
            <button
              onClick={() => window.location.reload()}
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
        
        {!isLoadingTiendas && !tiendasError && selectedCategory === 'all' ? (
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
                    height: '280px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ 
                    height: '140px',
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
                        {getCurrencySymbol()} {product?.price ? product.price.toFixed(2) : '0.00'}
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
                          backgroundColor: productCount > 0 ? '#dbeafe' : '#fef3c7',
                          color: productCount > 0 ? '#3b82f6' : '#d97706',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          <ShoppingBag size={12} />
                          {productCount > 0 ? `${productCount} ${productCount === 1 ? 'producto' : 'productos'}` : 'Sin productos'}
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

export default ShopPage

