import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
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
const auth = getAuth(app)
const db = getFirestore(app)

const regeneratePadelBuddyPassword = async () => {
  const email = 'pablotellier16@gmail.com'
  const newPassword = 'paddelbuddy123' // Usar la contraseña que ya sabemos que funciona
  
  console.log('🔐 Regenerando contraseña de PadelBuddy...')
  
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
    
    const comercioId = comerciosSnapshot.docs[0].id
    console.log('✅ Comercio encontrado:', comercioId)
    
    // 2. Buscar usuario en Firestore
    const usersQuery = query(
      collection(db, 'users'),
      where('comercioId', '==', comercioId)
    )
    const usersSnapshot = await getDocs(usersQuery)
    
    if (usersSnapshot.empty) {
      console.log('❌ Usuario no encontrado en Firestore')
      return
    }
    
    const userDoc = usersSnapshot.docs[0]
    console.log('✅ Usuario encontrado en Firestore')
    
    // 3. Intentar login para verificar si existe en Auth
    try {
      await signInWithEmailAndPassword(auth, email, newPassword)
      console.log('✅ Usuario ya existe en Auth con la contraseña correcta')
    } catch (loginError) {
      if (loginError.code === 'auth/user-not-found') {
        // Usuario no existe, crearlo
        console.log('⚠️ Usuario no existe en Auth, creando...')
        const userCredential = await createUserWithEmailAndPassword(auth, email, newPassword)
        console.log('✅ Usuario creado en Auth:', userCredential.user.uid)
        
        // Actualizar UID en Firestore
        await updateDoc(userDoc.ref, {
          uid: userCredential.user.uid
        })
        console.log('✅ UID actualizado en Firestore')
      } else if (loginError.code === 'auth/wrong-password') {
        console.log('⚠️ Usuario existe pero con contraseña diferente')
        console.log('   Necesitas resetear la contraseña desde Firebase Console')
      } else {
        throw loginError
      }
    }
    
    console.log('✅ Proceso completado')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', newPassword)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

regeneratePadelBuddyPassword()