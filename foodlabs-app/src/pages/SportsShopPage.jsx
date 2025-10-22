import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { ShoppingBag, Plus, Star, Clock, MapPin } from 'lucide-react'

const SportsShopPage = () => {
  const navigate = useNavigate()
  const { setRestaurants, restaurants } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Tiendas de la Shop (estructura como restaurantes)
  const shopBusinesses = [
    {
      id: 'padelbuddy',
      name: 'PadelBuddy',
      slug: 'padelbuddy',
      type: 'shop',
      category: 'Deportes',
      tier: 'shop',
      rating: 5.0,
      reviewCount: 45,
      deliveryTime: '24-48 hrs',
      deliveryFee: 0,
      address: 'Entregas a domicilio',
      image: '/images/products/phoneMount-PadelBuddy.jpeg',
      logo: '/images/products/phoneMount-PadelBuddy.jpeg',
      isOpen: true,
      menuCategories: [
        {
          name: 'Accesorios',
          items: [
            {
              id: 'sp3',
              name: 'Phone Mount',
              price: 13.15,
              precio_HNL: 325.00,
              description: 'Soporte para teléfono con ventosas en forma de raqueta de padel. Perfecto para grabar tus partidos.',
              image: '/images/products/phoneMount-PadelBuddy.jpeg',
              stock: 20,
              isNew: true,
              features: ['12 ventosas', 'Forma de raqueta', 'Para vidrio', 'Grabación HD'],
              labels: []
            }
          ]
        }
      ]
    }
  ]
  
  // Cargar tiendas al iniciar
  useEffect(() => {
    // Agregar PadelBuddy a la lista global de restaurantes si no existe
    const existingRestaurants = restaurants || []
    const hasPadelbuddy = existingRestaurants.some(r => r.id === 'padelbuddy')
    
    if (!hasPadelbuddy) {
      setRestaurants([...existingRestaurants, ...shopBusinesses])
    }
  }, [])

  const categories = [
    { id: 'all', name: 'Todo', emoji: '🏪' },
    { id: 'sports', name: 'Deportes', emoji: '⚽' },
    { id: 'convenience', name: 'Conveniencia', emoji: '🏬' },
    { id: 'pharmacy', name: 'Farmacias', emoji: '💊' }
  ]

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

      {/* Businesses List */}
      <div style={{ padding: '20px 16px' }}>
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
                  {/* Business Logo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    backgroundImage: `url(${business.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    position: 'relative'
                  }}>
                    {business.isNew && (
                      <span className="badge badge-success" style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        fontSize: '9px',
                        padding: '4px 8px',
                        fontWeight: '800'
                      }}>
                        ✨ NUEVO
                      </span>
                    )}
                  </div>
                  
                  {/* Business Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: '6px'
                    }}>
                      {business.name}
                    </h3>
                    
                    {/* Rating and Delivery Time */}
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
                    
                    {/* Address */}
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
                    
                    {/* Product Count */}
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
      </div>
    </main>
  )
}

export default SportsShopPage

