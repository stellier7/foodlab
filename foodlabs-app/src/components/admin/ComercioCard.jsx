import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, MapPin, Phone, Mail, Clock, Store, Utensils, Package } from 'lucide-react'

const ComercioCard = ({ 
  comercio, 
  onEdit, 
  onDelete,
  onToggleActive 
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de eliminar "${comercio.nombre}"?`)) {
      setIsDeleting(true)
      try {
        await onDelete(comercio.id)
      } catch (error) {
        console.error('Error deleting comercio:', error)
        alert('Error al eliminar el comercio')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const getTipoIcon = () => {
    return comercio.tipo === 'tienda' ? <Store size={16} /> : <Utensils size={16} />
  }

  const getTipoColor = () => {
    return comercio.tipo === 'tienda' ? '#3b82f6' : '#f97316'
  }

  const getEstadoColor = () => {
    switch (comercio.estado) {
      case 'activo': return '#10b981'
      case 'pendiente': return '#f59e0b'
      case 'inactivo': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getEstadoText = () => {
    switch (comercio.estado) {
      case 'activo': return 'Activo'
      case 'pendiente': return 'Pendiente'
      case 'inactivo': return 'Inactivo'
      default: return 'Desconocido'
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      opacity: comercio.estado === 'activo' ? 1 : 0.7
    }}
    className="hover:shadow-lg hover:border-gray-300"
    >
      {/* Header con logo y acciones */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {/* Logo del comercio */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {comercio.configuracion?.logo ? (
            <img
              src={comercio.configuracion.logo}
              alt={comercio.nombre}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{ color: '#9ca3af' }}>
              {getTipoIcon()}
            </div>
          )}
        </div>

        {/* Info del comercio */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 4px 0',
                lineHeight: '1.3'
              }}>
                {comercio.nombre}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 8px 0'
              }}>
                {comercio.categoria}
              </p>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: '12px' }}>
              {/* Botones Editar y Borrar */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onEdit(comercio)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: '#3b82f6'
                  }}
                  className="hover:bg-blue-50"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    color: isDeleting ? '#9ca3af' : '#ef4444',
                    opacity: isDeleting ? 0.6 : 1
                  }}
                  className="hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Switch de activación */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: comercio.estado === 'activo' ? '#10b981' : '#6b7280',
                  minWidth: '50px',
                  textAlign: comercio.estado === 'activo' ? 'left' : 'right'
                }}>
                  {comercio.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={() => onToggleActive(comercio)}
                  style={{
                    width: '48px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: comercio.estado === 'activo' ? '#10b981' : '#d1d5db',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  className="hover:opacity-80"
                  title={comercio.estado === 'activo' ? 'Desactivar' : 'Activar'}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: comercio.estado === 'activo' ? '26px' : '2px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles del comercio */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 8px 0',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {comercio.configuracion?.descripcion || 'Sin descripción'}
        </p>
      </div>

      {/* Info adicional */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        fontSize: '13px'
      }}>
        {/* Tipo de comercio */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '6px',
          backgroundColor: `${getTipoColor()}15`,
          color: getTipoColor(),
          fontWeight: '500'
        }}>
          {getTipoIcon()}
          <span style={{ textTransform: 'capitalize' }}>
            {comercio.tipo}
          </span>
        </div>

        {/* Estado */}
        <div style={{
          padding: '4px 8px',
          borderRadius: '6px',
          backgroundColor: `${getEstadoColor()}15`,
          color: getEstadoColor(),
          fontWeight: '500'
        }}>
          {getEstadoText()}
        </div>

        {/* Tier */}
        <div style={{
          padding: '4px 8px',
          borderRadius: '6px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          fontWeight: '500'
        }}>
          {comercio.tier}
        </div>
      </div>

      {/* Información de contacto */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <MapPin size={14} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: '13px', color: '#374151' }}>
            {comercio.direccion.calle}, {comercio.direccion.ciudad}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Phone size={14} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: '13px', color: '#374151' }}>
            {comercio.contacto.telefono}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={14} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: '13px', color: '#374151' }}>
            {comercio.contacto.email}
          </span>
        </div>
      </div>

      {/* Horarios */}
      {comercio.horarios && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={14} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Horarios
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            <div>Lun-Vie: {comercio.horarios.lunes.abierto} - {comercio.horarios.lunes.cerrado}</div>
            <div>Sáb: {comercio.horarios.sabado.abierto} - {comercio.horarios.sabado.cerrado}</div>
            <div>Dom: {comercio.horarios.domingo.abierto} - {comercio.horarios.domingo.cerrado}</div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => navigate(`/admin/comercios/${comercio.id}/productos`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          <Package size={14} />
          Ver Productos
        </button>
        
        {onEdit && (
          <button
            onClick={() => onEdit(comercio)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
          >
            <Edit size={14} />
            Editar
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: isDeleting ? '#9ca3af' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => !isDeleting && (e.target.style.backgroundColor = '#dc2626')}
            onMouseOut={(e) => !isDeleting && (e.target.style.backgroundColor = '#ef4444')}
          >
            <Trash2 size={14} />
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        )}
      </div>
    </div>
  )
}

export default ComercioCard
