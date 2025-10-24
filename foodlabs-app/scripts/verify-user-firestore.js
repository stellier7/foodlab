// Script para verificar si el usuario admin existe en Firestore
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBjMXyjuIvRNMIfjMNP0t2FzmalpXc2dVU",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "872068459643",
  appId: "1:872068459643:web:084af9024162056d49c6de"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function verifyUserInFirestore() {
  console.log('🔍 Verificando usuarios en Firestore...')
  
  try {
    // 1. Listar todos los usuarios en la colección 'users'
    console.log('\n📋 Listando todos los usuarios en Firestore:')
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)
    
    console.log(`📊 Total de usuarios encontrados: ${usersSnapshot.size}`)
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data()
      console.log(`\n👤 Usuario ID: ${doc.id}`)
      console.log(`📧 Email: ${userData.email}`)
      console.log(`🎭 Rol: ${userData.role}`)
      console.log(`👤 Nombre: ${userData.displayName}`)
      console.log(`📅 Creado: ${userData.createdAt}`)
      console.log(`✅ Activo: ${userData.isActive}`)
      console.log('---')
    })
    
    // 2. Buscar específicamente admin@foodlab.store
    console.log('\n🔍 Buscando admin@foodlab.store específicamente...')
    const adminEmail = 'admin@foodlab.store'
    
    let adminFound = false
    usersSnapshot.forEach((doc) => {
      const userData = doc.data()
      if (userData.email === adminEmail) {
        adminFound = true
        console.log(`✅ ENCONTRADO: ${adminEmail}`)
        console.log(`📄 Documento ID: ${doc.id}`)
        console.log(`🎭 Rol: ${userData.role}`)
        console.log(`👤 Nombre: ${userData.displayName}`)
        console.log(`📅 Creado: ${userData.createdAt}`)
        console.log(`✅ Activo: ${userData.isActive}`)
      }
    })
    
    if (!adminFound) {
      console.log(`❌ NO ENCONTRADO: ${adminEmail}`)
      console.log('\n💡 Posibles causas:')
      console.log('1. El usuario no fue creado en Firestore')
      console.log('2. El email es diferente al esperado')
      console.log('3. El usuario está en otra colección')
    }
    
    // 3. Verificar estructura de datos
    console.log('\n📋 Verificando estructura de datos del primer usuario...')
    if (usersSnapshot.size > 0) {
      const firstUser = usersSnapshot.docs[0]
      const firstUserData = firstUser.data()
      console.log('📊 Estructura de datos:', Object.keys(firstUserData))
      console.log('📄 Datos completos:', firstUserData)
    }
    
  } catch (error) {
    console.error('💥 Error verificando usuarios:', error)
    console.error('💥 Error code:', error.code)
    console.error('💥 Error message:', error.message)
  }
}

// Ejecutar verificación
verifyUserInFirestore()
