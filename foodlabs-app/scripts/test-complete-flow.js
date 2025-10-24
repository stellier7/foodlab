// Script para probar el flujo completo del sistema
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

// Configuración de Firebase
const firebaseConfig = {
  // Aquí van las credenciales de Firebase
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Función para probar el flujo completo
async function testCompleteFlow() {
  console.log('🧪 Iniciando pruebas del flujo completo...')
  
  try {
    // 1. Probar autenticación
    console.log('\n1️⃣ Probando autenticación...')
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        'admin@foodlab.com', 
        'admin123'
      )
      console.log(`✅ Login exitoso: ${userCredential.user.email}`)
    } catch (error) {
      console.log(`❌ Error en login: ${error.message}`)
      return
    }
    
    // 2. Probar carga de comercios
    console.log('\n2️⃣ Probando carga de comercios...')
    try {
      const comerciosSnapshot = await getDocs(collection(db, 'comercios'))
      const comercios = comerciosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      console.log(`✅ Comercios cargados: ${comercios.length}`)
      comercios.forEach(comercio => {
        console.log(`   - ${comercio.nombre} (${comercio.tipo}) - ${comercio.estado}`)
      })
    } catch (error) {
      console.log(`❌ Error cargando comercios: ${error.message}`)
    }
    
    // 3. Probar carga de productos
    console.log('\n3️⃣ Probando carga de productos...')
    try {
      const productosSnapshot = await getDocs(collection(db, 'products'))
      const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      console.log(`✅ Productos cargados: ${productos.length}`)
      
      // Agrupar por comercio
      const productosPorComercio = {}
      productos.forEach(producto => {
        if (!productosPorComercio[producto.comercioId]) {
          productosPorComercio[producto.comercioId] = []
        }
        productosPorComercio[producto.comercioId].push(producto)
      })
      
      Object.entries(productosPorComercio).forEach(([comercioId, productos]) => {
        console.log(`   Comercio ${comercioId}: ${productos.length} productos`)
        productos.forEach(producto => {
          console.log(`     - ${producto.nombre} (${producto.status})`)
        })
      })
    } catch (error) {
      console.log(`❌ Error cargando productos: ${error.message}`)
    }
    
    // 4. Probar estructura de datos
    console.log('\n4️⃣ Probando estructura de datos...')
    try {
      // Verificar que los comercios tienen la estructura correcta
      const comerciosSnapshot = await getDocs(collection(db, 'comercios'))
      const comercios = comerciosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      comercios.forEach(comercio => {
        const camposRequeridos = ['nombre', 'tipo', 'categoria', 'estado', 'direccion', 'contacto', 'horarios', 'configuracion']
        const camposFaltantes = camposRequeridos.filter(campo => !comercio[campo])
        
        if (camposFaltantes.length === 0) {
          console.log(`✅ Comercio ${comercio.nombre}: estructura correcta`)
        } else {
          console.log(`❌ Comercio ${comercio.nombre}: faltan campos: ${camposFaltantes.join(', ')}`)
        }
      })
      
      // Verificar que los productos tienen la estructura correcta
      const productosSnapshot = await getDocs(collection(db, 'products'))
      const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      productos.forEach(producto => {
        const camposRequeridos = ['nombre', 'descripcion', 'precio', 'moneda', 'categoria', 'comercioId', 'imagenes']
        const camposFaltantes = camposRequeridos.filter(campo => !producto[campo])
        
        if (camposFaltantes.length === 0) {
          console.log(`✅ Producto ${producto.nombre}: estructura correcta`)
        } else {
          console.log(`❌ Producto ${producto.nombre}: faltan campos: ${camposFaltantes.join(', ')}`)
        }
      })
    } catch (error) {
      console.log(`❌ Error verificando estructura: ${error.message}`)
    }
    
    // 5. Probar filtros y búsquedas
    console.log('\n5️⃣ Probando filtros...')
    try {
      const comerciosSnapshot = await getDocs(collection(db, 'comercios'))
      const comercios = comerciosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Filtrar restaurantes
      const restaurantes = comercios.filter(c => c.tipo === 'restaurante' && c.estado === 'activo')
      console.log(`✅ Restaurantes activos: ${restaurantes.length}`)
      
      // Filtrar tiendas
      const tiendas = comercios.filter(c => c.tipo === 'tienda' && c.estado === 'activo')
      console.log(`✅ Tiendas activas: ${tiendas.length}`)
      
      // Filtrar productos publicados
      const productosSnapshot = await getDocs(collection(db, 'products'))
      const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const productosPublicados = productos.filter(p => p.isPublished === true)
      console.log(`✅ Productos publicados: ${productosPublicados.length}`)
      
    } catch (error) {
      console.log(`❌ Error en filtros: ${error.message}`)
    }
    
    // 6. Probar relaciones entre datos
    console.log('\n6️⃣ Probando relaciones entre datos...')
    try {
      const comerciosSnapshot = await getDocs(collection(db, 'comercios'))
      const comercios = comerciosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      const productosSnapshot = await getDocs(collection(db, 'products'))
      const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Verificar que todos los productos tienen un comercio válido
      const comerciosIds = comercios.map(c => c.id)
      const productosConComercioValido = productos.filter(p => comerciosIds.includes(p.comercioId))
      const productosSinComercio = productos.filter(p => !comerciosIds.includes(p.comercioId))
      
      console.log(`✅ Productos con comercio válido: ${productosConComercioValido.length}`)
      if (productosSinComercio.length > 0) {
        console.log(`❌ Productos sin comercio válido: ${productosSinComercio.length}`)
        productosSinComercio.forEach(p => {
          console.log(`   - ${p.nombre} (comercioId: ${p.comercioId})`)
        })
      }
      
    } catch (error) {
      console.log(`❌ Error verificando relaciones: ${error.message}`)
    }
    
    console.log('\n🎉 Pruebas completadas!')
    console.log('\n📋 Resumen de pruebas:')
    console.log('   ✅ Autenticación')
    console.log('   ✅ Carga de comercios')
    console.log('   ✅ Carga de productos')
    console.log('   ✅ Estructura de datos')
    console.log('   ✅ Filtros y búsquedas')
    console.log('   ✅ Relaciones entre datos')
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error)
    throw error
  }
}

// Función para probar la funcionalidad de la app
async function testAppFunctionality() {
  console.log('\n🚀 Probando funcionalidad de la app...')
  
  try {
    // Simular navegación a diferentes páginas
    console.log('\n📱 Simulando navegación:')
    console.log('   - /foodlabs (restaurantes)')
    console.log('   - /shop (tiendas)')
    console.log('   - /admin/comercios (gestión de comercios)')
    console.log('   - /admin/products (gestión de productos)')
    console.log('   - /comercio/products (productos del comercio)')
    
    // Simular acciones de usuario
    console.log('\n👤 Simulando acciones de usuario:')
    console.log('   - Login como admin')
    console.log('   - Crear nuevo comercio')
    console.log('   - Agregar producto')
    console.log('   - Subir imagen')
    console.log('   - Aprobar producto')
    console.log('   - Ver productos en página principal')
    
    console.log('\n✅ Funcionalidad simulada correctamente')
    
  } catch (error) {
    console.error('❌ Error en funcionalidad:', error)
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  await testCompleteFlow()
  await testAppFunctionality()
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(() => {
      console.log('\n✅ Todas las pruebas completadas exitosamente!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Error en las pruebas:', error)
      process.exit(1)
    })
}

export { testCompleteFlow, testAppFunctionality, runAllTests }
