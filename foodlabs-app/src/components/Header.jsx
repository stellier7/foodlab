import { ShoppingCart as ShoppingCartIcon, UtensilsCrossed, Dumbbell, ShoppingBag } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { useNavigate, useLocation } from 'react-router-dom'

const Header = () => {
  const { cart } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  const navItems = [
    { path: '/', name: 'FoodLab', icon: UtensilsCrossed, color: '#f97316' },
    { path: '/fitlabs', name: 'FitLabs', icon: Dumbbell, color: '#10b981' },
    { path: '/sportsshop', name: 'SportsShop', icon: ShoppingBag, color: '#3b82f6' }
  ]

  const currentNav = navItems.find(item => item.path === location.pathname) || navItems[0]
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <header className="fade-in" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Full Color Background with Rounded Bottom */}
      <div style={{
        background: `linear-gradient(135deg, ${currentNav.color} 0%, ${currentNav.color}dd 100%)`,
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px'
      }}>
        <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div className="fade-in stagger-1" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: `linear-gradient(135deg, ${currentNav.color} 0%, ${currentNav.color}dd 100%)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${currentNav.color}40`,
              transition: 'all 0.3s ease'
            }}>
              <currentNav.icon size={22} style={{ color: 'white' }} strokeWidth={2.5} />
            </div>
            <h1 style={{ 
              fontSize: '22px', 
              fontWeight: '800', 
              color: '#111827',
              letterSpacing: '-0.5px'
            }}>
              {currentNav.name}
            </h1>
          </div>

          {/* Cart Button - Hidden in Admin */}
          {!isAdminPage && (
            <div className="fade-in stagger-2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="tap-effect" style={{
                position: 'relative',
                padding: '10px',
                color: '#111827',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <ShoppingCartIcon size={22} strokeWidth={2} />
                {cartItemsCount > 0 && (
                  <span className="fade-in-scale" style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: `linear-gradient(135deg, ${currentNav.color} 0%, ${currentNav.color}dd 100%)`,
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 2px 8px ${currentNav.color}60`,
                    border: '2px solid white'
                  }}>
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="fade-in stagger-2" style={{
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {navItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="tap-effect"
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '12px',
                background: location.pathname === item.path 
                  ? 'rgba(255, 255, 255, 0.25)' 
                  : 'rgba(255, 255, 255, 0.9)',
                color: location.pathname === item.path ? 'white' : '#111827',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: location.pathname === item.path ? '700' : '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                boxShadow: location.pathname === item.path 
                  ? '0 4px 12px rgba(255, 255, 255, 0.3)' 
                  : '0 2px 6px rgba(0, 0, 0, 0.1)',
                animationDelay: `${0.1 + index * 0.05}s`,
                opacity: 0,
                animation: 'fadeInScale 0.4s ease-out forwards'
              }}
            >
              <item.icon size={18} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        </div>
      </div>
    </header>
  )
}

export default Header