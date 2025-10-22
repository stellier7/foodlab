import { useState } from 'react'
import { Edit, Trash2, Eye, EyeOff, Package, Utensils } from 'lucide-react'

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleActive 
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      setIsDeleting(true)
      try {
        await onDelete(product.id)
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Error al eliminar el producto')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const getBusinessIcon = () => {
    return product.businessType === 'shop' ? <Package size={16} /> : <Utensils size={16} />
  }

  const getBusinessColor = () => {
    return product.businessType === 'shop' ? '#3b82f6' : '#f97316'
  }

  const formatPrice = (price) => {
    return `L${price.toFixed(2)}`
  }

  const getStockText = () => {
    if (product.businessType === 'shop') {
      if (product.variants && product.variants.length > 0) {
        const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
        return `${totalStock} unidades`
      }
      return `${product.stock || 0} unidades`
    }
    return null
  }

  const getLabelsText = () => {
    if (product.businessType === 'restaurant' && product.labels && product.labels.length > 0) {
      return product.labels.join(', ')
    }
    return null
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      opacity: product.isActive ? 1 : 0.7
    }}
    className="hover:shadow-lg hover:border-gray-300"
    >
      {/* Header con imagen y acciones */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {/* Imagen del producto */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#f3f4f6'
        }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af'
            }}>
              <Package size={24} />
            </div>
          )}
        </div>

        {/* Info del producto */}
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
                {product.name}
              </h3>
              <p style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#f97316',
                margin: '0 0 8px 0'
              }}>
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
              <button
                onClick={() => onToggleActive(product.id, !product.isActive)}
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
                  color: product.isActive ? '#10b981' : '#6b7280'
                }}
                className="hover:bg-gray-50"
                title={product.isActive ? 'Desactivar' : 'Activar'}
              >
                {product.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              <button
                onClick={() => onEdit(product)}
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
          </div>
        </div>
      </div>

      {/* Detalles del producto */}
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
          {product.description}
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
        {/* Tipo de negocio */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '6px',
          backgroundColor: `${getBusinessColor()}15`,
          color: getBusinessColor(),
          fontWeight: '500'
        }}>
          {getBusinessIcon()}
          <span style={{ textTransform: 'capitalize' }}>
            {product.businessType === 'shop' ? 'Shop' : 'Restaurante'}
          </span>
        </div>

        {/* Negocio específico */}
        <div style={{
          padding: '4px 8px',
          borderRadius: '6px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          fontWeight: '500'
        }}>
          {product.businessId}
        </div>

        {/* Categoría */}
        <div style={{
          padding: '4px 8px',
          borderRadius: '6px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          fontWeight: '500'
        }}>
          {product.category}
        </div>

        {/* Stock (solo para shop) */}
        {getStockText() && (
          <div style={{
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            fontWeight: '500'
          }}>
            {getStockText()}
          </div>
        )}

        {/* Etiquetas dietarias (solo para restaurantes) */}
        {getLabelsText() && (
          <div style={{
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            fontWeight: '500'
          }}>
            {getLabelsText()}
          </div>
        )}
      </div>

      {/* Variantes (si las hay) */}
      {product.variants && product.variants.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 8px 0'
          }}>
            Variantes:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {product.variants.map((variant, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  color: '#374151'
                }}
              >
                {variant.name} ({variant.stock || 0})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductCard
