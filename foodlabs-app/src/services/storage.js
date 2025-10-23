import { storage } from '../config/firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

/**
 * Sube una imagen a Firebase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} path - Ruta donde subir (ej: 'products/productId/main.jpg')
 * @returns {Promise<string>} URL pública de la imagen
 */
export const uploadImage = async (file, path) => {
  try {
    // Comprimir imagen si es muy grande
    const compressedFile = await compressImage(file)
    
    // Crear referencia en Storage
    const storageRef = ref(storage, path)
    
    // Subir archivo
    const snapshot = await uploadBytes(storageRef, compressedFile)
    
    // Obtener URL pública
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Error al subir la imagen')
  }
}

/**
 * Elimina una imagen de Firebase Storage
 * @param {string} imageUrl - URL de la imagen a eliminar
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageUrl) => {
  try {
    // Extraer path del URL
    const path = extractPathFromUrl(imageUrl)
    if (!path) return

    const imageRef = ref(storage, path)
    await deleteObject(imageRef)
  } catch (error) {
    console.error('Error deleting image:', error)
    // No lanzar error si la imagen no existe
  }
}

/**
 * Comprime una imagen para reducir su tamaño
 * @param {File} file - Archivo original
 * @param {number} maxSizeKB - Tamaño máximo en KB (default: 1024)
 * @returns {Promise<File>} Archivo comprimido
 */
const compressImage = async (file, maxSizeKB = 1024) => {
  // Skip compression on mobile if file is already small enough
  if (file.size <= maxSizeKB * 1024 * 2) {
    return file
  }

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        // Canvas not supported, return original
        console.warn('Canvas not supported, using original file')
        resolve(file)
        return
      }

      const img = new Image()

      img.onerror = () => {
        // Image load failed, return original
        console.warn('Image load failed, using original file')
        resolve(file)
      }

      img.onload = () => {
        try {
          // Calcular nuevas dimensiones manteniendo aspect ratio
          let { width, height } = img
          const maxDimension = 1920 // Máximo 1920px en cualquier dimensión

          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }

          canvas.width = width
          canvas.height = height

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height)

          // Convertir a blob con calidad ajustable
          canvas.toBlob((blob) => {
            if (blob && blob.size <= maxSizeKB * 1024) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            } else if (blob) {
              // Si sigue siendo muy grande, reducir calidad
              canvas.toBlob((compressedBlob) => {
                if (compressedBlob) {
                  resolve(new File([compressedBlob], file.name, { type: 'image/jpeg' }))
                } else {
                  resolve(file) // Fallback to original
                }
              }, 'image/jpeg', 0.7)
            } else {
              resolve(file) // Fallback to original
            }
          }, 'image/jpeg', 0.8)
        } catch (error) {
          console.error('Compression error:', error)
          resolve(file) // Return original on error
        }
      }

      img.src = URL.createObjectURL(file)
    } catch (error) {
      console.error('Canvas creation error:', error)
      resolve(file) // Return original file on any error
    }
  })
}

/**
 * Extrae el path de un URL de Firebase Storage
 * @param {string} url - URL completa
 * @returns {string|null} Path del archivo
 */
const extractPathFromUrl = (url) => {
  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/)
    return pathMatch ? decodeURIComponent(pathMatch[1]) : null
  } catch (error) {
    return null
  }
}

/**
 * Genera un path único para un producto
 * @param {string} productId - ID del producto
 * @param {string} type - Tipo de imagen ('main' o 'variant')
 * @param {string} [variantId] - ID de la variante (solo para variantes)
 * @returns {string} Path generado
 */
export const generateProductImagePath = (productId, type, variantId = null) => {
  const timestamp = Date.now()
  const extension = 'jpg'
  
  if (type === 'main') {
    return `products/${productId}/main_${timestamp}.${extension}`
  } else if (type === 'variant' && variantId) {
    return `products/${productId}/variants/${variantId}_${timestamp}.${extension}`
  }
  
  throw new Error('Tipo de imagen no válido')
}

/**
 * Valida que un archivo sea una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateImageFile = (file) => {
  // Verificar que es un archivo
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo' }
  }

  // Verificar tipo de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no válido. Use JPG, PNG o WebP' }
  }

  // Verificar tamaño (máximo 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo es muy grande. Máximo 10MB' }
  }

  return { valid: true }
}
