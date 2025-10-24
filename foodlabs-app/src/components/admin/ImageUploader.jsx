import { useState, useRef, useEffect } from 'react'
import { uploadProductImage } from '../../services/storage'
import { X, Upload, Image as ImageIcon, AlertCircle, ZoomIn, Move } from 'lucide-react'

const ImageUploader = ({ 
  onImageUploaded, 
  currentImage = null, 
  comercioId = null,
  productId = null, 
  variantId = null,
  type = 'main',
  label = 'Imagen del producto',
  required = true 
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(currentImage)
  const [showZoom, setShowZoom] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar archivo
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('La imagen es demasiado grande. Máximo 10MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Crear preview local
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Si no hay comercioId, solo mostrar preview (para comercios nuevos)
      if (!comercioId) {
        console.log('No hay comercioId, solo mostrando preview')
        // Llamar callback con la preview URL para que ComercioModal pueda usarla
        onImageUploaded(previewUrl)
        return
      }

      // Subir imagen usando el nuevo servicio
      const imageUrl = await uploadProductImage(file, comercioId, productId, variantId)
      
      // Llamar callback con la URL
      onImageUploaded(imageUrl)
      
    } catch (error) {
      console.error('Error uploading image:', error)
      setError(error.message || 'Error al subir la imagen. Intenta de nuevo.')
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

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5))
  }

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }

  // Reset zoom when image changes
  useEffect(() => {
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }, [preview])

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
            <div
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: '10px',
                position: 'relative',
                cursor: zoomLevel > 1 ? 'move' : 'pointer'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                  transformOrigin: 'center center'
                }}
              />
            </div>
            
            {/* Zoom Controls */}
            {!isUploading && (
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                display: 'flex',
                gap: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '6px',
                padding: '4px'
              }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomOut()
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  −
                </button>
                <span style={{
                  color: 'white',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px'
                }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomIn()
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  +
                </button>
                {zoomLevel > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      resetZoom()
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                    title="Reset zoom"
                  >
                    <Move size={12} />
                  </button>
                )}
              </div>
            )}
            
            {/* Remove Button */}
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
        accept="image/*"
        capture="environment"
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

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ImageUploader
