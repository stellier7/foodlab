import { useState, useEffect } from 'react'
import { db } from '../../config/firebase'
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { Bell, Check, X, Package, DollarSign, Image, Edit, AlertCircle } from 'lucide-react'

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setNotifications(notificationsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleApprove = async (notificationId, productId) => {
    try {
      // Actualizar notificación
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'approved',
        approvedAt: new Date().toISOString()
      })

      // Aprobar producto
      await updateDoc(doc(db, 'products', productId), {
        status: 'aprobado',
        isPublished: true,
        updatedAt: new Date().toISOString()
      })

      alert('Cambios aprobados exitosamente')
    } catch (error) {
      console.error('Error approving changes:', error)
      alert('Error al aprobar cambios')
    }
  }

  const handleReject = async (notificationId, productId) => {
    try {
      // Actualizar notificación
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      })

      // Rechazar producto (mantener estado anterior)
      await updateDoc(doc(db, 'products', productId), {
        status: 'rechazado',
        isPublished: false,
        updatedAt: new Date().toISOString()
      })

      alert('Cambios rechazados')
    } catch (error) {
      console.error('Error rejecting changes:', error)
      alert('Error al rechazar cambios')
    }
  }

  const getChangeIcon = (change) => {
    if (change.includes('Precio')) return <DollarSign size={16} className="text-green-600" />
    if (change.includes('Imágenes')) return <Image size={16} className="text-blue-600" />
    if (change.includes('Nombre') || change.includes('Descripción')) return <Edit size={16} className="text-purple-600" />
    if (change.includes('Stock')) return <Package size={16} className="text-orange-600" />
    return <AlertCircle size={16} className="text-gray-600" />
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'approved': return 'Aprobado'
      case 'rejected': return 'Rechazado'
      default: return 'Desconocido'
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#6b7280' }}>Cargando notificaciones...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <Bell size={24} style={{ color: '#3b82f6' }} />
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#111827',
          margin: 0
        }}>
          Notificaciones de Cambios
        </h2>
        <span style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {notifications.filter(n => n.status === 'pending').length}
        </span>
      </div>

      {notifications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 20px',
          color: '#6b7280'
        }}>
          <Bell size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>
            No hay notificaciones pendientes
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#111827',
                    margin: '0 0 4px 0'
                  }}>
                    {notification.productName}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {new Date(notification.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: '1px solid',
                  ...getStatusColor(notification.status)
                }}>
                  {getStatusText(notification.status)}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  margin: '0 0 8px 0'
                }}>
                  Cambios realizados:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {notification.changes.map((change, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      {getChangeIcon(change)}
                      <span style={{ fontSize: '13px', color: '#374151' }}>
                        {change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {notification.status === 'pending' && (
                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    onClick={() => handleApprove(notification.id, notification.productId)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Check size={16} />
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(notification.id, notification.productId)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <X size={16} />
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPanel
