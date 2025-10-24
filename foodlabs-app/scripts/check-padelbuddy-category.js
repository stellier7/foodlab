import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDOPyTZBRmzoq1j-lItXFyniSlX81_6Tjs",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const checkPadelBuddyCategory = async () => {
  console.log('🔍 Verificando categoría de PadelBuddy...')
  
  try {
    // Buscar el comercio "PadelBuddy"
    const comerciosQuery = query(
      collection(db, 'comercios'),
      where('nombre', '==', 'PadelBuddy')
    )
    const comerciosSnapshot = await getDocs(comerciosQuery)

    if (comerciosSnapshot.empty) {
      console.log('❌ Comercio PadelBuddy no encontrado.')
      return
    }

    const comercioDoc = comerciosSnapshot.docs[0]
    const comercioData = comercioDoc.data()
    
    console.log('✅ Comercio PadelBuddy encontrado:')
    console.log('📋 Datos del comercio:')
    console.log('   ID:', comercioDoc.id)
    console.log('   Nombre:', comercioData.nombre)
    console.log('   Tipo:', comercioData.tipo)
    console.log('   Categoría:', comercioData.categoria)
    console.log('   Estado:', comercioData.estado)
    console.log('   Ubicación:', comercioData.location)

    // También verificar todos los comercios para ver qué categorías existen
    console.log('\n🔍 Verificando todas las categorías de comercios...')
    const allComerciosQuery = query(collection(db, 'comercios'))
    const allComerciosSnapshot = await getDocs(allComerciosQuery)
    
    const categories = new Set()
    allComerciosSnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.categoria) {
        categories.add(data.categoria)
      }
    })
    
    console.log('📋 Categorías encontradas en Firestore:')
    categories.forEach(cat => console.log('   -', cat))

  } catch (error) {
    console.error('❌ Error verificando categoría de PadelBuddy:', error)
  }
}

checkPadelBuddyCategory()
