import { db } from '../config/firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore'

const PRODUCTS_COLLECTION = 'products'

/**
 * Crea un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise<string>} ID del producto creado
 */
export const createProduct = async (productData) => {
  try {
    // Validar que el comercioId existe
    if (!productData.comercioId) {
      throw new Error('comercioId es requerido')
    }
    
    // Validar que el comercio existe
    const { getComercio } = await import('./comercios')
    const comercio = await getComercio(productData.comercioId)
    if (!comercio) {
      console.error('Comercio no encontrado:', productData.comercioId)
      throw new Error('El comercio especificado no existe')
    }
  } catch (error) {
    console.error('Error validating comercio:', error)
    throw error
  }

  const productRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    // Todos los productos requieren aprobación según el plan
    isPublished: false,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  })
  return productRef.id
}

/**
 * Actualiza un producto existente
 * @param {string} productId - ID del producto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateProduct = async (productId, updateData) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId)
  
  // Detectar qué campos cambiaron para crear notificación
  const productSnap = await getDoc(productRef)
  const currentData = productSnap.data()
  const changes = []
  
  // Detectar cambios específicos
  if (updateData.precio_HNL && updateData.precio_HNL !== currentData.precio_HNL) {
    changes.push(`Precio: L${currentData.precio_HNL} → L${updateData.precio_HNL}`)
  }
  if (updateData.nombre && updateData.nombre !== currentData.nombre) {
    changes.push(`Nombre: "${currentData.nombre}" → "${updateData.nombre}"`)
  }
  if (updateData.descripcion && updateData.descripcion !== currentData.descripcion) {
    changes.push('Descripción actualizada')
  }
  if (updateData.imagenes && JSON.stringify(updateData.imagenes) !== JSON.stringify(currentData.imagenes)) {
    changes.push('Imágenes actualizadas')
  }
  if (updateData.stock !== undefined && updateData.stock !== currentData.stock) {
    changes.push(`Stock: ${currentData.stock} → ${updateData.stock}`)
  }
  
  // Si hay cambios, crear notificación
  if (changes.length > 0) {
    const notificationData = {
      type: 'product_change',
      productId: productId,
      productName: updateData.nombre || currentData.nombre,
      comercioId: currentData.comercioId,
      changes: changes,
      status: 'pending',
      createdAt: new Date().toISOString(),
      message: `Cambios en producto "${updateData.nombre || currentData.nombre}": ${changes.join(', ')}`
    }
    
    // Crear notificación en la colección de notificaciones
    await addDoc(collection(db, 'notifications'), notificationData)
    
    // Marcar producto como pendiente de aprobación
    updateData.status = 'pendiente'
    updateData.isPublished = false
  }
  
  await updateDoc(productRef, {
    ...updateData,
    updatedAt: new Date().toISOString()
  })
}

/**
 * Elimina un producto (marca como inactivo)
 * @param {string} productId - ID del producto
 * @returns {Promise<void>}
 */
export const deleteProduct = async (productId) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId)
  await updateDoc(productRef, {
    isActive: false,
    updatedAt: new Date().toISOString()
  })
}

/**
 * Obtiene un producto por ID
 * @param {string} productId - ID del producto
 * @returns {Promise<Object|null>} Datos del producto o null si no existe
 */
export const getProduct = async (productId) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId)
  const productSnap = await getDoc(productRef)
  
  if (productSnap.exists()) {
    return { id: productSnap.id, ...productSnap.data() }
  }
  return null
}

/**
 * Obtiene todos los productos activos
 * @param {string} [tipoComercio] - Filtrar por tipo de comercio ('tienda' o 'restaurante')
 * @param {string} [comercioId] - Filtrar por ID de comercio específico
 * @param {boolean} [soloPublicados] - Si true, solo productos publicados
 * @returns {Promise<Array>} Lista de productos
 */
