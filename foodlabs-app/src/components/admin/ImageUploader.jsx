import { useState, useRef } from 'react'
import { uploadImage, validateImageFile, generateProductImagePath } from '../../services/storage'
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'

const ImageUploader = ({ 
  onImageUploaded, 
  currentImage = null, 
  productId = null, 
  variantId = null,
  type = 'main',
  label = 'Imagen del producto',
  required = true 
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(currentImage)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar archivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Crear preview local
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Generar path único
      const imagePath = productId 
        ? generateProductImagePath(productId, type, variantId)
        : `temp/${Date.now()}_${file.name}`

      // Subir imagen
      const imageUrl = await uploadImage(file, imagePath)
      
      // Llamar callback con la URL
      onImageUploaded(imageUrl)
      
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Error al subir la imagen. Intenta de nuevo.')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageUploaded(null)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div style={{ width: '100%' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>

      <div
        onClick={handleClick}
        style={{
          width: '100%',
          height: '200px',
          border: preview ? 'none' : '2px dashed #d1d5db',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: preview ? 'transparent' : '#f9fafb',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="hover:border-blue-400 hover:bg-blue-50"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px'
              }}
            />
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveImage()
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="hover:bg-red-600"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            {isUploading ? (
              <>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px'
                }}></div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                  Subiendo imagen...
                </p>
              </>
            ) : (
              <>
                <Upload size={32} style={{ marginBottom: '8px', color: '#9ca3af' }} />
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>
                  Haz clic para subir una imagen
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                  JPG, PNG o WebP (máx. 10MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={isUploading}
      />

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '13px'
        }}>
          <AlertCircle size={16} />
          {error}
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

export default ImageUploader
