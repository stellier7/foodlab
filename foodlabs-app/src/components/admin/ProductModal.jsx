import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Package, Utensils } from 'lucide-react'
import ImageUploader from './ImageUploader'

const ProductModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  product = null, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'HNL',
    category: '',
    businessId: '',
    businessType: 'shop',
    image: null,
    stock: '',
    variants: [],
    labels: [],
    sizes: [],
    isActive: true
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Opciones para dropdowns
  const businessOptions = [
    { value: 'padelbuddy', label: 'PadelBuddy' },
    { value: 'foodlab', label: 'FoodLab' },
    { value: 'taitai', label: 'TaiTai' },
    { value: 'fitlabs', label: 'FitLabs' }
  ]

  const categoryOptions = [
    'Accesorios',
    'Comida',
    'Bebidas',
    'Postres',
    'Ensaladas',
    'Platos Principales',
    'Snacks',
    'Suplementos'
  ]

  const dietaryLabels = [
    { value: 'vegano', label: 'Vegano 🌱' },
    { value: 'vegetariano', label: 'Vegetariano 🥗' },
    { value: 'pescatariano', label: 'Pescatariano 🐟' },
    { value: 'fit', label: 'Fit 💪' }
  ]

  const sizeOptions = [
    { value: 'S', label: 'Pequeño', priceModifier: 0 },
    { value: 'M', label: 'Mediano', priceModifier: 0 },
    { value: 'L', label: 'Grande', priceModifier: 0 }
  ]

  // Cargar datos del producto si está editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        currency: product.currency || 'HNL',
        category: product.category || '',
        businessId: product.businessId || '',
        businessType: product.businessType || 'shop',
        image: product.image || null,
        stock: product.stock || '',
        variants: product.variants || [],
        labels: product.labels || [],
        sizes: product.sizes || [],
        isActive: product.isActive !== false
      })
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'HNL',
        category: '',
        businessId: '',
        businessType: 'shop',
        image: null,
        stock: '',
        variants: [],
        labels: [],
        sizes: [],
        isActive: true
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
    setFormData(prev => ({ ...prev, image: imageUrl }))
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { id: '', name: '', image: null, stock: 0 }]
    }))
  }

  const updateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const handleVariantImageUploaded = (index, imageUrl) => {
    updateVariant(index, 'image', imageUrl)
  }

  const toggleLabel = (labelValue) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.includes(labelValue)
        ? prev.labels.filter(l => l !== labelValue)
        : [...prev.labels, labelValue]
    }))
  }

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { value: '', label: '', priceModifier: 0 }]
    }))
  }

  const updateSize = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }))
  }

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }

    if (!formData.businessId) {
      newErrors.businessId = 'El negocio es requerido'
    }

    if (!formData.image) {
      newErrors.image = 'La imagen es requerida'
    }

    if (formData.businessType === 'shop' && (!formData.stock || parseInt(formData.stock) < 0)) {
      newErrors.stock = 'El stock debe ser 0 o mayor'
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
        price: parseFloat(formData.price),
        stock: formData.businessType === 'shop' ? parseInt(formData.stock) : null,
        variants: formData.variants.map(variant => ({
          ...variant,
          stock: parseInt(variant.stock) || 0
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
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.name ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ej: Phone Mount"
                  />
                  {errors.name && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.name}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Precio (Lempiras) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.price ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="425.00"
                  />
                  {errors.price && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.price}</p>}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Descripción
                </label>
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
                    transition: 'all 0.2s ease',
                    resize: 'vertical'
                  }}
                  className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Describe el producto..."
                />
              </div>
            </div>

            {/* Categorización */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Categorización
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.category ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.category}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Negocio *
                  </label>
                  <select
                    value={formData.businessId}
                    onChange={(e) => handleInputChange('businessId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.businessId ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar negocio</option>
                    {businessOptions.map(business => (
                      <option key={business.value} value={business.value}>{business.label}</option>
                    ))}
                  </select>
                  {errors.businessId && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.businessId}</p>}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Tipo de Negocio
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="businessType"
                      value="shop"
                      checked={formData.businessType === 'shop'}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                    />
                    <Package size={16} />
                    <span>Shop</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="businessType"
                      value="restaurant"
                      checked={formData.businessType === 'restaurant'}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                    />
                    <Utensils size={16} />
                    <span>Restaurante</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Imagen del Producto
              </h3>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                currentImage={formData.image}
                productId={product?.id}
                type="main"
                label="Imagen principal"
                required={true}
              />
              {errors.image && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.image}</p>}
            </div>

            {/* Campos específicos por tipo */}
            {formData.businessType === 'shop' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Stock y Variantes
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    style={{
                      width: '200px',
                      padding: '12px',
                      border: `1px solid ${errors.stock ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="20"
                  />
                  {errors.stock && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.stock}</p>}
                </div>

                {/* Variantes */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Variantes (Opcional)
                    </label>
                    <button
                      type="button"
                      onClick={addVariant}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:bg-blue-700"
                    >
                      <Plus size={14} />
                      Agregar Variante
                    </button>
                  </div>

                  {formData.variants.map((variant, index) => (
                    <div key={index} style={{
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
                          onClick={() => removeVariant(index)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          className="hover:bg-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Nombre de la Variante
                          </label>
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            placeholder="Ej: Negro"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            placeholder="10"
                          />
                        </div>
                      </div>

                      <ImageUploader
                        onImageUploaded={(url) => handleVariantImageUploaded(index, url)}
                        currentImage={variant.image}
                        productId={product?.id}
                        variantId={variant.id || `variant_${index}`}
                        type="variant"
                        label="Imagen de la variante"
                        required={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.businessType === 'restaurant' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Etiquetas Dietarias
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {dietaryLabels.map(label => (
                    <label key={label.value} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      border: `1px solid ${formData.labels.includes(label.value) ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '8px',
                      backgroundColor: formData.labels.includes(label.value) ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.labels.includes(label.value)}
                        onChange={() => toggleLabel(label.value)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{label.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Estado */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Estado
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Producto activo (visible para clientes)
                </span>
              </label>
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

export default ProductModal
