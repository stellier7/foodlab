import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { readFileSync } from 'fs'

// Load environment variables from .env.local
const envContent = readFileSync('.env.local', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjMXyjuIvRNMIfjMNP0t2FzmalpXc2dVU",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "872068459643",
  appId: "1:872068459643:web:084af9024162056d49c6de"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createSuperAdmin() {
  const email = 'santiago@foodlab.store'
  const password = 'superadmin123' // Cambiar después del primer login
  const displayName = 'Santiago Tellier'
  
  try {
    console.log('🔥 Creando super admin...')
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    console.log('✅ Usuario creado en Firebase Auth:', user.uid)
    
    await updateProfile(user, { displayName })
    console.log('✅ Perfil actualizado')
    
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: 'super_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      country: 'honduras',
      region: 'TGU'
    }
    
    await setDoc(doc(db, 'users', user.uid), userDoc)
    console.log('✅ Documento de usuario creado en Firestore')
    
    console.log('🎉 Super admin creado exitosamente!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  El email ya está en uso. Verificando si el usuario existe en Firestore...')
      
      // Intentar obtener el usuario existente
      try {
        const userDoc = await getDoc(doc(db, 'users', 'existing-user-id'))
        if (userDoc.exists()) {
          console.log('✅ Usuario ya existe en Firestore')
        } else {
          console.log('⚠️  Usuario existe en Auth pero no en Firestore')
        }
      } catch (docError) {
        console.error('Error verificando documento:', docError.message)
      }
    }
  }
}

createSuperAdmin()
