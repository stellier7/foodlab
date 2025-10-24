import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Package, Utensils, RefreshCw, Sparkles } from 'lucide-react'
import ImageUploaderWithCrop from './ImageUploaderWithCrop'
import { getComercios } from '../../services/comercios'
import { DIETARY_LABELS } from '../../config/labels'
import { CATEGORIES, getCategoriesByType } from '../../config/categories'
import { suggestProductDescription } from '../../services/ai'
import { generateSKU, generateVariantSKU } from '../../services/products'
import { useWindowSize } from '../../hooks/useWindowSize'

const ProductModalNew = ({ 
  isOpen, 
  onClose, 
  onSave, 
  product = null, 
  isLoading = false,
  comercioId = null,
  isComercioView = false,  // Nueva prop para ocultar campos de admin
  forcedComercioType = null  // Nueva prop para forzar el tipo de comercio
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_HNL: '',
    categoria: '',
    comercioId: '',
    imagen: '',
    imagenes: [],
    stock: '',
    variantes: [],
    etiquetasDietarias: [],
    estaActivo: true,
    moneda: 'HNL'
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comercios, setComercios] = useState([])
  const [loadingComercios, setLoadingComercios] = useState(false)
  const [comercioType, setComercioType] = useState('restaurant') // 'restaurant' o 'shop'
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [generatedSKU, setGeneratedSKU] = useState('')
  const windowSize = useWindowSize()

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


  // Obtener el tipo de comercio seleccionado
  const selectedComercio = comercios.find(c => c.id === formData.comercioId)
  // Normalize Spanish DB values ('tienda', 'restaurante') to English logic values ('shop', 'restaurant')
  // FIX: usar forcedComercioType cuando esté disponible
  const currentComercioType = forcedComercioType || (selectedComercio?.tipo === 'tienda' ? 'shop' : 'restaurant')
  
  // Actualizar tipo de comercio cuando cambie
  useEffect(() => {
    setComercioType(currentComercioType)
  }, [currentComercioType])

  // Forzar actualización del comercioType cuando cambie el comercio seleccionado
  useEffect(() => {
    if (formData.comercioId) {
      const comercio = comercios.find(c => c.id === formData.comercioId)
      if (comercio) {
        const newType = comercio.tipo === 'tienda' ? 'shop' : 'restaurant'
        setComercioType(newType)
      }
    }
  }, [formData.comercioId, comercios])

  // Cargar datos del producto si está editando
  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio_HNL: product.precio_HNL || product.precio || '',
        categoria: product.categoria || '',
        comercioId: product.comercioId || comercioId || '',
        imagen: product.imagen || '',
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
        precio_HNL: '',
        categoria: '',
        comercioId: comercioId || '',
        imagen: '',
        imagenes: [],
        stock: '',
        variantes: [],
        etiquetasDietarias: [],
        estaActivo: true
      })
    }
    setErrors({})
  }, [product, isOpen, comercioId])

  // Auto-detect comercio type when comercioId is provided
  useEffect(() => {
    if (comercioId && comercios.length > 0) {
      const comercio = comercios.find(c => c.id === comercioId)
      if (comercio) {
        const newType = comercio.tipo === 'tienda' ? 'shop' : 'restaurant'
        setComercioType(newType)
        
        // Generar SKU automáticamente para tiendas
        if (newType === 'shop' && !product) {
          generateSKU(comercioId, 'general').then(sku => {
            setGeneratedSKU(sku)
          }).catch(error => {
            console.error('Error generating SKU:', error)
          })
        }
      } else {
        // Si no encontramos el comercio, asumir que es una tienda si el tipo forzado es 'shop'
        if (forcedComercioType === 'shop' && !product) {
          generateSKU(comercioId, 'general').then(sku => {
            setGeneratedSKU(sku)
          }).catch(error => {
            console.error('Error generating SKU:', error)
          })
        }
      }
    }
  }, [comercioId, comercios, forcedComercioType])

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
      variantes: prev.variantes.map((variant, i) => {
        if (i === index) {
          const updatedVariant = { ...variant, [field]: value }
          
          // Generar SKU para variante si es tienda y cambió el nombre
          if (comercioType === 'shop' && field === 'nombre' && value && generatedSKU) {
            updatedVariant.sku = generateVariantSKU(generatedSKU, value)
          }
          
          return updatedVariant
        }
        return variant
      })
    }))
  }

  const handleAddVariant = () => {
    const baseVariant = {
      id: Date.now().toString(),
      nombre: '',
      precio_HNL: '',
      descripcion: ''
    }
    
    // Agregar campos específicos según el tipo de comercio
    if (comercioType === 'shop') {
      baseVariant.color = '#000000'
      baseVariant.stock = ''
      baseVariant.imagen = ''
      baseVariant.sku = ''
    } else {
      baseVariant.stock = ''
    }
    
    setFormData(prev => ({
      ...prev,
      variantes: [...prev.variantes, baseVariant]
    }))
  }
  
  // Función para generar descripción con AI
  const handleGenerateDescription = async () => {
    if (!formData.nombre) {
      alert('Por favor ingresa el nombre del producto primero')
      return
    }
    
    setIsGeneratingDescription(true)
    try {
      const suggestion = await suggestProductDescription(
        formData.nombre,
        formData.categoria || 'general',
        comercioType
      )
      
      if (suggestion) {
        setFormData(prev => ({ ...prev, descripcion: suggestion }))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar descripción. Intenta de nuevo.')
    } finally {
      setIsGeneratingDescription(false)
    }
  }
  
  // Función para generar SKU cuando cambie la categoría
  const handleCategoryChange = async (categoria) => {
    setFormData(prev => ({ ...prev, categoria }))
    
    // Generar SKU si es tienda y tiene categoría
    if (comercioType === 'shop' && categoria && (formData.comercioId || comercioId)) {
      try {
        const sku = await generateSKU(formData.comercioId || comercioId, categoria)
        setGeneratedSKU(sku)
      } catch (error) {
        console.error('Error generating SKU:', error)
      }
    } else if (comercioType === 'shop' && !categoria) {
      // Si es tienda pero no tiene categoría, generar SKU genérico
      try {
        const sku = await generateSKU(formData.comercioId || comercioId, 'general')
        setGeneratedSKU(sku)
      } catch (error) {
        console.error('Error generating SKU:', error)
      }
    }
  }

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index)
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

    if (!formData.precio_HNL || formData.precio_HNL <= 0) {
      newErrors.precio_HNL = 'El precio debe ser mayor a 0'
    }

    // Solo requerir categoría para restaurantes
    if (comercioType === 'restaurant' && !formData.categoria) {
      newErrors.categoria = 'La categoría es requerida para restaurantes'
    }

    if (!formData.comercioId && !comercioId) {
      newErrors.comercioId = 'Debe seleccionar un comercio'
    }
    

    // Solo requerir imágenes para productos existentes
    if (product && formData.imagenes.length === 0) {
      newErrors.imagenes = 'Debe agregar al menos una imagen'
    }

    // Validaciones específicas para tiendas
    if (comercioType === 'shop') {
      // El SKU se genera automáticamente, no es requerido en validación
      // if (!generatedSKU) {
      //   newErrors.sku = 'El SKU es requerido para tiendas'
      // }
      
      // Validar variantes de tienda
      formData.variantes.forEach((variant, index) => {
        if (!variant.nombre.trim()) {
          newErrors[`variante_${index}_nombre`] = 'El nombre de la variante es requerido'
        }
        if (!variant.precio_HNL || variant.precio_HNL <= 0) {
          newErrors[`variante_${index}_precio`] = 'El precio de la variante debe ser mayor a 0'
        }
        if (!variant.stock || variant.stock <= 0) {
          newErrors[`variante_${index}_stock`] = 'El stock de la variante debe ser mayor a 0'
        }
        if (!variant.color) {
          newErrors[`variante_${index}_color`] = 'El color de la variante es requerido'
        }
      })
    }

    // Validaciones específicas para restaurantes
    if (comercioType === 'restaurant') {
      // Validar variantes de restaurante
      formData.variantes.forEach((variant, index) => {
        if (!variant.nombre.trim()) {
          newErrors[`variante_${index}_nombre`] = 'El nombre de la variante es requerido'
        }
        if (!variant.precio_HNL || variant.precio_HNL <= 0) {
          newErrors[`variante_${index}_precio`] = 'El precio de la variante debe ser mayor a 0'
        }
      })
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
        precio_HNL: parseFloat(formData.precio_HNL),
        stock: formData.stock ? parseInt(formData.stock) : null,
        variantes: formData.variantes.map(v => ({
          ...v,
          precio_HNL: parseFloat(v.precio_HNL),
          stock: v.stock ? parseInt(v.stock) : null
        })),
        // Incluir SKU generado para tiendas
        ...(comercioType === 'shop' && generatedSKU && { sku: generatedSKU }),
        // Asegurar que el comercioId esté presente
        comercioId: formData.comercioId || comercioId
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
          padding: windowSize.isMobile ? '16px' : '20px 24px',
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
        <div style={{ flex: 1, overflowY: 'auto', padding: windowSize.isMobile ? '16px' : '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Información básica */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Información Básica
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: windowSize.isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
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
                    placeholder={comercioType === 'restaurant' ? "Ej: Croissant de Desayuno" : "Ej: Funda para iPhone 14"}
                  />
                  {errors.nombre && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.nombre}</p>}
                </div>

                {/* Comercio - Solo mostrar si no viene comercioId como prop */}
                {!comercioId && !isComercioView && (
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
                )}
              </div>

              <div style={{ marginTop: '16px', position: 'relative' }}>
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
                    paddingRight: '120px', // Espacio para el botón
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
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription}
                  style={{
                    position: 'absolute',
                    top: '32px',
                    right: '8px',
                    padding: '6px 12px',
                    background: isGeneratingDescription 
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: isGeneratingDescription ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isGeneratingDescription ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      AI Sugerir
                    </>
                  )}
                </button>
                {errors.descripcion && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.descripcion}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: windowSize.isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Precio (L) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_HNL}
                    onChange={(e) => handleInputChange('precio_HNL', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.precio_HNL ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  {errors.precio_HNL && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.precio_HNL}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Categoría {comercioType === 'restaurant' ? '*' : '(opcional)'}
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => handleCategoryChange(e.target.value)}
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
                    {getCategoriesByType(comercioType).map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
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
                
                {/* Campo SKU solo para tiendas */}
                {comercioType === 'shop' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={generatedSKU}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#f9fafb',
                        color: '#6b7280'
                      }}
                      placeholder="SKU se generará automáticamente"
                    />
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }}>
                      SKU generado automáticamente basado en comercio y categoría
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Labels Dietéticas - Solo para restaurantes */}
            {comercioType === 'restaurant' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Labels Dietéticas
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {DIETARY_LABELS.map((label) => (
                  <label key={label.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: formData.etiquetasDietarias.includes(label.id) ? '#f3f4f6' : 'white',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.etiquetasDietarias.includes(label.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('etiquetasDietarias', [...formData.etiquetasDietarias, label.id])
                        } else {
                          handleInputChange('etiquetasDietarias', formData.etiquetasDietarias.filter(id => id !== label.id))
                        }
                      }}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      {label.icon} {label.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            )}

            {/* Imágenes */}
            {product ? (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Imágenes del Producto
                </h3>
                
                {/* Subir nueva imagen */}
                {formData.comercioId && (
                  <ImageUploaderWithCrop
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
            ) : (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                border: '1px dashed #d1d5db',
                textAlign: 'center'
              }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  💡 Puedes agregar imágenes una vez crees el producto
                </p>
              </div>
            )}

            {/* Variantes */}
            {product ? (
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

                    <div style={{ display: 'grid', gridTemplateColumns: windowSize.isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
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
                          value={variant.precio_HNL}
                          onChange={(e) => handleVariantChange(index, 'precio_HNL', e.target.value)}
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
            ) : (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                border: '1px dashed #d1d5db',
                textAlign: 'center'
              }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  💡 Puedes agregar variantes una vez crees el producto
                </p>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: windowSize.isMobile ? '16px' : '20px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          flexDirection: windowSize.isMobile ? 'column' : 'row'
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
              transition: 'all 0.2s ease',
              width: windowSize.isMobile ? '100%' : 'auto'
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
              transition: 'all 0.2s ease',
              width: windowSize.isMobile ? '100%' : 'auto'
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
