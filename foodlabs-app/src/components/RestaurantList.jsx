import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { Clock, Star, Truck } from 'lucide-react'

const RestaurantList = ({ filteredRestaurants }) => {
  const { restaurants: storeRestaurants, isLoading } = useAppStore()
  const navigate = useNavigate()
  
  // Usar restaurantes filtrados si se proporcionan, sino usar del store
  const restaurants = filteredRestaurants || storeRestaurants

  const handleRestaurantClick = (restaurant) => {
    navigate(`/restaurante/${restaurant.slug}`, { state: { from: 'foodlabs' } })
  }

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
          onClick={() => handleRestaurantClick(restaurant)}
          style={{
            padding: '20px',
            animationDelay: `${index * 0.1}s`,
            opacity: 0,
            cursor: 'pointer'
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


        </div>
      ))}
    </div>
  )
}

export default RestaurantList