import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import ShoppingCart from './components/ShoppingCart'
import FoodLabsPage from './pages/FoodLabsPage'
import FitLabsPage from './pages/FitLabsPage'
import SportsShopPage from './pages/SportsShopPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
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
  const { detectCurrencyByLocation, currency } = useAppStore()
  
  // Detectar moneda automáticamente al cargar la app
  useEffect(() => {
    // Solo detectar si no hay una moneda ya configurada o es USD por defecto
    if (currency === 'USD') {
      detectCurrencyByLocation()
    }
  }, [])
  
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<FoodLabsPage />} />
          <Route path="/fitlabs" element={<FitLabsPage />} />
          <Route path="/sportsshop" element={<SportsShopPage />} />
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