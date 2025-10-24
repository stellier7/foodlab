import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from './components/Header'
import ShoppingCart from './components/ShoppingCart'
import LocationSelector from './components/LocationSelector'
import FoodLabsPage from './pages/FoodLabsPage'
import FitLabsPage from './pages/FitLabsPage'
import ShopPage from './pages/ShopPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminRouter from './components/admin/AdminRouter'
import ComercioLoginPage from './pages/ComercioLoginPage'
import ComercioRouter from './components/comercio/ComercioRouter'
import { useAuthStore } from './stores/useAuthStore'
import { useAppStore } from './stores/useAppStore'

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore()
  
  if (!checkAuth()) {
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

// Componente para rutas protegidas de admin
const ProtectedAdminRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  if (!isAdmin()) {
    // Si no es admin, siempre redirigir al login de admin
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

// Componente interno para manejar las rutas
const AppContent = () => {
  const { detectCurrencyByLocation, manualLocation, hasAskedLocation, setManualLocation, setHasAskedLocation } = useAppStore()
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  
  // Detectar ubicación automáticamente al cargar la app
  useEffect(() => {
    // Si ya hay ubicación manual, no hacer nada
    if (manualLocation) {
      return
    }
    
    // Si ya preguntamos antes y no hay ubicación, mostrar selector
    if (hasAskedLocation && !manualLocation) {
      setShowLocationSelector(true)
      return
    }
    
    // Intentar GPS
    detectCurrencyByLocation().then(() => {
      // Si después de intentar GPS, hasAskedLocation es true y no hay ubicación
      // significa que GPS falló, mostrar selector
      const state = useAppStore.getState()
      if (state.hasAskedLocation && !state.manualLocation && !state.userLocation) {
        setShowLocationSelector(true)
      }
    })
  }, [])
  
  const handleLocationConfirm = (country, city) => {
    setManualLocation(country, city)
    setShowLocationSelector(false)
    setHasAskedLocation(false)
  }
  
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Location Selector Modal */}
      <LocationSelector
        isOpen={showLocationSelector}
        onConfirm={handleLocationConfirm}
        onClose={() => setShowLocationSelector(false)}
      />
      
      <Header />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<FoodLabsPage />} />
          <Route path="/fitlab" element={<FitLabsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/sportsshop" element={<Navigate to="/shop" replace />} />
          <Route path="/tienda/:slug" element={<RestaurantDetailPage />} />
          <Route path="/restaurante/:slug" element={<RestaurantDetailPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminRouter />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedAdminRoute>
                <AdminRouter />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Comercio Routes */}
          <Route path="/comercio/login" element={<ComercioLoginPage />} />
          <Route 
            path="/comercio" 
            element={
              <ProtectedRoute>
                <ComercioRouter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/comercio/:businessId/*" 
            element={
              <ProtectedRoute>
                <ComercioRouter />
              </ProtectedRoute>
            } 
          />
        </Routes>

      <ShoppingCart />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App