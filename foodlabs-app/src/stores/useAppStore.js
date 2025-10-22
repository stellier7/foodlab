import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ========================================
// CONFIGURACIÓN GLOBAL - Modificar aquí
// ========================================
const DEFAULT_CURRENCY = 'HNL'  // 'USD', 'HNL', 'GTQ'
const DEFAULT_COUNTRY = 'Honduras'
const DEFAULT_CITY = 'Tegucigalpa'
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
      
      // Estado de ubicación
      userLocation: null,
      manualLocation: null,  // { country, city } o null
      hasAskedLocation: false,
      
      // Estado de moneda
      currency: DEFAULT_CURRENCY,
      exchangeRates: EXCHANGE_RATES,
      
      // Estado de inventario
      inventory: {
        'sp3': { stock: 20, reserved: 0, sold: 0 },  // PadelBuddy
        'orange-chicken': { stock: 999, reserved: 0, sold: 0 },
        'boneless': { stock: 999, reserved: 0, sold: 0 },
        'angus-burger': { stock: 999, reserved: 0, sold: 0 },
        'chicken-sandwich': { stock: 999, reserved: 0, sold: 0 },
        'tallarin': { stock: 999, reserved: 0, sold: 0 },
        'loaded-fries': { stock: 999, reserved: 0, sold: 0 },
        'croilab': { stock: 999, reserved: 0, sold: 0 },
        'gyozas': { stock: 999, reserved: 0, sold: 0 }
      },
      
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
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        set({ cartTotal: total })
      },
      
      // Acciones para UI
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Acciones para ubicación
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
      
      // Acciones para inventario
      updateStock: (productId, quantity) => {
        const inventory = get().inventory
        const currentItem = inventory[productId] || { stock: 0, reserved: 0, sold: 0 }
        
        set({
          inventory: {
            ...inventory,
            [productId]: {
              ...currentItem,
              stock: Math.max(0, currentItem.stock + quantity),
              sold: quantity < 0 ? currentItem.sold + Math.abs(quantity) : currentItem.sold
            }
          }
        })
      },
      
      decreaseStock: (productId, quantity) => {
        get().updateStock(productId, -quantity)
      },
      
      getProductStock: (productId) => {
        const inventory = get().inventory
        return inventory[productId]?.stock || 0
      },
      
      setProductStock: (productId, stock) => {
        const inventory = get().inventory
        set({
          inventory: {
            ...inventory,
            [productId]: {
              ...(inventory[productId] || { reserved: 0, sold: 0 }),
              stock
            }
          }
        })
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
        const { currency, exchangeRates } = get()
        const curr = targetCurrency || currency
        
        // 1. Si hay precio específico para esta moneda, usarlo (override)
        const overrideKey = `precio_${curr}`
        if (product[overrideKey] && product[overrideKey] > 0) {
          return product[overrideKey]
        }
        
        // 2. Si no hay override, convertir desde precio base (USD)
        const basePrice = product.price || product.basePrice
        return basePrice * exchangeRates[curr]
      },
      
      // Obtener símbolo de moneda
      getCurrencySymbol: () => {
        const currency = get().currency
        const symbols = {
          USD: '$',
          HNL: 'L',
          GTQ: 'Q'
        }
        return symbols[currency] || '$'
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
      }
    }),
    {
      name: 'foodlabs-storage',
      partialize: (state) => ({
        cart: state.cart,
        cartTotal: state.cartTotal,
        userLocation: state.userLocation,
        manualLocation: state.manualLocation,
        hasAskedLocation: state.hasAskedLocation,
        currency: state.currency,
        exchangeRates: state.exchangeRates,
        inventory: state.inventory
      })
    }
  )
)
