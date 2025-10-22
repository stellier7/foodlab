import { db } from '../firebase'
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
  orderBy 
} from 'firebase/firestore'

const PRODUCTS_COLLECTION = 'products'

/**
 * Crea un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise<string>} ID del producto creado
 */
export const createProduct = async (productData) => {
  const productRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
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
 * @param {string} [businessType] - Filtrar por tipo de negocio ('shop' o 'restaurant')
 * @param {string} [businessId] - Filtrar por ID de negocio específico
 * @returns {Promise<Array>} Lista de productos
 */
export const getProducts = async (businessType = null, businessId = null) => {
  let q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  )

  if (businessType) {
    q = query(q, where('businessType', '==', businessType))
  }

  if (businessId) {
    q = query(q, where('businessId', '==', businessId))
  }

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Obtiene productos de shop
 * @returns {Promise<Array>} Lista de productos de shop
 */
export const getShopProducts = async () => {
  return await getProducts('shop')
}

/**
 * Obtiene productos de restaurantes
 * @returns {Promise<Array>} Lista de productos de restaurantes
 */
export const getRestaurantProducts = async () => {
  return await getProducts('restaurant')
}

/**
 * Busca productos por nombre
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} [businessType] - Filtrar por tipo de negocio
 * @returns {Promise<Array>} Lista de productos que coinciden
 */
export const searchProducts = async (searchTerm, businessType = null) => {
  const allProducts = await getProducts(businessType)
  const term = searchTerm.toLowerCase()
  
  return allProducts.filter(product => 
    product.name.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.category.toLowerCase().includes(term)
  )
}

/**
 * Obtiene productos por categoría
 * @param {string} category - Categoría a filtrar
 * @param {string} [businessType] - Tipo de negocio
 * @returns {Promise<Array>} Lista de productos de la categoría
 */
export const getProductsByCategory = async (category, businessType = null) => {
  const allProducts = await getProducts(businessType)
  return allProducts.filter(product => product.category === category)
}

/**
 * Obtiene estadísticas de productos
 * @returns {Promise<Object>} Estadísticas
 */
export const getProductStats = async () => {
  const allProducts = await getProducts()
  
  const stats = {
    total: allProducts.length,
    shop: allProducts.filter(p => p.businessType === 'shop').length,
    restaurant: allProducts.filter(p => p.businessType === 'restaurant').length,
    active: allProducts.filter(p => p.isActive).length,
    categories: {}
  }

  // Contar por categorías
  allProducts.forEach(product => {
    const category = product.category
    stats.categories[category] = (stats.categories[category] || 0) + 1
  })

  return stats
}
