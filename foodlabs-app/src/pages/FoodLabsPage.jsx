import { useEffect } from 'react'
import { useAppStore } from '../stores/useAppStore'
import RestaurantList from '../components/RestaurantList'
import { MapPin, Star } from 'lucide-react'

const FoodLabsPage = () => {
  const { setLoading, setRestaurants } = useAppStore()

  // Datos de ejemplo para desarrollo
  const mockRestaurants = [
    {
      id: 'foodlab-flagship',
      name: 'FoodLab',
      category: 'Internacional',
      tier: 'premium',
      isPrime: true,
      rating: 4.9,
      deliveryTime: '20-30 min',
      deliveryFee: 0,
      image: '/images/products/foodLab/orangeChicken.jpeg',
      menu: [
        { 
          id: 'fl1', 
          name: 'Croissant de Desayuno', 
          price: 4.50, 
          description: 'Croissant recién horneado relleno de jamón y queso',
          image: '/images/products/foodLab/croissantDeDesayuno.jpeg'
        },
        { 
          id: 'fl2', 
          name: 'Dumplings Asiáticos', 
          price: 8.00, 
          description: 'Dumplings al vapor con salsa de soya y jengibre',
          image: '/images/products/foodLab/dumplings.jpeg'
        },
        { 
          id: 'fl3', 
          name: 'Papas Cargadas', 
          price: 6.50, 
          description: 'Papas fritas con queso, tocino, cebollín y crema',
          image: '/images/products/foodLab/loadedFries.jpeg'
        },
        { 
          id: 'fl4', 
          name: 'Orange Chicken', 
          price: 12.00, 
          description: 'Pollo crujiente bañado en salsa de naranja dulce',
          image: '/images/products/foodLab/orangeChicken.jpeg'
        },
        { 
          id: 'fl5', 
          name: 'Pad Thai', 
          price: 11.00, 
          description: 'Fideos salteados estilo tailandés con camarones',
          image: '/images/products/foodLab/padTai.jpeg'
        }
      ]
    },
    {
      id: '1',
      name: 'Baleadas de Doña María',
      category: 'Hondureña',
      tier: 'local',
      isPrime: true,
      rating: 4.8,
      deliveryTime: '25-35 min',
      deliveryFee: 2.50,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      menu: [
        { id: '1', name: 'Baleada Simple', price: 2.50, description: 'Tortilla, frijoles, queso' },
        { id: '2', name: 'Baleada Especial', price: 4.00, description: 'Tortilla, frijoles, queso, aguacate, carne' },
        { id: '3', name: 'Baleada Super', price: 5.50, description: 'Tortilla, frijoles, queso, aguacate, carne, huevo' }
      ]
    },
    {
      id: '2',
      name: 'Tacos El Güero',
      category: 'Mexicana',
      tier: 'local',
      isPrime: false,
      rating: 4.5,
      deliveryTime: '20-30 min',
      deliveryFee: 2.00,
      image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
      menu: [
        { id: '4', name: 'Tacos de Carne', price: 1.50, description: 'Tacos de carne asada con cebolla y cilantro' },
        { id: '5', name: 'Tacos de Pollo', price: 1.50, description: 'Tacos de pollo con cebolla y cilantro' },
        { id: '6', name: 'Quesadilla', price: 3.00, description: 'Quesadilla con queso y carne' }
      ]
    },
    {
      id: '3',
      name: 'Pizza Corner',
      category: 'Italiana',
      tier: 'premium',
      isPrime: true,
      rating: 4.7,
      deliveryTime: '30-45 min',
      deliveryFee: 3.50,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      menu: [
        { id: '7', name: 'Pizza Margherita', price: 12.00, description: 'Tomate, mozzarella, albahaca' },
        { id: '8', name: 'Pizza Pepperoni', price: 14.00, description: 'Tomate, mozzarella, pepperoni' },
        { id: '9', name: 'Pizza Hawaiana', price: 15.00, description: 'Tomate, mozzarella, jamón, piña' }
      ]
    }
  ]

  useEffect(() => {
    // Simular carga de datos
    setLoading(true)
    setTimeout(() => {
      setRestaurants(mockRestaurants)
      setLoading(false)
    }, 1000)
  }, [setLoading, setRestaurants])

  return (
    <main style={{ paddingBottom: '80px' }}>
      {/* Restaurants Section */}
      <div style={{ padding: '20px 16px' }}>
        <div className="fade-in stagger-2" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: '700', 
            color: '#111827',
            letterSpacing: '-0.3px'
          }}>
            Restaurantes
          </h2>
          <div className="badge badge-primary" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px'
          }}>
            <Star size={12} style={{ fill: 'white' }} />
            <span style={{ fontSize: '10px' }}>Select</span>
          </div>
        </div>
        
        <div className="fade-in stagger-3">
          <RestaurantList />
        </div>
      </div>
    </main>
  )
}

export default FoodLabsPage

