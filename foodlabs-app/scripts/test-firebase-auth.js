// Script para probar Firebase Authentication
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDOPyTZBRmzoq1j-lItXFyniSlX81_6Tjs",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "872068459643",
  appId: "1:872068459643:web:084af9024162056d49c6de"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

async function testFirebaseAuth() {
  console.log('🧪 Probando Firebase Authentication...')
  
  try {
    // Test 1: Intentar crear un usuario de prueba
    console.log('📝 Test 1: Creando usuario de prueba...')
    const testEmail = `test-${Date.now()}@foodlab.store`
    const testPassword = 'test123456'
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword)
    console.log('✅ Usuario creado exitosamente:', userCredential.user.uid)
    
    // Test 2: Intentar hacer login con el usuario creado
    console.log('🔐 Test 2: Haciendo login...')
    await signInWithEmailAndPassword(auth, testEmail, testPassword)
    console.log('✅ Login exitoso!')
    
    console.log('🎉 Firebase Authentication está funcionando correctamente!')
    
  } catch (error) {
    console.error('❌ Error en Firebase Authentication:', error)
    console.error('❌ Error code:', error.code)
    console.error('❌ Error message:', error.message)
    
    if (error.code === 'auth/api-key-not-valid') {
      console.log('🔧 Solución: Ve a Firebase Console y habilita Authentication')
    }
  }
}

// Ejecutar test
testFirebaseAuth()
