import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAppStore } from '../../stores/useAppStore'
import ProductModal from '../../components/admin/ProductModal'
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react'

const ComercioProductsPage = () => {
  const { user } = useAuthStore()
  const { 
    products, 
    productsLoading, 
    productsError, 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useAppStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Detectar tipo de comercio - FIX: usar displayName cuando businessId no está disponible
  const businessType = user?.businessId === 'padelbuddy' || user?.businessId === 'sportsshop' || user?.displayName === 'PadelBuddy'
    ? 'shop' 
    : 'restaurant'
  
  // Usar el comercioId del usuario (que viene de la base de datos)
  const comercioId = user?.comercioId || user?.businessId || user?.uid
  

  // Categorías dinámicas según tipo de comercio
  const categories = businessType === 'shop'
    ? [
        { value: 'accesorios', label: 'Accesorios' },
        { value: 'ropa', label: 'Ropa' },
        { value: 'equipamiento', label: 'Equipamiento' }
      ]
    : [
        { value: 'comida', label: 'Comida' },
        { value: 'bebida', label: 'Bebida' },
        { value: 'postre', label: 'Postre' },
        { value: 'snack', label: 'Snack' }
      ]

  // Filtrar productos del comercio
  const businessProducts = products.filter(product => 
    product.comercioId === comercioId
  )

  // Aplicar filtros
  const filteredProducts = businessProducts.filter(product => {
    const matchesSearch = (product.nombre || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.categoria || product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'published' && product.isPublished) ||
                         (selectedFilter === 'pending' && !product.isPublished && product.status === 'pending') ||
                         (selectedFilter === 'rejected' && product.status === 'rejected')
    
    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    if (comercioId) {
      fetchProducts(null, comercioId)
    }
  }, [comercioId, businessType])

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(productId)
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  // Handle save product using unified modal
  const handleSaveProduct = async (productData) => {
    try {
      const finalProductData = {
        ...productData,
        comercioId: comercioId,
        isPublished: false, // Todos los productos requieren aprobación
        status: 'pendiente',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, finalProductData)
      } else {
        await createProduct(finalProductData)
      }

      // Refresh products
      await fetchProducts(null, comercioId)
      
    } catch (error) {
      console.error('Error saving product:', error)
      throw error
    }
  }

  // Open modal for editing
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowAddModal(true)
  }

  // Open modal for adding
  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowAddModal(true)
  }

  const getStatusBadge = (product) => {
    if (product.isPublished) {
      return {
        text: 'Publicado',
        color: '#10b981',
        bgColor: '#d1fae5',
        icon: CheckCircle
      }
    } else if (product.status === 'pending') {
      return {
        text: 'Pendiente',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        icon: Clock
      }
    } else if (product.status === 'rejected') {
      return {
        text: 'Rechazado',
        color: '#dc2626',
        bgColor: '#fee2e2',
        icon: XCircle
      }
    }
    return {
      text: 'Oculto',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      icon: EyeOff
    }
  }

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
            Mis Productos
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Gestiona tu catálogo de productos
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="btn-primary ripple"
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} strokeWidth={2} />
          Agregar Producto
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={18} style={{
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
              padding: '12px 16px 12px 44px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="all">Todos los productos</option>
            <option value="published">Publicados</option>
            <option value="pending">Pendientes</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>Cargando productos...</p>
        </div>
      ) : productsError ? (
        <div className="card" style={{
          padding: '40px',
          textAlign: 'center',
          background: 'white'
        }}>
          <Package size={48} style={{ margin: '0 auto 16px', color: '#6b7280' }} />
          <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px' }}>
            No hay productos disponibles
          </p>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
            Agrega tu primer producto usando el botón "Agregar Producto" arriba
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card" style={{
          padding: '40px',
          textAlign: 'center',
          background: 'white'
        }}>
          <Package size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '16px' }}>
            {searchTerm || selectedFilter !== 'all' 
              ? 'No se encontraron productos con esos filtros'
              : 'No tienes productos aún'
            }
          </p>
          {!searchTerm && selectedFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ padding: '12px 24px' }}
            >
              Agregar Primer Producto
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredProducts.map((product) => {
            const statusInfo = getStatusBadge(product)
            const StatusIcon = statusInfo.icon
            
            return (
              <div
                key={product.id}
                className="card fade-in"
                style={{
                  padding: '20px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  position: 'relative'
                }}
              >
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
                  {product.imagenes && product.imagenes.length > 0 ? (
                    <img
                      src={product.imagenes[0]}
                      alt={product.nombre || product.name || 'Producto'}
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

                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: statusInfo.bgColor,
                  color: statusInfo.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <StatusIcon size={14} strokeWidth={2} />
                  {statusInfo.text}
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
                    {product.nombre || product.name || 'Sin nombre'}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {product.descripcion || product.description || 'Sin descripción'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#1e293b'
                    }}>
                      L {(product.precio_HNL || product.price || 0).toFixed(2)}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {product.categoria || product.category || 'Sin categoría'}
                    </span>
                  </div>
                  
                  {/* Dietary Labels */}
                  {product.dietaryLabels && product.dietaryLabels.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {product.dietaryLabels.map((label, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: label === 'vegetariano' ? '#d1fae5' : '#fef3c7',
                            color: label === 'vegetariano' ? '#059669' : '#d97706'
                          }}
                        >
                          {label === 'vegetariano' ? '🌱 Veg' : '🌿 Vegan'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="tap-effect"
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.color = '#3b82f6'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.color = '#64748b'
                    }}
                  >
                    <Edit size={14} strokeWidth={2} />
                    Editar
                  </button>
                  
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="tap-effect"
                    style={{
                      padding: '10px',
                      border: '1px solid #fee2e2',
                      background: '#fef2f2',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#fee2e2'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#fef2f2'
                    }}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal unificado para agregar/editar producto */}
      <ProductModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        comercioId={comercioId}
        isComercioView={true}
        forcedComercioType={businessType}
      />
      
      {/* Modal anterior - comentado para referencia */}
      {false && showAddModal && (
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
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '20px'
            }}>
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
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
              </div>

              {/* Image Upload - Usando ImageUploader */}
              <div style={{ marginBottom: '16px' }}>
                <ImageUploader
                  onImageUploaded={(imageUrl) => {
                    if (imageUrl) {
                      setFormData(prev => ({
                        ...prev,
                        images: [imageUrl]
                      }))
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        images: []
                      }))
                    }
                  }}
                  currentImage={formData.images?.[0] || null}
                  comercioId={user?.businessId || 'temp'}
                  productId={editingProduct?.id || 'temp'}
                  type="product"
                  label="Imagen Principal"
                  required={false}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Precio (L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
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
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sección de Variantes */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Variantes
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    style={{
                      padding: '8px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    + Agregar Variante
                  </button>
                </div>

                {variants.map((variant, index) => (
                  <div key={variant.id} style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    background: '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                        Variante {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        style={{
                          padding: '4px 8px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder={businessType === 'shop' ? 'Color (ej: Negro)' : 'Tamaño (ej: Grande)'}
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Precio (ej: 425)"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                        style={{
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {businessType === 'shop' && (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <input
                            type="number"
                            placeholder="Stock (ej: 10)"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            style={{
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                          <input
                            type="text"
                            placeholder="URL de imagen (opcional)"
                            value={variant.image}
                            onChange={(e) => updateVariant(index, 'image', e.target.value)}
                            style={{
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                        </div>
                        
                        {/* Image URL for Variant - Temporal */}
                        <div style={{ marginTop: '8px' }}>
                          <input
                            type="url"
                            placeholder="URL de imagen (opcional)"
                            value={variant.image || ''}
                            onChange={(e) => updateVariant(index, 'image', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {submitError && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  marginBottom: '16px',
                  color: '#dc2626',
                  fontSize: '14px'
                }}>
                  {submitError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingProduct(null)
                    resetForm()
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
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ 
                    padding: '12px 24px',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting 
                    ? 'Guardando...' 
                    : editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComercioProductsPage
