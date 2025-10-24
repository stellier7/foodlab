import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { getComercioWithProducts } from '../../services/comercios'
import { createProduct, updateProduct, deleteProduct, approveProduct, rejectProduct } from '../../services/products'
import ProductModal from '../../components/admin/ProductModal'
import DietaryLabels from '../../components/DietaryLabels'
import { DIETARY_LABELS } from '../../config/labels'
import { 
  Search, 
  Plus, 
  Filter, 
  Package, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye,
  ArrowLeft,
  Store,
  Utensils
} from 'lucide-react'

const AdminComercioProductsPage = () => {
  const { id: comercioId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, userRole } = useAuthStore()
  
  const [comercio, setComercio] = useState(null)
  const [productos, setProductos] = useState([])
  const [filteredProductos, setFilteredProductos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterLabels, setFilterLabels] = useState([])
  const [filterPais, setFilterPais] = useState('all')
  const [filterCiudad, setFilterCiudad] = useState('all')

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin_national' || user?.role === 'admin_regional'

  useEffect(() => {
    console.log('🔍 AdminComercioProductsPage - Verificando permisos...')
    console.log('👤 Usuario:', user)
    console.log('🎭 userRole:', userRole)
    console.log('🎭 user.role:', user?.role)
    console.log('✅ isAuthenticated:', isAuthenticated)
    console.log('🔑 isAdmin:', isAdmin)
    
    if (isAuthenticated && isAdmin) {
      console.log('✅ AdminComercioProductsPage - Permisos correctos, cargando comercio...')
      fetchComercioData()
    } else if (isAuthenticated && !isAdmin) {
      console.log('❌ AdminComercioProductsPage - Usuario autenticado pero sin permisos de admin')
      setError('No tienes permisos para acceder a esta página.')
      setIsLoading(false)
    } else {
      console.log('❌ AdminComercioProductsPage - Usuario no autenticado')
      setError('Por favor, inicia sesión como administrador.')
      setIsLoading(false)
    }
  }, [isAuthenticated, isAdmin, userRole, comercioId])

  useEffect(() => {
    if (productos.length > 0) {
      applyFilters()
    }
  }, [productos, searchTerm, filterStatus, filterLabels, filterPais, filterCiudad])

  const fetchComercioData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const comercioData = await getComercioWithProducts(comercioId)
      if (comercioData) {
        setComercio(comercioData)
        setProductos(comercioData.productos || [])
      } else {
        setError('Comercio no encontrado')
      }
    } catch (error) {
      console.error('Error fetching comercio data:', error)
      setError('Error al cargar los datos del comercio')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...productos]

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(producto => 
        producto.nombre.toLowerCase().includes(term) ||
        producto.descripcion.toLowerCase().includes(term)
      )
    }

    // Filtro por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(producto => producto.status === filterStatus)
    }

    // Filtro por labels dietéticas
    if (filterLabels.length > 0) {
      filtered = filtered.filter(producto => 
        producto.etiquetasDietarias && 
        filterLabels.some(label => producto.etiquetasDietarias.includes(label))
      )
    }

    // Filtro por país
    if (filterPais !== 'all' && comercio) {
      filtered = filtered.filter(producto => 
        comercio.direccion.pais === filterPais
      )
    }

    // Filtro por ciudad
    if (filterCiudad !== 'all' && comercio) {
      filtered = filtered.filter(producto => 
        comercio.direccion.ciudad === filterCiudad
      )
    }

    setFilteredProductos(filtered)
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (producto) => {
    setEditingProduct(producto)
    setIsModalOpen(true)
  }

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await createProduct({
          ...productData,
          comercioId: comercioId
        })
      }
      await fetchComercioData()
      setIsModalOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Error saving product:', error)
      throw error
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProduct(productId)
        await fetchComercioData()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Error al eliminar el producto')
      }
    }
  }

  const handleApproveProduct = async (productId) => {
    try {
      await approveProduct(productId)
      await fetchComercioData()
    } catch (error) {
      console.error('Error approving product:', error)
      alert('Error al aprobar el producto')
    }
  }

  const handleRejectProduct = async (productId) => {
    const reason = prompt('Ingresa la razón del rechazo:')
    if (reason) {
      try {
        await rejectProduct(productId, reason)
        await fetchComercioData()
      } catch (error) {
        console.error('Error rejecting product:', error)
        alert('Error al rechazar el producto')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprobado': return '#10b981'
      case 'pendiente': return '#f59e0b'
      case 'rechazado': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'aprobado': return 'Aprobado'
      case 'pendiente': return 'Pendiente'
      case 'rechazado': return 'Rechazado'
      default: return 'Desconocido'
    }
  }

  const getTipoIcon = () => {
    return comercio?.tipo === 'tienda' ? <Store size={20} /> : <Utensils size={20} />
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
        <p style={{ color: '#6b7280' }}>Cargando productos...</p>
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

  if (!comercio) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <p>Comercio no encontrado.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <button
            onClick={() => navigate('/admin/comercios')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {getTipoIcon()} Productos de {comercio.nombre}
          </h1>
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Gestiona los productos de este comercio
        </p>
      </div>

      {/* Información del comercio */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            overflow: 'hidden',
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
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {comercio.nombre}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>
              {comercio.direccion.ciudad}, {comercio.direccion.pais}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: comercio.estado === 'activo' ? '#10b98115' : '#f59e0b15',
                color: comercio.estado === 'activo' ? '#10b981' : '#f59e0b',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {comercio.estado}
              </span>
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {productos.length} productos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Filter size={16} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
            Filtros
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Búsqueda */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Buscar
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af' 
              }} />
              <input
                type="text"
                placeholder="Nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos</option>
              <option value="aprobado">Aprobados</option>
              <option value="pendiente">Pendientes</option>
              <option value="rechazado">Rechazados</option>
            </select>
          </div>

          {/* País */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              País
            </label>
            <select
              value={filterPais}
              onChange={(e) => setFilterPais(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos</option>
              <option value={comercio.direccion.pais}>{comercio.direccion.pais}</option>
            </select>
          </div>

          {/* Ciudad */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Ciudad
            </label>
            <select
              value={filterCiudad}
              onChange={(e) => setFilterCiudad(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todas</option>
              <option value={comercio.direccion.ciudad}>{comercio.direccion.ciudad}</option>
            </select>
          </div>
        </div>

        {/* Labels dietéticas */}
        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
            Labels Dietéticas
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {DIETARY_LABELS.map((label) => (
              <label key={label.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filterLabels.includes(label.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilterLabels([...filterLabels, label.id])
                    } else {
                      setFilterLabels(filterLabels.filter(id => id !== label.id))
                    }
                  }}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: '13px', color: '#374151' }}>
                  {label.icon} {label.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Botón Agregar Producto */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={handleCreateProduct}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          <Plus size={16} />
          Agregar Producto
        </button>
      </div>

      {/* Lista de productos */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        {filteredProductos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', margin: 0 }}>
              {productos.length === 0 ? 'No hay productos en este comercio' : 'No se encontraron productos con los filtros aplicados'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredProductos.map((producto) => (
              <div
                key={producto.id}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Imagen del producto */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {producto.imagenes && producto.imagenes.length > 0 ? (
                      <img
                        src={producto.imagenes[0]}
                        alt={producto.nombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <Package size={24} style={{ color: '#9ca3af' }} />
                    )}
                  </div>

                  {/* Información del producto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>
                          {producto.nombre}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 8px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {producto.descripcion}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827'
                          }}>
                            ${producto.precio} {producto.moneda}
                          </span>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: `${getStatusColor(producto.status)}15`,
                            color: getStatusColor(producto.status),
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {getStatusText(producto.status)}
                          </span>
                        </div>
                        {producto.etiquetasDietarias && producto.etiquetasDietarias.length > 0 && (
                          <DietaryLabels labels={producto.etiquetasDietarias} size="small" />
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                        {producto.status === 'pendiente' && (
                          <>
                            <button
                              onClick={() => handleApproveProduct(producto.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 8px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              <CheckCircle size={14} />
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRejectProduct(producto.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 8px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              <XCircle size={14} />
                              Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEditProduct(producto)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 8px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit size={14} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(producto.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de producto */}
      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(null)
          }}
          onSave={handleSaveProduct}
          product={editingProduct}
          comercioId={comercioId}
        />
      )}
    </div>
  )
}

export default AdminComercioProductsPage
