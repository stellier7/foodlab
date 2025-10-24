// Servicio para gestión de comercios
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

const COMERCIOS_COLLECTION = 'comercios'

/**
 * Generate slug from name
 */
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '') // Remove leading/trailing -
}

/**
 * Check if slug is available for a business type
 */
export const isSlugAvailable = async (slug, tipo, excludeId = null) => {
  const q = query(
    collection(db, COMERCIOS_COLLECTION),
    where('slug', '==', slug),
    where('tipo', '==', tipo)
  )
  const snapshot = await getDocs(q)
  
  if (excludeId) {
    return snapshot.docs.every(doc => doc.id === excludeId)
  }
  return snapshot.empty
}

/**
 * Generate unique slug
 */
export const generateUniqueSlug = async (name, tipo, location = null, excludeId = null) => {
  let baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1
  
  // Try base slug
  if (await isSlugAvailable(slug, tipo, excludeId)) {
    return slug
  }
  
  // Try with location suffix
  if (location?.city) {
    const citySlug = generateSlug(location.city)
    slug = `${baseSlug}-${citySlug}`
    if (await isSlugAvailable(slug, tipo, excludeId)) {
      return slug
    }
  }
  
  // Try with numbers
  while (counter < 100) {
    slug = `${baseSlug}${counter}`
    if (await isSlugAvailable(slug, tipo, excludeId)) {
      return slug
    }
    counter++
  }
  
  // Fallback to ID-based slug
  return `${baseSlug}-${Date.now()}`
}

/**
 * Get comercio by slug
 */
export const getComercioBySlug = async (slug, tipo) => {
  const q = query(
    collection(db, COMERCIOS_COLLECTION),
    where('slug', '==', slug),
    where('tipo', '==', tipo),
    limit(1)
  )
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) return null
  
  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() }
}

/**
 * Obtiene todos los comercios con filtros opcionales
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de comercios
 */
export const getComercios = async (filtros = {}) => {
  try {
    // TEMPORARY: Simple query without complex filters to avoid index issues
    let q = query(collection(db, COMERCIOS_COLLECTION))

    // Apply simple filters
    if (filtros.tipo) {
      q = query(q, where('tipo', '==', filtros.tipo))
    }
    
    if (filtros.estado) {
      q = query(q, where('estado', '==', filtros.estado))
    }

    const querySnapshot = await getDocs(q)
    const comercios = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }))
    
    // Sort in JavaScript to avoid Firestore index requirements
    return comercios.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt || 0)
      const dateB = new Date(b.createdAt || b.updatedAt || 0)
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error fetching comercios:', error)
    throw new Error('Error al cargar los comercios')
  }
}

/**
 * Obtiene un comercio por ID
 * @param {string} comercioId - ID del comercio
 * @returns {Promise<Object|null>} Datos del comercio o null si no existe
 */
