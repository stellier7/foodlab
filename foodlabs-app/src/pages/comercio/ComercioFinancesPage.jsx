import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useOrdersStore } from '../../stores/useOrdersStore'
import { useAppStore } from '../../stores/useAppStore'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

const ComercioFinancesPage = () => {
  const { user } = useAuthStore()
  const { getOrdersByBusiness } = useOrdersStore()
  const { getPriceForCurrency, getCurrencySymbol } = useAppStore()
  
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [isLoading, setIsLoading] = useState(false)

  // Obtener órdenes del negocio
  const businessOrders = getOrdersByBusiness(user?.businessId || '')
  
  // Filtrar órdenes por período
  const getFilteredOrders = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (selectedPeriod) {
      case 'today':
        return businessOrders.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= today
        })
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return businessOrders.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= weekAgo
        })
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        return businessOrders.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= monthAgo
        })
      default:
        return businessOrders
    }
  }

  const filteredOrders = getFilteredOrders()
  
  // Calcular estadísticas financieras
  const calculateStats = () => {
    const completedOrders = filteredOrders.filter(order => 
      order.status === 'delivered' || order.status === 'completed'
    )
    
    const totalSales = completedOrders.reduce((sum, order) => sum + order.pricing.total, 0)
    const totalCommissions = completedOrders.reduce((sum, order) => sum + order.pricing.platformFee, 0)
    const netEarnings = totalSales - totalCommissions
    
    return {
      totalSales,
      totalCommissions,
      netEarnings,
      orderCount: completedOrders.length,
      averageOrder: completedOrders.length > 0 ? totalSales / completedOrders.length : 0
    }
  }

  const stats = calculateStats()

  // Generar reporte CSV
  const generateCSV = () => {
    const headers = ['Fecha', 'Orden', 'Cliente', 'Total', 'Comisión', 'Ganancia Neta', 'Estado']
    const rows = filteredOrders.map(order => [
      new Date(order.createdAt).toLocaleDateString('es-HN'),
      order.orderNumber,
      order.customer.name,
      order.pricing.total.toFixed(2),
      order.pricing.platformFee.toFixed(2),
      (order.pricing.total - order.pricing.platformFee).toFixed(2),
      order.status
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-financiero-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const periodOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'all', label: 'Todo el Tiempo' }
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '4px'
          }}>
            Finanzas
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Gestiona tus ingresos y comisiones
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={generateCSV}
            className="tap-effect"
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              background: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#10b981'
              e.target.style.color = '#10b981'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.color = '#374151'
            }}
          >
            <Download size={16} strokeWidth={2} />
            Exportar CSV
          </button>
        </div>
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={24} style={{ color: 'white' }} strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                {getCurrencySymbol()} {getPriceForCurrency({ price: stats.totalSales }).toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                Ventas Totales
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
            {stats.orderCount} pedidos completados
          </div>
        </div>

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
              <TrendingUp size={24} style={{ color: 'white' }} strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                {getCurrencySymbol()} {getPriceForCurrency({ price: stats.netEarnings }).toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                Ganancias Netas
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
            Después de comisiones
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
              <TrendingDown size={24} style={{ color: 'white' }} strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                {getCurrencySymbol()} {getPriceForCurrency({ price: stats.totalCommissions }).toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                Comisiones Pagadas
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>
            {stats.totalSales > 0 ? ((stats.totalCommissions / stats.totalSales) * 100).toFixed(1) : 0}% del total
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
              <Calendar size={24} style={{ color: 'white' }} strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                {getCurrencySymbol()} {getPriceForCurrency({ price: stats.averageOrder }).toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                Promedio por Pedido
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: '600' }}>
            Ticket promedio
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '16px'
        }}>
          Transacciones Recientes
        </h2>

        {filteredOrders.length === 0 ? (
          <div className="card" style={{
            padding: '40px',
            textAlign: 'center',
            background: 'white'
          }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '16px' }}>
              No hay transacciones en el período seleccionado
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Los pedidos completados aparecerán aquí
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => {
                const isCompleted = order.status === 'delivered' || order.status === 'completed'
                const StatusIcon = isCompleted ? CheckCircle : Clock
                
                return (
                  <div
                    key={order.id}
                    className="card fade-in"
                    style={{
                      padding: '20px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      opacity: isCompleted ? 1 : 0.7
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: isCompleted ? '#d1fae5' : '#fef3c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <StatusIcon size={20} style={{ 
                            color: isCompleted ? '#059669' : '#d97706' 
                          }} strokeWidth={2} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>
                            Orden #{order.orderNumber}
                          </h3>
                          <p style={{ fontSize: '13px', color: '#64748b' }}>
                            {order.customer.name} • {new Date(order.createdAt).toLocaleDateString('es-HN')}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>
                          {getCurrencySymbol()} {getPriceForCurrency({ price: order.pricing.total }).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Comisión: {getCurrencySymbol()} {getPriceForCurrency({ price: order.pricing.platformFee }).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '12px', color: isCompleted ? '#059669' : '#d97706', fontWeight: '600' }}>
                          {isCompleted ? 'Completado' : 'En proceso'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComercioFinancesPage
