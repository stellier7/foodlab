import { initializeApp } from 'firebase/app'
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
const auth = getAuth(app)

const testPadelBuddyLogin = async () => {
  console.log('🔐 Probando login de PadelBuddy...')
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'pablotellier16@gmail.com', 'paddelbuddy123')
    const user = userCredential.user
    
    console.log('✅ Login exitoso!')
    console.log('📋 Datos del usuario:')
    console.log('   UID:', user.uid)
    console.log('   Email:', user.email)
    console.log('   Email Verified:', user.emailVerified)
    
    // Cerrar sesión
    await auth.signOut()
    console.log('✅ Sesión cerrada correctamente')
    
  } catch (error) {
    console.log('❌ Error en login:', error.message)
    console.log('❌ Código de error:', error.code)
  }
}

testPadelBuddyLogin()