export const getComercio = async (comercioId) => {
  try {
    const comercioRef = doc(db, COMERCIOS_COLLECTION, comercioId)
    const comercioSnap = await getDoc(comercioRef)
    
    if (comercioSnap.exists()) {
      return { id: comercioSnap.id, ...comercioSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching comercio:', error)
    throw new Error('Error al cargar el comercio')
  }
}

/**
 * Crea un nuevo comercio
 * @param {Object} comercioData - Datos del comercio
 * @returns {Promise<string>} ID del comercio creado
 */
export const createComercio = async (comercioData) => {
  try {
    // Generate unique slug
    const slug = await generateUniqueSlug(
      comercioData.nombre, 
      comercioData.tipo, 
      comercioData.location
    )
    
    const comercioRef = await addDoc(collection(db, COMERCIOS_COLLECTION), {
      ...comercioData,
      slug,
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return comercioRef.id
  } catch (error) {
    console.error('Error creating comercio:', error)
    throw new Error('Error al crear el comercio')
  }
}

/**
 * Actualiza un comercio existente
 * @param {string} comercioId - ID del comercio
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateComercio = async (comercioId, updateData) => {
  try {
    // If name or type changed, regenerate slug
    let updatedData = { ...updateData }
    if (updateData.nombre || updateData.tipo) {
      // Get current comercio data to merge with updates
      const comercioDoc = await getDoc(doc(db, COMERCIOS_COLLECTION, comercioId))
      const currentData = comercioDoc.data()
      
      const finalData = { ...currentData, ...updateData }
      const newSlug = await generateUniqueSlug(
        finalData.nombre, 
        finalData.tipo, 
        finalData.location,
        comercioId // Exclude current comercio from slug availability check
      )
      
      updatedData.slug = newSlug
    }
    
    const comercioRef = doc(db, COMERCIOS_COLLECTION, comercioId)
    await updateDoc(comercioRef, {
      ...updatedData,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating comercio:', error)
    throw new Error('Error al actualizar el comercio')
  }
}

/**
 * Elimina un comercio completamente y todos sus productos asociados
 * @param {string} comercioId - ID del comercio
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteComercio = async (comercioId) => {
  try {
    // Eliminar comercio
    await deleteDoc(doc(db, COMERCIOS_COLLECTION, comercioId))
    
    // Eliminar productos asociados
    const productsQuery = query(
      collection(db, 'products'),
      where('comercioId', '==', comercioId)
    )
    const productsSnapshot = await getDocs(productsQuery)
    const deletePromises = productsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    console.log(`Comercio ${comercioId} y ${productsSnapshot.docs.length} productos eliminados`)
    return { success: true, deletedProducts: productsSnapshot.docs.length }
  } catch (error) {
    console.error('Error deleting comercio:', error)
    throw new Error('Error al eliminar el comercio')
  }
}

/**
 * Obtiene un comercio específico por ID
 * @param {string} comercioId - ID del comercio
 * @returns {Promise<Object|null>} Datos del comercio o null si no existe
 */
export const getComercioById = async (comercioId) => {
  try {
    const comercioRef = doc(db, COMERCIOS_COLLECTION, comercioId)
    const comercioSnap = await getDoc(comercioRef)
    
    if (!comercioSnap.exists()) {
      console.log('Comercio no encontrado:', comercioId)
      return null
    }
    
    const comercioData = {
      id: comercioSnap.id,
      ...comercioSnap.data()
    }
    
    console.log('Comercio cargado:', comercioData)
    return comercioData
  } catch (error) {
    console.error('Error getting comercio:', error)
    throw new Error('Error al obtener el comercio')
  }
}

/**
 * Obtiene comercios por tipo
 * @param {string} tipo - Tipo de comercio ('restaurante' o 'tienda')
 * @returns {Promise<Array>} Lista de comercios del tipo especificado
 */
export const getComerciosPorTipo = async (tipo) => {
  return await getComercios({ tipo })
}

/**
 * Obtiene comercios activos
 * @returns {Promise<Array>} Lista de comercios activos
 */
export const getComerciosActivos = async () => {
  return await getComercios({ estado: 'activo' })
}

/**
 * Obtiene comercios por ciudad
 * @param {string} ciudad - Nombre de la ciudad
 * @returns {Promise<Array>} Lista de comercios en la ciudad
 */
export const getComerciosPorCiudad = async (ciudad) => {
  return await getComercios({ ciudad })
}

/**
 * Obtiene comercios de un propietario
 * @param {string} ownerId - ID del propietario
 * @returns {Promise<Array>} Lista de comercios del propietario
 */
export const getComerciosPorPropietario = async (ownerId) => {
  try {
    const q = query(
      collection(db, COMERCIOS_COLLECTION),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }))
  } catch (error) {
    console.error('Error fetching comercios by owner:', error)
    throw new Error('Error al cargar los comercios del propietario')
  }
}

/**
 * Busca comercios por nombre
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Lista de comercios que coinciden
 */
export const buscarComercios = async (termino) => {
  try {
    const todosComercios = await getComercios()
    const terminoLower = termino.toLowerCase()
    
    return todosComercios.filter(comercio => 
      comercio.nombre.toLowerCase().includes(terminoLower) ||
      comercio.categoria.toLowerCase().includes(terminoLower) ||
      comercio.direccion.ciudad.toLowerCase().includes(terminoLower)
    )
  } catch (error) {
    console.error('Error searching comercios:', error)
    throw new Error('Error al buscar comercios')
  }
}

/**
 * Obtiene estadísticas de comercios
 * @returns {Promise<Object>} Estadísticas de comercios
 */
export const getEstadisticasComercios = async () => {
  try {
    const todosComercios = await getComercios()
    
    const stats = {
      total: todosComercios.length,
      activos: todosComercios.filter(c => c.estado === 'activo').length,
      pendientes: todosComercios.filter(c => c.estado === 'pendiente').length,
      inactivos: todosComercios.filter(c => c.estado === 'inactivo').length,
      restaurantes: todosComercios.filter(c => c.tipo === 'restaurante').length,
      tiendas: todosComercios.filter(c => c.tipo === 'tienda').length,
      porTier: {
        local: todosComercios.filter(c => c.tier === 'local').length,
        premium: todosComercios.filter(c => c.tier === 'premium').length,
        enterprise: todosComercios.filter(c => c.tier === 'enterprise').length
      }
    }

    return stats
  } catch (error) {
    console.error('Error getting comercios stats:', error)
    throw new Error('Error al obtener estadísticas de comercios')
  }
}

/**
 * Obtiene un comercio específico con sus productos
 * @param {string} comercioId - ID del comercio
 * @returns {Promise<Object>} Comercio con sus productos
 */
export const getComercioWithProducts = async (comercioId) => {
  try {
    const comercio = await getComercio(comercioId)
    if (!comercio) {
      return null
    }

    // Importar servicio de productos dinámicamente para evitar dependencias circulares
    const { getProductsByComercio } = await import('./products')
    const productos = await getProductsByComercio(comercioId)
    
    return {
      ...comercio,
      productos
    }
  } catch (error) {
    console.error('Error fetching comercio with products:', error)
    throw error
  }
}

/**
 * Obtiene solo comercios activos, opcionalmente filtrados por tipo
 * @param {string} tipo - Tipo de comercio ('restaurante' o 'tienda')
 * @returns {Promise<Array>} Lista de comercios activos
 */
export const getActiveComercios = async (tipo = null) => {
  try {
    const filtros = { estado: 'activo' }
    if (tipo) {
      filtros.tipo = tipo
    }
    
    return await getComercios(filtros)
  } catch (error) {
    console.error('Error fetching active comercios:', error)
    throw error
  }
}
