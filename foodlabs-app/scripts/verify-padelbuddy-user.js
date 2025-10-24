import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

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
const auth = getAuth(app)

const verifyPadelBuddyUser = async () => {
  console.log('🔍 Verificando usuario de PadelBuddy...')
  
  try {
    // 1. Buscar el comercio "PadelBuddy" en Firestore
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
    const comercioId = comercioDoc.id
    console.log('✅ Comercio PadelBuddy encontrado:', comercioId)

    // 2. Buscar si existe un usuario asociado a ese comercioId
    const usersQuery = query(
      collection(db, 'users'),
      where('comercioId', '==', comercioId)
    )
    const usersSnapshot = await getDocs(usersQuery)

    if (usersSnapshot.empty) {
      console.log('❌ No se encontró usuario asociado a PadelBuddy.')
      return
    }

    const userDoc = usersSnapshot.docs[0]
    const userData = userDoc.data()
    const userEmail = userData.email
    const userUid = userData.uid
    console.log('✅ Usuario encontrado en Firestore:', userEmail)
    console.log('📋 Datos del usuario:', {
      email: userData.email,
      uid: userData.uid,
      comercioId: userData.comercioId,
      role: userData.role
    })

    // 3. Intentar hacer login con las credenciales
    console.log('🔐 Intentando hacer login con las credenciales...')
    
    // Primero intentar con el email actual
    try {
      await signInWithEmailAndPassword(auth, userEmail, 'paddelbuddy123')
      console.log('✅ Login exitoso con email actual:', userEmail)
    } catch (error) {
      console.log('❌ Login falló con email actual:', error.message)
      
      // Intentar con el email que quieres usar
      try {
        await signInWithEmailAndPassword(auth, 'pablotellier16@gmail.com', 'paddelbuddy123')
        console.log('✅ Login exitoso con email deseado: pablotellier16@gmail.com')
      } catch (error2) {
        console.log('❌ Login falló con email deseado:', error2.message)
        console.log('💡 Posibles causas:')
        console.log('   - El usuario no existe en Firebase Authentication')
        console.log('   - La contraseña no coincide')
        console.log('   - El email no está correctamente configurado')
      }
    }

  } catch (error) {
    console.error('❌ Error verificando usuario de PadelBuddy:', error)
  }
}

verifyPadelBuddyUser()
