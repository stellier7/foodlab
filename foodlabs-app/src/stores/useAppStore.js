import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { inventoryService } from '../services/firestore'
import { useAuthStore } from './useAuthStore'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/products'

// ========================================
// CONFIGURACIÓN GLOBAL - Sistema de Ubicaciones
// ========================================
const LOCATIONS = {
  honduras: {
    name: 'Honduras',
    flag: '🇭🇳',
    currency: 'HNL',
    currencySymbol: 'L',
    cities: [
      { code: 'TGU', name: 'Tegucigalpa' },
      { code: 'SPS', name: 'San Pedro Sula' }
    ]
  },
  guatemala: {
    name: 'Guatemala',
    flag: '🇬🇹',
    currency: 'GTQ',
    currencySymbol: 'Q',
    cities: [
      { code: 'GUA', name: 'Ciudad de Guatemala' },
      { code: 'ANT', name: 'Antigua' }
    ]
  },
  salvador: {
    name: 'El Salvador',
    flag: '🇸🇻',
    currency: 'USD',
    currencySymbol: '$',
    cities: [
      { code: 'SLV', name: 'San Salvador' },
      { code: 'SMA', name: 'Santa Ana' }
    ]
  }
}

const DEFAULT_COUNTRY = 'honduras'
const DEFAULT_CITY = 'TGU'
const DEFAULT_CURRENCY = LOCATIONS[DEFAULT_COUNTRY].currency

const EXCHANGE_RATES = {
  USD: 1,
  HNL: 24.75,  // Lempiras hondureñas
  GTQ: 7.80    // Quetzales guatemaltecos
}
// ========================================

// Store principal de la aplicación
export const useAppStore = create(
  persist(
    (set, get) => ({
      // Estado de restaurantes
      restaurants: [],
      selectedRestaurant: null,
      shopBusinesses: [],  // Tiendas que aparecen en Shop
      
      // Estado del carrito
      cart: [],
      cartTotal: 0,
      
      // Estado de la UI
      isLoading: false,
      error: null,
      
      // Estado de ubicación (nuevo sistema)
      location: {
        country: DEFAULT_COUNTRY,
        countryName: LOCATIONS[DEFAULT_COUNTRY].name,
        city: DEFAULT_CITY,
        cityName: LOCATIONS[DEFAULT_COUNTRY].cities[0].name,
        currency: LOCATIONS[DEFAULT_COUNTRY].currency,
        currencySymbol: LOCATIONS[DEFAULT_COUNTRY].currencySymbol
      },
      userLocation: null,
      manualLocation: null,  // Mantener para compatibilidad
      hasAskedLocation: false,
      
      // Estado de moneda
      currency: DEFAULT_CURRENCY,
      exchangeRates: EXCHANGE_RATES,
      
      // Estado de inventario
      inventory: {},
      inventoryLoading: false,
      inventoryError: null,
      inventoryConnected: false,
      inventoryUnsubscribe: null,
      
      // Estado de productos
      products: [],
      productsLoading: false,
      productsError: null,
      
      // Acciones para restaurantes
      setRestaurants: (restaurants) => set({ restaurants }),
      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
      setShopBusinesses: (shopBusinesses) => set({ shopBusinesses }),
      
      // Acciones para el carrito
      addToCart: (item, restaurantId) => {
        const cart = get().cart
        const restaurants = get().restaurants
        const restaurant = restaurants.find(r => r.id === restaurantId)
        
        // Crear una clave única para las variantes del producto
        const variantKey = `${item.id}-${item.selectedSize || 'default'}-${item.withCombo || false}`
        
        const existingItem = cart.find(
          cartItem => cartItem.variantKey === variantKey && cartItem.restaurantId === restaurantId
        )
        
        if (existingItem) {
          set({
            cart: cart.map(cartItem =>
              cartItem.variantKey === variantKey && cartItem.restaurantId === restaurantId
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          })
        } else {
          set({
            cart: [...cart, { 
              ...item,
              variantKey,
              quantity: 1, 
              restaurantId,
              restaurantName: restaurant?.name || 'Restaurante'
            }]
          })
        }
        
        get().calculateCartTotal()
      },
      
      removeFromCart: (variantKey, restaurantId) => {
        const cart = get().cart
        const existingItem = cart.find(
          cartItem => cartItem.variantKey === variantKey && cartItem.restaurantId === restaurantId
        )
        
        if (existingItem && existingItem.quantity > 1) {
          set({
            cart: cart.map(cartItem =>
              cartItem.variantKey === variantKey && cartItem.restaurantId === restaurantId
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
            )
          })
        } else {
          set({
            cart: cart.filter(
              cartItem => !(cartItem.variantKey === variantKey && cartItem.restaurantId === restaurantId)
            )
          })
        }
        
        get().calculateCartTotal()
      },
      
      clearCart: () => set({ cart: [], cartTotal: 0 }),
      
      calculateCartTotal: () => {
        const cart = get().cart
        const { location } = get()
        const targetCurrency = location.currency  // HNL, GTQ, or USD
        
        const total = cart.reduce((sum, item) => {
          // Use explicit currency field (precio_HNL, precio_GTQ, precio_USD)
          const currencyField = `precio_${targetCurrency}`
          const itemPrice = item[currencyField] || item.price || 0
          
          // Log warning if price is missing
          if (!item[currencyField] && !item.price) {
            console.warn(`⚠️ Missing price for item: ${item.name}`, item)
          }
          
          return sum + (itemPrice * item.quantity)
        }, 0)
        set({ cartTotal: total })
      },
      
      // Acciones para UI
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Acciones para ubicación
      setLocation: (country, cityCode) => {
        const countryData = LOCATIONS[country]
        if (!countryData) {
          console.error('País no encontrado:', country)
          return
        }
        
        const city = countryData.cities.find(c => c.code === cityCode)
        if (!city) {
          console.error('Ciudad no encontrada:', cityCode)
          return
        }
        
        const newLocation = {
          country,
          countryName: countryData.name,
          city: cityCode,
          cityName: city.name,
          currency: countryData.currency,
          currencySymbol: countryData.currencySymbol
        }
        
        set({
          location: newLocation,
          currency: countryData.currency,
          // Actualizar manualLocation para compatibilidad
          manualLocation: {
            country: countryData.name,
            city: city.name
          }
        })
      },
      
      getLocations: () => LOCATIONS,
      
      setUserLocation: (location) => set({ userLocation: location }),
      
      setManualLocation: (country, city) => {
        set({ manualLocation: { country, city } })
        // Establecer moneda según país
        if (country === 'Honduras') {
          set({ currency: 'HNL' })
        } else if (country === 'Guatemala') {
          set({ currency: 'GTQ' })
        } else {
          set({ currency: 'USD' })
        }
      },
      
      setHasAskedLocation: (value) => set({ hasAskedLocation: value }),
      
      // Initialize inventory connection
      initializeInventory: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) return

        set({ inventoryLoading: true, inventoryError: null })

        try {
          // Subscribe to real-time inventory updates
          const unsubscribe = inventoryService.subscribeToInventory((inventory) => {
            set({ 
              inventory, 
              inventoryConnected: true, 
              inventoryLoading: false,
              inventoryError: null 
            })
          })

          set({ inventoryUnsubscribe: unsubscribe })
        } catch (error) {
          console.error('Error initializing inventory:', error)
          set({ 
            inventoryError: error.message, 
            inventoryLoading: false,
            inventoryConnected: false 
          })
        }
      },

      // Disconnect from inventory
      disconnectInventory: () => {
        const { inventoryUnsubscribe } = get()
        if (inventoryUnsubscribe) {
          inventoryUnsubscribe()
          set({ inventoryUnsubscribe: null, inventoryConnected: false })
        }
      },

      // Acciones para inventario
      updateStock: async (productId, quantity) => {
        set({ inventoryLoading: true, inventoryError: null })

        try {
          const currentItem = get().inventory[productId] || { stock: 0, reserved: 0, sold: 0 }
          const newStock = Math.max(0, currentItem.stock + quantity)
          const newSold = quantity < 0 ? currentItem.sold + Math.abs(quantity) : currentItem.sold

          await inventoryService.updateStock(productId, {
            stock: newStock,
            sold: newSold,
            reserved: currentItem.reserved
          })

          set({ inventoryLoading: false, inventoryError: null })
        } catch (error) {
          console.error('Error updating stock:', error)
          set({ 
            inventoryError: error.message, 
            inventoryLoading: false 
          })
          throw error
        }
      },
      
      decreaseStock: async (productId, quantity) => {
        try {
          await inventoryService.decreaseStock(productId, quantity)
        } catch (error) {
          console.error('Error decreasing stock:', error)
          set({ inventoryError: error.message })
          throw error
        }
      },
      
      increaseStock: async (productId, quantity) => {
        try {
          await inventoryService.increaseStock(productId, quantity)
        } catch (error) {
          console.error('Error increasing stock:', error)
          set({ inventoryError: error.message })
          throw error
        }
      },
      
      getProductStock: (productId) => {
        const inventory = get().inventory
        return inventory[productId]?.stock || 0
      },
      
      setProductStock: async (productId, stock) => {
        set({ inventoryLoading: true, inventoryError: null })

        try {
          const currentItem = get().inventory[productId] || { reserved: 0, sold: 0 }
          
          await inventoryService.updateStock(productId, {
            stock,
            reserved: currentItem.reserved,
            sold: currentItem.sold
          })

          set({ inventoryLoading: false, inventoryError: null })
        } catch (error) {
          console.error('Error setting product stock:', error)
          set({ 
            inventoryError: error.message, 
            inventoryLoading: false 
          })
          throw error
        }
      },
      
      // Acciones para moneda
      setCurrency: (currency) => set({ currency }),
      
      setExchangeRate: (currency, rate) => {
        const rates = get().exchangeRates
        set({ exchangeRates: { ...rates, [currency]: rate } })
      },
      
      // Convertir precio de USD a la moneda seleccionada
      convertPrice: (usdPrice) => {
        const { currency, exchangeRates } = get()
        return usdPrice * exchangeRates[currency]
      },
      
      // Obtener precio con sistema de override
      getPriceForCurrency: (product, targetCurrency) => {
        const { currency } = get()
        const curr = targetCurrency || currency
        
        // Check if product is valid
        if (!product) {
          console.warn(`⚠️ Product is undefined for currency ${curr}`)
          return 0
        }
        
        // 1. Si hay precio específico para esta moneda, usarlo (override)
        const overrideKey = `precio_${curr}`
        if (product[overrideKey] && product[overrideKey] > 0) {
          return product[overrideKey]
        }
        
        // 2. Si no hay override, usar price directo (sin conversión)
        // Asumimos que price está en la moneda del restaurante
        if (product.price && product.price > 0) {
          return product.price
        }
        
        // 3. Si tampoco hay price, log warning y retornar 0
        console.warn(`⚠️ No price found for product in currency ${curr}:`, product.name || product.id || 'unknown')
        return 0
      },
      
      // Obtener símbolo de moneda
      getCurrencySymbol: () => {
        const { location } = get()
        return location.currencySymbol
      },
      
      // Detectar moneda según país del restaurante
      detectCurrencyByCountry: (country) => {
        if (!country) return 'USD'
        
        const countryLower = country.toLowerCase()
        if (countryLower.includes('honduras') || countryLower === 'hn') {
          return 'HNL'
        }
        if (countryLower.includes('guatemala') || countryLower === 'gt') {
          return 'GTQ'
        }
        return 'USD'
      },
      
      // Detectar moneda basada en geolocalización del navegador
      detectCurrencyByLocation: async () => {
        // Si ya hay ubicación manual, no sobrescribir
        const { manualLocation } = get()
        if (manualLocation) {
          return
        }
        
        if (!navigator.geolocation) {
          set({ hasAskedLocation: true })
          return
        }
        
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              maximumAge: 0
            })
          })
          
          const { latitude, longitude } = position.coords
          
          // Honduras aproximadamente: 13-16°N, 83-89°W
          // Guatemala aproximadamente: 13.5-18°N, 88-92.5°W
          
          if (latitude >= 13 && latitude <= 16 && longitude >= -89 && longitude <= -83) {
            set({ currency: 'HNL' })
          } else if (latitude >= 13.5 && latitude <= 18 && longitude >= -92.5 && longitude <= -88) {
            set({ currency: 'GTQ' })
          }
          
          // Guardar ubicación del usuario
          set({ userLocation: { latitude, longitude } })
        } catch (error) {
          console.log('No se pudo obtener la ubicación:', error)
          set({ hasAskedLocation: true })
        }
      },
      
      // Función para calcular fees
      calculateFees: (subtotal) => {
        const platformFee = subtotal * 0.075 // 7.5% fee de plataforma
        const serviceFee = 0 // Removido
        const deliveryFee = 0 // Por ahora 0
        const totalFees = platformFee + serviceFee + deliveryFee
        
        return {
          subtotal,
          platformFee,
          serviceFee,
          deliveryFee,
          totalFees,
          grandTotal: subtotal + totalFees
        }
      },
      
      // Acciones para productos
      fetchProducts: async (businessType = null, businessId = null) => {
        set({ productsLoading: true, productsError: null })
        try {
          const products = await getProducts(businessType, businessId)
          set({ products, productsLoading: false, productsError: null })
          return products
        } catch (error) {
          console.error('Error fetching products:', error)
          set({ productsError: error.message, productsLoading: false })
          throw error
        }
      },
      
      createProduct: async (productData) => {
        set({ productsLoading: true, productsError: null })
        try {
          const productId = await createProduct(productData)
          // Refresh products list
          await get().fetchProducts()
          set({ productsLoading: false, productsError: null })
          return productId
        } catch (error) {
          console.error('Error creating product:', error)
          set({ productsError: error.message, productsLoading: false })
          throw error
        }
      },
      
      updateProduct: async (productId, updateData) => {
        set({ productsLoading: true, productsError: null })
        try {
          await updateProduct(productId, updateData)
          // Refresh products list
          await get().fetchProducts()
          set({ productsLoading: false, productsError: null })
        } catch (error) {
          console.error('Error updating product:', error)
          set({ productsError: error.message, productsLoading: false })
          throw error
        }
      },
      
      deleteProduct: async (productId) => {
        set({ productsLoading: true, productsError: null })
        try {
          await deleteProduct(productId)
          // Refresh products list
          await get().fetchProducts()
          set({ productsLoading: false, productsError: null })
        } catch (error) {
          console.error('Error deleting product:', error)
          set({ productsError: error.message, productsLoading: false })
          throw error
        }
      },
      
      getProductsByBusiness: (businessId) => {
        const products = get().products
        return products.filter(product => product.businessId === businessId)
      },
      
      getShopProducts: () => {
        const products = get().products
        return products.filter(product => product.businessType === 'shop' && product.isActive)
      },
      
      getRestaurantProducts: () => {
        const products = get().products
        return products.filter(product => product.businessType === 'restaurant' && product.isActive)
      }
    }),
    {
      name: 'foodlabs-storage',
      partialize: (state) => ({
        cart: state.cart,
        cartTotal: state.cartTotal,
        location: state.location,
        userLocation: state.userLocation,
        manualLocation: state.manualLocation,
        hasAskedLocation: state.hasAskedLocation,
        currency: state.currency,
        exchangeRates: state.exchangeRates
        // Don't persist inventory - it comes from Firestore
      })
    }
  )
)
