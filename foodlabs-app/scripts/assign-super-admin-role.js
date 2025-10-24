import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjMXyjuIvRNMIfjMNP0t2FzmalpXc2dVU",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "872068459643",
  appId: "1:872068459643:web:084af9024162056d49c6de"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

async function assignSuperAdminRole() {
  try {
    console.log('🔑 Asignando rol de super_admin a santiago@foodlab.store...')
    
    // Hacer login para obtener el UID
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'santiago@foodlab.store', 
      'admin123'
    )
    
    const user = userCredential.user
    console.log(`✅ Login exitoso: ${user.email}`)
    
    // Crear/actualizar el documento de usuario en Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName: 'Santiago Admin',
      role: 'super_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      country: 'honduras',
      region: 'TGU'
    }
    
    await setDoc(doc(db, 'users', user.uid), userDoc)
    console.log(`✅ Rol de super_admin asignado exitosamente a ${user.email}`)
    
    // Verificar que se guardó correctamente
    const savedDoc = await getDoc(doc(db, 'users', user.uid))
    if (savedDoc.exists()) {
      console.log('📋 Datos guardados:', savedDoc.data())
    }
    
    console.log('🎉 Proceso completado exitosamente!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Ejecutar la función
assignSuperAdminRole()
