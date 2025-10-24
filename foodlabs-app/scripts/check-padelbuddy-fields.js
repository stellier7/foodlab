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

const checkPadelBuddyFields = async () => {
  console.log('🔍 Verificando campos de PadelBuddy...')
  
  try {
    // 1. Buscar el comercio PadelBuddy
    const comerciosQuery = query(
      collection(db, 'comercios'),
      where('nombre', '==', 'PadelBuddy')
    )
    const comerciosSnapshot = await getDocs(comerciosQuery)
    
    if (comerciosSnapshot.empty) {
      console.log('❌ Comercio PadelBuddy no encontrado')
      return
    }
    
    const comercioDoc = comerciosSnapshot.docs[0]
    const comercioData = comercioDoc.data()
    const comercioId = comercioDoc.id
    
    console.log('✅ Comercio PadelBuddy encontrado:', comercioId)
    console.log('📋 Todos los campos del comercio:')
    console.log(JSON.stringify(comercioData, null, 2))
    
    // Verificar campos específicos
    console.log('\n🔍 Verificando campos específicos:')
    console.log('- id:', comercioId)
    console.log('- nombre:', comercioData.nombre)
    console.log('- categoria:', comercioData.categoria)
    console.log('- tipo:', comercioData.tipo)
    console.log('- estado:', comercioData.estado)
    console.log('- location:', comercioData.location)
    
    // Verificar si tiene productos
    const productsQuery = query(
      collection(db, 'products'),
      where('comercioId', '==', comercioId)
    )
    const productsSnapshot = await getDocs(productsQuery)
    console.log('- productos asociados:', productsSnapshot.docs.length)
    
    if (productsSnapshot.docs.length > 0) {
      console.log('📦 Productos encontrados:')
      productsSnapshot.docs.forEach((doc, index) => {
        const productData = doc.data()
        console.log(`  ${index + 1}. ${productData.nombre} - ${productData.status} - ${productData.isPublished}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error verificando PadelBuddy:', error)
  }
}

checkPadelBuddyFields()
