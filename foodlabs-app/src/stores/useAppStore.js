import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Store principal de la aplicación
export const useAppStore = create(
  persist(
    (set, get) => ({
      // Estado de restaurantes
      restaurants: [],
      selectedRestaurant: null,
      
      // Estado del carrito
      cart: [],
      cartTotal: 0,
      
      // Estado de la UI
      isLoading: false,
      error: null,
      
      // Estado de ubicación
      userLocation: null,
      
      // Acciones para restaurantes
      setRestaurants: (restaurants) => set({ restaurants }),
      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
      
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
      
      // Función para calcular fees
      calculateFees: (subtotal) => {
        const platformFee = subtotal * 0.05 // 5% fee base
        const serviceFee = subtotal * 0.10 // 10% fee de servicio (ejemplo)
        const deliveryFee = 3.00 // Fee fijo de delivery
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
        userLocation: state.userLocation
      })
    }
  )
)
