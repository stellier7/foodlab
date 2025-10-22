import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from './components/Header'
import ShoppingCart from './components/ShoppingCart'
import LocationSelector from './components/LocationSelector'
import FoodLabsPage from './pages/FoodLabsPage'
import FitLabsPage from './pages/FitLabsPage'
import SportsShopPage from './pages/SportsShopPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import BusinessLoginPage from './pages/BusinessLoginPage'
import BusinessPage from './pages/BusinessPage'
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
          <Route path="/fitlabs" element={<FitLabsPage />} />
          <Route path="/shop" element={<SportsShopPage />} />
          <Route path="/sportsshop" element={<Navigate to="/shop" replace />} />
          <Route path="/restaurant/:restaurantName" element={<RestaurantDetailPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Business Routes */}
          <Route path="/business/login" element={<BusinessLoginPage />} />
          <Route 
            path="/business/:businessId" 
            element={
              <ProtectedRoute>
                <BusinessPage />
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