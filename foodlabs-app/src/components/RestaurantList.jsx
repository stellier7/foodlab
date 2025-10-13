import { useState } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { Clock, Star, Truck } from 'lucide-react'

const RestaurantList = () => {
  const { restaurants, isLoading, addToCart } = useAppStore()
  const [expandedRestaurant, setExpandedRestaurant] = useState(null)

  if (isLoading) {
    return (
      <div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card skeleton fade-in" style={{ 
            animationDelay: `${i * 0.1}s`,
            opacity: 0 
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '16px', flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: '20px', borderRadius: '8px', width: '70%', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ height: '14px', borderRadius: '6px', width: '40%', marginBottom: '16px' }}></div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="skeleton" style={{ height: '12px', borderRadius: '4px', width: '50px' }}></div>
                  <div className="skeleton" style={{ height: '12px', borderRadius: '4px', width: '60px' }}></div>
                  <div className="skeleton" style={{ height: '12px', borderRadius: '4px', width: '45px' }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {restaurants.map((restaurant, index) => (
        <div 
          key={restaurant.id} 
          className="card fade-in tap-effect"
          style={{
            padding: '20px',
            animationDelay: `${index * 0.1}s`,
            opacity: 0
          }}
        >
          {/* Restaurant Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <img
              src={restaurant.image}
              alt={restaurant.name}
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '16px', 
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ 
                    fontWeight: '800', 
                    color: '#111827', 
                    fontSize: '18px', 
                    margin: 0,
                    letterSpacing: '-0.3px'
                  }}>
                    {restaurant.name}
                  </h3>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '13px', 
                    margin: '4px 0',
                    fontWeight: '500'
                  }}>
                    {restaurant.category}
                  </p>
                </div>
                
                {restaurant.isPrime && (
                  <div className="badge badge-primary" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '9px',
                    padding: '6px 10px'
                  }}>
                    <Star size={10} style={{ fill: 'white' }} />
                    <span>SELECT</span>
                  </div>
                )}
              </div>

              {/* Restaurant Info */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginTop: '12px', 
                fontSize: '13px', 
                color: '#6b7280',
                fontWeight: '500'
              }}>
                <div className="badge" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '4px 8px',
                  fontSize: '11px'
                }}>
                  <Star size={12} style={{ fill: 'currentColor' }} />
                  <span>{restaurant.rating}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} strokeWidth={2} />
                  <span style={{ fontSize: '12px' }}>{restaurant.deliveryTime}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={14} strokeWidth={2} />
                  <span style={{ fontSize: '12px' }}>${restaurant.deliveryFee}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Toggle Button */}
          <button
            onClick={() => setExpandedRestaurant(
              expandedRestaurant === restaurant.id ? null : restaurant.id
            )}
            className="tap-effect"
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              color: '#f97316',
              fontWeight: '700',
              fontSize: '14px',
              background: expandedRestaurant === restaurant.id 
                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)'
                : '#fef3c7',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxShadow: expandedRestaurant === restaurant.id 
                ? '0 4px 12px rgba(249, 115, 22, 0.15)'
                : 'none'
            }}
          >
            {expandedRestaurant === restaurant.id ? '▲ Ocultar menú' : '▼ Ver menú'}
          </button>

          {/* Menu Items */}
          {expandedRestaurant === restaurant.id && (
            <div className="fade-in" style={{ 
              marginTop: '16px', 
              paddingTop: '16px', 
              borderTop: '2px solid rgba(249, 115, 22, 0.1)' 
            }}>
              <h4 style={{ 
                fontWeight: '800', 
                color: '#111827', 
                marginBottom: '16px',
                fontSize: '16px',
                letterSpacing: '-0.3px'
              }}>
                🍽️ Menú
              </h4>
              <div>
                {restaurant.menu.map((item, itemIndex) => (
                  <div 
                    key={item.id} 
                    className="card fade-in tap-effect"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      marginBottom: '12px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                      animationDelay: `${itemIndex * 0.05}s`,
                      opacity: 0
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h5 style={{ 
                        fontWeight: '700', 
                        color: '#111827', 
                        margin: 0,
                        fontSize: '15px'
                      }}>
                        {item.name}
                      </h5>
                      <p style={{ 
                        fontSize: '13px', 
                        color: '#6b7280', 
                        margin: '4px 0',
                        fontWeight: '500'
                      }}>
                        {item.description}
                      </p>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px',
                      marginLeft: '16px'
                    }}>
                      <span style={{ 
                        fontWeight: '800', 
                        color: '#f97316',
                        fontSize: '18px'
                      }}>
                        ${item.price.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => addToCart(item, restaurant.id)}
                        className="btn-primary ripple"
                        style={{ 
                          fontSize: '13px', 
                          padding: '10px 20px',
                          fontWeight: '700',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default RestaurantList