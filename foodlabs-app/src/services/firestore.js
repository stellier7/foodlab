// Firestore service for FoodLab
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Collections
export const COLLECTIONS = {
  ORDERS: 'orders',
  INVENTORY: 'inventory',
  USERS: 'users',
  BUSINESSES: 'businesses',
  PRODUCTS: 'products'
}

// ========================================
// ORDERS SERVICE
// ========================================

export const ordersService = {
  // Get all orders with real-time updates
  subscribeToOrders: (callback, filters = {}) => {
    let q = collection(db, COLLECTIONS.ORDERS)
    
    // Apply filters
    if (filters.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status))
    }
    
    if (filters.business && filters.business !== 'all') {
      q = query(q, where('business.id', '==', filters.business))
    }
    
    if (filters.date) {
      const now = new Date()
      let startDate
      
      switch (filters.date) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = null
      }
      
      if (startDate) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(startDate)))
      }
    }
    
    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }))
      callback(orders)
    })
  },

  // Get single order
  getOrder: async (orderId) => {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }
    }
    return null
  },

  // Create new order
  createOrder: async (orderData) => {
    const orderRef = collection(db, COLLECTIONS.ORDERS)
    const orderWithTimestamp = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(orderRef, orderWithTimestamp)
    return docRef.id
  },

  // Update order
  updateOrder: async (orderId, updates) => {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(orderRef, updatesWithTimestamp)
  },

  // Delete order
  deleteOrder: async (orderId) => {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId)
    await deleteDoc(orderRef)
  },

  // Get orders by business
  getOrdersByBusiness: async (businessId) => {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('business.id', '==', businessId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }))
  },

  // Get orders by status
  getOrdersByStatus: async (status) => {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }))
  }
}

// ========================================
// INVENTORY SERVICE
// ========================================

export const inventoryService = {
  // Get all inventory items
  getInventory: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.INVENTORY))
    const inventory = {}
    
    snapshot.docs.forEach(doc => {
      inventory[doc.id] = doc.data()
    })
    
    return inventory
  },

  // Subscribe to inventory changes
  subscribeToInventory: (callback) => {
    return onSnapshot(collection(db, COLLECTIONS.INVENTORY), (snapshot) => {
      const inventory = {}
      snapshot.docs.forEach(doc => {
        inventory[doc.id] = doc.data()
      })
      callback(inventory)
    })
  },

  // Update product stock
  updateStock: async (productId, stockData) => {
    const productRef = doc(db, COLLECTIONS.INVENTORY, productId)
    await updateDoc(productRef, {
      ...stockData,
      updatedAt: serverTimestamp()
    })
  },

  // Decrease stock (for orders)
  decreaseStock: async (productId, quantity) => {
    const productRef = doc(db, COLLECTIONS.INVENTORY, productId)
    
    return runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef)
      
      if (!productDoc.exists()) {
        throw new Error('Product not found')
      }
      
      const currentStock = productDoc.data().stock || 0
      const newStock = Math.max(0, currentStock - quantity)
      
      if (newStock < 0) {
        throw new Error('Insufficient stock')
      }
      
      transaction.update(productRef, {
        stock: newStock,
        sold: (productDoc.data().sold || 0) + quantity,
        updatedAt: serverTimestamp()
      })
      
      return newStock
    })
  },

  // Increase stock (for returns)
  increaseStock: async (productId, quantity) => {
    const productRef = doc(db, COLLECTIONS.INVENTORY, productId)
    
    return runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef)
      
      if (!productDoc.exists()) {
        throw new Error('Product not found')
      }
      
      const currentStock = productDoc.data().stock || 0
      const newStock = currentStock + quantity
      
      transaction.update(productRef, {
        stock: newStock,
        sold: Math.max(0, (productDoc.data().sold || 0) - quantity),
        updatedAt: serverTimestamp()
      })
      
      return newStock
    })
  }
}

// ========================================
// USERS SERVICE
// ========================================

export const usersService = {
  // Get user by ID
  getUser: async (userId) => {
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data()
      }
    }
    return null
  },

  // Create or update user
  createOrUpdateUser: async (userId, userData) => {
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    const userWithTimestamp = {
      ...userData,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(userRef, userWithTimestamp)
  },

  // Get users by role
  getUsersByRole: async (role) => {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', '==', role)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }
}

// ========================================
// BUSINESSES SERVICE
// ========================================

export const businessesService = {
  // Get all businesses
  getBusinesses: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.BUSINESSES))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  },

  // Get business by ID
  getBusiness: async (businessId) => {
    const businessRef = doc(db, COLLECTIONS.BUSINESSES, businessId)
    const businessSnap = await getDoc(businessRef)
    
    if (businessSnap.exists()) {
      return {
        id: businessSnap.id,
        ...businessSnap.data()
      }
    }
    return null
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const firestoreUtils = {
  // Convert Firestore timestamp to ISO string
  timestampToISO: (timestamp) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toISOString()
    }
    return new Date().toISOString()
  },

  // Convert ISO string to Firestore timestamp
  isoToTimestamp: (isoString) => {
    return Timestamp.fromDate(new Date(isoString))
  },

  // Batch operations
  batchUpdate: async (operations) => {
    const batch = writeBatch(db)
    
    operations.forEach(operation => {
      const { type, ref, data } = operation
      
      switch (type) {
        case 'set':
          batch.set(ref, data)
          break
        case 'update':
          batch.update(ref, data)
          break
        case 'delete':
          batch.delete(ref)
          break
      }
    })
    
    await batch.commit()
  }
}
