import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useOrdersStore } from '../../stores/useOrdersStore'
import { useAppStore } from '../../stores/useAppStore'
import StatusBadge from '../../components/admin/StatusBadge'
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  RefreshCw,
  AlertCircle,
  Package
} from 'lucide-react'

const ComercioOrdersPage = () => {
  const { user } = useAuthStore()
  const { getOrdersByBusiness, changeOrderStatus } = useOrdersStore()
  const { getPriceForCurrency, getCurrencySymbol } = useAppStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Obtener órdenes del negocio
  const businessOrders = getOrdersByBusiness(user?.businessId || '')
  
  // Filtrar órdenes
  const filteredOrders = businessOrders.filter(order => {
    const matchesSearch = order.orderNumber.toString().includes(searchTerm) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.phone.includes(searchTerm)
    
    const matchesFilter = selectedFilter === 'all' || order.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  // Calcular estadísticas
  const stats = {
    total: businessOrders.length,
    pending: businessOrders.filter(o => o.status === 'pending').length,
    confirmed: businessOrders.filter(o => o.status === 'confirmed').length,
    preparing: businessOrders.filter(o => o.status === 'preparing').length,
    ready: businessOrders.filter(o => o.status === 'ready').length,
    completed: businessOrders.filter(o => o.status === 'delivered').length
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setIsLoading(true)
    try {
      await changeOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error('Error changing order status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusActions = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleStatusChange(order.id, 'confirmed')}
              disabled={isLoading}
              className="btn-primary ripple"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <CheckCircle size={18} strokeWidth={2} />
              Aceptar
            </button>
            <button
              onClick={() => handleStatusChange(order.id, 'cancelled')}
              disabled={isLoading}
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
                gap: '6px',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <XCircle size={18} strokeWidth={2} />
              Rechazar
            </button>
          </div>
        )
      case 'confirmed':
        return (
          <button
            onClick={() => handleStatusChange(order.id, 'preparing')}
            disabled={isLoading}
            className="btn-primary ripple"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            <Clock size={18} strokeWidth={2} />
            Marcar en Preparación
          </button>
        )
      case 'preparing':
        return (
          <button
            onClick={() => handleStatusChange(order.id, 'ready')}
            disabled={isLoading}
            className="btn-primary ripple"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            <CheckCircle size={18} strokeWidth={2} />
            Marcar como Listo
          </button>
        )
      case 'ready':
        return (
          <div style={{
            padding: '12px',
            background: '#d1fae5',
            color: '#059669',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            ✅ Listo para entrega
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#1e293b',
          marginBottom: '4px'
        }}>
          Gestión de Pedidos
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Administra los pedidos de tu negocio
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { label: 'Total', value: stats.total, color: '#6b7280' },
          { label: 'Pendientes', value: stats.pending, color: '#f59e0b' },
          { label: 'Confirmados', value: stats.confirmed, color: '#3b82f6' },
          { label: 'En Preparación', value: stats.preparing, color: '#8b5cf6' },
          { label: 'Listos', value: stats.ready, color: '#10b981' },
          { label: 'Completados', value: stats.completed, color: '#059669' }
        ].map((stat, index) => (
          <div key={index} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '800',
              color: stat.color,
              marginBottom: '4px'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '600'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Buscar por número, cliente o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Filter Buttons */}
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className="tap-effect"
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: selectedFilter === filter ? '#3b82f6' : 'white',
              color: selectedFilter === filter ? 'white' : '#64748b',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Filter size={16} strokeWidth={2} />
            {filter === 'all' ? 'Todos' :
             filter === 'pending' ? 'Pendientes' :
             filter === 'confirmed' ? 'Confirmados' :
             filter === 'preparing' ? 'En Preparación' :
             filter === 'ready' ? 'Listos' :
             filter === 'delivered' ? 'Entregados' : 'Cancelados'}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card" style={{
          padding: '40px',
          textAlign: 'center',
          background: 'white'
        }}>
          <Package size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '16px' }}>
            {searchTerm || selectedFilter !== 'all' 
              ? 'No se encontraron pedidos con esos filtros'
              : 'No tienes pedidos aún'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedFilter('all')
              }}
              className="btn-primary"
              style={{ padding: '12px 24px' }}
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="card fade-in"
              style={{
                padding: '20px',
                background: 'white',
                border: '1px solid #e2e8f0'
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
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                    Orden #{order.orderNumber}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    {new Date(order.createdAt).toLocaleString('es-HN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
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
                background: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      👤 {order.customer.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      📱 {order.customer.phone}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      📍 Dirección
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {order.customer.address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Productos ({order.items.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#f9fafb',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <div style={{ color: '#1e293b', fontWeight: '500' }}>
                        {item.name} {item.selectedVariant && `(${item.selectedVariant})`}
                      </div>
                      <div style={{ color: '#64748b', fontWeight: '600' }}>
                        x{item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div style={{
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Subtotal:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                    {getCurrencySymbol()} {getPriceForCurrency({ price: order.pricing.subtotal }).toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Comisión FoodLab:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                    {getCurrencySymbol()} {getPriceForCurrency({ price: order.pricing.platformFee }).toFixed(2)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid #e0f2fe',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1e293b'
                }}>
                  <span>Total:</span>
                  <span>{getCurrencySymbol()} {getPriceForCurrency({ price: order.pricing.total }).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              {getStatusActions(order)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ComercioOrdersPage
