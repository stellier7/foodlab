import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore'

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

const fixPadelBuddyUser = async () => {
  console.log('🔧 Arreglando usuario de PadelBuddy...')
  
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
    
    // 2. Hacer login para obtener el UID de Firebase Auth
    const email = 'pablotellier16@gmail.com'
    const password = 'paddelbuddy123'
    
    console.log('🔐 Haciendo login para obtener UID...')
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid
    
    console.log('✅ UID obtenido de Firebase Auth:', uid)
    
    // 3. Verificar si el usuario ya existe en Firestore
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
    
    if (!userSnap.empty) {
      console.log('✅ Usuario ya existe en Firestore')
      const existingUser = userSnap.docs[0]
      console.log('📄 Datos del usuario:', existingUser.data())
      return
    }
    
    // 4. Crear el usuario en Firestore
    console.log('📝 Creando usuario en Firestore...')
    const userData = {
      uid: uid,
      email: email,
      role: 'business',
      comercioId: comercioId,
      displayName: comercioData.nombre,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      country: comercioData.location?.country || 'honduras',
      region: comercioData.location?.cityName || 'Tegucigalpa',
      requirePasswordChange: false
    }
    
    await setDoc(userRef, userData)
    console.log('✅ Usuario creado en Firestore con UID:', uid)
    console.log('📄 Datos del usuario:', userData)
    
    // 5. Verificar que se creó correctamente
    const verifySnap = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
    if (!verifySnap.empty) {
      console.log('✅ Verificación exitosa - Usuario existe en Firestore')
    } else {
      console.log('❌ Error en la verificación')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 'auth/invalid-credential') {
      console.log('💡 Las credenciales son incorrectas. Verifica el email y password.')
    }
  }
}

fixPadelBuddyUser()
