import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { getComercios, deleteComercio, getEstadisticasComercios } from '../../services/comercios'
import ComercioCard from '../../components/admin/ComercioCard'
import ComercioModal from '../../components/admin/ComercioModal'
import { Search, Plus, Filter, Building2, Store, Utensils, BarChart3, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react'

const AdminComerciosPage = () => {
  const { user, isAuthenticated, userRole } = useAuthStore()
  const [comercios, setComercios] = useState([])
  const [filteredComercios, setFilteredComercios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('all') // 'all', 'restaurante', 'tienda'
  const [filterEstado, setFilterEstado] = useState('all') // 'all', 'activo', 'inactivo', 'pendiente'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingComercio, setEditingComercio] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    pendientes: 0,
    inactivos: 0,
    restaurantes: 0,
    tiendas: 0
  })

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin_national' || user?.role === 'admin_regional'

  useEffect(() => {
    console.log('🔍 AdminComerciosPage - Verificando permisos...')
    console.log('👤 Usuario:', user)
    console.log('🎭 userRole:', userRole)
    console.log('🎭 user.role:', user?.role)
    console.log('✅ isAuthenticated:', isAuthenticated)
    console.log('🔑 isAdmin:', isAdmin)
    
    if (isAuthenticated && isAdmin) {
      console.log('✅ AdminComerciosPage - Permisos correctos, cargando comercios...')
      fetchComercios()
    } else if (isAuthenticated && !isAdmin) {
      console.log('❌ AdminComerciosPage - Usuario autenticado pero sin permisos de admin')
      setError('No tienes permisos para acceder a esta página.')
      setIsLoading(false)
    } else {
      console.log('❌ AdminComerciosPage - Usuario no autenticado')
      setError('Por favor, inicia sesión como administrador.')
      setIsLoading(false)
    }
  }, [isAuthenticated, isAdmin, userRole])

  useEffect(() => {
    filterComercios()
  }, [comercios, searchTerm, filterTipo, filterEstado])

  const fetchComercios = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [comerciosData, statsData] = await Promise.all([
        getComercios(),
        getEstadisticasComercios()
      ])
      setComercios(comerciosData)
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching comercios:', err)
      setError('Error al cargar los comercios.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterComercios = () => {
    let filtered = comercios

    // Filtrar por tipo
    if (filterTipo !== 'all') {
      filtered = filtered.filter(comercio => comercio.tipo === filterTipo)
    }

    // Filtrar por estado
    if (filterEstado !== 'all') {
      filtered = filtered.filter(comercio => comercio.estado === filterEstado)
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(comercio =>
        comercio.nombre.toLowerCase().includes(term) ||
        comercio.categoria.toLowerCase().includes(term) ||
        comercio.direccion.ciudad.toLowerCase().includes(term)
      )
    }

    setFilteredComercios(filtered)
  }

  const handleCreateComercio = async (comercioData) => {
    try {
      console.log('🔍 handleCreateComercio - Iniciando creación de comercio...')
      
      // Importar el servicio de comercios
      const { createComercio } = await import('../../services/comercios')
      
      // Crear el comercio y obtener el ID
      const comercioId = await createComercio(comercioData)
      console.log('✅ handleCreateComercio - Comercio creado con ID:', comercioId)
      
      // Refresh list
      await fetchComercios()
      
      // Retornar el ID para que ComercioModal pueda usarlo
      console.log('🔄 handleCreateComercio - Retornando ID:', comercioId)
      return comercioId
    } catch (error) {
      console.error('❌ Error creating comercio:', error)
      throw error
    }
  }

  const handleUpdateComercio = async (comercioData) => {
    try {
      console.log('🔍 handleUpdateComercio - Iniciando actualización...', editingComercio?.id)
      
      // Importar el servicio de comercios
      const { updateComercio } = await import('../../services/comercios')
      
      // Actualizar el comercio con el ID del comercio en edición
      await updateComercio(editingComercio.id, comercioData)
      console.log('✅ handleUpdateComercio - Comercio actualizado:', editingComercio.id)
      
      // Refresh list
      await fetchComercios()
      
      // Retornar el ID del comercio editado para que ComercioModal pueda usarlo
      console.log('🔄 handleUpdateComercio - Retornando ID:', editingComercio.id)
      return editingComercio.id
    } catch (error) {
      console.error('❌ Error updating comercio:', error)
      throw error
    }
  }

  const handleDeleteComercio = async (comercioId) => {
    try {
      await deleteComercio(comercioId)
      await fetchComercios() // Refresh list
    } catch (error) {
      console.error('Error deleting comercio:', error)
      throw error
    }
  }

  const handleToggleActive = async (comercio) => {
    try {
      console.log('🔍 handleToggleActive - Iniciando...', comercio.id, comercio.estado)
      
      // Si intenta activar, validar que tenga ubicación
      if (comercio.estado !== 'activo' && (!comercio.location || !comercio.location.city)) {
        alert('⚠️ Este comercio no tiene ubicación configurada. Por favor edítalo y selecciona un país y ciudad antes de activarlo.')
        return
      }
      
      // Importar el servicio de comercios
      const { updateComercio } = await import('../../services/comercios')
      
      // Cambiar el estado
      const nuevoEstado = comercio.estado === 'activo' ? 'inactivo' : 'activo'
      
      // Actualizar el comercio
      await updateComercio(comercio.id, {
        ...comercio,
        estado: nuevoEstado
      })
      
      console.log('✅ handleToggleActive - Comercio actualizado:', comercio.id, 'nuevo estado:', nuevoEstado)
      
      // Refresh list
      await fetchComercios()
      
    } catch (error) {
      console.error('❌ Error toggling comercio:', error)
      alert('Error al cambiar el estado del comercio: ' + error.message)
    }
  }

  const handleEditComercio = (comercio) => {
    setEditingComercio(comercio)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingComercio(null)
  }

  const handleSaveComercio = async (comercioData) => {
    console.log('🔍 handleSaveComercio - Iniciando...', { editingComercio })
    if (editingComercio) {
      const result = await handleUpdateComercio(comercioData)
      console.log('🔄 handleSaveComercio - Resultado (update):', result)
      return result
    } else {
      const result = await handleCreateComercio(comercioData)
      console.log('🔄 handleSaveComercio - Resultado (create):', result)
      return result
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#6b7280' }}>Cargando comercios...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <p>{error}</p>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <p>Acceso denegado.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          🏢 Gestión de Comercios
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Administra todos los comercios de la plataforma
        </p>
      </div>

      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <BarChart3 size={20} color="#3b82f6" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Total</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {stats.total}
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Utensils size={20} color="#f97316" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Restaurantes</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {stats.restaurantes}
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Store size={20} color="#3b82f6" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tiendas</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {stats.tiendas}
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Activos</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {stats.activos}
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Clock size={20} color="#f59e0b" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Pendientes</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {stats.pendientes}
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Búsqueda */}
          <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Buscar comercios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFilterTipo('all')}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${filterTipo === 'all' ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: filterTipo === 'all' ? '#eff6ff' : 'white',
                color: filterTipo === 'all' ? '#3b82f6' : '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Filter size={16} />
              Todo
            </button>
            <button
              onClick={() => setFilterTipo('restaurante')}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${filterTipo === 'restaurante' ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: filterTipo === 'restaurante' ? '#eff6ff' : 'white',
                color: filterTipo === 'restaurante' ? '#3b82f6' : '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Utensils size={16} />
              Restaurantes
            </button>
            <button
              onClick={() => setFilterTipo('tienda')}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${filterTipo === 'tienda' ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: filterTipo === 'tienda' ? '#eff6ff' : 'white',
                color: filterTipo === 'tienda' ? '#3b82f6' : '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Store size={16} />
              Tiendas
            </button>
          </div>

          {/* Botón agregar */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="hover:bg-blue-700"
          >
            <Plus size={16} />
            Nuevo Comercio
          </button>
        </div>
      </div>

      {/* Lista de comercios */}
      <div>
        {filteredComercios.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <Building2 size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              {searchTerm || filterTipo !== 'all' || filterEstado !== 'all' ? 'No se encontraron comercios' : 'No hay comercios'}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              {searchTerm || filterTipo !== 'all' || filterEstado !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Comienza agregando tu primer comercio'
              }
            </p>
            {!searchTerm && filterTipo === 'all' && filterEstado === 'all' && (
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
                className="hover:bg-blue-700"
              >
                <Plus size={16} />
                Agregar Primer Comercio
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '20px'
          }}>
            {filteredComercios.map(comercio => (
              <ComercioCard
                key={comercio.id}
                comercio={comercio}
                onEdit={handleEditComercio}
                onDelete={handleDeleteComercio}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ComercioModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveComercio}
        comercio={editingComercio}
        isLoading={false}
      />
    </div>
  )
}

export default AdminComerciosPage
