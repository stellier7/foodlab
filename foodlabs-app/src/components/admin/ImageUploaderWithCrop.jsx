import { useState, useRef, useEffect } from 'react'
import { uploadProductImage } from '../../services/storage'
import { X, Upload, Image as ImageIcon, AlertCircle, Crop, RotateCw, Download } from 'lucide-react'
import { useWindowSize } from '../../hooks/useWindowSize'

const ImageUploaderWithCrop = ({ 
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
  const [showCropModal, setShowCropModal] = useState(false)
  const [originalImage, setOriginalImage] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState('')
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [cropDimensions, setCropDimensions] = useState({ width: 400, height: 400 }) // Default crop size
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const windowSize = useWindowSize()

  // Store display dimensions (how the image will appear in the store)
  const storeDisplayDimensions = {
    card: { width: 300, height: 200 }, // Product card dimensions
    modal: { width: 400, height: 400 }, // Product modal dimensions
    detail: { width: 600, height: 400 } // Product detail dimensions
  }

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
    
    // Create preview and show crop modal
    const previewUrl = URL.createObjectURL(file)
    setOriginalImage(previewUrl)
    setShowCropModal(true)
  }

  const handleCropImage = () => {
    if (!originalImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Set canvas size to store display dimensions
      canvas.width = storeDisplayDimensions.card.width
      canvas.height = storeDisplayDimensions.card.height
      
      // Calculate scale factor
      const scaleX = img.width / imageDimensions.width
      const scaleY = img.height / imageDimensions.height
      
      // Draw cropped image
      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        storeDisplayDimensions.card.width,
        storeDisplayDimensions.card.height
      )
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'cropped-image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          setCroppedImage(URL.createObjectURL(blob))
          setPreview(URL.createObjectURL(blob))
          
          // Upload the cropped image
          uploadCroppedImage(croppedFile)
        }
      }, 'image/jpeg', 0.9)
    }
    
    img.src = originalImage
  }

  const uploadCroppedImage = async (file) => {
    setIsUploading(true)
    setShowCropModal(false)
    
    try {
      // Si no hay comercioId, solo mostrar preview (para comercios nuevos)
      if (!comercioId) {
        console.log('No hay comercioId, solo mostrando preview')
        onImageUploaded(preview)
        return
      }

      // Subir imagen usando el servicio
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
    setCroppedImage(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageUploaded(null)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX)
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY)
    setDragStart({
      x: clientX - rect.left - cropArea.x,
      y: clientY - rect.top - cropArea.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !originalImage || isResizing) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX)
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY)
    const newX = clientX - rect.left - dragStart.x
    const newY = clientY - rect.top - dragStart.y
    
    // Constrain crop area within image bounds
    const maxX = imageDimensions.width - cropArea.width
    const maxY = imageDimensions.height - cropArea.height
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    }))
  }

  const handleMouseUp = () => {
    if (isResizing) {
      handleResizeEnd()
    } else {
      setIsDragging(false)
    }
  }

  // Touch event handlers that work alongside mouse events
  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    handleMouseDown({ 
      clientX: touch.clientX, 
      clientY: touch.clientY, 
      currentTarget: e.currentTarget 
    })
  }

  const handleTouchMove = (e) => {
    e.preventDefault() // Prevent scrolling while dragging
    const touch = e.touches[0]
    handleMouseMove({ 
      clientX: touch.clientX, 
      clientY: touch.clientY, 
      currentTarget: e.currentTarget 
    })
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  const handleResizeCrop = (direction, e) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setDragStart({
      x: e.clientX || (e.touches && e.touches[0]?.clientX) || 0,
      y: e.clientY || (e.touches && e.touches[0]?.clientY) || 0
    })
  }

  const handleResizeMove = (e) => {
    if (!isResizing || !resizeDirection) return
    
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX)
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY)
    
    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y
    
    let newWidth = cropArea.width
    let newHeight = cropArea.height
    let newX = cropArea.x
    let newY = cropArea.y
    
    if (resizeDirection.includes('right')) newWidth += deltaX
    if (resizeDirection.includes('left')) {
      newWidth -= deltaX
      newX += deltaX
    }
    if (resizeDirection.includes('bottom')) newHeight += deltaY
    if (resizeDirection.includes('top')) {
      newHeight -= deltaY
      newY += deltaY
    }
    
    // Maintain 3:2 aspect ratio
    const aspectRatio = 3 / 2
    const minSize = 100
    const maxSize = Math.min(imageDimensions.width, imageDimensions.height)
    
    // Adjust to maintain aspect ratio
    if (newWidth / newHeight > aspectRatio) {
      newWidth = newHeight * aspectRatio
    } else {
      newHeight = newWidth / aspectRatio
    }
    
    newWidth = Math.max(minSize, Math.min(newWidth, maxSize))
    newHeight = Math.max(minSize, Math.min(newHeight, maxSize))
    
    setCropArea({
      x: Math.max(0, Math.min(newX, imageDimensions.width - newWidth)),
      y: Math.max(0, Math.min(newY, imageDimensions.height - newHeight)),
      width: newWidth,
      height: newHeight
    })
    
    setDragStart({ x: clientX, y: clientY })
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
    setResizeDirection('')
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
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
              
              {/* Store Display Preview Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {storeDisplayDimensions.card.width}×{storeDisplayDimensions.card.height}px
              </div>
            </div>
            
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
                  JPG, PNG o WebP (máx. 10MB) • Se ajustará a {storeDisplayDimensions.card.width}×{storeDisplayDimensions.card.height}px
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

      {/* Crop Modal */}
      {showCropModal && originalImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: windowSize.isMobile ? '16px' : '24px',
            maxWidth: windowSize.isMobile ? '95vw' : '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>
                Ajustar Imagen
              </h3>
              <button
                onClick={() => setShowCropModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div 
              style={{
                position: 'relative',
                display: 'inline-block',
                marginBottom: '20px'
              }}
              onMouseMove={isResizing ? handleResizeMove : handleMouseMove}
              onTouchMove={isResizing ? handleResizeMove : handleTouchMove}
              onMouseUp={isResizing ? handleResizeEnd : handleMouseUp}
              onTouchEnd={isResizing ? handleResizeEnd : handleTouchEnd}
              onMouseLeave={isResizing ? handleResizeEnd : handleMouseUp}
            >
              <img
                src={originalImage}
                alt="Crop preview"
                style={{
                  maxWidth: windowSize.isMobile ? '90vw' : '500px',
                  maxHeight: windowSize.isMobile ? '60vh' : '400px',
                  display: 'block'
                }}
                onLoad={(e) => {
                  // Get actual rendered image dimensions
                  const img = e.target
                  const rect = img.getBoundingClientRect()
                  
                  // Use the rendered dimensions, not natural dimensions
                  setImageDimensions({ 
                    width: rect.width, 
                    height: rect.height 
                  })
                  
                  // Set initial crop area with 3:2 aspect ratio (product card ratio)
                  const aspectRatio = 3 / 2
                  const maxWidth = rect.width * 0.8
                  const maxHeight = rect.height * 0.8
                  
                  let cropWidth = Math.min(maxWidth, maxHeight * aspectRatio)
                  let cropHeight = cropWidth / aspectRatio
                  
                  // Ensure it fits within image bounds
                  if (cropHeight > maxHeight) {
                    cropHeight = maxHeight
                    cropWidth = cropHeight * aspectRatio
                  }
                  
                  setCropArea({
                    x: (rect.width - cropWidth) / 2,
                    y: (rect.height - cropHeight) / 2,
                    width: cropWidth,
                    height: cropHeight
                  })
                }}
              />
              
              {/* Crop Area Overlay */}
              {cropArea.width > 0 && cropArea.height > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                    border: '2px solid #3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    cursor: 'move',
                    boxSizing: 'border-box',
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                {/* Resize handles */}
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    width: 20,
                    height: 20,
                    backgroundColor: '#3b82f6',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'nw-resize',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleResizeCrop('top-left', e)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleResizeCrop('top-left', e)
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 20,
                    height: 20,
                    backgroundColor: '#3b82f6',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'ne-resize',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleResizeCrop('top-right', e)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleResizeCrop('top-right', e)
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    left: -10,
                    width: 20,
                    height: 20,
                    backgroundColor: '#3b82f6',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'sw-resize',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleResizeCrop('bottom-left', e)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleResizeCrop('bottom-left', e)
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    width: 20,
                    height: 20,
                    backgroundColor: '#3b82f6',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'se-resize',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleResizeCrop('bottom-right', e)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleResizeCrop('bottom-right', e)
                  }}
                />
                </div>
              )}
            </div>

            {/* Preview of how it will look in store */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Vista previa en tienda:
              </h4>
              <div style={{
                width: '150px',
                height: '100px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              flexDirection: windowSize.isMobile ? 'column' : 'row'
            }}>
              <button
                onClick={() => setShowCropModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: windowSize.isMobile ? '100%' : 'auto'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCropImage}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: windowSize.isMobile ? '100%' : 'auto'
                }}
              >
                <Crop size={16} />
                Ajustar y Subir
              </button>
            </div>
          </div>
        </div>
      )}

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

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ImageUploaderWithCrop
