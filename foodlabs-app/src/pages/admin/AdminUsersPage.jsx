import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { createUserWithRole, checkPermission } from '../../services/auth'
import { Search, Plus, Filter, Users, Mail, Shield, Building2, Truck, User } from 'lucide-react'

const AdminUsersPage = () => {
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    role: 'customer',
    displayName: '',
    comercioId: '',
    region: '',
    country: 'honduras'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filtrar roles que puede crear según permisos
  const availableRoles = [
    checkPermission(user?.role, 'canCreateNationalAdmin') && { value: 'admin_national', label: 'Admin Nacional' },
    checkPermission(user?.role, 'canCreateRegionalAdmin') && { value: 'admin_regional', label: 'Admin Regional' },
    checkPermission(user?.role, 'canCreateBusiness') && { value: 'business', label: 'Comercio' },
    checkPermission(user?.role, 'canCreateDriver') && { value: 'driver', label: 'Driver' },
    { value: 'customer', label: 'Cliente' }
  ].filter(Boolean)

  const roleIcons = {
    super_admin: Shield,
    admin_national: Shield,
    admin_regional: Shield,
    business: Building2,
    driver: Truck,
    customer: User
  }

  const roleColors = {
    super_admin: { bg: '#fef3c7', text: '#d97706', icon: '#f59e0b' },
    admin_national: { bg: '#dbeafe', text: '#2563eb', icon: '#3b82f6' },
    admin_regional: { bg: '#e0e7ff', text: '#5b21b6', icon: '#6366f1' },
    business: { bg: '#d1fae5', text: '#059669', icon: '#10b981' },
    driver: { bg: '#fef3c7', text: '#d97706', icon: '#f59e0b' },
    customer: { bg: '#f3f4f6', text: '#6b7280', icon: '#9ca3af' }
  }

  useEffect(() => {
    // TODO: Implementar fetchUsers cuando tengamos la función
    setIsLoading(false)
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleCreateUser = async () => {
    if (!newUserData.email || !newUserData.password || !newUserData.displayName) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createUserWithRole(newUserData)
      if (result.success) {
        setUsers(prev => [...prev, result.user])
        setShowCreateModal(false)
        setNewUserData({
          email: '',
          password: '',
          role: 'customer',
          displayName: '',
          comercioId: '',
          region: '',
          country: 'honduras'
        })
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0 }}>
            Gestión de Usuarios
          </h1>
          {availableRoles.length > 1 && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}
            >
              <Plus size={16} />
              Crear Usuario
            </button>
          )}
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          Gestiona usuarios, roles y permisos del sistema
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
        
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            outline: 'none',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">Todos los roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin_national">Admin Nacional</option>
          <option value="admin_regional">Admin Regional</option>
          <option value="business">Comercio</option>
          <option value="driver">Driver</option>
          <option value="customer">Cliente</option>
        </select>
      </div>

      {/* Users List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Users size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '16px' }}>
              {searchTerm || filterRole !== 'all' 
                ? 'No se encontraron usuarios con esos filtros'
                : 'No hay usuarios registrados aún'
              }
            </p>
          </div>
        ) : (
          <div>
            {filteredUsers.map((user) => {
              const Icon = roleIcons[user.role] || User
              const colors = roleColors[user.role] || roleColors.customer
              
              return (
                <div
                  key={user.uid}
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={24} color={colors.icon} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 4px 0'
                    }}>
                      {user.displayName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} color="#9ca3af" />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {user.email}
                        </span>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: colors.bg,
                        color: colors.text,
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {availableRoles.find(r => r.value === user.role)?.label || user.role}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 24px 0'
            }}>
              Crear Nuevo Usuario
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={newUserData.displayName}
                  onChange={(e) => setNewUserData({...newUserData, displayName: e.target.value})}
                  placeholder="Juan Pérez"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  placeholder="usuario@foodlab.store"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Rol *
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {availableRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {newUserData.role === 'business' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    ID del Comercio
                  </label>
                  <input
                    type="text"
                    value={newUserData.comercioId}
                    onChange={(e) => setNewUserData({...newUserData, comercioId: e.target.value})}
                    placeholder="padelbuddy"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              )}

              {newUserData.role === 'admin_regional' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Región
                  </label>
                  <select
                    value={newUserData.region}
                    onChange={(e) => setNewUserData({...newUserData, region: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Seleccionar región</option>
                    <option value="TGU">Tegucigalpa</option>
                    <option value="SPS">San Pedro Sula</option>
                    <option value="GUA">Guatemala City</option>
                    <option value="ANT">Antigua</option>
                    <option value="SLV">San Salvador</option>
                    <option value="SMA">Santa Ana</option>
                  </select>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '20px',
                color: '#dc2626',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: isSubmitting ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmitting ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default AdminUsersPage
