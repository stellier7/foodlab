import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { useOrdersStore } from '../stores/useOrdersStore'
import StatsCards, { QuickStats, OrderStatusStats } from '../components/admin/StatsCards'
import StatusBadge, { StatusSummary } from '../components/admin/StatusBadge'
import { 
  Plus, 
  Search, 
  Filter, 
  Bell, 
  Settings, 
  LogOut,
  Eye,
  Edit,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react'

const AdminPage = () => {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, checkAuth } = useAuthStore()
  const { 
    getRecentOrders, 
    getFilteredOrders, 
    filters, 
    setFilters, 
    calculateStats,
    exportOrders 
  } = useOrdersStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [showNotifications, setShowNotifications] = useState(false)

  // Verificar autenticación
  useEffect(() => {
    if (!checkAuth()) {
      navigate('/admin/login')
    }
  }, [checkAuth, navigate])

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Recalcular stats cuando cambie el período
  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setFilters({ search: term })
  }

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
    setFilters({ date: period })
  }

  const handleCardClick = (type) => {
    switch (type) {
      case 'sales':
        navigate('/admin/analytics')
        break
      case 'orders':
        navigate('/admin/orders')
        break
      case 'pending':
        setFilters({ status: 'pending' })
        navigate('/admin/orders')
        break
      case 'customers':
        navigate('/admin/analytics')
        break
      default:
        break
    }
  }

  const recentOrders = getRecentOrders(5)
  const filteredOrders = getFilteredOrders()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo y título */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#1f2937',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
            }}>
              <span style={{ fontSize: '20px' }}>🏢</span>
            </div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.5px'
              }}>
                FoodLabs Admin
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Panel de Administración
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ 
            display: window.innerWidth < 768 ? 'none' : 'flex',
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <QuickStats />
            
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="tap-effect"
              style={{
                position: 'relative',
                padding: '8px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Bell size={20} style={{ color: '#6b7280' }} />
              {/* Notification badge */}
              <span className="badge badge-danger" style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                fontSize: '10px',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                3
              </span>
            </button>

            {/* User menu */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827'
              }}>
                {user?.name || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="tap-effect"
                style={{
                  padding: '4px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: window.innerWidth < 768 ? '16px 12px' : '24px 20px'
      }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#111827',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px'
            }}>
              Dashboard
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>
              Resumen general de tu plataforma
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => navigate('/admin/orders')}
              className="btn-primary ripple"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <Plus size={16} />
              Nueva Orden
            </button>
            
            <button
              onClick={() => exportOrders('csv')}
              className="tap-effect"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: 'white',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards period={selectedPeriod} onCardClick={handleCardClick} />

        {/* Period Selector */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          justifyContent: 'center'
        }}>
          {[
            { key: 'today', label: 'Hoy' },
            { key: 'week', label: 'Esta Semana' },
            { key: 'month', label: 'Este Mes' }
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => handlePeriodChange(period.key)}
              className="tap-effect"
              style={{
                padding: '8px 16px',
                backgroundColor: selectedPeriod === period.key ? '#3b82f6' : 'white',
                color: selectedPeriod === period.key ? 'white' : '#374151',
                border: `2px solid ${selectedPeriod === period.key ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '2fr 1fr',
          gap: window.innerWidth < 768 ? '16px' : '24px',
          alignItems: 'start'
        }}>
          {/* Recent Orders */}
          <div className="card fade-in-scale" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            border: '2px solid rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                Pedidos Recientes
              </h3>
              <button
                onClick={() => navigate('/admin/orders')}
                className="tap-effect"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Ver todos
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="fade-in tap-effect"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/admin/orders?order=${order.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: order.business.id === 'sportsshop' ? '#3b82f6' : '#f97316',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {order.business.id === 'sportsshop' ? '🏆' : '🍽️'}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '2px'
                      }}>
                        #{order.orderNumber} - {order.customer.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {order.business.name} • ${order.pricing.total}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusBadge status={order.status} size="sm" />
                    <Clock size={14} style={{ color: '#9ca3af' }} />
                    <span style={{
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      {new Date(order.createdAt).toLocaleTimeString('es-HN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <OrderStatusStats />
            
            {/* Quick Actions */}
            <div className="card fade-in-scale" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              border: '2px solid rgba(16, 185, 129, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 16px 0'
              }}>
                Acciones Rápidas
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="tap-effect"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}
                >
                  <Eye size={16} />
                  Ver todos los pedidos
                </button>
                
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="tap-effect"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}
                >
                  <TrendingUp size={16} />
                  Ver analytics
                </button>
                
                <button
                  onClick={() => calculateStats()}
                  className="tap-effect"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}
                >
                  <RefreshCw size={16} />
                  Actualizar datos
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminPage

