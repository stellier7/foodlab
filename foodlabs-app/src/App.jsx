import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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

// Componente interno para manejar el heroContent
const AppContent = () => {
  const location = useLocation()
  
  const getHeroContent = (pathname) => {
    switch(pathname) {
      case '/':
        return (
          <>
            <h1 className="fade-in stagger-1" style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              marginBottom: '12px',
              letterSpacing: '-0.5px',
              color: 'white'
            }}>
              ¡Bienvenido a FoodLab!
            </h1>
            <p className="fade-in stagger-2" style={{ 
              color: '#fed7aa', 
              marginBottom: '20px',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              Descubre los mejores restaurantes locales y haz tu pedido
            </p>
          </>
        )
      case '/fitlabs':
        return (
          <>
            <h1 className="fade-in stagger-1" style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              marginBottom: '12px',
              letterSpacing: '-0.5px',
              color: 'white'
            }}>
              ¡Bienvenido a FitLabs!
            </h1>
            <p className="fade-in stagger-2" style={{ 
              color: '#a7f3d0', 
              marginBottom: '20px',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              Tu centro de fitness y bienestar
            </p>
          </>
        )
      case '/sportsshop':
        return (
          <>
            <h1 className="fade-in stagger-1" style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              marginBottom: '12px',
              letterSpacing: '-0.5px',
              color: 'white'
            }}>
              ¡Bienvenido a SportsShop!
            </h1>
            <p className="fade-in stagger-2" style={{ 
              color: '#bfdbfe', 
              marginBottom: '20px',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              Todo para tu deporte favorito
            </p>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header heroContent={getHeroContent(location.pathname)} />
        
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