import { db } from '../config/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore'

const NOTIFICATIONS_COLLECTION = 'notifications'

/**
 * Crea una notificación
 * @param {Object} notificationData - Datos de la notificación
 * @returns {Promise<string>} ID de la notificación creada
 */
export const createNotification = async (notificationData) => {
  const notificationRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    ...notificationData,
    createdAt: new Date().toISOString(),
    isRead: false
  })
  return notificationRef.id
}

/**
 * Notifica aprobación de producto
 * @param {string} businessId - ID del negocio
 * @param {string} productId - ID del producto
 * @param {string} productName - Nombre del producto
 * @returns {Promise<string>} ID de la notificación
 */
export const notifyProductApproved = async (businessId, productId, productName) => {
  return await createNotification({
    type: 'product_approved',
    businessId: businessId,
    productId: productId,
    title: 'Producto Aprobado',
    message: `Tu producto "${productName}" ha sido aprobado y ya está visible en la plataforma.`,
    priority: 'success'
  })
}

/**
 * Notifica rechazo de producto
 * @param {string} businessId - ID del negocio
 * @param {string} productId - ID del producto
 * @param {string} productName - Nombre del producto
 * @param {string} reason - Razón del rechazo
 * @returns {Promise<string>} ID de la notificación
 */
export const notifyProductRejected = async (businessId, productId, productName, reason) => {
  return await createNotification({
    type: 'product_rejected',
    businessId: businessId,
    productId: productId,
    title: 'Producto Rechazado',
    message: `Tu producto "${productName}" ha sido rechazado. Razón: ${reason}`,
    priority: 'error'
  })
}

/**
 * Obtiene notificaciones de un negocio
 * @param {string} businessId - ID del negocio
 * @returns {Promise<Array>} Lista de notificaciones
 */
export const getBusinessNotifications = async (businessId) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('businessId', '==', businessId),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Obtiene notificaciones no leídas de un negocio
 * @param {string} businessId - ID del negocio
 * @returns {Promise<Array>} Lista de notificaciones no leídas
 */
export const getUnreadNotifications = async (businessId) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('businessId', '==', businessId),
    where('isRead', '==', false),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Marca una notificación como leída
 * @param {string} notificationId - ID de la notificación
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
  await updateDoc(notificationRef, {
    isRead: true,
    readAt: new Date().toISOString()
  })
}

/**
 * Marca todas las notificaciones de un negocio como leídas
 * @param {string} businessId - ID del negocio
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async (businessId) => {
  const notifications = await getBusinessNotifications(businessId)
  const unreadNotifications = notifications.filter(n => !n.isRead)
  
  for (const notification of unreadNotifications) {
    await markNotificationAsRead(notification.id)
  }
}

/**
 * Obtiene el conteo de notificaciones no leídas
 * @param {string} businessId - ID del negocio
 * @returns {Promise<number>} Número de notificaciones no leídas
 */
export const getUnreadCount = async (businessId) => {
  const unreadNotifications = await getUnreadNotifications(businessId)
  return unreadNotifications.length
}
