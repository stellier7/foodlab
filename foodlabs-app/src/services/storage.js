// Servicio para gestión de archivos en Firebase Storage
import { storage } from '../config/firebase'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  getMetadata
} from 'firebase/storage'

/**
 * Comprime una imagen antes de subirla
 * @param {File} file - Archivo de imagen
 * @param {number} maxWidth - Ancho máximo en píxeles
 * @param {number} quality - Calidad de compresión (0-1)
 * @returns {Promise<File>} Archivo comprimido
 */
export const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height)

      // Convertir a blob con compresión
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Error al comprimir la imagen'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('Error al cargar la imagen'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Sube una imagen de producto a Firebase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} comercioId - ID del comercio
 * @param {string} productId - ID del producto
 * @param {string} variantId - ID de la variante (opcional)
 * @returns {Promise<string>} URL de descarga de la imagen
 */
export const uploadProductImage = async (file, comercioId, productId, variantId = null) => {
  try {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen')
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB')
    }

    // Comprimir imagen
    const compressedFile = await compressImage(file, 1200, 0.8)

    // Crear referencia en Storage
    const timestamp = Date.now()
    let fileName
    
    if (!productId) {
      // Es un logo de comercio
      fileName = `comercios/${comercioId}/logo_${timestamp}.jpg`
    } else if (variantId) {
      // Es una variante de producto
      fileName = `productos/${comercioId}/${productId}/variantes/${variantId}_${timestamp}.jpg`
    } else {
      // Es una imagen de producto
      fileName = `productos/${comercioId}/${productId}/${timestamp}.jpg`
    }
    
    const storageRef = ref(storage, fileName)

    // Subir archivo a Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, compressedFile)
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progreso de subida
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`Subida: ${progress}% completado`)
        },
        (error) => {
          console.error('Error al subir imagen:', error)
          reject(new Error('Error al subir la imagen'))
        },
        async () => {
          try {
            // Obtener URL de descarga
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error('Error al obtener URL:', error)
            reject(new Error('Error al obtener la URL de la imagen'))
          }
        }
      )
    })
    
    /* ORIGINAL FIREBASE STORAGE CODE - TO BE RESTORED LATER
    // Subir archivo
    const uploadTask = uploadBytesResumable(storageRef, compressedFile)
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progreso de subida
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`Subida: ${progress}% completado`)
        },
        (error) => {
          console.error('Error al subir imagen:', error)
          reject(new Error('Error al subir la imagen'))
        },
        async () => {
          try {
            // Obtener URL de descarga
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error('Error al obtener URL:', error)
            reject(new Error('Error al obtener la URL de la imagen'))
          }
        }
      )
    })
    */
  } catch (error) {
    console.error('Error in uploadProductImage:', error)
    throw error
  }
}

/**
 * Elimina una imagen de Firebase Storage
 * @param {string} imageUrl - URL de la imagen a eliminar
 * @returns {Promise<void>}
 */
export const deleteProductImage = async (imageUrl) => {
  try {
    // Extraer path de la URL
    const url = new URL(imageUrl)
    const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0])
    
    const imageRef = ref(storage, path)
    await deleteObject(imageRef)
  } catch (error) {
    console.error('Error al eliminar imagen:', error)
    // No lanzar error si la imagen no existe
    if (!error.message.includes('object-not-found')) {
      throw new Error('Error al eliminar la imagen')
    }
  }
}

/**
 * Sube múltiples imágenes de producto
 * @param {File[]} files - Array de archivos
 * @param {string} comercioId - ID del comercio
 * @param {string} productId - ID del producto
 * @returns {Promise<string[]>} Array de URLs de descarga
 */
export const uploadMultipleProductImages = async (files, comercioId, productId) => {
  try {
    const uploadPromises = files.map(file => 
      uploadProductImage(file, comercioId, productId)
    )
    
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error('Error al subir múltiples imágenes:', error)
    throw new Error('Error al subir las imágenes')
  }
}

/**
 * Sube logo de comercio
 * @param {File} file - Archivo de imagen
 * @param {string} comercioId - ID del comercio
 * @returns {Promise<string>} URL de descarga del logo
 */
export const uploadComercioLogo = async (file, comercioId) => {
  try {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen')
    }

    // Comprimir imagen (logos más pequeños)
    const compressedFile = await compressImage(file, 800, 0.9)

    // Crear referencia en Storage
    const timestamp = Date.now()
    const fileName = `comercios/${comercioId}/logo_${timestamp}.jpg`
    const storageRef = ref(storage, fileName)

    // Subir archivo
    const snapshot = await uploadBytes(storageRef, compressedFile)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return downloadURL
  } catch (error) {
    console.error('Error al subir logo:', error)
    throw new Error('Error al subir el logo')
  }
}

/**
 * Obtiene metadatos de una imagen
 * @param {string} imageUrl - URL de la imagen
 * @returns {Promise<Object>} Metadatos de la imagen
 */
export const getImageMetadata = async (imageUrl) => {
  try {
    const url = new URL(imageUrl)
    const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0])
    
    const imageRef = ref(storage, path)
    const metadata = await getMetadata(imageRef)
    
    return {
      size: metadata.size,
      contentType: metadata.contentType,
      timeCreated: metadata.timeCreated,
      updated: metadata.updated
    }
  } catch (error) {
    console.error('Error al obtener metadatos:', error)
    return null
  }
}

/**
 * Valida si una URL es de Firebase Storage
 * @param {string} url - URL a validar
 * @returns {boolean} True si es URL de Firebase Storage
 */
export const isFirebaseStorageUrl = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes('firebasestorage.googleapis.com')
  } catch {
    return false
  }
}

/**
 * Obtiene el tamaño de archivo en formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}