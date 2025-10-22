import { useEffect, useState } from 'react'
import { ShoppingCart as ShoppingCartIcon, UtensilsCrossed, Dumbbell, ShoppingBag, Search, User, LogOut } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useNavigate, useLocation } from 'react-router-dom'

const Header = () => {
  const { cart, location: userLocation, setLocation, getLocations } = useAppStore()
  const { user, isAuthenticated, logout, loginWithGoogle } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const [scrollStage, setScrollStage] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  // Stage 0: Full header with logo + toggle (0-100px)
  // Stage 1: Logo fading (100-250px)
  // Stage 2: Toggle fading (250-450px)
  // Stage 3: Minimal header (450px+)

  const navItems = [
    { path: '/', name: 'FoodLab', icon: UtensilsCrossed, color: '#f97316' },
    { path: '/fitlabs', name: 'FitLabs', icon: Dumbbell, color: '#10b981' },
    { path: '/shop', name: 'Shop', icon: ShoppingBag, color: '#3b82f6' }
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

  // Obtener datos de ubicaciones
  const LOCATIONS = getLocations()
  
  // Cerrar dropdowns cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.location-selector-container')) {
        setShowLocationDropdown(false)
        setSelectedCountry(null)
      }
      if (!e.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showLocationDropdown, showUserMenu])

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  // Hide header on restaurant, admin, and business pages (tienen sus propios headers)
  if (isRestaurantPage || isAdminPage || location.pathname.startsWith('/business')) {
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
              {/* City Code Selector */}
              <div className="location-selector-container" style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="tap-effect"
                  style={{
                    height: '42px',
                    padding: '0 16px',
                    color: currentNav.color,
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px',
                    fontWeight: '700',
                    outline: 'none',
                    letterSpacing: '0.5px'
                  }}
                >
                  [{userLocation.city}]
                </button>
                
                {/* Location Dropdown - Dos Niveles */}
                {showLocationDropdown && (
                  <div
                    className="fade-in"
                    style={{
                      position: 'absolute',
                      top: '50px',
                      right: '0',
                      background: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      padding: '16px',
                      minWidth: '200px',
                      zIndex: 1000
                    }}
                  >
                    {/* Nivel 1: Países */}
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#9ca3af',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      País:
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      {Object.keys(LOCATIONS).map((countryKey) => {
                        const country = LOCATIONS[countryKey]
                        const isSelected = userLocation.country === countryKey
                        const isHovered = selectedCountry === countryKey
                        
                        return (
                          <button
                            key={countryKey}
                            onClick={() => setSelectedCountry(countryKey)}
                            onMouseEnter={() => setSelectedCountry(countryKey)}
                            className="tap-effect"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              marginBottom: '4px',
                              border: 'none',
                              borderRadius: '8px',
                              background: isSelected ? '#e0f2fe' : (isHovered ? '#f3f4f6' : '#fafafa'),
                              color: '#111827',
                              fontSize: '14px',
                              fontWeight: isSelected ? '700' : '600',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                            {isSelected && <span style={{ marginLeft: 'auto', color: '#3b82f6' }}>✓</span>}
                          </button>
                        )
                      })}
                    </div>
                    
                    {/* Nivel 2: Ciudades (si hay país seleccionado) */}
                    {selectedCountry && (
                      <>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#9ca3af',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderTop: '1px solid #f3f4f6',
                          paddingTop: '12px'
                        }}>
                          Ciudad:
                        </div>
                        <div>
                          {LOCATIONS[selectedCountry].cities.map((city) => {
                            const isCurrentCity = userLocation.city === city.code && userLocation.country === selectedCountry
                            
                            return (
                              <button
                                key={city.code}
                                onClick={() => {
                                  setLocation(selectedCountry, city.code)
                                  setShowLocationDropdown(false)
                                  setSelectedCountry(null)
                                }}
                                className="tap-effect"
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  marginBottom: '4px',
                                  border: 'none',
                                  borderRadius: '8px',
                                  background: isCurrentCity ? '#dbeafe' : '#f9fafb',
                                  color: '#111827',
                                  fontSize: '14px',
                                  fontWeight: isCurrentCity ? '700' : '600',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <span>{city.name}</span>
                                {isCurrentCity && <span style={{ color: '#3b82f6', fontSize: '12px' }}>✓</span>}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

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

              {/* User Menu / Login Button */}
              {isAuthenticated ? (
                <div className="user-menu-container" style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="tap-effect"
                    style={{
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
                    }}
                  >
                    <User size={20} strokeWidth={2} />
                  </button>
                  
                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div
                      className="fade-in"
                      style={{
                        position: 'absolute',
                        top: '50px',
                        right: '0',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        padding: '8px',
                        minWidth: '200px',
                        zIndex: 1000
                      }}
                    >
                      {/* User Info */}
                      <div style={{
                        padding: '12px',
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>
                          {user?.firstName || user?.displayName?.split(' ')[0] || 'Usuario'}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: '0'
                        }}>
                          {user?.email}
                        </p>
                      </div>
                      
                      {/* Menu Items */}
                      <div style={{ padding: '4px 0' }}>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            // Navigate to profile or orders
                          }}
                          className="tap-effect"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#111827',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '8px'
                          }}
                        >
                          <User size={16} />
                          Mi Perfil
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            // Navigate to orders
                          }}
                          className="tap-effect"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#111827',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '8px'
                          }}
                        >
                          <ShoppingCartIcon size={16} />
                          Mis Pedidos
                        </button>
                        
                        <button
                          onClick={handleLogout}
                          className="tap-effect"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#dc2626',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '8px'
                          }}
                        >
                          <LogOut size={16} />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="tap-effect"
                  style={{
                    height: '42px',
                    padding: '0 16px',
                    color: currentNav.color,
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px',
                    fontWeight: '700',
                    outline: 'none',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <User size={16} />
                  Iniciar
                </button>
              )}

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