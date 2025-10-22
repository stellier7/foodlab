import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { 
  Save, 
  Edit, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  AlertCircle,
  CheckCircle,
  Upload
} from 'lucide-react'

const ComercioProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    hours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '08:00', close: '22:00', closed: false }
    }
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        description: user.description || '',
        hours: user.hours || formData.hours
      })
    }
  }, [user])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateUser(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }))
  }

  const days = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
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
            Perfil del Comercio
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Gestiona la información de tu negocio
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '10px 20px',
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
                onClick={handleSave}
                disabled={isLoading}
                className="btn-primary"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                <Save size={16} strokeWidth={2} />
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="tap-effect"
              style={{
                padding: '10px 20px',
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
                e.target.style.borderColor = '#3b82f6'
                e.target.style.color = '#3b82f6'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.color = '#374151'
              }}
            >
              <Edit size={16} strokeWidth={2} />
              Editar
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Business Info */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={20} strokeWidth={2} />
            Información del Negocio
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Nombre del Comercio
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <p style={{ fontSize: '16px', color: '#1e293b', margin: 0, padding: '12px 0' }}>
                  {formData.name || 'No especificado'}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Descripción
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, padding: '12px 0' }}>
                  {formData.description || 'No especificado'}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Dirección
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, padding: '12px 0' }}>
                  {formData.address || 'No especificado'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Phone size={20} strokeWidth={2} />
            Información de Contacto
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <p style={{ fontSize: '16px', color: '#1e293b', margin: 0, padding: '12px 0' }}>
                  {formData.phone || 'No especificado'}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <p style={{ fontSize: '16px', color: '#1e293b', margin: 0, padding: '12px 0' }}>
                  {formData.email || 'No especificado'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Clock size={20} strokeWidth={2} />
          Horarios de Atención
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {days.map((day) => (
            <div
              key={day.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', minWidth: '80px' }}>
                {day.label}
              </div>
              
              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <input
                      type="checkbox"
                      checked={!formData.hours[day.key].closed}
                      onChange={(e) => handleHoursChange(day.key, 'closed', !e.target.checked)}
                    />
                    Abierto
                  </label>
                  
                  {!formData.hours[day.key].closed && (
                    <>
                      <input
                        type="time"
                        value={formData.hours[day.key].open}
                        onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                        style={{
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>a</span>
                      <input
                        type="time"
                        value={formData.hours[day.key].close}
                        onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                        style={{
                          padding: '6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  {formData.hours[day.key].closed ? (
                    <span style={{ color: '#dc2626', fontWeight: '600' }}>Cerrado</span>
                  ) : (
                    <span>
                      {formData.hours[day.key].open} - {formData.hours[day.key].close}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Business Status */}
      <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={20} strokeWidth={2} />
          Estado del Negocio
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#10b981'
          }} />
          <div>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Negocio Activo
            </p>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0 0' }}>
              Tu negocio está funcionando correctamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComercioProfilePage
