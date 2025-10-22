import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAppStore } from './useAppStore'

// Datos mock para testing
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    orderNumber: 1,
    customer: {
      name: 'Santiago Tellier',
      phone: '+504 8869-4777',
      address: 'Col. Palmira, Tegucigalpa'
    },
    items: [
      {
        id: 'sp3',
        name: 'PadelBuddy - Phone Mount',
        price: 24.99,
        quantity: 1,
        restaurantId: 'sportsshop'
      }
    ],
    business: {
      id: 'sportsshop',
      name: 'Shop'
    },
    pricing: {
      subtotal: 24.99,
      platformFee: 1.25,
      serviceFee: 2.50,
      deliveryFee: 3.00,
      discount: 0,
      total: 31.74
    },
    status: 'pending',
    paymentMethod: null,
    notes: '',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), user: 'system' }
    ]
  },
  {
    id: 'ORD-002',
    orderNumber: 2,
    customer: {
      name: 'Ana García',
      phone: '+504 9988-7766',
      address: 'Col. Las Minitas, Tegucigalpa'
    },
    items: [
      {
        id: 'sp1',
        name: 'Paleta de Padel Pro',
        price: 89.99,
        quantity: 1,
        restaurantId: 'sportsshop'
      },
      {
        id: 'sp2',
        name: 'Pelotas de Padel x3',
        price: 15.99,
        quantity: 2,
        restaurantId: 'sportsshop'
      }
    ],
    business: {
      id: 'sportsshop',
      name: 'Shop'
    },
    pricing: {
      subtotal: 121.97,
      platformFee: 6.10,
      serviceFee: 12.20,
      deliveryFee: 0,
      discount: 0,
      total: 140.27
    },
    status: 'confirmed',
    paymentMethod: 'efectivo',
    notes: 'Cliente prefiere entrega en la mañana',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user: 'system' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), user: 'admin-001', from: 'pending', to: 'confirmed' }
    ]
  },
  {
    id: 'ORD-003',
    orderNumber: 3,
    customer: {
      name: 'Carlos Pérez',
      phone: '+504 8877-6655',
      address: 'Col. Residencial Los Pinos'
    },
    items: [
      {
        id: 'food1',
        name: 'Baleada Mixta',
        price: 45.00,
        quantity: 2,
        restaurantId: '1',
        restaurantName: 'Baleadas de Doña María'
      },
      {
        id: 'food2',
        name: 'Jugo de Naranja',
        price: 25.00,
        quantity: 1,
        restaurantId: '1',
        restaurantName: 'Baleadas de Doña María'
      }
    ],
    business: {
      id: '1',
      name: 'Baleadas de Doña María'
    },
    pricing: {
      subtotal: 115.00,
      platformFee: 5.75,
      serviceFee: 11.50,
      deliveryFee: 3.00,
      discount: 10.00,
      total: 125.25
    },
    status: 'delivered',
    paymentMethod: 'tarjeta',
    notes: 'Entregado exitosamente',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), user: 'system' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), user: 'admin-001', from: 'pending', to: 'confirmed' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), user: 'admin-001', from: 'confirmed', to: 'preparing' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(), user: 'admin-001', from: 'preparing', to: 'ready' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(), user: 'admin-001', from: 'ready', to: 'in_transit' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), user: 'admin-001', from: 'in_transit', to: 'delivered' }
    ]
  },
  {
    id: 'ORD-004',
    orderNumber: 4,
    customer: {
      name: 'María López',
      phone: '+504 7766-5544',
      address: 'Col. Florencia Norte'
    },
    items: [
      {
        id: 'sp4',
        name: 'Bolso Deportivo',
        price: 45.99,
        quantity: 1,
        restaurantId: 'sportsshop'
      }
    ],
    business: {
      id: 'sportsshop',
      name: 'Shop'
    },
    pricing: {
      subtotal: 45.99,
      platformFee: 2.30,
      serviceFee: 4.60,
      deliveryFee: 3.00,
      discount: 0,
      total: 55.89
    },
    status: 'preparing',
    paymentMethod: 'transferencia',
    notes: '',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), user: 'system' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), user: 'admin-001', from: 'pending', to: 'confirmed' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), user: 'admin-001', from: 'confirmed', to: 'preparing' }
    ]
  },
  {
    id: 'ORD-005',
    orderNumber: 5,
    customer: {
      name: 'Roberto Martínez',
      phone: '+504 6655-4433',
      address: 'Col. San Miguel'
    },
    items: [
      {
        id: 'food3',
        name: 'Pizza Margherita',
        price: 180.00,
        quantity: 1,
        restaurantId: '2',
        restaurantName: 'Pizza Express'
      },
      {
        id: 'food4',
        name: 'Coca Cola 500ml',
        price: 30.00,
        quantity: 2,
        restaurantId: '2',
        restaurantName: 'Pizza Express'
      }
    ],
    business: {
      id: '2',
      name: 'Pizza Express'
    },
    pricing: {
      subtotal: 240.00,
      platformFee: 12.00,
      serviceFee: 24.00,
      deliveryFee: 3.00,
      discount: 0,
      total: 279.00
    },
    status: 'ready',
    paymentMethod: 'efectivo',
    notes: 'Cliente solicita poca salsa',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), user: 'system' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), user: 'admin-001', from: 'pending', to: 'confirmed' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user: 'admin-001', from: 'confirmed', to: 'preparing' },
      { action: 'status_changed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), user: 'admin-001', from: 'preparing', to: 'ready' }
    ]
  }
]

// Estados de pedidos con colores
export const ORDER_STATUSES = {
  pending: { label: 'Pendiente', color: '#ef4444', icon: '🔴' },
  confirmed: { label: 'Confirmado', color: '#f59e0b', icon: '🟡' },
  preparing: { label: 'En Preparación', color: '#3b82f6', icon: '🔵' },
  ready: { label: 'Listo', color: '#8b5cf6', icon: '🟣' },
  in_transit: { label: 'En Camino', color: '#06b6d4', icon: '🟢' },
  delivered: { label: 'Entregado', color: '#10b981', icon: '✅' },
  cancelled: { label: 'Cancelado', color: '#6b7280', icon: '❌' },
  problem: { label: 'Problema', color: '#dc2626', icon: '⚠️' }
}

export const useOrdersStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      orders: MOCK_ORDERS,
      currentOrder: null,
      filters: {
        status: 'all',
        date: 'today',
        business: 'all',
        search: ''
      },
      stats: {
        today: { sales: 0, orders: 0, commission: 0 },
        week: { sales: 0, orders: 0, commission: 0 },
        month: { sales: 0, orders: 0, commission: 0 }
      },
      orderCounter: MOCK_ORDERS.length,

      // Acciones principales
      addOrder: (order) => {
        const orders = get().orders
        const orderCounter = get().orderCounter + 1
        
        const newOrder = {
          ...order,
          id: `ORD-${String(orderCounter).padStart(3, '0')}`,
          orderNumber: orderCounter,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            { 
              action: 'created', 
              timestamp: new Date().toISOString(), 
              user: 'system' 
            }
          ]
        }

        set({
          orders: [newOrder, ...orders],
          orderCounter
        })

        get().calculateStats()
        
        // Trigger notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nuevo Pedido', {
            body: `Orden #${orderCounter} - ${newOrder.customer.name} - $${newOrder.pricing.total}`,
            icon: '/favicon.ico'
          })
        }

        return newOrder
      },

      updateOrder: (orderId, updates) => {
        const orders = get().orders
        const currentUser = get().currentUser || 'admin-001'
        
        const updatedOrders = orders.map(order => {
          if (order.id === orderId) {
            const updatedOrder = {
              ...order,
              ...updates,
              updatedAt: new Date().toISOString(),
              history: [
                ...order.history,
                {
                  action: 'updated',
                  timestamp: new Date().toISOString(),
                  user: currentUser,
                  changes: updates
                }
              ]
            }
            return updatedOrder
          }
          return order
        })

        set({ orders: updatedOrders })
        get().calculateStats()
      },

      deleteOrder: (orderId) => {
        const orders = get().orders
        const filteredOrders = orders.filter(order => order.id !== orderId)
        
        set({ orders: filteredOrders })
        get().calculateStats()
      },

      changeOrderStatus: (orderId, newStatus) => {
        const orders = get().orders
        const currentUser = get().currentUser || 'admin-001'
        const order = orders.find(o => o.id === orderId)
        
        if (!order) return
        
        const oldStatus = order.status
        
        // Actualizar stock si se confirma la orden
        if (newStatus === 'confirmed' && oldStatus === 'pending') {
          order.items.forEach(item => {
            useAppStore.getState().decreaseStock(item.id, item.quantity)
          })
        }
        
        // Devolver stock si se cancela la orden
        if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
          order.items.forEach(item => {
            useAppStore.getState().updateStock(item.id, item.quantity)
          })
        }
        
        const updatedOrders = orders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              history: [
                ...order.history,
                {
                  action: 'status_changed',
                  timestamp: new Date().toISOString(),
                  user: currentUser,
                  from: oldStatus,
                  to: newStatus
                }
              ]
            }
          }
          return order
        })

        set({ orders: updatedOrders })
        get().calculateStats()
      },

      duplicateOrder: (orderId) => {
        const orders = get().orders
        const originalOrder = orders.find(order => order.id === orderId)
        
        if (originalOrder) {
          const duplicatedOrder = {
            ...originalOrder,
            id: null, // Will be set by addOrder
            orderNumber: null, // Will be set by addOrder
            status: 'pending',
            paymentMethod: null,
            notes: `Duplicado de orden #${originalOrder.orderNumber}`,
            createdAt: null, // Will be set by addOrder
            updatedAt: null, // Will be set by addOrder
            history: [] // Will be set by addOrder
          }

          get().addOrder(duplicatedOrder)
        }
      },

      getOrderById: (orderId) => {
        const orders = get().orders
        return orders.find(order => order.id === orderId)
      },

      getOrdersByBusiness: (businessId) => {
        const orders = get().orders
        // Normalizar businessId para compatibilidad
        const normalizedId = (businessId === 'shop' || businessId === 'padelbuddy') ? 'sportsshop' : businessId
        return orders.filter(order => order.business.id === normalizedId || order.business.id === businessId)
      },

      setCurrentOrder: (order) => {
        set({ currentOrder: order })
      },

      clearCurrentOrder: () => {
        set({ currentOrder: null })
      },

      setFilters: (filters) => {
        set({ filters: { ...get().filters, ...filters } })
      },

      clearFilters: () => {
        set({
          filters: {
            status: 'all',
            date: 'today',
            business: 'all',
            search: ''
          }
        })
      },

      getFilteredOrders: () => {
        const { orders, filters } = get()
        let filtered = [...orders]

        // Filter by status
        if (filters.status !== 'all') {
          filtered = filtered.filter(order => order.status === filters.status)
        }

        // Filter by business
        if (filters.business !== 'all') {
          filtered = filtered.filter(order => order.business.id === filters.business)
        }

        // Filter by date
        const now = new Date()
        if (filters.date === 'today') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          filtered = filtered.filter(order => new Date(order.createdAt) >= today)
        } else if (filters.date === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(order => new Date(order.createdAt) >= weekAgo)
        } else if (filters.date === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(order => new Date(order.createdAt) >= monthAgo)
        }

        // Filter by search
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(order =>
            order.customer.name.toLowerCase().includes(searchLower) ||
            order.customer.phone.includes(searchLower) ||
            order.id.toLowerCase().includes(searchLower) ||
            order.orderNumber.toString().includes(searchLower) ||
            order.items.some(item => item.name.toLowerCase().includes(searchLower))
          )
        }

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      },

      calculateStats: () => {
        const orders = get().orders
        const now = new Date()
        
        // Today's stats
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todayOrders = orders.filter(order => 
          new Date(order.createdAt) >= today && order.status !== 'cancelled'
        )
        const todayStats = {
          sales: todayOrders.reduce((sum, order) => sum + order.pricing.total, 0),
          orders: todayOrders.length,
          commission: todayOrders.reduce((sum, order) => sum + (order.pricing.platformFee + order.pricing.serviceFee), 0)
        }

        // Week's stats
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const weekOrders = orders.filter(order => 
          new Date(order.createdAt) >= weekAgo && order.status !== 'cancelled'
        )
        const weekStats = {
          sales: weekOrders.reduce((sum, order) => sum + order.pricing.total, 0),
          orders: weekOrders.length,
          commission: weekOrders.reduce((sum, order) => sum + (order.pricing.platformFee + order.pricing.serviceFee), 0)
        }

        // Month's stats
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const monthOrders = orders.filter(order => 
          new Date(order.createdAt) >= monthAgo && order.status !== 'cancelled'
        )
        const monthStats = {
          sales: monthOrders.reduce((sum, order) => sum + order.pricing.total, 0),
          orders: monthOrders.length,
          commission: monthOrders.reduce((sum, order) => sum + (order.pricing.platformFee + order.pricing.serviceFee), 0)
        }

        set({
          stats: {
            today: todayStats,
            week: weekStats,
            month: monthStats
          }
        })
      },

      exportOrders: (format = 'csv', filteredOrders = null) => {
        const orders = filteredOrders || get().getFilteredOrders()
        
        if (format === 'csv') {
          const headers = ['ID', 'Orden', 'Cliente', 'Teléfono', 'Negocio', 'Total', 'Estado', 'Fecha', 'Método de Pago']
          const rows = orders.map(order => [
            order.id,
            order.orderNumber,
            order.customer.name,
            order.customer.phone,
            order.business.name,
            order.pricing.total,
            ORDER_STATUSES[order.status]?.label || order.status,
            new Date(order.createdAt).toLocaleDateString(),
            order.paymentMethod || 'N/A'
          ])
          
          const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n')
          
          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `foodlabs-orders-${new Date().toISOString().split('T')[0]}.csv`
          a.click()
          window.URL.revokeObjectURL(url)
        } else if (format === 'json') {
          const jsonContent = JSON.stringify(orders, null, 2)
          const blob = new Blob([jsonContent], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `foodlabs-orders-${new Date().toISOString().split('T')[0]}.json`
          a.click()
          window.URL.revokeObjectURL(url)
        }
      },

      getPendingOrdersCount: () => {
        const orders = get().orders
        return orders.filter(order => order.status === 'pending').length
      },

      getRecentOrders: (limit = 10) => {
        const orders = get().orders
        return orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit)
      },

      getOrdersByStatus: (status) => {
        const orders = get().orders
        return orders.filter(order => order.status === status)
      },

      getTopProducts: (limit = 5) => {
        const orders = get().orders
        const productCounts = {}
        
        orders.forEach(order => {
          order.items.forEach(item => {
            if (productCounts[item.name]) {
              productCounts[item.name] += item.quantity
            } else {
              productCounts[item.name] = item.quantity
            }
          })
        })
        
        return Object.entries(productCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, limit)
          .map(([name, quantity]) => ({ name, quantity }))
      },

      getBusinessStats: () => {
        const orders = get().orders
        const businessStats = {}
        
        orders.forEach(order => {
          const businessId = order.business.id
          if (!businessStats[businessId]) {
            businessStats[businessId] = {
              name: order.business.name,
              orders: 0,
              sales: 0,
              commission: 0
            }
          }
          
          businessStats[businessId].orders += 1
          businessStats[businessId].sales += order.pricing.total
          businessStats[businessId].commission += (order.pricing.platformFee + order.pricing.serviceFee)
        })
        
        return Object.values(businessStats)
          .sort((a, b) => b.sales - a.sales)
      }
    }),
    {
      name: 'foodlabs-orders-storage',
      partialize: (state) => ({
        orders: state.orders,
        orderCounter: state.orderCounter,
        filters: state.filters
      })
    }
  )
)

