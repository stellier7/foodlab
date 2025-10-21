import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { Store, Lock, AlertCircle } from 'lucide-react'

const BusinessLoginPage = () => {
  const navigate = useNavigate()
  const { businessLogin } = useAuthStore()
  const [businessId, setBusinessId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const businesses = [
    { id: 'sportsshop', name: 'Shop' },
    { id: 'foodlab-tgu', name: 'FoodLab TGU' },
    { id: 'foodlab-sps', name: 'FoodLab SPS' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = businessLogin(businessId, password)
      
      if (success) {
        navigate(`/business/${businessId}`)
      } else {
        setError('Credenciales incorrectas')
      }
    } catch (err) {
      setError('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="slide-in-bottom" style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
          }}>
            <Store size={40} style={{ color: 'white' }} strokeWidth={2} />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            Panel de Comercio
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Gestiona las órdenes de tu negocio
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Business Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Comercio:
            </label>
            <select
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="">Selecciona tu comercio</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Contraseña:
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="fade-in" style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} style={{ color: '#dc2626' }} />
              <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
                {error}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary ripple"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Back to Admin */}
        <button
          onClick={() => navigate('/admin/login')}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            border: 'none',
            background: 'transparent',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => (e.target.style.color = '#111827')}
          onMouseLeave={(e) => (e.target.style.color = '#6b7280')}
        >
          ¿Eres admin? Inicia sesión aquí
        </button>
      </div>
    </div>
  )
}

export default BusinessLoginPage

