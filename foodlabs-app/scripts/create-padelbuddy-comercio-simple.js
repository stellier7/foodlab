// Script simple para crear el comercio PadelBuddy
// Ejecutar este script en la consola del navegador cuando estés logueado como admin

const comercioData = {
  nombre: 'PadelBuddy',
  tipo: 'tienda',
  slug: 'padelbuddy',
  categoria: 'deportes',
  descripcion: 'Tienda especializada en equipos de padel y accesorios deportivos',
  direccion: {
    calle: 'Calle Principal',
    ciudad: 'Tegucigalpa',
    departamento: 'Francisco Morazán',
    codigoPostal: '11101',
    pais: 'Honduras'
  },
  contacto: {
    telefono: '+504 1234-5678',
    email: 'info@padelbuddy.com',
    sitioWeb: 'https://padelbuddy.com'
  },
  horarios: {
    lunes: '9:00 - 18:00',
    martes: '9:00 - 18:00',
    miercoles: '9:00 - 18:00',
    jueves: '9:00 - 18:00',
    viernes: '9:00 - 18:00',
    sabado: '9:00 - 16:00',
    domingo: 'Cerrado'
  },
  servicios: [
    'Venta de equipos de padel',
    'Accesorios deportivos',
    'Asesoría técnica',
    'Reparación de equipos'
  ],
  imagenes: [],
  estado: 'activo',
  tier: 'local',
  ownerId: 'XnJLKpHQizcjyjxztqM9Xdw20AE2',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

console.log('📋 Datos del comercio PadelBuddy:')
console.log(comercioData)
console.log('')
console.log('🔧 Para crear el comercio, ejecuta este código en la consola del navegador:')
console.log(`
// Crear el comercio en Firestore
import { createComercio } from './src/services/comercios.js'

const comercioId = 'tuu70Pcs1KFXFGJAK6mh'
const comercioRef = firebase.firestore().collection('comercios').doc(comercioId)
await comercioRef.set(${JSON.stringify(comercioData, null, 2)})
console.log('✅ Comercio creado con ID:', comercioId)
`)
