import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useOrdersStore } from '../../stores/useOrdersStore'
import { useAppStore } from '../../stores/useAppStore'
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

const ComercioDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { getOrdersByBusiness, calculateStats } = useOrdersStore()
  const { getPriceForCurrency, getCurrencySymbol } = useAppStore()
  const [stats, setStats] = useState({
    todayOrders: 0,
    todaySales: 0,
    pendingOrders: 0,
    totalProducts: 0
  })

  // Obtener órdenes del negocio
  const businessOrders = getOrdersByBusiness(user?.businessId || '')
  
  // Calcular estadísticas
  useEffect(() => {
    const today = new Date()
    const todayOrders = businessOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate.toDateString() === today.toDateString()
    })
    
    const pendingOrders = businessOrders.filter(order => order.status === 'pending')
    const todaySales = todayOrders.reduce((sum, order) => sum + order.pricing.total, 0)
    
    setStats({
      todayOrders: todayOrders.length,
      todaySales,
      pendingOrders: pendingOrders.length,
      totalProducts: 0 // Se calculará cuando tengamos productos
    })
  }, [businessOrders])

  const quickActions = [
    {
      icon: Plus,
      label: 'Agregar Producto',
      description: 'Añadir nuevo producto al catálogo',
      color: '#10b981',
      path: '/productos',
      action: 'add'
    },
    {
      icon: ShoppingCart,
      label: 'Ver Pedidos',
      description: 'Gestionar pedidos pendientes',
      color: '#3b82f6',
      path: '/pedidos',
      badge: stats.pendingOrders
    },
    {
      icon: TrendingUp,
      label: 'Finanzas',
      description: 'Ver reportes y ganancias',
      color: '#8b5cf6',
      path: '/finanzas'
    },
    {
      icon: Package,
      label: 'Inventario',
      description: 'Gestionar stock de productos',
      color: '#f59e0b',
      path: '/productos'
    }
  ]

  const recentOrders = businessOrders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div>
      {/* Welcome Card */}
      <div style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(249, 115, 22, 0.3)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>
          ¡Hola, {user?.name || 'Comercio'}! 👋
        </h1>
        <p style={{
          fontSize: '16px',
          opacity: 0.9,
          marginBottom: '16px'
        }}>
          Tienes {stats.pendingOrders} pedidos pendientes de confirmación
        </p>
        {stats.pendingOrders > 0 && (
          <button
            onClick={() => navigate('/pedidos')}
            className="tap-effect ripple"
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Eye size={18} strokeWidth={2} />
            Ver Pedidos Pendientes
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingCart size={24} style={{ color: 'white' }} strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                {stats.todayOrders}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                Pedidos Hoy
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
            +12% vs ayer
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={24} style={{ color: 'white' }} strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                {getCurrencySymbol()} {getPriceForCurrency({ price: stats.todaySales }).toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                Ventas Hoy
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
            +8% vs ayer
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={24} style={{ color: 'white' }} strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                {stats.pendingOrders}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                Pendientes
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: stats.pendingOrders > 0 ? '#dc2626' : '#10b981', fontWeight: '600' }}>
            {stats.pendingOrders > 0 ? 'Requieren atención' : 'Todo al día'}
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={24} style={{ color: 'white' }} strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                {stats.totalProducts}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                Productos
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            En catálogo
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '16px'
        }}>
          Acciones Rápidas
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="tap-effect ripple"
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = action.color
                  e.target.style.boxShadow = `0 4px 12px rgba(${parseInt(action.color.slice(1, 3), 16)}, ${parseInt(action.color.slice(3, 5), 16)}, ${parseInt(action.color.slice(5, 7), 16)}, 0.1)`
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} style={{ color: 'white' }} strokeWidth={2} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                    {action.label}
                  </div>
                  {action.badge && action.badge > 0 && (
                    <div style={{
                      background: '#dc2626',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {action.badge}
                    </div>
                  )}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {action.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0
          }}>
            Pedidos Recientes
          </h2>
          <button
            onClick={() => navigate('/pedidos')}
            className="tap-effect"
            style={{
              padding: '8px 16px',
              border: '1px solid #e2e8f0',
              background: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.color = '#3b82f6'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.color = '#64748b'
            }}
          >
            Ver Todos
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="card" style={{
            padding: '40px',
            textAlign: 'center',
            background: 'white'
          }}>
            <ShoppingCart size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
              No hay pedidos recientes
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="card fade-in"
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                      Orden #{order.orderNumber}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(order.createdAt).toLocaleString('es-HN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: order.status === 'pending' ? '#fef3c7' : 
                              order.status === 'confirmed' ? '#d1fae5' : 
                              order.status === 'preparing' ? '#dbeafe' : '#f3f4f6',
                    color: order.status === 'pending' ? '#d97706' : 
                           order.status === 'confirmed' ? '#059669' : 
                           order.status === 'preparing' ? '#2563eb' : '#6b7280'
                  }}>
                    {order.status === 'pending' ? 'Pendiente' :
                     order.status === 'confirmed' ? 'Confirmada' :
                     order.status === 'preparing' ? 'En Preparación' :
                     order.status === 'ready' ? 'Lista' : order.status}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {order.customer.name} • {order.items.length} items
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                    {getCurrencySymbol()} {getPriceForCurrency({ price: order.pricing.total }).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComercioDashboard
