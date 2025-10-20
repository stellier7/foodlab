import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Heart, Calendar, Users, Star, Leaf, MapPin, Clock } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'

const FitLabsPage = () => {
  const { restaurants } = useAppStore()
  const navigate = useNavigate()
  const [selectedLabels, setSelectedLabels] = useState([])

  // Labels disponibles para filtrar
  const LABEL_FILTERS = [
    { key: 'Vegano', label: 'Vegano', icon: '🌿', color: '#10b981' },
    { key: 'Vegetariano', label: 'Vegetariano', icon: '🌱', color: '#059669' },
    { key: 'Pescatariano', label: 'Pescatariano', icon: '🐟', color: '#0ea5e9' }
  ]

  // Restaurantes que tienen productos con labels dietarios
  const fitRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      return restaurant.menuCategories?.some(category =>
        category.items?.some(item =>
          item.labels?.some(label => 
            ['Fit', 'Vegano', 'Vegetariano', 'Pescatariano'].includes(label)
          )
        )
      )
    })
  }, [restaurants])

  // Filtrar restaurantes según labels seleccionados
  const filteredRestaurants = useMemo(() => {
    if (selectedLabels.length === 0) {
      return fitRestaurants
    }
    
    return fitRestaurants.filter(restaurant => {
      return restaurant.menuCategories?.some(category =>
        category.items?.some(item =>
          item.labels?.some(label => selectedLabels.includes(label))
        )
      )
    })
  }, [fitRestaurants, selectedLabels])

  // Contar productos fit de un restaurante
  const countFitProducts = (restaurant, labels = []) => {
    const targetLabels = labels.length > 0 
      ? labels 
      : ['Fit', 'Vegano', 'Vegetariano', 'Pescatariano']
    
    return restaurant.menuCategories?.reduce((count, category) => {
      return count + (category.items?.filter(item =>
        item.labels?.some(l => targetLabels.includes(l))
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
    const slug = restaurant.slug || restaurant.name.toLowerCase().replace(/\s+/g, '-')
    const labelsParam = selectedLabels.length > 0 ? `&labels=${selectedLabels.join(',')}` : ''
    navigate(`/restaurant/${slug}?filter=fit${labelsParam}`)
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
                border: 'none',
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
          <div className="badge" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: '#d1fae5',
            color: '#10b981',
            padding: '6px 12px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '11px'
          }}>
            <Heart size={12} style={{ fill: '#10b981' }} />
            <span>{filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurante' : 'restaurantes'}</span>
          </div>
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