export const getProducts = async (tipoComercio = null, comercioId = null, soloPublicados = false) => {
  try {
    // Start with a simple query to avoid complex index requirements
    let q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('isActive', '==', true)
    )

    // Add comercioId filter if specified
    if (comercioId) {
      q = query(q, where('comercioId', '==', comercioId))
    }

    // Add published filter if specified
    if (soloPublicados) {
      q = query(q, where('isPublished', '==', true))
    }

    const querySnapshot = await getDocs(q)
    let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Filter by tipoComercio in JavaScript (to avoid complex Firestore queries)
    if (tipoComercio) {
      const { getComercios } = await import('./comercios')
      const comercios = await getComercios({ tipo: tipoComercio })
      const comercioIds = comercios.map(c => c.id)
      products = products.filter(p => comercioIds.includes(p.comercioId))
    }
    
    // Sort in JavaScript to avoid Firestore index requirements
    return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('Error fetching products:', error)
    throw new Error('Error al cargar los productos')
  }
}

/**
 * Obtiene productos de tiendas
 * @returns {Promise<Array>} Lista de productos de tiendas
 */
export const getTiendaProducts = async () => {
  return await getProducts('tienda', null, true)
}

/**
 * Obtiene productos de restaurantes
 * @returns {Promise<Array>} Lista de productos de restaurantes
 */
export const getRestauranteProducts = async () => {
  return await getProducts('restaurante', null, true)
}

/**
 * Busca productos por nombre
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} [tipoComercio] - Filtrar por tipo de comercio
 * @returns {Promise<Array>} Lista de productos que coinciden
 */
export const searchProducts = async (searchTerm, tipoComercio = null) => {
  const allProducts = await getProducts(tipoComercio, null, true)
  const term = searchTerm.toLowerCase()
  
  return allProducts.filter(product => 
    product.nombre.toLowerCase().includes(term) ||
    product.descripcion.toLowerCase().includes(term) ||
    product.categoria.toLowerCase().includes(term)
  )
}

/**
 * Obtiene productos por categoría
 * @param {string} category - Categoría a filtrar
 * @param {string} [tipoComercio] - Tipo de comercio
 * @returns {Promise<Array>} Lista de productos de la categoría
 */
export const getProductsByCategory = async (category, tipoComercio = null) => {
  const allProducts = await getProducts(tipoComercio, null, true)
  return allProducts.filter(product => product.categoria === category)
}

/**
 * Obtiene estadísticas de productos
 * @returns {Promise<Object>} Estadísticas
 */
export const getProductStats = async () => {
  const allProducts = await getProducts()
  
  const stats = {
    total: allProducts.length,
    tienda: allProducts.filter(p => {
      // Necesitamos verificar el tipo del comercio
      return p.comercioId // Se filtrará por tipo de comercio en el frontend
    }).length,
    restaurante: allProducts.filter(p => {
      // Se filtrará por tipo de comercio en el frontend
      return p.comercioId
    }).length,
    activos: allProducts.filter(p => p.isActive).length,
    publicados: allProducts.filter(p => p.isPublished).length,
    pendientes: allProducts.filter(p => p.status === 'pendiente').length,
    categorias: {}
  }

  // Contar por categorías
  allProducts.forEach(product => {
    const categoria = product.categoria
    stats.categorias[categoria] = (stats.categorias[categoria] || 0) + 1
  })

  return stats
}

/**
 * Aprueba un producto
 * @param {string} productId - ID del producto
 * @param {string} approvedBy - ID del admin que aprueba
 * @returns {Promise<void>}
 */
export const approveProduct = async (productId, approvedBy = null) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    await updateDoc(productRef, {
      isPublished: true,
      status: 'aprobado',
      approvedAt: new Date().toISOString(),
      approvedBy: approvedBy,
      updatedAt: new Date().toISOString()
    })
    console.log('Producto aprobado:', productId)
  } catch (error) {
    console.error('Error approving product:', error)
    throw new Error('Error al aprobar el producto')
  }
}

/**
 * Rechaza un producto
 * @param {string} productId - ID del producto
 * @param {string} rejectedBy - ID del admin que rechaza
 * @param {string} reason - Razón del rechazo
 * @returns {Promise<void>}
 */
