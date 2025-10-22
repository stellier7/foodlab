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
  const [showLoginModal, setShowLoginModal] = useState(false)
  // Stage 0: Full header with logo + toggle (0-100px)
  // Stage 1: Logo fading (100-250px)
  // Stage 2: Toggle fading (250-450px)
  // Stage 3: Minimal header (450px+)

  const navItems = [
    { path: '/', name: 'FoodLab', icon: UtensilsCrossed, color: '#f97316' },
    { path: '/fitlab', name: 'FitLab', icon: Dumbbell, color: '#10b981' },
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
      if (!e.target.closest('.login-modal-container')) {
        setShowLoginModal(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showLocationDropdown, showUserMenu, showLoginModal])

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
      setShowLoginModal(false)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  // Handle email login
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')
    
    try {
      await loginWithEmail(email, password)
      setShowLoginModal(false)
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

          {/* Right side buttons - Clean Layout */}
          {!isAdminPage && (
            <div className="fade-in stagger-2" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginLeft: scrollStage >= 2 ? 'auto' : '0',
              transition: 'margin-left 0.4s ease-in-out'
            }}>
              {/* City Code - Clean */}
              <div className="location-selector-container" style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="tap-effect"
                  style={{
                    width: '42px',
                    height: '42px',
                    color: 'white',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '13px',
                    fontWeight: '700',
                    outline: 'none',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Hover effect
                    ':hover': {
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  {userLocation.city}
                </button>

                {/* Location Dropdown - Dos Niveles */}
                {showLocationDropdown && (
                  <div
                    className="fade-in"
                    style={{
                      position: 'fixed',
                      top: '100px',
                      right: '16px',
                      background: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
                      padding: '16px',
                      minWidth: '200px',
                      zIndex: 999999,
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    {!selectedCountry ? (
                      // Show ONLY countries
                      <>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#9ca3af',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Selecciona tu país:
                        </div>
                        <div>
                          {Object.keys(LOCATIONS).map((countryKey) => {
                            const country = LOCATIONS[countryKey]
                            const isSelected = userLocation.country === countryKey
                            
                            return (
                              <button
                                key={countryKey}
                                onClick={() => setSelectedCountry(countryKey)}
                                className="tap-effect"
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
                                  marginBottom: '4px',
                                  border: 'none',
                                  borderRadius: '8px',
                                  background: isSelected ? '#e0f2fe' : '#fafafa',
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
                      </>
                    ) : (
                      // Show ONLY cities with back button
                      <>
                        <button
                          onClick={() => setSelectedCountry(null)}
                          className="tap-effect"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            marginBottom: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            background: '#f9fafb',
                            color: '#6b7280',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          ← Volver a países
                        </button>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#9ca3af',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Selecciona tu ciudad:
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

              {/* User Menu / Login Button */}
              {isAuthenticated ? (
                <div className="user-menu-container" style={{ position: 'relative', marginLeft: '8px' }}>
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
                  onClick={() => setShowLoginModal(true)}
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
                    gap: '6px',
                    marginLeft: '8px'
                  }}
                >
                  <User size={16} />
                  Iniciar
                </button>
              )}
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

      {/* Login Modal */}
      {showLoginModal && (
        <div 
          className="fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            className="login-modal-container"
            style={{
              backgroundColor: 'white',
              width: '100%',
              maxWidth: '400px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div 
              style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h2 
                style={{ 
                  fontSize: '20px',
                  fontWeight: '700',
                  letterSpacing: '-0.3px',
                  margin: 0,
                  color: '#111827'
                }}
              >
                Iniciar Sesión
              </h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="tap-effect"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  color: '#6b7280',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div 
              style={{ 
                padding: '24px'
              }}
            >
              {/* Google Sign-in */}
              <button
                onClick={handleGoogleLogin}
                className="tap-effect"
                style={{
                  width: '100%',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                <span style={{ margin: '0 12px', fontSize: '12px', color: '#6b7280' }}>o</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  className="focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  className="focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  required
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#f97316',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Iniciar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header