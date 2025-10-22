import React, { useState } from 'react'
import { useWalletStore } from '../stores/useWalletStore'
import { useAuthStore } from '../stores/useAuthStore'
import { PAYMENT_CONFIG } from '../config/payments'

const TopupModal = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const { requestTopup, loading, error, clearError } = useWalletStore()
  
  const [amount, setAmount] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    
    setIsSubmitting(true)
    clearError()
    
    try {
      // En una implementación real, aquí subirías el archivo a Firebase Storage
      const proofUrl = proofFile ? `proof_${Date.now()}` : null
      
      await requestTopup(user.uid, parseFloat(amount), proofUrl)
      setSuccess(true)
      
      // Reset form
      setAmount('')
      setProofFile(null)
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Error requesting topup:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('')
      setProofFile(null)
      setSuccess(false)
      clearError()
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recargar saldo</h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Solicitud enviada!</h3>
              <p className="text-gray-600">Tu recarga será aprobada en las próximas 24 horas.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a recargar
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    L
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Monto mínimo: L 1.00
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante de transferencia (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sube una foto del comprobante para aprobación más rápida
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Instrucciones de transferencia:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Banco:</strong> {PAYMENT_CONFIG.bankAccounts.HNL}</p>
                  <p><strong>Concepto:</strong> Recarga FoodLabs - {user?.email}</p>
                  <p><strong>Monto:</strong> L {amount || '0.00'}</p>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar recarga'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopupModal
