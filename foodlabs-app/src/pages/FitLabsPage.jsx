import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Heart, Calendar, Users, Star, Leaf, MapPin, Clock } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { getActiveComercios } from '../services/comercios'
import { getProductsByComercio } from '../services/products'

const FitLabsPage = () => {
  const navigate = useNavigate()
  const { location } = useAppStore()
  const [restaurantes, setRestaurantes] = useState([])
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)
  const [restaurantsError, setRestaurantsError] = useState(null)
  const [selectedLabels, setSelectedLabels] = useState([])

  // Cargar restaurantes fit
  useEffect(() => {
    const loadFitRestaurants = async () => {
      try {
        setIsLoadingRestaurants(true)
        setRestaurantsError(null)
        
        console.log('🔄 Cargando restaurantes fit...')
        
        // Obtener solo restaurantes activos
        const comercios = await getActiveComercios('restaurante')
        console.log('🏪 Comercios activos encontrados:', comercios.length)
        
        // Obtener productos para cada restaurante
        const restaurantesConProductos = await Promise.all(
          comercios.map(async (comercio) => {
            try {
              const productos = await getProductsByComercio(comercio.id)
              console.log(`📦 Productos encontrados para ${comercio.nombre}:`, productos.length)
              
              // Solo productos aprobados, publicados Y con etiquetas fit
              const productosFit = productos.filter(p => {
                const isApproved = p.status === 'aprobado' && p.isPublished
                const hasFitLabels = p.etiquetasDietarias?.some(label => 
                  ['vegano', 'vegetariano', 'sin-gluten', 'bajo-calorias', 'organico'].includes(label)
                )
                return isApproved && hasFitLabels
              })
              
              console.log(`✅ Productos fit para ${comercio.nombre}:`, productosFit.length)
              
              // Solo incluir restaurante si tiene productos fit
              if (productosFit.length === 0) return null
              
              return {
                id: comercio.id,
                name: comercio.nombre,
                slug: comercio.id,
                image: comercio.imagenes?.[0] || null,
                category: comercio.categoria || 'Restaurante',
                rating: comercio.rating || 4.5,
                deliveryTime: comercio.tiempoEntrega || '30-45 min',
                deliveryFee: comercio.costoEnvio || 0,
                isPrime: comercio.isPrime || false,
                direccion: comercio.direccion, // Mantener para filtrado
                menuCategories: [{
                  name: 'Menu Fit',
                  items: productosFit.map(producto => ({
                    id: producto.id,
                    name: producto.nombre,
                    description: producto.descripcion,
                    price: producto.precio,
                    currency: producto.moneda,
                    image: producto.imagenes?.[0] || null,
                    dietaryLabels: producto.etiquetasDietarias || [],
                    category: producto.categoria,
                    isAvailable: producto.estaActivo,
                    stock: producto.stock
                  }))
                }],
                productCount: productosFit.length
              }
            } catch (error) {
              console.error(`Error loading products for ${comercio.nombre}:`, error)
              return null
            }
          })
        )
        
        // Filtrar nulls (restaurantes sin productos fit)
        const restaurantesFit = restaurantesConProductos.filter(r => r !== null)
        console.log('🎯 Restaurantes fit finales:', restaurantesFit.length)
        setRestaurantes(restaurantesFit)
      } catch (error) {
        console.error('Error loading fit restaurants:', error)
        setRestaurantsError('Error al cargar restaurantes fit')
      } finally {
        setIsLoadingRestaurants(false)
      }
    }

    loadFitRestaurants()
  }, [])

  // Labels disponibles para filtrar
  const LABEL_FILTERS = [
    { key: 'vegano', label: 'Vegano', icon: '🌿', color: '#10b981' },
    { key: 'vegetariano', label: 'Vegetariano', icon: '🌱', color: '#059669' },
    { key: 'sin-gluten', label: 'Sin Gluten', icon: '🌾', color: '#0ea5e9' },
    { key: 'bajo-calorias', label: 'Bajo Calorías', icon: '🔥', color: '#f59e0b' },
    { key: 'organico', label: 'Orgánico', icon: '🌿', color: '#10b981' }
  ]

  // Filtrar restaurantes por región
  const filteredRestaurants = useMemo(() => {
    if (!restaurantes || restaurantes.length === 0) return []
    
    // Si no hay ubicación, mostrar todos los restaurantes
    if (!location || !location.city) {
      return restaurantes
    }
    
    // Filtrar por ciudad usando el nuevo sistema de ubicación
    const filtered = restaurantes.filter(restaurant => {
      const comercioLocation = restaurant.location
      if (!comercioLocation || !comercioLocation.city) {
        return false // No mostrar comercios sin ubicación
      }
      
      // Comparar por código de ciudad (ej: 'TGU', 'SPS')
      return comercioLocation.city === location.city
    })
    
    console.log(`🔍 FitLabsPage - Filtrado por ciudad ${location.city}:`, filtered.length, 'de', restaurantes.length)
    return filtered
  }, [restaurantes, location])

  // Filtrar restaurantes según labels seleccionados
  const fitRestaurants = useMemo(() => {
    if (selectedLabels.length === 0) {
      return filteredRestaurants
    }
    
    return filteredRestaurants.filter(restaurant => {
      return restaurant.menuCategories?.some(category =>
        category.items?.some(item =>
          item.dietaryLabels?.some(label => selectedLabels.includes(label))
        )
      )
    })
  }, [filteredRestaurants, selectedLabels])

  // Contar productos fit de un restaurante
  const countFitProducts = (restaurant, labels = []) => {
    const targetLabels = labels.length > 0 
      ? labels 
      : ['vegano', 'vegetariano', 'sin-gluten', 'bajo-calorias', 'organico']
    
    return restaurant.menuCategories?.reduce((count, category) => {
      return count + (category.items?.filter(item =>
        item.dietaryLabels?.some(l => targetLabels.includes(l))
      ).length || 0)
    }, 0) || 0
  }

  // Toggle label filter
  const toggleLabel = (labelKey) => {
    if (selectedLabels.includes(labelKey)) {
      setSelectedLabels(selectedLabels.filter(l => l !== labelKey))
    } else {
      setSelectedLabels([...selectedLabels, labelKey])
    }
  }

  // Navegar a restaurante con filtro
  const handleRestaurantClick = (restaurant) => {
    const labelsParam = selectedLabels.length > 0 ? `&labels=${selectedLabels.join(',')}` : ''
    navigate(`/restaurante/${restaurant.slug}?filter=fit${labelsParam}`, { state: { from: 'fitlabs' } })
  }

  if (isLoadingRestaurants) {
    return (
      <main style={{ paddingBottom: '80px' }}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando restaurantes fit...</p>
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

  if (restaurantsError) {
    return (
      <main style={{ paddingBottom: '80px' }}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
          <p>{restaurantsError}</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ paddingBottom: '80px' }}>
      {/* Hero Section - Scrolls with page */}
      <div className="fade-in stagger-1" style={{
        background: '#10b981',
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
          color: '#d1fae5', 
          marginBottom: '16px',
          fontSize: '15px',
          fontWeight: '500'
        }}>
          Productos saludables de todos nuestros restaurantes
        </p>
        
        {/* Label Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {LABEL_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => toggleLabel(filter.key)}
              className="tap-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                border: selectedLabels.includes(filter.key)
                  ? '2px solid white' 
                  : '2px solid rgba(255, 255, 255, 0.4)',
                background: selectedLabels.includes(filter.key)
                  ? 'white' 
                  : 'rgba(255, 255, 255, 0.2)',
                color: selectedLabels.includes(filter.key) ? filter.color : 'white',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: selectedLabels.includes(filter.key)
                  ? '0 2px 8px rgba(0, 0, 0, 0.15)'
                  : 'none'
              }}
            >
              <span style={{ fontSize: '14px' }}>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fit Restaurants Section */}
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
            Restaurantes con Opciones Fit
          </h2>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="card fade-in stagger-3" style={{ 
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            <Leaf size={48} style={{ margin: '0 auto 12px', color: '#10b981', strokeWidth: 1.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>
              No hay restaurantes con estas opciones
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Intenta con otros filtros o espera nuevos restaurantes
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRestaurants.map((restaurant, index) => {
              const productCount = countFitProducts(restaurant, selectedLabels)
              
              return (
                <div
                  key={restaurant.id}
                  onClick={() => handleRestaurantClick(restaurant)}
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
                    {/* Restaurant Logo */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      backgroundImage: `url(${restaurant.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}></div>
                    
                    {/* Restaurant Info */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '6px'
                      }}>
                        {restaurant.name}
                      </h3>
                      
                      {/* Rating and Delivery Time */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} style={{ fill: '#fbbf24', color: '#fbbf24' }} />
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                            {restaurant.rating}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} style={{ color: '#6b7280' }} />
                          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                            {restaurant.deliveryTime}
                          </span>
                        </div>
                      </div>
                      
                      {/* Address */}
                      {restaurant.address && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          marginBottom: '8px'
                        }}>
                          <MapPin size={14} style={{ color: '#10b981' }} />
                          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                            {restaurant.address}
                          </span>
                        </div>
                      )}
                      
                      {/* Fit Options Count */}
                      <div className="badge" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#d1fae5',
                        color: '#10b981',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        <Heart size={12} style={{ fill: '#10b981' }} />
                        {productCount} opciones fit disponibles
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default FitLabsPage

