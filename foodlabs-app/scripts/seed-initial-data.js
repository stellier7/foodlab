// Script para poblar la base de datos con datos iniciales
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

// Configuración de Firebase (usar las mismas credenciales del proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyBjMXyjuIvRNMIfiMNP0t2FzmalpXc2dVU",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "872068459643",
  appId: "1:872068459643:web:084af9024162056d49c6de"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Datos de comercios iniciales
const comerciosIniciales = [
  {
    nombre: 'FoodLab TGU',
    tipo: 'restaurante',
    categoria: 'Internacional',
    tier: 'premium',
    estado: 'activo',
    ownerId: 'admin', // Se actualizará con el ID real del admin
    direccion: {
      calle: 'Col. Palmira, Blvd. Morazán',
      ciudad: 'Tegucigalpa',
      codigoPostal: '11101',
      coordenadas: { lat: 14.0723, lng: -87.1921 },
      zona: 'Palmira'
    },
    contacto: {
      telefono: '+504 9999-9999',
      whatsapp: '+504 9999-9999',
      email: 'tgu@foodlab.com',
      sitioWeb: 'https://foodlab.com'
    },
    horarios: {
      lunes: { abierto: '11:30', cerrado: '22:00', estaAbierto: true },
      martes: { abierto: '11:30', cerrado: '22:00', estaAbierto: true },
      miercoles: { abierto: '11:30', cerrado: '22:00', estaAbierto: true },
      jueves: { abierto: '11:30', cerrado: '22:00', estaAbierto: true },
      viernes: { abierto: '11:30', cerrado: '23:00', estaAbierto: true },
      sabado: { abierto: '11:30', cerrado: '23:00', estaAbierto: true },
      domingo: { abierto: '11:30', cerrado: '22:00', estaAbierto: true }
    },
    configuracion: {
      radioEntrega: 5,
      pedidoMinimo: 0,
      costoEntrega: 0,
      tiempoEstimado: 25,
      metodosPago: ['efectivo', 'transferencia', 'qr'],
      comision: 15,
      logo: '/images/products/foodLab/orangeChicken.jpeg',
      imagen: '/images/products/foodLab/orangeChicken.jpeg',
      descripcion: 'Restaurante de comida internacional con los mejores sabores'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    nombre: 'FoodLab SPS',
    tipo: 'restaurante',
    categoria: 'Internacional',
    tier: 'premium',
    estado: 'activo',
    ownerId: 'admin',
    direccion: {
      calle: 'Col. Satélite, Av. Circunvalación',
      ciudad: 'San Pedro Sula',
      codigoPostal: '21101',
      coordenadas: { lat: 15.5049, lng: -88.0258 },
      zona: 'Satélite'
    },
    contacto: {
      telefono: '+504 9999-8888',
      whatsapp: '+504 9999-8888',
      email: 'sps@foodlab.com',
      sitioWeb: 'https://foodlab.com'
    },
    horarios: {
      lunes: { abierto: '11:30', cerrado: '22:00', estaAbierto: true },
      martes: { abierto: '11:30', cerrado: '22:00', estaAbierto: true },
      miercoles: { abierto: '11:30', cerrado: '22:00', estaAbierto: true },
      jueves: { abierto: '11:30', cerrado: '22:00', estaAbierto: true },
      viernes: { abierto: '11:30', cerrado: '23:00', estaAbierto: true },
      sabado: { abierto: '11:30', cerrado: '23:00', estaAbierto: true },
      domingo: { abierto: '11:30', cerrado: '22:00', estaAbierto: true }
    },
    configuracion: {
      radioEntrega: 5,
      pedidoMinimo: 0,
      costoEntrega: 0,
      tiempoEstimado: 25,
      metodosPago: ['efectivo', 'transferencia', 'qr'],
      comision: 15,
      logo: '/images/products/foodLab/orangeChicken.jpeg',
      imagen: '/images/products/foodLab/orangeChicken.jpeg',
      descripcion: 'Restaurante de comida internacional con los mejores sabores'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    nombre: 'PadelBuddy',
    tipo: 'tienda',
    categoria: 'Deportes',
    tier: 'local',
    estado: 'activo',
    ownerId: 'admin',
    direccion: {
      calle: 'Col. Palmira, Blvd. Morazán',
      ciudad: 'Tegucigalpa',
      codigoPostal: '11101',
      coordenadas: { lat: 14.0723, lng: -87.1921 },
      zona: 'Palmira'
    },
    contacto: {
      telefono: '+504 9999-7777',
      whatsapp: '+504 9999-7777',
      email: 'info@padelbuddy.com',
      sitioWeb: 'https://padelbuddy.com'
    },
    horarios: {
      lunes: { abierto: '09:00', cerrado: '18:00', estaAbierto: true },
      martes: { abierto: '09:00', cerrado: '18:00', estaAbierto: true },
      miercoles: { abierto: '09:00', cerrado: '18:00', estaAbierto: true },
      jueves: { abierto: '09:00', cerrado: '18:00', estaAbierto: true },
      viernes: { abierto: '09:00', cerrado: '18:00', estaAbierto: true },
      sabado: { abierto: '09:00', cerrado: '16:00', estaAbierto: true },
      domingo: { abierto: '10:00', cerrado: '14:00', estaAbierto: true }
    },
    configuracion: {
      radioEntrega: 10,
      pedidoMinimo: 0,
      costoEntrega: 50,
      tiempoEstimado: 60,
      metodosPago: ['efectivo', 'transferencia'],
      comision: 10,
      logo: '/images/products/padelBuddy/phoneMount_black.jpg',
      imagen: '/images/products/padelBuddy/phoneMount_black.jpg',
      descripcion: 'Tienda especializada en accesorios para padel y deportes'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Productos iniciales
const productosIniciales = [
  // Productos de FoodLab TGU
  {
    comercioId: '', // Se actualizará con el ID real del comercio
    nombre: 'Orange Chicken',
    descripcion: 'Pollo crujiente con salsa de naranja, servido con arroz blanco',
    precio: 180,
    moneda: 'HNL',
    categoria: 'Platos Principales',
    imagenes: ['/images/products/foodLab/orangeChicken.jpeg'],
    variantes: [],
    etiquetasDietarias: ['fit'],
    estaActivo: true,
    isPublished: true,
    status: 'aprobado',
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    comercioId: '',
    nombre: 'Pad Thai',
    descripcion: 'Fideos de arroz salteados con camarones, tofu y vegetales',
    precio: 200,
    moneda: 'HNL',
    categoria: 'Platos Principales',
    imagenes: ['/images/products/foodLab/padTai.jpeg'],
    variantes: [],
    etiquetasDietarias: ['vegetariano'],
    estaActivo: true,
    isPublished: true,
    status: 'aprobado',
    stock: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    comercioId: '',
    nombre: 'Loaded Fries',
    descripcion: 'Papas fritas cargadas con queso, tocino y cebolla',
    precio: 120,
    moneda: 'HNL',
    categoria: 'Entradas',
    imagenes: ['/images/products/foodLab/loadedFries.jpeg'],
    variantes: [],
    etiquetasDietarias: [],
    estaActivo: true,
    isPublished: true,
    status: 'aprobado',
    stock: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    comercioId: '',
    nombre: 'Dumplings',
    descripcion: 'Empanadillas al vapor rellenas de cerdo y vegetales',
    precio: 150,
    moneda: 'HNL',
    categoria: 'Entradas',
    imagenes: ['/images/products/foodLab/dumplings.jpeg'],
    variantes: [],
    etiquetasDietarias: [],
    estaActivo: true,
    isPublished: true,
    status: 'aprobado',
    stock: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    comercioId: '',
    nombre: 'Croissant de Desayuno',
    descripcion: 'Croissant relleno de jamón, queso y huevo',
    precio: 80,
    moneda: 'HNL',
    categoria: 'Desayunos',
    imagenes: ['/images/products/foodLab/croissantDeDesayuno.jpeg'],
    variantes: [],
    etiquetasDietarias: [],
    estaActivo: true,
    isPublished: true,
    status: 'aprobado',
    stock: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Productos de PadelBuddy
  {
    comercioId: '',
    nombre: 'Phone Mount Bicolor',
    descripcion: 'Soporte para teléfono bicolor para padel',
    precio: 450,
    moneda: 'HNL',
    categoria: 'Accesorios',
    imagenes: ['/images/products/padelBuddy/phoneMount_bicolor.jpg'],
    variantes: [
      {
        id: 'color-bicolor',
        nombre: 'Bicolor',
        precio: 450,
        stock: 15,
        descripcion: 'Color bicolor'
      },
      {
        id: 'color-negro',
        nombre: 'Negro',
        precio: 450,
        stock: 20,
        descripcion: 'Color negro'
      }
    ],
    etiquetasDietarias: [],
    estaActivo: true,
    isPublished: true,
    status: 'aprobado',
    stock: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Función principal para ejecutar el seed
async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...')
    
    // 1. Crear comercios
    console.log('📦 Creando comercios...')
    const comerciosCreados = []
    
    for (const comercio of comerciosIniciales) {
      const docRef = await addDoc(collection(db, 'comercios'), comercio)
      comerciosCreados.push({ id: docRef.id, ...comercio })
      console.log(`✅ Comercio creado: ${comercio.nombre} (${docRef.id})`)
    }
    
    // 2. Crear productos
    console.log('🛍️ Creando productos...')
    
    // Mapear productos a comercios
    const productosConComercio = productosIniciales.map(producto => {
      if (producto.nombre.includes('Orange Chicken') || 
          producto.nombre.includes('Pad Thai') || 
          producto.nombre.includes('Loaded Fries') || 
          producto.nombre.includes('Dumplings') || 
          producto.nombre.includes('Croissant')) {
        // Productos de FoodLab
        const foodlabComercio = comerciosCreados.find(c => c.nombre.includes('FoodLab'))
        return { ...producto, comercioId: foodlabComercio.id }
      } else {
        // Productos de PadelBuddy
        const padelbuddyComercio = comerciosCreados.find(c => c.nombre === 'PadelBuddy')
        return { ...producto, comercioId: padelbuddyComercio.id }
      }
    })
    
    for (const producto of productosConComercio) {
      const docRef = await addDoc(collection(db, 'products'), producto)
      console.log(`✅ Producto creado: ${producto.nombre} (${docRef.id})`)
    }
    
    // 3. Crear usuario admin de prueba
    console.log('👤 Creando usuario admin de prueba...')
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        'admin@foodlab.com', 
        'admin123'
      )
      
      // Crear perfil de usuario en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: 'admin@foodlab.com',
        role: 'super_admin',
        profile: {
          name: 'Admin FoodLab',
          phone: '+504 9999-9999'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      console.log(`✅ Usuario admin creado: ${userCredential.user.uid}`)
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️ Usuario admin ya existe')
      } else {
        console.error('❌ Error creando usuario admin:', error)
      }
    }
    
    console.log('🎉 Seed completado exitosamente!')
    console.log(`📊 Resumen:`)
    console.log(`   - Comercios creados: ${comerciosCreados.length}`)
    console.log(`   - Productos creados: ${productosConComercio.length}`)
    console.log(`   - Usuario admin: admin@foodlab.com / admin123`)
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    throw error
  }
}

// Ejecutar el seed si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error)
      process.exit(1)
    })
}

export { seedDatabase }
