import { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '../stores/useAppStore'
import { getActiveComercios } from '../services/comercios'
import { getProductsByComercio } from '../services/products'
import RestaurantList from '../components/RestaurantList'
import DietaryLabels from '../components/DietaryLabels'
import { MapPin, Star, Package, Utensils } from 'lucide-react'

const FoodLabsPage = () => {
  const { 
    setLoading, 
    location, 
    isLoading,
    error
  } = useAppStore()

  const [restaurantes, setRestaurantes] = useState([])
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)
  const [restaurantsError, setRestaurantsError] = useState(null)

  // Cargar restaurantes activos
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setIsLoadingRestaurants(true)
        setRestaurantsError(null)
        
        // Obtener solo restaurantes activos
        const comercios = await getActiveComercios('restaurante')
        console.log(`🏪 Comercios activos encontrados:`, comercios.length)
        console.log(`📋 Lista de comercios:`, comercios.map(c => ({ id: c.id, nombre: c.nombre, tipo: c.tipo, estado: c.estado })))
        
        // Obtener productos para cada restaurante
        const restaurantesConProductos = await Promise.all(
          comercios.map(async (comercio) => {
            try {
              console.log(`🔄 Cargando productos para ${comercio.nombre}...`)
              const productos = await getProductsByComercio(comercio.id)
              console.log(`📦 Productos encontrados para ${comercio.nombre}:`, productos.length)
              
              // Solo productos aprobados y publicados
              const productosAprobados = productos.filter(p => {
                const isApproved = p.status === 'aprobado' && p.isPublished
                console.log(`🔍 Producto ${p.nombre}: status=${p.status}, isPublished=${p.isPublished}, aprobado=${isApproved}`)
                return isApproved
              })
              
              console.log(`✅ Productos aprobados para ${comercio.nombre}:`, productosAprobados.length)
              
              // Mapear comercio a la estructura esperada por RestaurantList
              const restauranteData = {
                id: comercio.id,
                name: comercio.nombre,
                slug: comercio.id,
                image: comercio.imagenes?.[0] || '/images/placeholder-restaurant.jpg',
                category: comercio.categoria || 'Restaurante',
                rating: comercio.rating || 4.5,
                deliveryTime: comercio.tiempoEntrega || '30-45 min',
                deliveryFee: comercio.costoEnvio || 0,
                isPrime: comercio.isPrime || false,
                menuCategories: [
                  {
                    name: 'Menú Principal',
                    items: productosAprobados.map(producto => ({
                      id: producto.id,
                      name: producto.nombre,
                      description: producto.descripcion,
                      price: producto.precio_HNL || producto.precio,
                      precio_HNL: producto.precio_HNL || producto.precio,
                      currency: producto.moneda || 'HNL',
                      image: producto.imagenes?.[0] || null,
                      dietaryLabels: producto.etiquetasDietarias || [],
                      category: producto.categoria,
                      isAvailable: producto.estaActivo,
                      stock: producto.stock
                    }))
                  }
                ],
                productCount: productosAprobados.length,
                allProducts: productosAprobados
              }
              
              console.log(`🏪 Datos finales para ${comercio.nombre}:`, {
                id: restauranteData.id,
                name: restauranteData.name,
                productCount: restauranteData.productCount,
                menuItems: restauranteData.menuCategories[0]?.items.length || 0
              })
              
              return restauranteData
            } catch (error) {
              console.error(`❌ Error loading products for ${comercio.nombre}:`, error)
              return {
                id: comercio.id,
                name: comercio.nombre,
                slug: comercio.id,
                image: comercio.imagenes?.[0] || '/images/placeholder-restaurant.jpg',
                category: comercio.categoria || 'Restaurante',
                rating: comercio.rating || 4.5,
                deliveryTime: comercio.tiempoEntrega || '30-45 min',
                deliveryFee: comercio.costoEnvio || 0,
                isPrime: comercio.isPrime || false,
                menuCategories: [],
                productCount: 0,
                allProducts: []
              }
            }
          })
        )
        
        console.log(`🎯 Restaurantes finales con productos:`, restaurantesConProductos.length)
        console.log(`📊 Datos finales:`, restaurantesConProductos.map(r => ({ 
          name: r.name, 
          productCount: r.productCount,
          menuItems: r.menuCategories[0]?.items.length || 0 
        })))
        
        setRestaurantes(restaurantesConProductos)
      } catch (error) {
        console.error('Error loading restaurants:', error)
        setRestaurantsError('Error al cargar los restaurantes')
      } finally {
        setIsLoadingRestaurants(false)
      }
    }

    loadRestaurants()
  }, [])

  // Datos de ejemplo para desarrollo (backup)
  const mockRestaurants = [
    {
      id: 'foodlab-tgu',
      name: 'FoodLab TGU',
      slug: 'foodlab-tgu',
      type: 'restaurant',
      city: 'Tegucigalpa',
      address: 'Col. Palmira, Blvd. Morazán',
      coordinates: {
        lat: 14.0723,
        lng: -87.1921
      },
      deliveryRadius: 5,
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
              precio_HNL: 227.90,
              description: 'Pollo crujiente bañado en salsa de naranja dulce',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              isPopular: true,
              popularity: '95% (40)',
              labels: []
            },
            { 
              id: 'boneless', 
              name: 'Boneless', 
              precio_HNL: 193.40,
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
              precio_HNL: 118.24,
              description: 'Croissant artesanal relleno',
              image: '/images/products/foodLab/croissantDeDesayuno.jpeg',
              labels: ['Vegetariano']
            },
            { 
              id: 'gyozas', 
              name: 'Gyozas', 
              precio_HNL: 150.00,
              description: 'Dumplings al vapor con salsa de soya y jengibre',
              image: '/images/products/foodLab/dumplings.jpeg',
              labels: ['Vegetariano']
            },
            { 
              id: 'loaded-fries', 
              name: 'Loaded Fries', 
              precio_HNL: 140.63,
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
              precio_HNL: 234.58,
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
              precio_HNL: 20.87,
              description: 'Agua purificada',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'coca-cola', 
              name: 'Coca Cola', 
              precio_HNL: 41.73,
              description: 'Coca Cola 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'pepsi-light', 
              name: 'Pepsi Light', 
              precio_HNL: 41.73,
              description: 'Pepsi Light 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: '7up', 
              name: '7Up', 
              precio_HNL: 41.73,
              description: '7Up 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'natural', 
              name: 'Natural', 
              precio_HNL: 55.64,
              description: 'Jugo natural 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: 'tamarindo', 
              name: 'Tamarindo', 
              precio_HNL: 55.64,
              description: 'Jugo de tamarindo 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: 'limonada', 
              name: 'Limonada', 
              precio_HNL: 55.64,
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
      type: 'restaurant',
      city: 'San Pedro Sula',
      address: 'Col. Trejo, Av. Circunvalación',
      coordinates: {
        lat: 15.5047,
        lng: -88.0253
      },
      deliveryRadius: 5,
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
              precio_HNL: 227.90,
              description: 'Pollo crujiente bañado en salsa de naranja dulce',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              isPopular: true,
              popularity: '93% (42)',
              labels: []
            },
            { 
              id: 'boneless', 
              name: 'Boneless', 
              precio_HNL: 193.40,
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
              precio_HNL: 140.63,
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
              precio_HNL: 150.23,
              description: 'Hamburguesa de carne Angus premium',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: []
            },
            { 
              id: 'chicken-sandwich', 
              name: 'Chicken Sandwich', 
              precio_HNL: 121.02,
              description: 'Sándwich de pollo crujiente',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: []
            },
            { 
              id: 'tallarin', 
              name: 'Tallarin', 
              precio_HNL: 234.58,
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
              precio_HNL: 20.87,
              description: 'Agua purificada',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'coca-cola', 
              name: 'Coca Cola', 
              precio_HNL: 41.73,
              description: 'Coca Cola 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'pepsi-light', 
              name: 'Pepsi Light', 
              precio_HNL: 41.73,
              description: 'Pepsi Light 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: '7up', 
              name: '7Up', 
              precio_HNL: 41.73,
              description: '7Up 355ml',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano']
            },
            { 
              id: 'natural', 
              name: 'Natural', 
              precio_HNL: 55.64,
              description: 'Jugo natural 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: 'tamarindo', 
              name: 'Tamarindo', 
              precio_HNL: 55.64,
              description: 'Jugo de tamarindo 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            },
            { 
              id: 'limonada', 
              name: 'Limonada', 
              precio_HNL: 55.64,
              description: 'Limonada natural 16oz',
              image: '/images/products/foodLab/orangeChicken.jpeg',
              labels: ['Vegano', 'Fit']
            }
          ]
        }
      ]
    }
  ]


  // Filtrar restaurantes por ciudad si hay ubicación seleccionada
  const filteredRestaurants = useMemo(() => {
    if (!restaurantes || restaurantes.length === 0) {
      return []
    }
    
    // Si no hay ubicación, mostrar todos los restaurantes
    if (!location || !location.city) {
      return restaurantes
    }
    
    // Filtrar por ciudad usando el nuevo sistema de ubicación
    const filtered = restaurantes.filter(restaurant => {
      const comercioLocation = restaurant.location
      if (!comercioLocation || !comercioLocation.city) {
        return false // No mostrar comercios sin ubicación
      }
      
      // Comparar por código de ciudad (ej: 'TGU', 'SPS')
      return comercioLocation.city === location.city
    })
    
    console.log(`🔍 Filtrado por ciudad ${location.city}:`, filtered.length, 'de', restaurantes.length)
    return filtered
  }, [restaurantes, location])

  if (isLoadingRestaurants) {
    return (
      <main style={{ paddingBottom: '80px' }}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando restaurantes...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
    )
  }

  if (restaurantsError) {
    return (
      <main style={{ paddingBottom: '80px' }}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
          <p>Error al cargar los restaurantes: {restaurantsError}</p>
        </div>
      </main>
    )
  }

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
          </div>
        </div>
        
        <div className="fade-in stagger-3">
          <RestaurantList filteredRestaurants={filteredRestaurants} />
        </div>
      </div>
    </main>
  )
}

export default FoodLabsPage

