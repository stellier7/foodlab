// Script para limpiar comercios duplicados
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore'

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
const db = getFirestore(app)

const cleanDuplicateComercios = async () => {
  console.log('🧹 Limpiando comercios duplicados...')

  try {
    // Obtener todos los comercios
    const comerciosCol = collection(db, 'comercios')
    const comerciosSnapshot = await getDocs(comerciosCol)
    
    if (comerciosSnapshot.empty) {
      console.log('No se encontraron comercios.')
      return
    }

    console.log(`📊 Total de comercios encontrados: ${comerciosSnapshot.size}`)
    
    // Agrupar por nombre para encontrar duplicados
    const comerciosByName = {}
    const comerciosToDelete = []
    
    comerciosSnapshot.docs.forEach(doc => {
      const comercioData = doc.data()
      const nombre = comercioData.nombre || comercioData.name || 'Sin nombre'
      
      if (!comerciosByName[nombre]) {
        comerciosByName[nombre] = []
      }
      comerciosByName[nombre].push({
        id: doc.id,
        data: comercioData,
        doc: doc
      })
    })

    // Identificar duplicados
    console.log('\n🔍 Analizando duplicados...')
    Object.keys(comerciosByName).forEach(nombre => {
      const comercios = comerciosByName[nombre]
      if (comercios.length > 1) {
        console.log(`\n📋 ${nombre}: ${comercios.length} duplicados encontrados`)
        
        // Ordenar por fecha de creación (mantener el más reciente)
        comercios.sort((a, b) => {
          const dateA = new Date(a.data.createdAt || a.data.fechaCreacion || 0)
          const dateB = new Date(b.data.createdAt || b.data.fechaCreacion || 0)
          return dateB - dateA
        })
        
        // Mantener el primero (más reciente) y marcar los demás para eliminar
        const toKeep = comercios[0]
        const toDelete = comercios.slice(1)
        
        console.log(`✅ Mantener: ${toKeep.id} (creado: ${toKeep.data.createdAt || toKeep.data.fechaCreacion})`)
        toDelete.forEach(comercio => {
          console.log(`❌ Eliminar: ${comercio.id} (creado: ${comercio.data.createdAt || comercio.data.fechaCreacion})`)
          comerciosToDelete.push(comercio)
        })
      } else {
        console.log(`✅ ${nombre}: Sin duplicados`)
      }
    })

    if (comerciosToDelete.length === 0) {
      console.log('\n🎉 No hay duplicados para eliminar!')
      return
    }

    console.log(`\n🗑️ Eliminando ${comerciosToDelete.length} comercios duplicados...`)
    
    // Eliminar duplicados
    for (const comercio of comerciosToDelete) {
      try {
        await deleteDoc(doc(db, 'comercios', comercio.id))
        console.log(`✅ Eliminado: ${comercio.id} (${comercio.data.nombre || comercio.data.name})`)
      } catch (error) {
        console.error(`❌ Error eliminando ${comercio.id}:`, error)
      }
    }

    console.log('\n🎉 Limpieza completada!')
    
    // Mostrar comercios restantes
    console.log('\n📋 Comercios restantes:')
    const finalSnapshot = await getDocs(comerciosCol)
    finalSnapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log(`✅ ${data.nombre || data.name}: ${doc.id}`)
    })

  } catch (error) {
    console.error('💥 Error limpiando comercios:', error)
  }
}

cleanDuplicateComercios()
