import React, { useState, useEffect } from 'react'
import { useWalletStore } from '../stores/useWalletStore'
import { useAuthStore } from '../stores/useAuthStore'
import { approveTopup, rejectTopup } from '../services/wallet'
import { generatePayoutCSV, executePayout, executeBulkPayouts } from '../services/payout'
import { PAYMENT_CONFIG } from '../config/payments'

const AdminWalletPage = () => {
  const { user } = useAuthStore()
  const { 
    adminStats, 
    topupRequests, 
    loading, 
    error, 
    fetchAdminStats, 
    fetchPendingTopups,
    clearError 
  } = useWalletStore()
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedRestaurants, setSelectedRestaurants] = useState([])
  const [isProcessingPayouts, setIsProcessingPayouts] = useState(false)
  const [payoutResults, setPayoutResults] = useState(null)
  
  useEffect(() => {
    fetchAdminStats()
    fetchPendingTopups()
  }, [fetchAdminStats, fetchPendingTopups])
  
  const handleApproveTopup = async (topupId) => {
    try {
      await approveTopup(topupId, user.uid)
      await fetchPendingTopups()
      await fetchAdminStats()
    } catch (error) {
      console.error('Error approving topup:', error)
    }
  }
  
  const handleRejectTopup = async (topupId) => {
    const reason = prompt('Razón del rechazo:')
    if (reason) {
      try {
        await rejectTopup(topupId, user.uid, reason)
        await fetchPendingTopups()
      } catch (error) {
        console.error('Error rejecting topup:', error)
      }
    }
  }
  
  const handleGenerateCSV = async () => {
    try {
      const csvData = await generatePayoutCSV(adminStats.restaurantBalances)
      
      // Download CSV
      const blob = new Blob([csvData.csvString], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payouts_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating CSV:', error)
    }
  }
  
  const handleExecutePayouts = async () => {
    if (selectedRestaurants.length === 0) return
    
    setIsProcessingPayouts(true)
    try {
      const results = await executeBulkPayouts(selectedRestaurants, user.uid)
      setPayoutResults(results)
      await fetchAdminStats()
    } catch (error) {
      console.error('Error executing payouts:', error)
    } finally {
      setIsProcessingPayouts(false)
    }
  }
  
  const formatCurrency = (amount) => `L${amount.toFixed(2)}`
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestión de wallets, recargas y liquidaciones</p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'topups', label: 'Recargas' },
                { id: 'payouts', label: 'Liquidaciones' },
                { id: 'balances', label: 'Balances' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen General</h3>
                
                {loading.adminStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Dinero en Escrow</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {formatCurrency(adminStats.escrowTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Comisiones Acumuladas</p>
                          <p className="text-2xl font-bold text-green-900">
                            {formatCurrency(adminStats.adminCommissions)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-orange-600">Restaurantes con Saldo</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {adminStats.restaurantBalances.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Topups Tab */}
            {activeTab === 'topups' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recargas Pendientes</h3>
                  <button
                    onClick={fetchPendingTopups}
                    disabled={loading.topupRequests}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {loading.topupRequests ? 'Cargando...' : 'Actualizar'}
                  </button>
                </div>
                
                {loading.topupRequests ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : topupRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recargas pendientes</h3>
                    <p className="text-gray-500">Las solicitudes de recarga aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topupRequests.map((request) => (
                      <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Usuario: {request.userId}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(request.requestedAt?.toDate?.() || request.requestedAt).toLocaleDateString('es-HN')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(request.amount)}
                              </span>
                              {request.proofUrl && (
                                <a
                                  href={request.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  Ver comprobante
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRejectTopup(request.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => handleApproveTopup(request.id)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium"
                            >
                              Aprobar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Payouts Tab */}
            {activeTab === 'payouts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Liquidaciones</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleGenerateCSV}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      Generar CSV
                    </button>
                    <button
                      onClick={handleExecutePayouts}
                      disabled={selectedRestaurants.length === 0 || isProcessingPayouts}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {isProcessingPayouts ? 'Procesando...' : `Pagar Seleccionados (${selectedRestaurants.length})`}
                    </button>
                  </div>
                </div>
                
                {adminStats.restaurantBalances.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay liquidaciones pendientes</h3>
                    <p className="text-gray-500">Los restaurantes con saldo aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminStats.restaurantBalances.map((restaurant) => (
                      <div key={restaurant.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedRestaurants.includes(restaurant.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRestaurants([...selectedRestaurants, restaurant.id])
                                } else {
                                  setSelectedRestaurants(selectedRestaurants.filter(id => id !== restaurant.id))
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {restaurant.name || `Restaurante ${restaurant.userId}`}
                              </p>
                              <p className="text-sm text-gray-500">ID: {restaurant.userId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(restaurant.balance)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Comisión: {formatCurrency(restaurant.balance * PAYMENT_CONFIG.commissions.default.payoutFee)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {payoutResults && (
                  <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resultados de Liquidación</h4>
                    <div className="space-y-2">
                      {payoutResults.map((result, index) => (
                        <div key={index} className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.restaurantId}: {result.success ? 'Éxito' : result.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Balances Tab */}
            {activeTab === 'balances' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Balances de Restaurantes</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Restaurante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Moneda
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {adminStats.restaurantBalances.map((restaurant) => (
                        <tr key={restaurant.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {restaurant.name || 'Sin nombre'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {restaurant.userId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(restaurant.balance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {restaurant.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button onClick={clearError} className="ml-2 text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminWalletPage
