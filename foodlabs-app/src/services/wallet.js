import { db } from '../config/firebase'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'

// Crear una nueva wallet
export const createWallet = async (userId, userType, currency = 'HNL') => {
  try {
    const walletData = {
      userId,
      userType, // 'client' | 'restaurant' | 'admin' | 'escrow'
      balance: 0,
      currency,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(collection(db, 'wallets'), walletData)
    return { id: docRef.id, ...walletData }
  } catch (error) {
    console.error('Error creating wallet:', error)
    throw error
  }
}

// Obtener balance de una wallet
export const getWalletBalance = async (userId) => {
  try {
    const walletsQuery = query(
      collection(db, 'wallets'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(walletsQuery)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const wallet = querySnapshot.docs[0].data()
    return {
      id: querySnapshot.docs[0].id,
      ...wallet
    }
  } catch (error) {
    console.error('Error getting wallet balance:', error)
    throw error
  }
}

// Crear o obtener wallet (si no existe, la crea)
export const getOrCreateWallet = async (userId, userType, currency = 'HNL') => {
  try {
    let wallet = await getWalletBalance(userId)
    
    if (!wallet) {
      wallet = await createWallet(userId, userType, currency)
    }
    
    return wallet
  } catch (error) {
    console.error('Error getting or creating wallet:', error)
    throw error
  }
}

// Actualizar balance de una wallet
export const updateWalletBalance = async (walletId, newBalance) => {
  try {
    const walletRef = doc(db, 'wallets', walletId)
    await updateDoc(walletRef, {
      balance: newBalance,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('Error updating wallet balance:', error)
    throw error
  }
}

// Solicitar recarga de saldo
export const requestTopup = async (userId, amount, proofUrl = null) => {
  try {
    const topupData = {
      userId,
      amount,
      currency: 'HNL', // Por defecto HNL, se puede hacer configurable
      status: 'pending',
      proofUrl,
      requestedAt: serverTimestamp(),
      approvedBy: null,
      approvedAt: null
    }
    
    const docRef = await addDoc(collection(db, 'topup_requests'), topupData)
    return { id: docRef.id, ...topupData }
  } catch (error) {
    console.error('Error requesting topup:', error)
    throw error
  }
}

// Aprobar recarga de saldo (solo admins)
export const approveTopup = async (topupId, adminId) => {
  try {
    const topupRef = doc(db, 'topup_requests', topupId)
    await updateDoc(topupRef, {
      status: 'approved',
      approvedBy: adminId,
      approvedAt: serverTimestamp()
    })
    
    // Obtener datos de la recarga
    const topupDoc = await getDoc(topupRef)
    const topupData = topupDoc.data()
    
    // Obtener o crear wallet del usuario
    const wallet = await getOrCreateWallet(topupData.userId, 'client')
    
    // Actualizar balance
    const newBalance = wallet.balance + topupData.amount
    await updateWalletBalance(wallet.id, newBalance)
    
    // Registrar transacción
    await addDoc(collection(db, 'transactions'), {
      type: 'topup',
      fromWalletId: null,
      toWalletId: wallet.id,
      amount: topupData.amount,
      commission: 0,
      orderId: null,
      status: 'completed',
      metadata: {
        topupId,
        approvedBy: adminId
      },
      createdAt: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Error approving topup:', error)
    throw error
  }
}

// Rechazar recarga de saldo (solo admins)
export const rejectTopup = async (topupId, adminId, reason = '') => {
  try {
    const topupRef = doc(db, 'topup_requests', topupId)
    await updateDoc(topupRef, {
      status: 'rejected',
      approvedBy: adminId,
      approvedAt: serverTimestamp(),
      rejectionReason: reason
    })
    
    return true
  } catch (error) {
    console.error('Error rejecting topup:', error)
    throw error
  }
}

// Obtener todas las recargas pendientes (solo admins)
export const getPendingTopups = async () => {
  try {
    const topupsQuery = query(
      collection(db, 'topup_requests'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(topupsQuery)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting pending topups:', error)
    throw error
  }
}

// Obtener historial de transacciones de un usuario
export const getUserTransactions = async (userId, limit = 20) => {
  try {
    // Obtener wallet del usuario
    const wallet = await getWalletBalance(userId)
    if (!wallet) return []
    
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('toWalletId', '==', wallet.id),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(transactionsQuery)
    return querySnapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting user transactions:', error)
    throw error
  }
}
