import { useOrdersStore } from '../../stores/useOrdersStore'
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  TrendingUp, 
  Users, 
  Package,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

const StatCard = ({ title, value, icon, color, trend, subtitle, onClick }) => {
  const IconComponent = icon

  return (
    <div 
      className="card fade-in-scale tap-effect"
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
        border: `2px solid ${color}20`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${color}30`
          }}>
            <IconComponent size={24} style={{ color: 'white' }} />
          </div>
          
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: trend.value > 0 ? '#dcfce7' : trend.value < 0 ? '#fef2f2' : '#f3f4f6',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              color: trend.value > 0 ? '#16a34a' : trend.value < 0 ? '#dc2626' : '#6b7280'
            }}>
              <TrendingUp 
                size={12} 
                style={{ 
                  transform: trend.value < 0 ? 'rotate(180deg)' : 'none',
                  opacity: trend.value === 0 ? 0.5 : 1
                }} 
              />
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#111827',
            margin: '0 0 4px 0',
            letterSpacing: '-0.5px'
          }}>
            {value}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 8px 0',
            fontWeight: '500'
          }}>
            {title}
          </p>
          {subtitle && (
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: 0,
              fontWeight: '400'
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const StatsCards = ({ period = 'today', onCardClick }) => {
  const { stats, getPendingOrdersCount, getRecentOrders, getOrdersByStatus } = useOrdersStore()
  
  const currentStats = stats[period] || { sales: 0, orders: 0, commission: 0 }
  const pendingCount = getPendingOrdersCount()
  const deliveredToday = getOrdersByStatus('delivered').filter(order => {
    const today = new Date()
    const orderDate = new Date(order.createdAt)
    return orderDate.toDateString() === today.toDateString()
  }).length

  const cards = [
    {
      title: 'Ventas',
      value: `$${currentStats.sales.toFixed(2)}`,
      icon: DollarSign,
      color: '#10b981',
      trend: { value: 12.5 }, // Mock trend
      subtitle: `Comisión: $${currentStats.commission.toFixed(2)}`,
      onClick: () => onCardClick && onCardClick('sales')
    },
    {
      title: 'Pedidos',
      value: currentStats.orders.toString(),
      icon: ShoppingBag,
      color: '#3b82f6',
      trend: { value: 8.2 }, // Mock trend
      subtitle: `Entregados hoy: ${deliveredToday}`,
      onClick: () => onCardClick && onCardClick('orders')
    },
    {
      title: 'Pendientes',
      value: pendingCount.toString(),
      icon: Clock,
      color: pendingCount > 5 ? '#ef4444' : pendingCount > 2 ? '#f59e0b' : '#10b981',
      trend: null,
      subtitle: pendingCount === 0 ? '¡Todo al día!' : 'Requieren atención',
      onClick: () => onCardClick && onCardClick('pending')
    },
    {
      title: 'Clientes',
      value: '24', // Mock value
      icon: Users,
      color: '#8b5cf6',
      trend: { value: 15.3 }, // Mock trend
      subtitle: 'Nuevos esta semana',
      onClick: () => onCardClick && onCardClick('customers')
    }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    }}>
      {cards.map((card, index) => (
        <StatCard
          key={card.title}
          {...card}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}

// Componente para estadísticas rápidas en el header
export const QuickStats = () => {
  const { stats, getPendingOrdersCount } = useOrdersStore()
  const todayStats = stats.today
  const pendingCount = getPendingOrdersCount()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      padding: '12px 20px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(8px)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DollarSign size={16} style={{ color: '#10b981' }} />
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
          ${todayStats.sales.toFixed(2)}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShoppingBag size={16} style={{ color: '#3b82f6' }} />
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
          {todayStats.orders}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {pendingCount > 0 ? (
          <AlertCircle size={16} style={{ color: '#ef4444' }} />
        ) : (
          <CheckCircle size={16} style={{ color: '#10b981' }} />
        )}
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: pendingCount > 0 ? '#ef4444' : '#10b981'
        }}>
          {pendingCount}
        </span>
      </div>
    </div>
  )
}

// Componente para mostrar estadísticas de estado de pedidos
export const OrderStatusStats = () => {
  const { orders } = useOrdersStore()
  
  const statusCounts = {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0,
    problem: 0
  }

  orders.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
  })

  const statusIcons = {
    pending: AlertCircle,
    confirmed: Clock,
    preparing: Package,
    ready: CheckCircle,
    in_transit: Clock,
    delivered: CheckCircle,
    cancelled: XCircle,
    problem: AlertCircle
  }

  return (
    <div className="card fade-in-scale" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
      border: '2px solid rgba(59, 130, 246, 0.1)'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#111827',
        margin: '0 0 16px 0'
      }}>
        Estados de Pedidos
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px'
      }}>
        {Object.entries(statusCounts).map(([status, count]) => {
          const IconComponent = statusIcons[status]
          const colors = {
            pending: '#ef4444',
            confirmed: '#f59e0b',
            preparing: '#3b82f6',
            ready: '#8b5cf6',
            in_transit: '#06b6d4',
            delivered: '#10b981',
            cancelled: '#6b7280',
            problem: '#dc2626'
          }
          
          return (
            <div key={status} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: `${colors[status]}10`,
              borderRadius: '8px',
              border: `1px solid ${colors[status]}20`
            }}>
              <IconComponent size={16} style={{ color: colors[status] }} />
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors[status]
                }}>
                  {count}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  textTransform: 'capitalize',
                  fontWeight: '500'
                }}>
                  {status.replace('_', ' ')}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StatsCards

