import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, updatePassword } from 'firebase/auth'

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

const createPadelBuddyAuthUser = async () => {
  console.log('🔍 Creando usuario de Firebase Authentication para PadelBuddy...')
  
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

    // 3. Crear el usuario en Firebase Authentication
    console.log('🔐 Creando usuario en Firebase Authentication...')
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, 'paddelbuddy123')
      const newUser = userCredential.user
      console.log('✅ Usuario creado en Firebase Authentication:', newUser.uid)
      
      // 4. Actualizar el UID en Firestore si es diferente
      if (newUser.uid !== userUid) {
        console.log('🔄 Actualizando UID en Firestore...')
        await updateDoc(userDoc.ref, {
          uid: newUser.uid
        })
        console.log('✅ UID actualizado en Firestore')
      }
      
      console.log('✅ Usuario de PadelBuddy creado exitosamente!')
      console.log('📋 Credenciales:')
      console.log('   Email:', userEmail)
      console.log('   Password: paddelbuddy123')
      console.log('   UID:', newUser.uid)
      
    } catch (error) {
      console.log('❌ Error creando usuario en Firebase Authentication:', error.message)
      
      if (error.code === 'auth/email-already-in-use') {
        console.log('💡 El email ya está en uso. Intentando actualizar la contraseña...')
        // Aquí necesitaríamos el Admin SDK para actualizar la contraseña de otro usuario
        console.log('⚠️ No se puede actualizar la contraseña desde el cliente. Usa Firebase Console.')
      }
    }

  } catch (error) {
    console.error('❌ Error creando usuario de PadelBuddy:', error)
  }
}

createPadelBuddyAuthUser()
