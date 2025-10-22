import React, { useState, useEffect } from 'react'
import { useWalletStore } from '../stores/useWalletStore'
import { useAuthStore } from '../stores/useAuthStore'
import WalletCard from '../components/WalletCard'
import TopupModal from '../components/TopupModal'
import { PAYMENT_CONFIG } from '../config/payments'

const WalletPage = () => {
  const { user } = useAuthStore()
  const { 
    balance, 
    currency, 
    transactions, 
    loading, 
    error, 
    fetchBalance, 
    fetchTransactions 
  } = useWalletStore()
  
  const [showTopupModal, setShowTopupModal] = useState(false)
  const [activeTab, setActiveTab] = useState('transactions')
  
  useEffect(() => {
    if (user?.uid) {
      fetchBalance(user.uid)
      fetchTransactions(user.uid)
    }
  }, [user?.uid, fetchBalance, fetchTransactions])
  
  const currencyConfig = PAYMENT_CONFIG.currencies[currency] || PAYMENT_CONFIG.currencies.HNL
  
  const formatTransactionType = (type) => {
    const types = {
      'order': 'Pedido',
      'topup': 'Recarga',
      'payout': 'Liquidación',
      'refund': 'Reembolso',
      'commission': 'Comisión'
    }
    return types[type] || type
  }
  
  const formatTransactionAmount = (transaction) => {
    const isPositive = transaction.type === 'topup' || 
                      (transaction.type === 'order' && transaction.fromWalletId !== user?.uid)
    
    return `${isPositive ? '+' : '-'}${currencyConfig.symbol}${Math.abs(transaction.amount).toFixed(2)}`
  }
  
  const getTransactionColor = (transaction) => {
    if (transaction.type === 'topup') return 'text-green-600'
    if (transaction.type === 'refund') return 'text-blue-600'
    if (transaction.type === 'order') return 'text-orange-600'
    return 'text-gray-600'
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Wallet</h1>
          <p className="text-gray-600">Gestiona tu saldo y revisa tus transacciones</p>
        </div>
        
        {/* Wallet Card */}
        <div className="mb-8">
          <WalletCard onTopupClick={() => setShowTopupModal(true)} />
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Transacciones
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pedidos
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'transactions' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Historial de transacciones</h3>
                  <button
                    onClick={() => fetchTransactions(user.uid)}
                    disabled={loading.transactions}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {loading.transactions ? 'Cargando...' : 'Actualizar'}
                  </button>
                </div>
                
                {loading.transactions ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
                    <p className="text-gray-500">Tus transacciones aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'topup' ? 'bg-green-100' :
                            transaction.type === 'order' ? 'bg-orange-100' :
                            transaction.type === 'refund' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            <svg className={`w-5 h-5 ${
                              transaction.type === 'topup' ? 'text-green-600' :
                              transaction.type === 'order' ? 'text-orange-600' :
                              transaction.type === 'refund' ? 'text-blue-600' :
                              'text-gray-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {transaction.type === 'topup' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              ) : transaction.type === 'order' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatTransactionType(transaction.type)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.createdAt?.toDate?.() || transaction.createdAt).toLocaleDateString('es-HN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionColor(transaction)}`}>
                            {formatTransactionAmount(transaction)}
                          </p>
                          {transaction.commission > 0 && (
                            <p className="text-xs text-gray-500">
                              Comisión: {currencyConfig.symbol}{transaction.commission.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Historial de pedidos</h3>
                <p className="text-gray-500">Próximamente: verás aquí el historial de tus pedidos</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
      </div>
      
      {/* Topup Modal */}
      <TopupModal 
        isOpen={showTopupModal} 
        onClose={() => setShowTopupModal(false)} 
      />
    </div>
  )
}

export default WalletPage
