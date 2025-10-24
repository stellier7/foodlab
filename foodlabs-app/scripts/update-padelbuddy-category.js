import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'

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

const updatePadelBuddyCategory = async () => {
  console.log('🔍 Actualizando categoría de PadelBuddy...')
  
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
    console.log('📋 Categoría actual:', comercioData.categoria)
    
    // Actualizar la categoría a "Accesorios"
    await updateDoc(comercioDoc.ref, {
      categoria: 'Accesorios'
    })
    
    console.log('✅ Categoría actualizada a: Accesorios')
    console.log('📋 Datos actualizados:')
    console.log('   Nombre:', comercioData.nombre)
    console.log('   Categoría anterior:', comercioData.categoria)
    console.log('   Categoría nueva: Accesorios')

  } catch (error) {
    console.error('❌ Error actualizando categoría de PadelBuddy:', error)
  }
}

updatePadelBuddyCategory()
