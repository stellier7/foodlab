import { ORDER_STATUSES } from '../../stores/useOrdersStore'

const StatusBadge = ({ status, size = 'md', showIcon = true, onClick }) => {
  const statusConfig = ORDER_STATUSES[status]
  
  if (!statusConfig) {
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        border: '1px solid #e5e7eb'
      }}>
        {status}
      </span>
    )
  }

  const sizes = {
    sm: {
      padding: '2px 6px',
      fontSize: '10px',
      borderRadius: '4px',
      iconSize: 10
    },
    md: {
      padding: '4px 8px',
      fontSize: '12px',
      borderRadius: '6px',
      iconSize: 12
    },
    lg: {
      padding: '6px 12px',
      fontSize: '14px',
      borderRadius: '8px',
      iconSize: 14
    }
  }

  const currentSize = sizes[size]

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: '600',
    borderRadius: currentSize.borderRadius,
    backgroundColor: statusConfig.color,
    color: 'white',
    border: 'none',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    boxShadow: `0 2px 4px ${statusConfig.color}20`,
    textTransform: 'capitalize'
  }

  const handleClick = () => {
    if (onClick) {
      onClick(status)
    }
  }

  return (
    <span 
      style={badgeStyle}
      onClick={handleClick}
      className={onClick ? 'tap-effect' : ''}
    >
      {showIcon && (
        <span style={{ fontSize: currentSize.iconSize }}>
          {statusConfig.icon}
        </span>
      )}
      {statusConfig.label}
    </span>
  )
}

// Componente para mostrar múltiples estados en un resumen
export const StatusSummary = ({ orders, showCounts = true }) => {
  const statusCounts = {}
  
  orders.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
  })

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      alignItems: 'center'
    }}>
      {Object.entries(statusCounts).map(([status, count]) => (
        <div key={status} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <StatusBadge status={status} size="sm" />
          {showCounts && (
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280'
            }}>
              {count}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// Componente para selector de estado
export const StatusSelector = ({ value, onChange, disabled = false }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        border: '2px solid #e5e7eb',
        backgroundColor: 'white',
        fontSize: '14px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        outline: 'none',
        transition: 'all 0.2s ease'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#3b82f6'
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#e5e7eb'
      }}
    >
      <option value="">Seleccionar estado</option>
      {Object.entries(ORDER_STATUSES).map(([key, config]) => (
        <option key={key} value={key}>
          {config.icon} {config.label}
        </option>
      ))}
    </select>
  )
}

// Componente para mostrar el progreso de un pedido
export const OrderProgress = ({ order }) => {
  const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered']
  const currentIndex = statusOrder.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'
  const hasProblem = order.status === 'problem'

  if (isCancelled) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <span style={{ fontSize: '16px' }}>❌</span>
        <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
          Pedido Cancelado
        </span>
      </div>
    )
  }

  if (hasProblem) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #fde68a'
      }}>
        <span style={{ fontSize: '16px' }}>⚠️</span>
        <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '600' }}>
          Requiere Atención
        </span>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '8px 0'
    }}>
      {statusOrder.map((status, index) => {
        const statusConfig = ORDER_STATUSES[status]
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        
        return (
          <div key={status} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: isCompleted ? statusConfig.color : '#e5e7eb',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '600',
              border: isCurrent ? '2px solid white' : 'none',
              boxShadow: isCurrent ? `0 0 0 2px ${statusConfig.color}` : 'none',
              transition: 'all 0.2s ease'
            }}>
              {isCompleted ? statusConfig.icon : index + 1}
            </div>
            
            {/* Línea conectora */}
            {index < statusOrder.length - 1 && (
              <div style={{
                width: '20px',
                height: '2px',
                backgroundColor: isCompleted ? '#d1d5db' : '#e5e7eb',
                transition: 'all 0.2s ease'
              }}></div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StatusBadge

