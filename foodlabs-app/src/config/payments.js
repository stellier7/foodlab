export const PAYMENT_CONFIG = {
  commissions: {
    default: {
      orderFee: 0.12,    // 12% comisión al pedido (para deducir a comercios)
      customerFee: 0.15, // 15% fee que ve el cliente
      payoutFee: 0.15    // 15% comisión al payout
    },
    byRestaurant: {
      // 'm001': { orderFee: 0.10, payoutFee: 0.15 } // Comisiones personalizadas por restaurante
    }
  },
  currencies: {
    HNL: { symbol: 'L', name: 'Lempiras' },
    GTQ: { symbol: 'Q', name: 'Quetzales' }
  },
  bankAccounts: {
    HNL: 'Cuenta bancaria FoodLabs HN',
    GTQ: 'Cuenta bancaria FoodLabs GT'
  },
  ui: {
    showTaxDisclaimer: true,  // Mostrar "*ISV incluido" en la UI
    taxDisclaimerText: '*ISV incluido'
  }
}

// Función para obtener comisiones de un restaurante específico
export const getCommissions = (restaurantId) => {
  const restaurantCommissions = PAYMENT_CONFIG.commissions.byRestaurant[restaurantId]
  return restaurantCommissions || PAYMENT_CONFIG.commissions.default
}

// Función para calcular comisiones de un pedido
export const calculateOrderCommissions = (amount, restaurantId) => {
  const commissions = getCommissions(restaurantId)
  const orderCommission = amount * commissions.orderFee
  const netAmount = amount - orderCommission
  
  return {
    total: amount,
    orderCommission,
    netAmount,
    commissionRate: commissions.orderFee
  }
}

// Función para calcular comisiones de payout
export const calculatePayoutCommissions = (amount, restaurantId) => {
  const commissions = getCommissions(restaurantId)
  const payoutCommission = amount * commissions.payoutFee
  const finalAmount = amount - payoutCommission
  
  return {
    originalAmount: amount,
    payoutCommission,
    finalAmount,
    commissionRate: commissions.payoutFee
  }
}
