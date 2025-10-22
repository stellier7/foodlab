import React, { useEffect } from 'react'
import { useWalletStore } from '../stores/useWalletStore'
import { useAuthStore } from '../stores/useAuthStore'
import { PAYMENT_CONFIG } from '../config/payments'

const WalletCard = ({ onTopupClick }) => {
  const { user } = useAuthStore()
  const { balance, currency, loading, error, fetchBalance } = useWalletStore()
  
  useEffect(() => {
    if (user?.uid) {
      fetchBalance(user.uid)
    }
  }, [user?.uid, fetchBalance])
  
  const currencyConfig = PAYMENT_CONFIG.currencies[currency] || PAYMENT_CONFIG.currencies.HNL
  
  if (loading.balance) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Saldo disponible</h3>
          <p className="text-blue-100 text-sm">Tu wallet de FoodLabs</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {currencyConfig.symbol}{balance.toFixed(2)}
          </div>
          <div className="text-blue-100 text-sm">
            {currencyConfig.name}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <button
        onClick={onTopupClick}
        className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Recargar saldo
      </button>
      
      <div className="mt-4 text-xs text-blue-100">
        <p>• Recarga vía transferencia bancaria</p>
        <p>• Aprobación manual en 24h</p>
        <p>• Sin comisiones de recarga</p>
      </div>
    </div>
  )
}

export default WalletCard
