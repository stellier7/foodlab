import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Heart, MoreVertical, Star, Clock, Truck, Plus, User, Leaf, Sprout, Fish, Heart as FitIcon, X } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { getComercioBySlug } from '../services/comercios'
import ProductModal from '../components/ProductModal'

// Label configuration
const LABEL_CONFIG = {
  'Vegano': { icon: Leaf, color: '#10b981', bgColor: '#d1fae5', label: 'Vegano' },
  'Vegetariano': { icon: Sprout, color: '#059669', bgColor: '#a7f3d0', label: 'Vegetariano' },
  'Pescaradiano': { icon: Fish, color: '#0ea5e9', bgColor: '#e0f2fe', label: 'Pescaradiano' },
  'Fit': { icon: FitIcon, color: '#f97316', bgColor: '#fed7aa', label: 'Fit' }
}

const RestaurantDetailPage = () => {
  const { 
    restaurants,
    tiendas,
    fetchProducts, 
    products, 
    productsLoading, 
    productsError
  } = useAppStore()
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('menu')
  const [comercio, setComercio] = useState(null)
  const [isLoadingComercio, setIsLoadingComercio] = useState(true)
  const [comercioError, setComercioError] = useState(null)

  // Detectar si viene de FitLab con filtros
  const searchParams = new URLSearchParams(location.search)
  const filterMode = searchParams.get('filter')
  const filterLabelsParam = searchParams.get('labels')
  const filterLabels = filterLabelsParam ? filterLabelsParam.split(',') : []
  const isFitMode = filterMode === 'fit'

  // Detectar tipo de comercio
  const isRestaurant = comercio?.tipo === 'restaurante'
  const isShop = comercio?.tipo === 'tienda'
  
  // Para compatibilidad con el código existente
  const restaurant = comercio

  // Detect business type from URL path
  const businessType = location.pathname.includes('/tienda/') ? 'tienda' : 'restaurante'

  // Cargar comercio directamente desde Firestore usando slug
  useEffect(() => {
    const loadComercio = async () => {
      console.log('🔍 RestaurantDetailPage - Cargando comercio con slug:', slug, 'tipo:', businessType)
      if (!slug) {
        console.log('❌ No hay slug')
        return
      }
      
      try {
        setIsLoadingComercio(true)
        setComercioError(null)
        
        console.log('📡 Cargando comercio por slug...')
        const comercioData = await getComercioBySlug(slug, businessType)
        console.log('📄 Datos del comercio obtenidos:', comercioData)
        
        if (!comercioData) {
          console.log('❌ Comercio no encontrado')
          setComercioError('Comercio no encontrado')
          return
        }
        
        console.log('✅ Comercio cargado exitosamente')
        setComercio(comercioData)
      } catch (error) {
        console.error('❌ Error loading comercio:', error)
        setComercioError('Error al cargar el comercio: ' + error.message)
      } finally {
        setIsLoadingComercio(false)
      }
    }
    
    loadComercio()
  }, [slug, businessType])

  // Cargar productos del restaurante desde Firestore
  useEffect(() => {
    if (restaurant) {
      fetchProducts('comercio', restaurant.id)
    }
  }, [restaurant, fetchProducts])

  // Obtener productos de Firestore para este restaurante
  const firestoreProducts = products || []
  
  // Combinar productos de Firestore con productos hardcoded como fallback
  const combinedMenuCategories = useMemo(() => {
    if (firestoreProducts.length > 0) {
      // Agrupar productos de Firestore por categoría
      const categoriesMap = {}
      firestoreProducts.forEach(product => {
        const categoryName = product.category || 'Otros'
        if (!categoriesMap[categoryName]) {
          categoriesMap[categoryName] = {
            name: categoryName,
            items: []
          }
        }
        categoriesMap[categoryName].items.push(product)
      })
      return Object.values(categoriesMap)
    }
    
    // Fallback a productos hardcoded
    return restaurant?.menuCategories || []
  }, [firestoreProducts, restaurant])

  // Filtrar categorías y productos según modo Fit
  const filteredMenuCategories = useMemo(() => {
    if (!combinedMenuCategories || !isFitMode) {
      return combinedMenuCategories || []
    }
    
    const targetLabels = filterLabels.length > 0 
      ? filterLabels 
      : ['Fit', 'Vegano', 'Vegetariano', 'Pescatariano']
    
    // Filtrar categorías y sus items
    return combinedMenuCategories
      .map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.labels?.some(label => targetLabels.includes(label))
        )
      }))
      .filter(category => category.items.length > 0)  // Solo categorías con items
  }, [combinedMenuCategories, isFitMode, filterLabels])
  
  // Función para quitar filtro
  const clearFitFilter = () => {
    navigate(`/comercio/${restaurant.id}`)
  }


  const openProductModal = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }


  // Estado de carga del comercio
  if (isLoadingComercio) {
    return (
      <div style={{ 
        padding: '48px 16px', 
        textAlign: 'center',
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
        <p>Cargando comercio...</p>
      </div>
    )
  }

  // Error al cargar comercio
  if (comercioError || !comercio) {
    return (
      <div style={{ 
        padding: '48px 16px', 
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <p>{comercioError || 'Comercio no encontrado'}</p>
        <button
          onClick={() => navigate('/shop')}
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
          Volver a Shop
        </button>
      </div>
    )
  }

  // Función para obtener el banner de estado (solo se ejecuta si el comercio existe)
  const getStatusBanner = () => {
    if (restaurant?.isOpen) {
      return {
        text: `Abre a las ${restaurant.openingTime} hs`,
        color: '#10b981',
        bgColor: '#d1fae5'
      }
    }
    return {
      text: 'Cerrado ahora',
      color: '#ef4444',
      bgColor: '#fee2e2'
    }
  }

  const statusBanner = getStatusBanner()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Restaurant Navigation */}
      <div style={{
        background: 'white',
        paddingTop: 'env(safe-area-inset-top)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Navigation Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{
            background: statusBanner.bgColor,
            color: statusBanner.color,
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {statusBanner.text}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}>
              <Heart size={20} />
            </button>
            <button style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}>
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Restaurant Info */}
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <img
              src={restaurant.logo || restaurant.image}
              alt={restaurant.name}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #f3f4f6'
              }}
            />
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '8px'
              }}>
                {restaurant.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Star size={16} style={{ fill: '#fbbf24', color: '#fbbf24' }} />
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  {restaurant.rating}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Leer opiniones
                </span>
              </div>
              {isRestaurant && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {restaurant.deliveryTime || '30-40 min'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={14} style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {restaurant.deliveryFee === 0 ? 'Envío gratis' : `L ${restaurant.deliveryFee || '50'} envío`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offers Section */}
      {restaurant.offers && restaurant.offers.length > 0 && (
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
            {restaurant.offers.map((offer, index) => (
              <div
                key={index}
                style={{
                  minWidth: '200px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: offer.type === 'plus' ? '#8b5cf6' : '#fef3c7',
                  color: offer.type === 'plus' ? 'white' : '#92400e',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {offer.type === 'plus' ? <Plus size={16} /> : <User size={16} />}
                  <span>{offer.title}</span>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {offer.type === 'plus' ? 'Suscríbete ahora' : 'Ahorra en tu pedido'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Navigation Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #f3f4f6',
        padding: '0 16px'
      }}>
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
          {['menu', 'mas-vendidos', 'precio-bajo', 'favoritos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab ? '#f97316' : '#6b7280',
                fontWeight: activeTab === tab ? '600' : '500',
                fontSize: '14px',
                borderBottom: activeTab === tab ? '2px solid #f97316' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab === 'menu' && 'Menú'}
              {tab === 'mas-vendidos' && 'Más vendidos'}
              {tab === 'precio-bajo' && 'Precio más bajo'}
              {tab === 'favoritos' && 'Favoritos'}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Content */}
      <div style={{ padding: '16px' }}>
        {/* Fit Mode Banner */}
        {isFitMode && (
          <div className="fade-in" style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Heart size={20} style={{ color: '#10b981', fill: '#10b981' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
                  Modo Fit Activado
                </div>
                <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                  {filterLabels.length > 0 
                    ? `Mostrando solo: ${filterLabels.join(', ')}`
                    : 'Mostrando opciones saludables'
                  }
                </div>
              </div>
            </div>
            <button
              onClick={clearFitFilter}
              className="tap-effect"
              style={{
                padding: '8px',
                border: 'none',
                background: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <X size={18} style={{ color: '#10b981' }} />
            </button>
          </div>
        )}
        
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
            <p>Cargando menú...</p>
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
            <p>Error al cargar el menú: {productsError}</p>
            <button
              onClick={() => restaurant && fetchProducts('restaurant', restaurant.id)}
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
        
        {!productsLoading && !productsError && filteredMenuCategories?.length === 0 && (
          <div style={{ 
            textAlign: 'center',
            padding: '48px 16px',
            color: '#6b7280'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <span style={{ fontSize: '32px' }}>📦</span>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              No hay productos disponibles
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '0'
            }}>
              Este comercio aún no tiene productos en su catálogo.
            </p>
          </div>
        )}
        
        {!productsLoading && !productsError && filteredMenuCategories?.map((category, categoryIndex) => (
          <div key={categoryIndex} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '16px'
            }}>
              {category.name}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {category.items?.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  onClick={() => openProductModal(item)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Heart size={12} />
                    </button>
                    {item.isPopular && (
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        background: '#10b981',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        Más vendido
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '4px'
                      }}>
                        {item.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                      }}>
                        {item.description}
                      </p>
                      
                      {/* Labels dietarios */}
                      {item.labels && item.labels.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          {item.labels.map((label, idx) => {
                            const config = LABEL_CONFIG[label]
                            if (!config) return null
                            const Icon = config.icon
                            return (
                              <div 
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  backgroundColor: config.bgColor,
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: config.color
                                }}
                              >
                                <Icon size={12} strokeWidth={2.5} />
                                {config.label}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#111827'
                      }}>
                        {useAppStore.getState().getCurrencySymbol()} {useAppStore.getState().getPriceForCurrency(item).toFixed(2)}
                      </span>
                      {item.popularity && (
                        <span style={{
                          fontSize: '12px',
                          color: '#10b981',
                          fontWeight: '600'
                        }}>
                          {item.popularity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          restaurantId={restaurant.id}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default RestaurantDetailPage
