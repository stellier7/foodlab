import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { getProducts, createProduct, updateProduct, deleteProduct, getPendingProducts, approveProduct, rejectProduct } from '../../services/products'
import { notifyProductApproved, notifyProductRejected } from '../../services/notifications'
import ProductCard from '../../components/admin/ProductCard'
import PendingProductCard from '../../components/admin/PendingProductCard'
import ProductModal from '../../components/admin/ProductModal'
import { Search, Plus, Filter, Package, Utensils, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react'

const AdminProductsPage = () => {
  const { user, isAuthenticated, userRole } = useAuthStore()
  const [products, setProducts] = useState([])
  const [pendingProducts, setPendingProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'shop', 'restaurant', 'pending'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    shop: 0,
    restaurant: 0,
    active: 0,
    pending: 0
  })

  const isAdmin = userRole === 'admin_national' || userRole === 'super_admin'

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProducts()
    } else if (isAuthenticated && !isAdmin) {
      setError('No tienes permisos para acceder a esta página.')
      setIsLoading(false)
    } else {
      setError('Por favor, inicia sesión como administrador.')
      setIsLoading(false)
    }
  }, [isAuthenticated, isAdmin, userRole])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, filterType])

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [allProducts, pending] = await Promise.all([
        getProducts(),
        getPendingProducts()
      ])
      setProducts(allProducts)
      setPendingProducts(pending)
      
      // Calcular estadísticas
      const newStats = {
        total: allProducts.length,
        shop: allProducts.filter(p => p.businessType === 'shop').length,
        restaurant: allProducts.filter(p => p.businessType === 'restaurant').length,
        active: allProducts.filter(p => p.isActive).length,
        pending: pending.length
      }
      setStats(newStats)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Error al cargar los productos.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = filterType === 'pending' ? pendingProducts : products

    // Filtrar por tipo
    if (filterType !== 'all' && filterType !== 'pending') {
      // TODO: Filtrar por tipo de comercio cuando tengamos esa información
      // filtered = filtered.filter(product => product.comercioType === filterType)
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(term) ||
        product.descripcion.toLowerCase().includes(term) ||
        product.categoria.toLowerCase().includes(term) ||
        product.comercioId.toLowerCase().includes(term)
      )
    }

    setFilteredProducts(filtered)
  }

  const handleCreateProduct = async (productData) => {
    try {
      const productId = await createProduct(productData)
      await fetchProducts() // Refresh list
      return productId
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  const handleUpdateProduct = async (productData) => {
    try {
      await updateProduct(editingProduct.id, productData)
      await fetchProducts() // Refresh list
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId)
      await fetchProducts() // Refresh list
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  const handleToggleActive = async (productId, isActive) => {
    try {
      await updateProduct(productId, { isActive })
      await fetchProducts() // Refresh list
    } catch (error) {
      console.error('Error toggling product status:', error)
      throw error
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleSaveProduct = async (productData) => {
    if (editingProduct) {
      await handleUpdateProduct({ ...productData, id: editingProduct.id })
    } else {
      await handleCreateProduct(productData)
    }
  }

  const handleApproveProduct = async (productId, productName, businessId) => {
    try {
      await approveProduct(productId, user.uid)
      await notifyProductApproved(businessId, productId, productName)
      await fetchProducts() // Refresh list
    } catch (error) {
      console.error('Error approving product:', error)
      throw error
    }
  }

  const handleRejectProduct = async (productId, productName, businessId, reason) => {
    try {
      await rejectProduct(productId, user.uid, reason)
      await notifyProductRejected(businessId, productId, productName, reason)
      await fetchProducts() // Refresh list
    } catch (error) {
      console.error('Error rejecting product:', error)
      throw error
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
        <p style={{ color: '#6b7280' }}>Cargando productos...</p>
        <style jsx>{`
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
          🏪 Gestión de Productos
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Administra todos los productos de la plataforma
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
            <Package size={20} color="#3b82f6" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Shop</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {stats.shop}
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
            {stats.restaurant}
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
            {stats.active}
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
            {stats.pending}
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
              placeholder="Buscar productos..."
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
              onClick={() => setFilterType('all')}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${filterType === 'all' ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: filterType === 'all' ? '#eff6ff' : 'white',
                color: filterType === 'all' ? '#3b82f6' : '#374151',
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
              onClick={() => setFilterType('shop')}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${filterType === 'shop' ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: filterType === 'shop' ? '#eff6ff' : 'white',
                color: filterType === 'shop' ? '#3b82f6' : '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Package size={16} />
              Shop
            </button>
            <button
              onClick={() => setFilterType('restaurant')}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${filterType === 'restaurant' ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: filterType === 'restaurant' ? '#eff6ff' : 'white',
                color: filterType === 'restaurant' ? '#3b82f6' : '#374151',
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
              onClick={() => setFilterType('pending')}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${filterType === 'pending' ? '#3b82f6' : '#d1d5db'}`,
                backgroundColor: filterType === 'pending' ? '#eff6ff' : 'white',
                color: filterType === 'pending' ? '#3b82f6' : '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                position: 'relative'
              }}
            >
              <Clock size={16} />
              Pendientes
              {stats.pending > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '10px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stats.pending}
                </span>
              )}
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
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div>
        {filteredProducts.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <Package size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              {searchTerm || filterType !== 'all' ? 'No se encontraron productos' : 'No hay productos'}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              {searchTerm || filterType !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Comienza agregando tu primer producto'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
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
                Agregar Primer Producto
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '20px'
          }}>
            {filteredProducts.map(product => 
              filterType === 'pending' ? (
                <PendingProductCard
                  key={product.id}
                  product={product}
                  onApprove={handleApproveProduct}
                  onReject={handleRejectProduct}
                />
              ) : (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleActive={handleToggleActive}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        product={editingProduct}
        isLoading={false}
      />
    </div>
  )
}

export default AdminProductsPage
