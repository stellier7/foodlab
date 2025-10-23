import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Package, User, Calendar } from 'lucide-react'

const PendingProductCard = ({ 
  product, 
  onApprove, 
  onReject 
}) => {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await onApprove(product.id, product.name, product.businessId)
    } catch (error) {
      console.error('Error approving product:', error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    
    setIsRejecting(true)
    try {
      await onReject(product.id, product.name, product.businessId, rejectReason)
      setShowRejectModal(false)
      setRejectReason('')
    } catch (error) {
      console.error('Error rejecting product:', error)
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        position: 'relative'
      }}>
        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
          background: '#fef3c7',
          color: '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Clock size={14} strokeWidth={2} />
          Pendiente
        </div>

        {/* Product Image */}
        <div style={{
          width: '100%',
          height: '160px',
          borderRadius: '12px',
          background: '#f8fafc',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Package size={48} style={{ color: '#d1d5db' }} />
          )}
        </div>

        {/* Product Info */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px',
            lineHeight: '1.3'
          }}>
            {product.name}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px',
            lineHeight: '1.4'
          }}>
            {product.description}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1e293b'
            }}>
              L {product.price.toFixed(2)}
            </span>
            <span style={{
              fontSize: '12px',
              color: '#64748b',
              background: '#f1f5f9',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {product.category}
            </span>
          </div>

          {/* Business Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px',
            padding: '8px',
            background: '#f8fafc',
            borderRadius: '6px'
          }}>
            <User size={14} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Negocio: {product.businessId}
            </span>
          </div>

          {/* Created Date */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px',
            background: '#f8fafc',
            borderRadius: '6px'
          }}>
            <Calendar size={14} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Creado: {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: '#10b981',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isApproving ? 'not-allowed' : 'pointer',
              opacity: isApproving ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            <CheckCircle size={16} strokeWidth={2} />
            {isApproving ? 'Aprobando...' : 'Aprobar'}
          </button>
          
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isRejecting}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isRejecting ? 'not-allowed' : 'pointer',
              opacity: isRejecting ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            <XCircle size={16} strokeWidth={2} />
            Rechazar
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Rechazar Producto
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              marginBottom: '16px'
            }}>
              ¿Por qué rechazas este producto?
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Imagen de baja calidad, descripción incompleta, precio incorrecto..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isRejecting}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: !rejectReason.trim() || isRejecting ? 'not-allowed' : 'pointer',
                  opacity: !rejectReason.trim() || isRejecting ? 0.6 : 1
                }}
              >
                {isRejecting ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PendingProductCard
