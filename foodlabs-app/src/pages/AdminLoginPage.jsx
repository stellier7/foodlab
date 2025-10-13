import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader } from 'lucide-react'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, checkAuth, resetLoginAttempts } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)

  // Verificar si ya está autenticado
  useEffect(() => {
    if (checkAuth()) {
      navigate('/admin')
    }
  }, [checkAuth, navigate])

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
      if (err.message.includes('bloqueada')) {
        setIsBlocked(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (role) => {
    setFormData({
      email: role === 'admin' ? 'admin@foodlabs.com' : 'operator@foodlabs.com',
      password: role === 'admin' ? 'admin123' : 'operator123'
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#1f2937',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              boxShadow: '0 8px 24px rgba(31, 41, 55, 0.3)'
            }}>
              <span style={{ fontSize: '32px' }}>🏢</span>
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#111827',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px'
            }}>
              FoodLabs Admin
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>
              Panel de Administración
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="fade-in" style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={20} style={{ color: '#dc2626' }} />
              <span style={{ color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>
                {error}
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@foodlabs.com"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.backgroundColor = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.backgroundColor = '#f9fafb'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.backgroundColor = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.backgroundColor = '#f9fafb'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="btn-primary ripple"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading || !formData.email || !formData.password ? 0.6 : 1,
                cursor: isLoading || !formData.email || !formData.password ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Demo Buttons */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0 0 16px 0'
            }}>
              Acceso rápido:
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="tap-effect"
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#1f2937',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                👨‍💼 Admin
              </button>
              <button
                onClick={() => handleDemoLogin('operator')}
                disabled={isLoading}
                className="tap-effect"
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                👷 Operador
              </button>
            </div>
          </div>

          {/* Blocked Message */}
          {isBlocked && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#dc2626',
                margin: '0 0 12px 0'
              }}>
                Cuenta temporalmente bloqueada por múltiples intentos fallidos.
              </p>
              <button
                onClick={resetLoginAttempts}
                className="tap-effect"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Desbloquear
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: 0
            }}>
              © 2024 FoodLabs. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage

