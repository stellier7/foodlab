import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { useOrdersStore } from '../stores/useOrdersStore'
import { useAppStore } from '../stores/useAppStore'
import StatusBadge from '../components/admin/StatusBadge'
import { 
  Store, 
  LogOut, 
  Package, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react'

const BusinessPage = () => {
  const navigate = useNavigate()
  const { businessId } = useParams()
  const { user, logout, role } = useAuthStore()
  const { getOrdersByBusiness, changeOrderStatus, calculateStats } = useOrdersStore()
  const { inventory, getProductStock, getPriceForCurrency, getCurrencySymbol } = useAppStore()
  const [selectedFilter, setSelectedFilter] = useState('all')
  
  // Normalizar businessId para compatibilidad
  const normalizedBusinessId = businessId === 'shop' ? 'sportsshop' : businessId

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!user || role !== 'business' || user.businessId !== businessId) {
      navigate('/business/login')
    }
  }, [user, role, businessId, navigate])

  if (!user || role !== 'business') {
    return null
  }

  const businessOrders = getOrdersByBusiness(normalizedBusinessId)
  
  // Filtrar órdenes
  const filteredOrders = selectedFilter === 'all'
    ? businessOrders
    : businessOrders.filter(o => o.status === selectedFilter)

  // Calcular estadísticas del negocio
  const todayOrders = businessOrders.filter(o => {
    const orderDate = new Date(o.createdAt)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  })
  
  const pendingOrders = businessOrders.filter(o => o.status === 'pending')
  const todaySales = todayOrders.reduce((sum, o) => sum + o.pricing.total, 0)
  const todayCommission = todayOrders.reduce((sum, o) => sum + o.pricing.platformFee, 0)

  // Obtener productos del negocio
  const businessProducts = Object.entries(inventory).filter(([productId]) => {
    // Para Shop, filtrar productos que empiezan con 'sp'
    if (normalizedBusinessId === 'sportsshop') {
      return productId.startsWith('sp')
    }
    // Para FoodLabs, todos los productos de comida
    return !productId.startsWith('sp')
  })

  const handleLogout = () => {
    logout()
    navigate('/business/login')
  }

  const handleAcceptOrder = (orderId) => {
    changeOrderStatus(orderId, 'confirmed')
  }

  const handleRejectOrder = (orderId) => {
    changeOrderStatus(orderId, 'cancelled')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        padding: '24px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Store size={28} strokeWidth={2.5} />
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '800',
                marginBottom: '2px',
                letterSpacing: '-0.5px'
              }}>
                {user.name}
              </h1>
              <p style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>
                Panel de Comercio
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="tap-effect"
            style={{
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '16px',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>
              Órdenes Hoy
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800' }}>
              {todayOrders.length}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '16px',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>
              Pendientes
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800' }}>
              {pendingOrders.length}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '16px',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>
              Ventas Hoy
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800' }}>
              {getCurrencySymbol()} {getPriceForCurrency({ price: todaySales }).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px' }}>
        {/* Inventory Section */}
        {normalizedBusinessId === 'sportsshop' && (
          <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '16px'
            }}>
              📦 Inventario
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {businessProducts.map(([productId, item]) => {
                const stockStatus = item.stock < 5 ? 'critical' : item.stock < 10 ? 'low' : 'ok'
                const statusColor = stockStatus === 'critical' ? '#dc2626' : stockStatus === 'low' ? '#f59e0b' : '#10b981'
                
                return (
                  <div
                    key={productId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {productId === 'sp3' ? 'PadelBuddy - Phone Mount' : productId}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Vendidos: {item.sold || 0}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: statusColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Package size={16} />
                      Stock: {item.stock}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '16px',
          paddingBottom: '8px'
        }}>
          {['all', 'pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className="tap-effect"
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: selectedFilter === filter 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : '#ffffff',
                color: selectedFilter === filter ? 'white' : '#6b7280',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                boxShadow: selectedFilter === filter 
                  ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                  : 'none'
              }}
            >
              {filter === 'all' ? 'Todas' : 
               filter === 'pending' ? 'Pendientes' :
               filter === 'confirmed' ? 'Confirmadas' :
               filter === 'preparing' ? 'En Preparación' :
               filter === 'ready' ? 'Listas' :
               filter === 'in_transit' ? 'En Camino' :
               'Entregadas'}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Órdenes ({filteredOrders.length})
          </h2>

          {filteredOrders.length === 0 ? (
            <div className="card" style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: 'white'
            }}>
              <Package size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                No hay órdenes {selectedFilter !== 'all' ? `en estado ${selectedFilter}` : ''}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="card fade-in"
                  style={{
                    padding: '20px',
                    background: 'white'
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                        Orden #{order.orderNumber}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>
                        {new Date(order.createdAt).toLocaleString('es-HN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Customer Info */}
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {order.customer.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      📱 {order.customer.phone}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      📍 {order.customer.address}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ marginBottom: '12px' }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '14px',
                          color: '#111827',
                          padding: '8px 0',
                          borderBottom: idx < order.items.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}
                      >
                        {item.name} x{item.quantity}
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#3b82f6',
                    marginBottom: '16px'
                  }}>
                    Total: {getCurrencySymbol()} {getPriceForCurrency({ price: order.pricing.total }).toFixed(2)}
                  </div>

                  {/* Actions */}
                  {order.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="tap-effect ripple"
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle size={18} strokeWidth={2.5} />
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order.id)}
                        className="tap-effect"
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <XCircle size={18} strokeWidth={2.5} />
                        Rechazar
                      </button>
                    </div>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => changeOrderStatus(order.id, 'preparing')}
                      className="btn-primary ripple"
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Clock size={18} strokeWidth={2.5} />
                      Marcar en Preparación
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => changeOrderStatus(order.id, 'ready')}
                      className="btn-primary ripple"
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle size={18} strokeWidth={2.5} />
                      Marcar como Listo
                    </button>
                  )}
                  
                  {/* Botón cancelar - disponible en cualquier momento */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => changeOrderStatus(order.id, 'cancelled')}
                      className="tap-effect"
                      style={{
                        width: '100%',
                        padding: '10px',
                        marginTop: '8px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ❌ Cancelar Orden
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BusinessPage

