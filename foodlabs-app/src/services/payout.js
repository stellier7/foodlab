import { db } from '../config/firebase'
import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { calculatePayoutCommissions } from '../config/payments'
import { getWalletBalance, updateWalletBalance } from './wallet'

// Obtener balances de restaurantes con saldo > 0
export const getRestaurantBalances = async () => {
  try {
    const walletsQuery = query(
      collection(db, 'wallets'),
      where('userType', '==', 'restaurant'),
      where('balance', '>', 0)
    )
    
    const querySnapshot = await getDocs(walletsQuery)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting restaurant balances:', error)
    throw error
  }
}

// Generar CSV de payouts
export const generatePayoutCSV = async (restaurantBalances) => {
  try {
    const csvData = []
    
    // Headers
    csvData.push(['ID Restaurante', 'Nombre', 'Monto Original (L)', 'Comisión Payout (15%)', 'Monto Final (L)', 'Fecha'])
    
    const currentDate = new Date().toLocaleDateString('es-HN')
    
    for (const restaurant of restaurantBalances) {
      const commissions = calculatePayoutCommissions(restaurant.balance, restaurant.userId)
      
      csvData.push([
        restaurant.userId,
        restaurant.name || 'Restaurante',
        restaurant.balance.toFixed(2),
        commissions.payoutCommission.toFixed(2),
        commissions.finalAmount.toFixed(2),
        currentDate
      ])
    }
    
    // Convertir a CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n')
    
    return {
      csvString,
      totalRestaurants: restaurantBalances.length,
      totalAmount: restaurantBalances.reduce((sum, r) => sum + r.balance, 0),
      totalCommissions: restaurantBalances.reduce((sum, r) => {
        const commissions = calculatePayoutCommissions(r.balance, r.userId)
        return sum + commissions.payoutCommission
      }, 0)
    }
  } catch (error) {
    console.error('Error generating payout CSV:', error)
    throw error
  }
}

// Ejecutar payout individual (marcar como pagado y resetear balance)
export const executePayout = async (restaurantId, adminId) => {
  try {
    const restaurantWallet = await getWalletBalance(restaurantId)
    
    if (!restaurantWallet || restaurantWallet.balance <= 0) {
      throw new Error('El restaurante no tiene saldo para liquidar')
    }
    
    const adminWallet = await getWalletBalance('foodlabs')
    const originalAmount = restaurantWallet.balance
    
    // Calcular comisiones de payout
    const commissions = calculatePayoutCommissions(originalAmount, restaurantId)
    
    // Actualizar balances
    const newAdminBalance = adminWallet.balance + commissions.payoutCommission
    await updateWalletBalance(adminWallet.id, newAdminBalance)
    await updateWalletBalance(restaurantWallet.id, 0) // Resetear balance del restaurante
    
    // Registrar transacción de payout
    const payoutTransaction = await addDoc(collection(db, 'transactions'), {
      type: 'payout',
      fromWalletId: restaurantWallet.id,
      toWalletId: adminWallet.id,
      amount: commissions.payoutCommission,
      commission: 0,
      orderId: null,
      status: 'completed',
      metadata: {
        restaurantId,
        originalAmount,
        finalAmount: commissions.finalAmount,
        commissionRate: commissions.commissionRate,
        executedBy: adminId
      },
      createdAt: serverTimestamp()
    })
    
    // Registrar payout como transacción separada
    await addDoc(collection(db, 'transactions'), {
      type: 'payout',
      fromWalletId: restaurantWallet.id,
      toWalletId: null, // Dinero sale del sistema
      amount: commissions.finalAmount,
      commission: 0,
      orderId: null,
      status: 'completed',
      metadata: {
        restaurantId,
        payoutType: 'bank_transfer',
        executedBy: adminId
      },
      createdAt: serverTimestamp()
    })
    
    return {
      success: true,
      payoutTransactionId: payoutTransaction.id,
      originalAmount,
      commissionAmount: commissions.payoutCommission,
      finalAmount: commissions.finalAmount
    }
  } catch (error) {
    console.error('Error executing payout:', error)
    throw error
  }
}

// Ejecutar payouts masivos
export const executeBulkPayouts = async (restaurantIds, adminId) => {
  try {
    const results = []
    
    for (const restaurantId of restaurantIds) {
      try {
        const result = await executePayout(restaurantId, adminId)
        results.push({ restaurantId, success: true, ...result })
      } catch (error) {
        results.push({ 
          restaurantId, 
          success: false, 
          error: error.message 
        })
      }
    }
    
    return results
  } catch (error) {
    console.error('Error executing bulk payouts:', error)
    throw error
  }
}

// Obtener historial de payouts
export const getPayoutHistory = async (limit = 50) => {
  try {
    const payoutsQuery = query(
      collection(db, 'transactions'),
      where('type', '==', 'payout'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(payoutsQuery)
    return querySnapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting payout history:', error)
    throw error
  }
}

// Obtener estadísticas de payouts
export const getPayoutStats = async () => {
  try {
    const restaurantBalances = await getRestaurantBalances()
    const totalPending = restaurantBalances.reduce((sum, r) => sum + r.balance, 0)
    
    const totalCommissions = restaurantBalances.reduce((sum, r) => {
      const commissions = calculatePayoutCommissions(r.balance, r.userId)
      return sum + commissions.payoutCommission
    }, 0)
    
    const totalFinal = restaurantBalances.reduce((sum, r) => {
      const commissions = calculatePayoutCommissions(r.balance, r.userId)
      return sum + commissions.finalAmount
    }, 0)
    
    return {
      totalRestaurants: restaurantBalances.length,
      totalPending,
      totalCommissions,
      totalFinal,
      averagePayout: restaurantBalances.length > 0 ? totalPending / restaurantBalances.length : 0
    }
  } catch (error) {
    console.error('Error getting payout stats:', error)
    throw error
  }
}
