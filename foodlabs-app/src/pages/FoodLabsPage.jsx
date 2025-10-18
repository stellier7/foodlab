import { useEffect } from 'react'
import { useAppStore } from '../stores/useAppStore'
import RestaurantList from '../components/RestaurantList'
import { MapPin, Star } from 'lucide-react'

const FoodLabsPage = () => {
  const { setLoading, setRestaurants } = useAppStore()

  // Datos de ejemplo para desarrollo
  const mockRestaurants = [
    {
      id: 'foodlab-tgu',
      name: 'FoodLab TGU',
      slug: 'foodlab-tgu',
      city: 'Tegucigalpa',
      category: 'Internacional',
      tier: 'premium',
      isPrime: true,
      rating: 4.9,
      reviewCount: 120,
      deliveryTime: '20-30 min',
      deliveryFee: 0,
      image: '/images/products/foodLab/orangeChicken.jpeg',
      logo: '/images/products/foodLab/orangeChicken.jpeg',
      openingTime: '11:30',
      isOpen: true,
      offers: [
        { type: 'plus', title: 'Ahorra con Plus' },
        { type: 'pickup', title: '10% DTO con retiro en local' }
      ],
      menuCategories: [
        {
          name: 'Más vendidos',
          items: [
            { 
              id: 'orange-chicken', 
              name: 'Orange Chicken', 
              basePrice: 227.90,
              price: 227.90,
              description: 'Pollo crujiente bañado en salsa de naranja dulce',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              isPopular: true,
              popularity: '95% (40)',
              labels: []
            },
            { 
              id: 'boneless', 
              name: 'Boneless', 
              basePrice: 193.40,
              price: 193.40,
              description: 'Deliciosos boneless de pollo crujiente',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              isPopular: true,
              popularity: '98% (65)',
              labels: [],
              sizes: [
                { value: 'regular', label: 'Regular', priceModifier: 0 },
                { value: 'regular-papas', label: 'Regular + Papas', priceModifier: 33.39 },
                { value: '12', label: '12 piezas', priceModifier: 134.74 },
                { value: '24', label: '24 piezas', priceModifier: 405.15 }
              ],
              comboOptions: {
                available: true,
                price: 32.66,
                description: 'Incluye papas fritas',
                includesImage: '/images/products/foodLab/loadedFries.jpeg'
              }
            }
          ]
        },
        {
          name: 'Entradas',
          items: [
            { 
              id: 'croilab', 
              name: 'CroiLab', 
              basePrice: 118.24,
              price: 118.24,
              description: 'Croissant artesanal relleno',
              image: '/images/products/foodLab/croissantDeDesayuno.jpeg',
              labels: ['Vegetariano']
            },
            { 
              id: 'gyozas', 
              name: 'Gyozas', 
              basePrice: 150.00,
              price: 150.00,
              description: 'Dumplings al vapor con salsa de soya y jengibre',
              image: '/images/products/foodLab/dumplings.jpeg',
              labels: ['Vegetariano']
            },
            { 
              id: 'loaded-fries', 
              name: 'Loaded Fries', 
              basePrice: 140.63,
              price: 140.63,
              description: 'Papas fritas con queso, tocino, cebollín y crema',
              image: '/images/products/foodLab/loadedFries.jpeg',
              labels: ['Vegetariano']
            }
          ]
        },
        {
          name: 'Platos principales',
          items: [
            { 
              id: 'tallarin', 
              name: 'Tallarin', 
              basePrice: 234.58,
              price: 234.58,
              description: 'Orange Chicken con tallarines',
              image: '/images/products/foodLab/padTai.jpeg',
              labels: ['Pescaradiano']
            }
          ]
        },
        {
          name: 'Bebidas',
          items: [
            { 
              id: 'agua', 
              name: 'Agua', 
              basePrice: 20.87,
              price: 20.87,
              description: 'Agua purificada',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'coca-cola', 
              name: 'Coca Cola', 
              basePrice: 41.73,
              price: 41.73,
              description: 'Coca Cola 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'pepsi-light', 
              name: 'Pepsi Light', 
              basePrice: 41.73,
              price: 41.73,
              description: 'Pepsi Light 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: '7up', 
              name: '7Up', 
              basePrice: 41.73,
              price: 41.73,
              description: '7Up 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'natural', 
              name: 'Natural', 
              basePrice: 55.64,
              price: 55.64,
              description: 'Jugo natural 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: 'tamarindo', 
              name: 'Tamarindo', 
              basePrice: 55.64,
              price: 55.64,
              description: 'Jugo de tamarindo 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: 'limonada', 
              name: 'Limonada', 
              basePrice: 55.64,
              price: 55.64,
              description: 'Limonada natural 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            }
          ]
        }
      ]
    },
    {
      id: 'foodlab-sps',
      name: 'FoodLab SPS',
      slug: 'foodlab-sps',
      city: 'San Pedro Sula',
      category: 'Internacional',
      tier: 'premium',
      isPrime: true,
      rating: 4.8,
      reviewCount: 95,
      deliveryTime: '25-35 min',
      deliveryFee: 0,
      image: '/images/products/foodLab/orangeChicken.jpeg',
      logo: '/images/products/foodLab/orangeChicken.jpeg',
      openingTime: '11:30',
      isOpen: true,
      offers: [
        { type: 'plus', title: 'Ahorra con Plus' },
        { type: 'pickup', title: '10% DTO con retiro en local' }
      ],
      menuCategories: [
        {
          name: 'Más vendidos',
          items: [
            { 
              id: 'orange-chicken', 
              name: 'Orange Chicken', 
              basePrice: 227.90,
              price: 227.90,
              description: 'Pollo crujiente bañado en salsa de naranja dulce',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              isPopular: true,
              popularity: '93% (42)',
              labels: []
            },
            { 
              id: 'boneless', 
              name: 'Boneless', 
              basePrice: 193.40,
              price: 193.40,
              description: 'Deliciosos boneless de pollo crujiente',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              isPopular: true,
              popularity: '97% (58)',
              labels: [],
              sizes: [
                { value: 'regular', label: 'Regular', priceModifier: 0 },
                { value: 'regular-papas', label: 'Regular + Papas', priceModifier: 33.39 },
                { value: '12', label: '12 piezas', priceModifier: 134.74 },
                { value: '24', label: '24 piezas', priceModifier: 405.15 }
              ],
              comboOptions: {
                available: true,
                price: 32.66,
                description: 'Incluye papas fritas',
                includesImage: '/images/products/foodLab/loadedFries.jpeg'
              }
            }
          ]
        },
        {
          name: 'Entradas',
          items: [
            { 
              id: 'loaded-fries', 
              name: 'Loaded Fries', 
              basePrice: 140.63,
              price: 140.63,
              description: 'Papas fritas con queso, tocino, cebollín y crema',
              image: '/images/products/foodLab/loadedFries.jpeg',
              labels: ['Vegetariano']
            }
          ]
        },
        {
          name: 'Platos principales',
          items: [
            { 
              id: 'angus-burger', 
              name: 'Angus Burger', 
              basePrice: 150.23,
              price: 150.23,
              description: 'Hamburguesa de carne Angus premium',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: []
            },
            { 
              id: 'chicken-sandwich', 
              name: 'Chicken Sandwich', 
              basePrice: 121.02,
              price: 121.02,
              description: 'Sándwich de pollo crujiente',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: []
            },
            { 
              id: 'tallarin', 
              name: 'Tallarin', 
              basePrice: 234.58,
              price: 234.58,
              description: 'Orange Chicken con tallarines',
              image: '/images/products/foodLab/padTai.jpeg',
              labels: ['Pescaradiano']
            }
          ]
        },
        {
          name: 'Bebidas',
          items: [
            { 
              id: 'agua', 
              name: 'Agua', 
              basePrice: 20.87,
              price: 20.87,
              description: 'Agua purificada',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'coca-cola', 
              name: 'Coca Cola', 
              basePrice: 41.73,
              price: 41.73,
              description: 'Coca Cola 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'pepsi-light', 
              name: 'Pepsi Light', 
              basePrice: 41.73,
              price: 41.73,
              description: 'Pepsi Light 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: '7up', 
              name: '7Up', 
              basePrice: 41.73,
              price: 41.73,
              description: '7Up 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'natural', 
              name: 'Natural', 
              basePrice: 55.64,
              price: 55.64,
              description: 'Jugo natural 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: 'tamarindo', 
              name: 'Tamarindo', 
              basePrice: 55.64,
              price: 55.64,
              description: 'Jugo de tamarindo 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: 'limonada', 
              name: 'Limonada', 
              basePrice: 55.64,
              price: 55.64,
              description: 'Limonada natural 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            }
          ]
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
      {/* Hero Section - Scrolls with page */}
      <div className="fade-in stagger-1" style={{
        background: '#f97316',
        padding: '32px 24px',
        textAlign: 'center',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        marginTop: '-1px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          marginBottom: '12px',
          letterSpacing: '-0.5px',
          color: 'white'
        }}>
          ¡Bienvenido a FoodLab!
        </h1>
        <p style={{ 
          color: '#fed7aa', 
          marginBottom: '0',
          fontSize: '15px',
          fontWeight: '500'
        }}>
          Descubre los mejores restaurantes locales y haz tu pedido
        </p>
      </div>

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

