import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import ShoppingCart from './components/ShoppingCart'
import FoodLabsPage from './pages/FoodLabsPage'
import FitLabsPage from './pages/FitLabsPage'
import SportsShopPage from './pages/SportsShopPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import { useAuthStore } from './stores/useAuthStore'

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore()
  
  if (!checkAuth()) {
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <Header />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<FoodLabsPage />} />
          <Route path="/fitlabs" element={<FitLabsPage />} />
          <Route path="/sportsshop" element={<SportsShopPage />} />
          
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
    </Router>
  )
}

export default App