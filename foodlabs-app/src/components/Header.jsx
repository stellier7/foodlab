import { useEffect, useState } from 'react'
import { ShoppingCart as ShoppingCartIcon, UtensilsCrossed, Dumbbell, ShoppingBag, Search } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { useNavigate, useLocation } from 'react-router-dom'

const Header = () => {
  const { cart } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const [scrollStage, setScrollStage] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  // Stage 0: Full header with logo + toggle (0-100px)
  // Stage 1: Logo fading (100-250px)
  // Stage 2: Toggle fading (250-450px)
  // Stage 3: Minimal header (450px+)

  const navItems = [
    { path: '/', name: 'FoodLab', icon: UtensilsCrossed, color: '#f97316' },
    { path: '/fitlabs', name: 'FitLabs', icon: Dumbbell, color: '#10b981' },
    { path: '/sportsshop', name: 'SportsShop', icon: ShoppingBag, color: '#3b82f6' }
  ]

  const currentNav = navItems.find(item => item.path === location.pathname) || navItems[0]
  const isAdminPage = location.pathname.startsWith('/admin')
  const isRestaurantPage = location.pathname.startsWith('/restaurant/')

  // Calculate smooth opacity values based on scroll position
  const logoOpacity = Math.max(0, Math.min(1, 1 - ((scrollY - 100) / 150)))
  const toggleOpacity = Math.max(0, Math.min(1, 1 - ((scrollY - 250) / 200)))

  // Update theme color dynamically based on current section
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentNav.color)
    }
  }, [currentNav.color])

  // Handle scroll behavior with multi-stage transitions
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setScrollY(scrollTop)
      
      if (scrollTop < 100) {
        setScrollStage(0)
      } else if (scrollTop < 250) {
        setScrollStage(1)
      } else if (scrollTop < 450) {
        setScrollStage(2)
      } else {
        setScrollStage(3)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hide header on restaurant pages
  if (isRestaurantPage) {
    return null
  }

  return (
    <header className="fade-in" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'transparent',
      transition: 'background-color 0.3s ease-in-out',
      willChange: 'background-color'
    }}>
      {/* Full Color Background with conditional rounded bottom */}
      <div style={{
        background: currentNav.color,
        paddingTop: 'env(safe-area-inset-top)',
        transition: 'background-color 0.3s ease-in-out, border-radius 0.4s ease-in-out',
        borderBottomLeftRadius: scrollStage === 0 ? '0' : (scrollStage >= 2 ? '12px' : '24px'),
        borderBottomRightRadius: scrollStage === 0 ? '0' : (scrollStage >= 2 ? '12px' : '24px'),
        boxShadow: scrollStage === 0 ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          padding: scrollStage >= 2 ? '8px 16px' : '16px',
          transition: 'padding 0.4s ease-in-out'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo - Hidden after stage 1 with slower transition */}
          <div className="fade-in stagger-1" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            opacity: logoOpacity,
            transform: `translateY(${-Math.max(0, (scrollY - 80) * 0.08)}px)`,
            pointerEvents: scrollStage >= 2 ? 'none' : 'auto'
          }}>
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
                color: 'white',
                letterSpacing: '-0.5px'
              }}>
                {currentNav.name}
              </h1>
            </div>

          {/* Right side buttons */}
          {!isAdminPage && (
            <div className="fade-in stagger-2" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginLeft: scrollStage >= 2 ? 'auto' : '0',
              transition: 'margin-left 0.4s ease-in-out'
            }}>
              {/* Search Button */}
              <button className="tap-effect" style={{
                width: '42px',
                height: '42px',
                color: currentNav.color,
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Search size={20} strokeWidth={2} />
              </button>

              {/* Cart Button */}
              <button className="tap-effect" style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                color: currentNav.color,
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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

        {/* Navigation Tabs - Gradual fade with scroll */}
        <div className="fade-in stagger-2" style={{
          marginTop: `${Math.max(0, 16 - Math.max(0, (scrollY - 200) * 0.08))}px`,
          display: 'flex',
          gap: '0',
          justifyContent: 'center',
          backgroundColor: `rgba(255, 255, 255, ${0.9 * toggleOpacity})`,
          borderRadius: '12px',
          padding: `${Math.max(0, 4 * toggleOpacity)}px`,
          maxWidth: window.innerWidth >= 768 ? '380px' : '100%',
          margin: window.innerWidth >= 768 ? `${Math.max(0, 16 - Math.max(0, (scrollY - 200) * 0.08))}px auto 0` : `${Math.max(0, 16 - Math.max(0, (scrollY - 200) * 0.08))}px 0 0`,
          overflowX: 'auto',
          opacity: toggleOpacity,
          transform: `translateY(${-Math.max(0, (scrollY - 200) * 0.05)}px) scale(${Math.max(0.95, toggleOpacity)})`,
          pointerEvents: scrollStage >= 3 ? 'none' : 'auto',
          maxHeight: `${Math.max(0, 60 * toggleOpacity)}px`,
          overflow: 'hidden'
        }}>
          {navItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="tap-effect"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                borderRadius: location.pathname === item.path ? '10px' : '0',
                background: location.pathname === item.path 
                  ? 'rgba(255, 255, 255, 1)' 
                  : 'transparent',
                color: location.pathname === item.path ? currentNav.color : '#6b7280',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: location.pathname === item.path ? '700' : '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                boxShadow: location.pathname === item.path 
                  ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
                  : 'none',
                animationDelay: `${0.1 + index * 0.05}s`,
                opacity: 0,
                animation: 'fadeInScale 0.4s ease-out forwards'
              }}
            >
              <item.icon size={16} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
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