import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

// Configuración de Firebase (usar las mismas credenciales que en el proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyBvQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Datos del producto Phone Mount
const phoneMountProduct = {
  name: "Phone Mount - PadelBuddy",
  description: "Soporte para teléfono móvil ideal para jugadores de pádel. Diseño ergonómico y resistente.",
  price: 425,
  category: "accesorios",
  businessType: "shop",
  businessId: "padelbuddy",
  images: [
    "/images/products/padelBuddy/phoneMount_black.jpg",
    "/images/products/padelBuddy/phoneMount_bicolor.jpg"
  ],
  variants: [
    {
      id: "negro",
      name: "Negro",
      price: 425,
      stock: 10,
      image: "/images/products/padelBuddy/phoneMount_black.jpg"
    },
    {
      id: "bicolor",
      name: "Bi-Color",
      price: 425,
      stock: 10,
      image: "/images/products/padelBuddy/phoneMount_bicolor.jpg"
    }
  ],
  isPublished: true,
  isActive: true,
  status: "approved",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ["padel", "accesorio", "telefono", "deporte"],
  specifications: {
    material: "Plástico resistente",
    peso: "50g",
    compatibilidad: "Todos los teléfonos",
    color: "Negro / Bi-Color"
  }
}

async function addPhoneMountProduct() {
  try {
    console.log('Agregando producto Phone Mount...')
    
    const docRef = await addDoc(collection(db, 'products'), phoneMountProduct)
    console.log('✅ Producto agregado exitosamente con ID:', docRef.id)
    
    console.log('📱 Producto Phone Mount creado:')
    console.log('- Nombre:', phoneMountProduct.name)
    console.log('- Precio:', phoneMountProduct.price, 'L')
    console.log('- Variantes:', phoneMountProduct.variants.length)
    console.log('- Estado:', phoneMountProduct.isPublished ? 'Publicado' : 'No publicado')
    
  } catch (error) {
    console.error('❌ Error agregando producto:', error)
  }
}

// Ejecutar el script
addPhoneMountProduct()