export const rejectProduct = async (productId, reason, rejectedBy = null) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    await updateDoc(productRef, {
      isPublished: false,
      status: 'rechazado',
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectedBy,
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    })
    console.log('Producto rechazado:', productId, 'Razón:', reason)
  } catch (error) {
    console.error('Error rejecting product:', error)
    throw new Error('Error al rechazar el producto')
  }
}

/**
 * Obtiene productos de un comercio específico
 * @param {string} comercioId - ID del comercio
 * @returns {Promise<Array>} Lista de productos del comercio
 */
export const getProductsByComercio = async (comercioId) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('comercioId', '==', comercioId),
      where('isActive', '==', true)
    )

    const querySnapshot = await getDocs(q)
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Sort in JavaScript to avoid Firestore index requirements
    return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('Error fetching products by comercio:', error)
    throw new Error('Error al obtener productos del comercio')
  }
}

/**
 * Obtiene productos pendientes de aprobación
 * @returns {Promise<Array>} Lista de productos pendientes
 */
export const getPendingProducts = async () => {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('status', '==', 'pendiente'),
    where('isActive', '==', true)
  )

  const querySnapshot = await getDocs(q)
  const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
  // Sort in JavaScript to avoid Firestore index requirements
  return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * Genera un SKU único para un producto
 * @param {string} comercioId - ID del comercio
 * @param {string} categoria - Categoría del producto
 * @returns {Promise<string>} SKU generado
 */
export const generateSKU = async (comercioId, categoria) => {
  // Si no hay categoría, usar 'general'
  const categoriaFinal = categoria || 'general'
  
  try {
    // Obtener todos los productos del comercio (sin filtros complejos para evitar índices)
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('comercioId', '==', comercioId)
    )
    
    const querySnapshot = await getDocs(q)
    let lastNumber = '000'
    
    // Buscar el último SKU en JavaScript
    querySnapshot.docs.forEach(doc => {
      const product = doc.data()
      if (product.sku && product.categoria === categoriaFinal) {
        const skuParts = product.sku.split('-')
        if (skuParts.length >= 3) {
          const currentNumber = parseInt(skuParts[2])
          if (currentNumber > parseInt(lastNumber)) {
            lastNumber = skuParts[2]
          }
        }
      }
    })
    
    // Generar siguiente número
    const nextNumber = (parseInt(lastNumber) + 1).toString().padStart(3, '0')
    
    // Crear prefijos
    const comercioPrefix = comercioId.substring(0, 10).toUpperCase()
    const categoryPrefix = categoriaFinal.substring(0, 3).toUpperCase()
    
    return `${comercioPrefix}-${categoryPrefix}-${nextNumber}`
    
  } catch (error) {
    console.error('Error generating SKU:', error)
    // Fallback: usar timestamp
    const timestamp = Date.now().toString().slice(-6)
    const comercioPrefix = comercioId.substring(0, 10).toUpperCase()
    const categoryPrefix = categoriaFinal.substring(0, 3).toUpperCase()
    return `${comercioPrefix}-${categoryPrefix}-${timestamp}`
  }
}

/**
 * Genera un SKU para una variante de producto
 * @param {string} productSKU - SKU del producto principal
 * @param {string} variantName - Nombre de la variante
 * @returns {string} SKU de la variante
 */
export const generateVariantSKU = (productSKU, variantName) => {
  // Tomar las primeras 3 letras del nombre de la variante
  const variantPrefix = variantName.substring(0, 3).toUpperCase()
  return `${productSKU}-${variantPrefix}`
}


/**
 * Obtiene productos por estado
 * @param {string} status - Estado del producto
 * @returns {Promise<Array>} Lista de productos con el estado especificado
 */
export const getProductsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('status', '==', status),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Sort in JavaScript to avoid Firestore index requirements
    return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error(`Error fetching products by status ${status}:`, error)
    throw new Error(`Error al cargar los productos con estado ${status}`)
  }
}



