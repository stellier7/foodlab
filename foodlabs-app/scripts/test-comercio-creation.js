#!/usr/bin/env node

/**
 * Script para probar la creación de comercios desde el admin panel
 * 
 * Este script simula el flujo completo:
 * 1. Admin crea un comercio
 * 2. Se genera automáticamente un usuario de Firebase Auth
 * 3. Se crea el comercio en Firestore
 * 4. Se puede subir imágenes (después de crear el comercio)
 */

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, getDocs, query, where, orderBy } = require('firebase/firestore')

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDOPy2jqQqQqQqQqQqQqQqQqQqQqQqQqQ",
  authDomain: "foodlab-production.firebaseapp.com",
  projectId: "foodlab-production",
  storageBucket: "foodlab-production.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function testComercioCreation() {
  try {
    console.log('🧪 Iniciando prueba de creación de comercios...')
    
    // 1. Verificar comercios existentes
    console.log('\n📋 Verificando comercios existentes...')
    const comerciosRef = collection(db, 'comercios')
    const comerciosSnapshot = await getDocs(comerciosRef)
    console.log(`✅ Comercios existentes: ${comerciosSnapshot.docs.length}`)
    
    // 2. Crear un comercio de prueba
    console.log('\n🏪 Creando comercio de prueba...')
    const nuevoComercio = {
      nombre: 'Restaurante de Prueba',
      tipo: 'restaurante',
      categoria: 'Comida Rápida',
      tier: 'local',
      direccion: {
        calle: 'Calle Principal 123',
        ciudad: 'Tegucigalpa',
        codigoPostal: '11101',
        coordenadas: { lat: 14.0723, lng: -87.1921 },
        zona: 'Centro'
      },
      contacto: {
        telefono: '+504 9999-9999',
        whatsapp: '+504 9999-9999',
        email: 'prueba@foodlab.store',
        sitioWeb: 'https://prueba.com'
      },
      horarios: {
        lunes: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
        martes: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
        miercoles: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
        jueves: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
        viernes: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
        sabado: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
        domingo: { abierto: '08:00', cerrado: '22:00', estaAbierto: true }
      },
      configuracion: {
        radioEntrega: 5,
        pedidoMinimo: 0,
        costoEntrega: 0,
        tiempoEstimado: 30,
        metodosPago: ['efectivo'],
        comision: 10,
        logo: '',
        imagen: '',
        descripcion: 'Restaurante de prueba para testing'
      },
      ownerId: 'admin',
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(comerciosRef, nuevoComercio)
    console.log(`✅ Comercio creado con ID: ${docRef.id}`)
    
    // 3. Verificar que se creó correctamente
    console.log('\n🔍 Verificando comercio creado...')
    const comerciosSnapshot2 = await getDocs(comerciosRef)
    console.log(`✅ Total de comercios después de crear: ${comerciosSnapshot2.docs.length}`)
    
    // 4. Mostrar información del comercio creado
    const comercioCreado = comerciosSnapshot2.docs.find(doc => doc.id === docRef.id)
    if (comercioCreado) {
      const data = comercioCreado.data()
      console.log(`✅ Comercio: ${data.nombre}`)
      console.log(`✅ Tipo: ${data.tipo}`)
      console.log(`✅ Estado: ${data.estado}`)
      console.log(`✅ Ciudad: ${data.direccion.ciudad}`)
    }
    
    console.log('\n🎉 Prueba completada exitosamente!')
    console.log('\n📝 Próximos pasos:')
    console.log('1. Ir a /admin/comercios en el navegador')
    console.log('2. Verificar que el comercio aparece en la lista')
    console.log('3. Probar la funcionalidad de eliminar comercios')
    console.log('4. Crear un nuevo comercio desde la interfaz')
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

// Ejecutar la prueba
testComercioCreation()
