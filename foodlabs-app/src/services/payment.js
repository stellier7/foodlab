import { db } from '../config/firebase'
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { calculateOrderCommissions, calculatePayoutCommissions } from '../config/payments'
import { getOrCreateWallet, updateWalletBalance } from './wallet'

// Procesar un pedido (mover dinero a escrow)
export const processOrder = async (orderId, clientId, restaurantId, amount) => {
  try {
    // Obtener o crear wallets
    const clientWallet = await getOrCreateWallet(clientId, 'client')
    const restaurantWallet = await getOrCreateWallet(restaurantId, 'restaurant')
    const escrowWallet = await getOrCreateWallet('escrow', 'escrow')
    
    // Verificar saldo suficiente del cliente
    if (clientWallet.balance < amount) {
      throw new Error('Saldo insuficiente. Por favor recarga tu cuenta.')
    }
    
    // Calcular comisiones
    const commissions = calculateOrderCommissions(amount, restaurantId)
    
    // Actualizar balances
    const newClientBalance = clientWallet.balance - amount
    const newEscrowBalance = escrowWallet.balance + amount
    
    await updateWalletBalance(clientWallet.id, newClientBalance)
    await updateWalletBalance(escrowWallet.id, newEscrowBalance)
    
    // Registrar transacción de escrow
    const escrowTransaction = await addDoc(collection(db, 'transactions'), {
      type: 'order',
      fromWalletId: clientWallet.id,
      toWalletId: escrowWallet.id,
      amount,
      commission: 0, // La comisión se cobra al confirmar
      orderId,
      status: 'completed',
      metadata: {
        restaurantId,
        clientId,
        isEscrow: true
      },
      createdAt: serverTimestamp()
    })
    
    // Actualizar orden con estado de pago
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      paymentStatus: 'pending_restaurant',
      escrowTransactionId: escrowTransaction.id,
      updatedAt: serverTimestamp()
    })
    
    return {
      success: true,
      escrowTransactionId: escrowTransaction.id,
      clientNewBalance: newClientBalance
    }
  } catch (error) {
    console.error('Error processing order:', error)
    throw error
  }
}

// Confirmar orden (mover dinero de escrow a restaurante con comisiones)
export const confirmOrder = async (orderId) => {
  try {
    // Obtener datos de la orden
    const orderRef = doc(db, 'orders', orderId)
    const orderDoc = await getDoc(orderRef)
    
    if (!orderDoc.exists()) {
      throw new Error('Orden no encontrada')
    }
    
    const orderData = orderDoc.data()
    
    if (orderData.paymentStatus !== 'pending_restaurant') {
      throw new Error('La orden no está en estado pendiente de confirmación')
    }
    
    // Obtener wallets
    const restaurantWallet = await getOrCreateWallet(orderData.restaurantId, 'restaurant')
    const escrowWallet = await getOrCreateWallet('escrow', 'escrow')
    const adminWallet = await getOrCreateWallet('foodlabs', 'admin')
    
    const amount = orderData.total
    
    // Calcular comisiones
    const commissions = calculateOrderCommissions(amount, orderData.restaurantId)
    
    // Actualizar balances
    const newEscrowBalance = escrowWallet.balance - amount
    const newRestaurantBalance = restaurantWallet.balance + commissions.netAmount
    const newAdminBalance = adminWallet.balance + commissions.orderCommission
    
    await updateWalletBalance(escrowWallet.id, newEscrowBalance)
    await updateWalletBalance(restaurantWallet.id, newRestaurantBalance)
    await updateWalletBalance(adminWallet.id, newAdminBalance)
    
    // Registrar transacción final
    const finalTransaction = await addDoc(collection(db, 'transactions'), {
      type: 'order',
      fromWalletId: escrowWallet.id,
      toWalletId: restaurantWallet.id,
      amount: commissions.netAmount,
      commission: commissions.orderCommission,
      orderId,
      status: 'completed',
      metadata: {
        restaurantId: orderData.restaurantId,
        clientId: orderData.clientId,
        isFinal: true,
        commissionRate: commissions.commissionRate
      },
      createdAt: serverTimestamp()
    })
    
    // Registrar comisión como transacción separada
    await addDoc(collection(db, 'transactions'), {
      type: 'commission',
      fromWalletId: escrowWallet.id,
      toWalletId: adminWallet.id,
      amount: commissions.orderCommission,
      commission: 0,
      orderId,
      status: 'completed',
      metadata: {
        commissionType: 'order',
        restaurantId: orderData.restaurantId
      },
      createdAt: serverTimestamp()
    })
    
    // Actualizar orden
    await updateDoc(orderRef, {
      paymentStatus: 'confirmed',
      finalTransactionId: finalTransaction.id,
      updatedAt: serverTimestamp()
    })
    
    return {
      success: true,
      finalTransactionId: finalTransaction.id,
      restaurantNewBalance: newRestaurantBalance,
      commissionAmount: commissions.orderCommission
    }
  } catch (error) {
    console.error('Error confirming order:', error)
    throw error
  }
}

// Cancelar orden (devolver dinero de escrow a cliente)
export const cancelOrder = async (orderId, reason = '') => {
  try {
    // Obtener datos de la orden
    const orderRef = doc(db, 'orders', orderId)
    const orderDoc = await getDoc(orderRef)
    
    if (!orderDoc.exists()) {
      throw new Error('Orden no encontrada')
    }
    
    const orderData = orderDoc.data()
    
    if (!['pending_restaurant', 'pending_payment'].includes(orderData.paymentStatus)) {
      throw new Error('La orden no puede ser cancelada en este estado')
    }
    
    // Obtener wallets
    const clientWallet = await getOrCreateWallet(orderData.clientId, 'client')
    const escrowWallet = await getOrCreateWallet('escrow', 'escrow')
    
    const amount = orderData.total
    
    // Devolver dinero
    const newEscrowBalance = escrowWallet.balance - amount
    const newClientBalance = clientWallet.balance + amount
    
    await updateWalletBalance(escrowWallet.id, newEscrowBalance)
    await updateWalletBalance(clientWallet.id, newClientBalance)
    
    // Registrar transacción de refund
    const refundTransaction = await addDoc(collection(db, 'transactions'), {
      type: 'refund',
      fromWalletId: escrowWallet.id,
      toWalletId: clientWallet.id,
      amount,
      commission: 0,
      orderId,
      status: 'completed',
      metadata: {
        reason,
        cancelledBy: 'system'
      },
      createdAt: serverTimestamp()
    })
    
    // Actualizar orden
    await updateDoc(orderRef, {
      paymentStatus: 'cancelled',
      finalTransactionId: refundTransaction.id,
      cancellationReason: reason,
      updatedAt: serverTimestamp()
    })
    
    return {
      success: true,
      refundTransactionId: refundTransaction.id,
      clientNewBalance: newClientBalance
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    throw error
  }
}

// Obtener total en escrow (para dashboard admin)
export const getEscrowTotal = async () => {
  try {
    const escrowWallet = await getOrCreateWallet('escrow', 'escrow')
    return escrowWallet.balance
  } catch (error) {
    console.error('Error getting escrow total:', error)
    throw error
  }
}

// Obtener comisiones acumuladas de FoodLabs
export const getAdminCommissions = async () => {
  try {
    const adminWallet = await getOrCreateWallet('foodlabs', 'admin')
    return adminWallet.balance
  } catch (error) {
    console.error('Error getting admin commissions:', error)
    throw error
  }
}
