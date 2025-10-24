import { initializeApp } from 'firebase/app'
import { getAuth, updatePassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDOPyTZBRmzoq1j-lItXFyniSlX81_6Tjs",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function updatePadelBuddyUser() {
  try {
    console.log('🔍 Buscando comercio PadelBuddy...')
    
    // 1. Buscar el comercio PadelBuddy
    const comerciosQuery = query(
      collection(db, 'comercios'),
      where('nombre', '==', 'PadelBuddy')
    )
    const comerciosSnapshot = await getDocs(comerciosQuery)
    
    if (comerciosSnapshot.empty) {
      console.log('❌ No se encontró el comercio PadelBuddy')
      return
    }
    
    const comercioDoc = comerciosSnapshot.docs[0]
    const comercioData = comercioDoc.data()
    const comercioId = comercioDoc.id
    
    console.log('✅ Comercio PadelBuddy encontrado:', comercioId)
    
    // 2. Buscar usuario asociado a este comercio
    const usersQuery = query(
      collection(db, 'users'),
      where('comercioId', '==', comercioId)
    )
    const usersSnapshot = await getDocs(usersQuery)
    
    if (usersSnapshot.empty) {
      console.log('❌ No se encontró usuario asociado al comercio PadelBuddy')
      console.log('💡 Necesitas crear el usuario manualmente desde el admin panel')
      return
    }
    
    const userDoc = usersSnapshot.docs[0]
    const userData = userDoc.data()
    const userId = userDoc.id
    
    console.log('✅ Usuario encontrado:', userData.email)
    
    // 3. Actualizar datos del usuario en Firestore
    await updateDoc(doc(db, 'users', userId), {
      email: 'pablotellier16@gmail.com',
      displayName: 'PadelBuddy User'
    })
    
    console.log('✅ Datos del usuario actualizados en Firestore')
    
    // 4. Intentar actualizar la contraseña en Firebase Auth
    try {
      // Primero intentar hacer login con el email actual
      const currentEmail = userData.email
      console.log('🔐 Intentando login con email actual:', currentEmail)
      
      // Nota: Necesitaríamos la contraseña actual para poder cambiar la contraseña
      // Por ahora solo actualizamos el email en Firestore
      console.log('⚠️ Para cambiar la contraseña, necesitas hacerlo manualmente desde Firebase Console')
      console.log('📧 Nuevo email configurado: pablotellier16@gmail.com')
      console.log('🔑 Nueva contraseña a configurar: paddelbuddy123')
      
    } catch (authError) {
      console.log('⚠️ No se pudo actualizar la contraseña automáticamente:', authError.message)
      console.log('💡 Actualiza manualmente desde Firebase Console:')
      console.log('   - Email: pablotellier16@gmail.com')
      console.log('   - Password: paddelbuddy123')
    }
    
    console.log('🎉 Proceso completado exitosamente!')
    
  } catch (error) {
    console.error('❌ Error actualizando usuario de PadelBuddy:', error)
  }
}

// Ejecutar el script
updatePadelBuddyUser()
  .then(() => {
    console.log('✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })
