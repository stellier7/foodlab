import { useState, useEffect } from 'react'
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { 
  Store, 
  LogOut, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings,
  Home,
  Bell
} from 'lucide-react'

// Importar páginas (se crearán después)
import ComercioDashboard from '../../pages/comercio/ComercioDashboard'
import ComercioProductsPage from '../../pages/comercio/ComercioProductsPage'
import ComercioOrdersPage from '../../pages/comercio/ComercioOrdersPage'
import ComercioFinancesPage from '../../pages/comercio/ComercioFinancesPage'
import ComercioProfilePage from '../../pages/comercio/ComercioProfilePage'

const ComercioRouter = () => {
  const { businessId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Navegación del comercio
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: `/comercio/${businessId}/dashboard`,
      color: '#3b82f6'
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: Package,
      path: `/comercio/${businessId}/productos`,
      color: '#f97316'
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: ShoppingCart,
      path: `/comercio/${businessId}/pedidos`,
      color: '#10b981'
    },
    {
      id: 'finanzas',
      label: 'Finanzas',
      icon: TrendingUp,
      path: `/comercio/${businessId}/finanzas`,
      color: '#8b5cf6'
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: Settings,
      path: `/comercio/${businessId}/perfil`,
      color: '#6b7280'
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/comercio/login')
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab.id)
    navigate(tab.path)
  }

  // Determinar tab activo basado en la ruta actual
  useEffect(() => {
    const currentPath = location.pathname
    const activeTabFromPath = navigationItems.find(item => 
      currentPath.includes(item.path.split('/').pop())
    )
    if (activeTabFromPath) {
      setActiveTab(activeTabFromPath.id)
    }
  }, [location.pathname])

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Store size={20} style={{ color: 'white' }} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '18px', 
                fontWeight: '800',
                color: 'white',
                marginBottom: '2px'
              }}>
                {user?.name || 'Comercio'}
              </h1>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Panel de Comercio
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '16px 0' }}>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id || location.pathname === item.path
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className="tap-effect"
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  border: 'none',
                  background: isActive ? item.color : 'transparent',
                  color: isActive ? 'white' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = '#f1f5f9'
                    e.target.style.color = '#334155'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'transparent'
                    e.target.style.color = '#64748b'
                  }
                }}
              >
                <Icon size={18} strokeWidth={2} />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* User Info & Logout */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                {user?.name || 'Comercio'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {user?.businessId || businessId}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="tap-effect"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#64748b',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#dc2626'
              e.target.style.color = '#dc2626'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.color = '#64748b'
            }}
          >
            <LogOut size={16} strokeWidth={2} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: '280px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Bar */}
        <div style={{
          height: '64px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 5
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>
              {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '2px 0 0 0'
            }}>
              Gestiona tu negocio de manera eficiente
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notifications */}
            <button
              className="tap-effect"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell size={18} style={{ color: '#64748b' }} strokeWidth={2} />
              {/* Notification badge */}
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#dc2626'
              }} />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '24px' }}>
          <Routes>
            <Route path="/" element={<ComercioDashboard />} />
            <Route path="/dashboard" element={<ComercioDashboard />} />
            <Route path="/productos" element={<ComercioProductsPage />} />
            <Route path="/pedidos" element={<ComercioOrdersPage />} />
            <Route path="/finanzas" element={<ComercioFinancesPage />} />
            <Route path="/perfil" element={<ComercioProfilePage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default ComercioRouter
