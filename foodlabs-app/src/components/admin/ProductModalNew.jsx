import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Package, Utensils } from 'lucide-react'
import ImageUploader from './ImageUploader'
import { getComercios } from '../../services/comercios'

const ProductModalNew = ({ 
  isOpen, 
  onClose, 
  onSave, 
  product = null, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    moneda: 'HNL',
    categoria: '',
    comercioId: '',
    imagenes: [],
    stock: '',
    variantes: [],
    etiquetasDietarias: [],
    estaActivo: true
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comercios, setComercios] = useState([])
  const [loadingComercios, setLoadingComercios] = useState(false)

  // Cargar comercios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadComercios()
    }
  }, [isOpen])

  const loadComercios = async () => {
    setLoadingComercios(true)
    try {
      const comerciosData = await getComercios({ estado: 'activo' })
      setComercios(comerciosData)
    } catch (error) {
      console.error('Error loading comercios:', error)
    } finally {
      setLoadingComercios(false)
    }
  }

  const categoryOptions = {
    restaurante: [
      'Entradas',
      'Platos Principales',
      'Postres',
      'Bebidas',
      'Snacks',
      'Especialidades'
    ],
    tienda: [
      'Accesorios',
      'Ropa',
      'Equipamiento',
      'Electrónicos',
      'Hogar',
      'Deportes'
    ]
  }

  const dietaryLabels = [
    { value: 'vegano', label: 'Vegano 🌱' },
    { value: 'vegetariano', label: 'Vegetariano 🥗' },
    { value: 'pescatariano', label: 'Pescatariano 🐟' },
    { value: 'fit', label: 'Fit 💪' },
    { value: 'sin-gluten', label: 'Sin Gluten 🌾' },
    { value: 'sin-lactosa', label: 'Sin Lactosa 🥛' }
  ]

  // Obtener el tipo de comercio seleccionado
  const selectedComercio = comercios.find(c => c.id === formData.comercioId)
  const comercioType = selectedComercio?.tipo || 'restaurante'

  // Cargar datos del producto si está editando
  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        moneda: product.moneda || 'HNL',
        categoria: product.categoria || '',
        comercioId: product.comercioId || '',
        imagenes: product.imagenes || [],
        stock: product.stock || '',
        variantes: product.variantes || [],
        etiquetasDietarias: product.etiquetasDietarias || [],
        estaActivo: product.estaActivo !== false
      })
    } else {
      // Reset form for new product
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        moneda: 'HNL',
        categoria: '',
        comercioId: '',
        imagenes: [],
        stock: '',
        variantes: [],
        etiquetasDietarias: [],
        estaActivo: true
      })
    }
    setErrors({})
  }, [product, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleImageUploaded = (imageUrl) => {
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, imageUrl]
      }))
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }))
  }

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variantes: [...prev.variantes, {
        id: Date.now().toString(),
        nombre: '',
        precio: '',
        stock: '',
        descripcion: ''
      }]
    }))
  }

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index)
    }))
  }

  const handleDietaryLabelToggle = (label) => {
    setFormData(prev => ({
      ...prev,
      etiquetasDietarias: prev.etiquetasDietarias.includes(label)
        ? prev.etiquetasDietarias.filter(l => l !== label)
        : [...prev.etiquetasDietarias, label]
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }

    if (!formData.precio || formData.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0'
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida'
    }

    if (!formData.comercioId) {
      newErrors.comercioId = 'Debe seleccionar un comercio'
    }

    if (formData.imagenes.length === 0) {
      newErrors.imagenes = 'Debe agregar al menos una imagen'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: formData.stock ? parseInt(formData.stock) : null,
        variantes: formData.variantes.map(v => ({
          ...v,
          precio: parseFloat(v.precio),
          stock: v.stock ? parseInt(v.stock) : null
        }))
      }

      await onSave(productData)
      onClose()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error al guardar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: 0,
            color: '#111827'
          }}>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Información básica */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Información Básica
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.nombre ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ej: Croissant de Desayuno"
                  />
                  {errors.nombre && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.nombre}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Comercio *
                  </label>
                  <select
                    value={formData.comercioId}
                    onChange={(e) => handleInputChange('comercioId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.comercioId ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={loadingComercios}
                  >
                    <option value="">Seleccionar comercio</option>
                    {comercios.map(comercio => (
                      <option key={comercio.id} value={comercio.id}>
                        {comercio.nombre} ({comercio.tipo})
                      </option>
                    ))}
                  </select>
                  {errors.comercioId && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.comercioId}</p>}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${errors.descripcion ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    resize: 'vertical'
                  }}
                  className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Describe el producto..."
                />
                {errors.descripcion && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.descripcion}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Precio (L) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => handleInputChange('precio', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.precio ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  {errors.precio && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.precio}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Categoría *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.categoria ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categoryOptions[comercioType]?.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                  {errors.categoria && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.categoria}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Stock (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Cantidad disponible"
                  />
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Imágenes del Producto
              </h3>
              
              {/* Subir nueva imagen */}
              {formData.comercioId && (
                <ImageUploader
                  onImageUploaded={handleImageUploaded}
                  comercioId={formData.comercioId}
                  productId={product?.id || 'temp'}
                  type="product"
                  label="Agregar imagen"
                  required={false}
                />
              )}

              {/* Mostrar imágenes existentes */}
              {formData.imagenes.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Imágenes actuales:
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {formData.imagenes.map((imagen, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={imagen}
                          alt={`Imagen ${index + 1}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.imagenes && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.imagenes}</p>}
            </div>

            {/* Variantes */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Variantes del Producto
                </h3>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} />
                  Agregar Variante
                </button>
              </div>

              {formData.variantes.map((variant, index) => (
                <div key={variant.id} style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>
                      Variante {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={variant.nombre}
                        onChange={(e) => handleVariantChange(index, 'nombre', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                        placeholder="Ej: Grande, Con queso"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Precio (L)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.precio}
                        onChange={(e) => handleVariantChange(index, 'precio', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                        placeholder="Cantidad"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={variant.descripcion}
                        onChange={(e) => handleVariantChange(index, 'descripcion', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                        placeholder="Descripción opcional"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Etiquetas dietarias */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Etiquetas Dietarias
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dietaryLabels.map(label => (
                  <label key={label.value} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    border: `1px solid ${formData.etiquetasDietarias.includes(label.value) ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '6px',
                    backgroundColor: formData.etiquetasDietarias.includes(label.value) ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '12px'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.etiquetasDietarias.includes(label.value)}
                      onChange={() => handleDietaryLabelToggle(label.value)}
                      style={{ margin: 0 }}
                    />
                    <span>{label.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : (product ? 'Actualizar' : 'Crear Producto')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductModalNew
