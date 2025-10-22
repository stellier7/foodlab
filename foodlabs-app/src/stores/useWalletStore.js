import { create } from 'zustand'
import { 
  getWalletBalance, 
  requestTopup, 
  getUserTransactions,
  getPendingTopups 
} from '../services/wallet'
import { getEscrowTotal, getAdminCommissions } from '../services/payment'
import { getRestaurantBalances, getPayoutStats } from '../services/payout'

export const useWalletStore = create((set, get) => ({
  // Estado del usuario
  balance: 0,
  currency: 'HNL',
  walletId: null,
  transactions: [],
  topupRequests: [],
  
  // Estado de admin
  adminStats: {
    escrowTotal: 0,
    adminCommissions: 0,
    restaurantBalances: [],
    payoutStats: null
  },
  
  // Estados de carga
  loading: {
    balance: false,
    transactions: false,
    topupRequests: false,
    adminStats: false
  },
  
  // Errores
  error: null,
  
  // Acciones del usuario
  fetchBalance: async (userId) => {
    set(state => ({ loading: { ...state.loading, balance: true } }))
    try {
      const wallet = await getWalletBalance(userId)
      if (wallet) {
        set({ 
          balance: wallet.balance, 
          currency: wallet.currency,
          walletId: wallet.id,
          error: null 
        })
      } else {
        set({ balance: 0, currency: 'HNL', walletId: null })
      }
    } catch (error) {
      set({ error: error.message })
    } finally {
      set(state => ({ loading: { ...state.loading, balance: false } }))
    }
  },
  
  fetchTransactions: async (userId, limit = 20) => {
    set(state => ({ loading: { ...state.loading, transactions: true } }))
    try {
      const transactions = await getUserTransactions(userId, limit)
      set({ transactions, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set(state => ({ loading: { ...state.loading, transactions: false } }))
    }
  },
  
  requestTopup: async (userId, amount, proofUrl = null) => {
    try {
      const topupRequest = await requestTopup(userId, amount, proofUrl)
      set({ error: null })
      return topupRequest
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  // Acciones de admin
  fetchAdminStats: async () => {
    set(state => ({ loading: { ...state.loading, adminStats: true } }))
    try {
      const [escrowTotal, adminCommissions, restaurantBalances, payoutStats] = await Promise.all([
        getEscrowTotal(),
        getAdminCommissions(),
        getRestaurantBalances(),
        getPayoutStats()
      ])
      
      set({ 
        adminStats: {
          escrowTotal,
          adminCommissions,
          restaurantBalances,
          payoutStats
        },
        error: null 
      })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set(state => ({ loading: { ...state.loading, adminStats: false } }))
    }
  },
  
  fetchPendingTopups: async () => {
    set(state => ({ loading: { ...state.loading, topupRequests: true } }))
    try {
      const topupRequests = await getPendingTopups()
      set({ topupRequests, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set(state => ({ loading: { ...state.loading, topupRequests: false } }))
    }
  },
  
  // Utilidades
  clearError: () => set({ error: null }),
  
  reset: () => set({
    balance: 0,
    currency: 'HNL',
    walletId: null,
    transactions: [],
    topupRequests: [],
    adminStats: {
      escrowTotal: 0,
      adminCommissions: 0,
      restaurantBalances: [],
      payoutStats: null
    },
    loading: {
      balance: false,
      transactions: false,
      topupRequests: false,
      adminStats: false
    },
    error: null
  })
}))
