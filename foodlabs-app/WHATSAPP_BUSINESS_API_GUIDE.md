# WhatsApp Business API Integration Guide

## Overview

Esta guía explica cómo integrar WhatsApp Business API con el sistema FoodLabs para automatizar la comunicación con restaurantes y motoristas.

## Arquitectura Propuesta

```
Cliente → FoodLabs App → WhatsApp Business API → Restaurante/Motorista
```

### Flujo de Comunicación

1. **Cliente hace pedido** → Sistema crea orden
2. **WhatsApp Bot recibe orden** → Envía notificación a restaurante
3. **Restaurante confirma** → Bot notifica a motorista
4. **Motorista confirma** → Bot notifica al cliente
5. **Entrega completada** → Bot actualiza estado

## Setup de WhatsApp Business API

### Opción 1: Meta Cloud API (Recomendado)

1. **Crear cuenta de desarrollador en Meta**
   - Ir a [developers.facebook.com](https://developers.facebook.com)
   - Crear una nueva app
   - Agregar producto "WhatsApp Business API"

2. **Configurar número de teléfono**
   - Verificar número de teléfono
   - Configurar webhook URL
   - Obtener access token

3. **Configurar webhook**
   ```javascript
   // Endpoint para recibir mensajes
   POST /api/whatsapp/webhook
   ```

### Opción 2: Twilio WhatsApp API

1. **Crear cuenta en Twilio**
   - Registrarse en [twilio.com](https://twilio.com)
   - Activar WhatsApp Sandbox
   - Obtener credenciales

2. **Configurar webhook**
   ```javascript
   // Webhook URL en Twilio
   https://tu-dominio.com/api/whatsapp/twilio-webhook
   ```

## Implementación Técnica

### 1. Configuración de Variables de Entorno

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=tu_access_token
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_VERIFY_TOKEN=tu_verify_token
WHATSAPP_WEBHOOK_URL=https://tu-dominio.com/api/whatsapp/webhook

# Twilio (alternativa)
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 2. Servicio de WhatsApp

```javascript
// src/services/whatsapp.js
import axios from 'axios'

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    this.baseURL = 'https://graph.facebook.com/v17.0'
  }

  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      throw error
    }
  }

  async sendTemplate(to, templateName, parameters = []) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'es' },
            components: [
              {
                type: 'body',
                parameters: parameters.map(param => ({ type: 'text', text: param }))
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error sending WhatsApp template:', error)
      throw error
    }
  }
}

export default new WhatsAppService()
```

### 3. Webhook Handler

```javascript
// src/api/whatsapp/webhook.js
import express from 'express'
import WhatsAppService from '../../services/whatsapp.js'
import { processOrder, confirmOrder } from '../../services/payment.js'

const router = express.Router()

// Verificar webhook
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge)
  } else {
    res.status(403).send('Forbidden')
  }
})

// Recibir mensajes
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body

    if (body.object === 'whatsapp_business_account') {
      body.entry.forEach(entry => {
        entry.changes.forEach(change => {
          if (change.field === 'messages') {
            const messages = change.value.messages
            if (messages) {
              messages.forEach(message => {
                handleIncomingMessage(message, change.value.contacts[0])
              })
            }
          }
        })
      })
    }

    res.status(200).send('OK')
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).send('Error')
  }
})

async function handleIncomingMessage(message, contact) {
  const phoneNumber = contact.wa_id
  const messageText = message.text?.body || ''

  // Identificar tipo de usuario por número de teléfono
  const userType = await identifyUserType(phoneNumber)
  
  if (userType === 'restaurant') {
    await handleRestaurantMessage(phoneNumber, messageText)
  } else if (userType === 'driver') {
    await handleDriverMessage(phoneNumber, messageText)
  } else {
    await handleCustomerMessage(phoneNumber, messageText)
  }
}

async function handleRestaurantMessage(phoneNumber, messageText) {
  // Buscar órdenes pendientes para este restaurante
  const pendingOrders = await getPendingOrdersForRestaurant(phoneNumber)
  
  if (messageText.toLowerCase().includes('acepto') || messageText.toLowerCase().includes('confirmo')) {
    // Confirmar orden
    const orderId = extractOrderId(messageText)
    if (orderId) {
      await confirmOrder(orderId)
      await WhatsAppService.sendMessage(phoneNumber, 
        `✅ Orden #${orderId} confirmada. El motorista será notificado.`
      )
    }
  } else if (messageText.toLowerCase().includes('rechazo') || messageText.toLowerCase().includes('cancelar')) {
    // Rechazar orden
    const orderId = extractOrderId(messageText)
    if (orderId) {
      await cancelOrder(orderId)
      await WhatsAppService.sendMessage(phoneNumber, 
        `❌ Orden #${orderId} rechazada. El cliente será notificado.`
      )
    }
  } else {
    // Enviar lista de órdenes pendientes
    if (pendingOrders.length > 0) {
      let response = "🍽️ Órdenes pendientes:\n\n"
      pendingOrders.forEach(order => {
        response += `#${order.id} - ${order.customer.name}\n`
        response += `Total: L${order.total}\n`
        response += `Items: ${order.items.length}\n\n`
        response += `Responde: "Acepto #${order.id}" o "Rechazo #${order.id}"\n\n`
      })
      await WhatsAppService.sendMessage(phoneNumber, response)
    } else {
      await WhatsAppService.sendMessage(phoneNumber, 
        "✅ No hay órdenes pendientes en este momento."
      )
    }
  }
}

async function handleDriverMessage(phoneNumber, messageText) {
  // Buscar entregas pendientes para este motorista
  const pendingDeliveries = await getPendingDeliveriesForDriver(phoneNumber)
  
  if (messageText.toLowerCase().includes('acepto') || messageText.toLowerCase().includes('confirmo')) {
    // Confirmar entrega
    const orderId = extractOrderId(messageText)
    if (orderId) {
      await confirmDelivery(orderId, phoneNumber)
      await WhatsAppService.sendMessage(phoneNumber, 
        `🚗 Entrega #${orderId} confirmada. Ve al restaurante a recoger el pedido.`
      )
    }
  } else if (messageText.toLowerCase().includes('completado') || messageText.toLowerCase().includes('entregado')) {
    // Marcar como entregado
    const orderId = extractOrderId(messageText)
    if (orderId) {
      await markOrderAsDelivered(orderId)
      await WhatsAppService.sendMessage(phoneNumber, 
        `✅ Entrega #${orderId} completada. ¡Gracias!`
      )
    }
  } else {
    // Enviar lista de entregas pendientes
    if (pendingDeliveries.length > 0) {
      let response = "🚗 Entregas pendientes:\n\n"
      pendingDeliveries.forEach(delivery => {
        response += `#${delivery.orderId} - ${delivery.customer.name}\n`
        response += `Dirección: ${delivery.customer.address}\n`
        response += `Restaurante: ${delivery.restaurant.name}\n\n`
        response += `Responde: "Acepto #${delivery.orderId}" para confirmar\n\n`
      })
      await WhatsAppService.sendMessage(phoneNumber, response)
    } else {
      await WhatsAppService.sendMessage(phoneNumber, 
        "✅ No hay entregas pendientes en este momento."
      )
    }
  }
}

export default router
```

### 4. Notificaciones Automáticas

```javascript
// src/services/notifications.js
import WhatsAppService from './whatsapp.js'
import { getRestaurantPhone, getDriverPhone } from './database.js'

export async function notifyRestaurantNewOrder(order) {
  const restaurantPhone = await getRestaurantPhone(order.restaurantId)
  
  const message = `🍽️ Nueva orden #${order.id}\n\n` +
    `Cliente: ${order.customer.name}\n` +
    `Total: L${order.total}\n` +
    `Items: ${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}\n\n` +
    `Responde: "Acepto #${order.id}" o "Rechazo #${order.id}"`
  
  await WhatsAppService.sendMessage(restaurantPhone, message)
}

export async function notifyDriverNewDelivery(order) {
  const driverPhone = await getDriverPhone(order.driverId)
  
  const message = `🚗 Nueva entrega #${order.id}\n\n` +
    `Cliente: ${order.customer.name}\n` +
    `Dirección: ${order.customer.address}\n` +
    `Restaurante: ${order.restaurant.name}\n\n` +
    `Responde: "Acepto #${order.id}" para confirmar`
  
  await WhatsAppService.sendMessage(driverPhone, message)
}

export async function notifyCustomerOrderStatus(order, status) {
  const customerPhone = order.customer.phone
  
  let message = ''
  switch (status) {
    case 'confirmed':
      message = `✅ Tu orden #${order.id} ha sido confirmada por el restaurante.`
      break
    case 'preparing':
      message = `👨‍🍳 Tu orden #${order.id} está siendo preparada.`
      break
    case 'ready':
      message = `🍽️ Tu orden #${order.id} está lista. El motorista va en camino.`
      break
    case 'delivered':
      message = `🎉 Tu orden #${order.id} ha sido entregada. ¡Disfruta tu comida!`
      break
    case 'cancelled':
      message = `❌ Tu orden #${order.id} ha sido cancelada. El reembolso será procesado.`
      break
  }
  
  await WhatsAppService.sendMessage(customerPhone, message)
}
```

## Configuración de Base de Datos

### Agregar campos a la colección de usuarios

```javascript
// Actualizar esquema de usuarios
{
  // ... campos existentes
  phone: string,           // Número de WhatsApp
  userType: 'customer' | 'restaurant' | 'driver',
  businessId: string,     // Para restaurantes
  isActive: boolean,      // Para motoristas
  lastSeen: timestamp
}
```

### Crear colección de motoristas

```javascript
// drivers collection
{
  id: string,
  name: string,
  phone: string,
  vehicle: string,
  isAvailable: boolean,
  currentLocation: {
    lat: number,
    lng: number
  },
  rating: number,
  totalDeliveries: number
}
```

## Flujo de Estados

### Estados de Orden
1. `pending_payment` → Esperando pago
2. `pending_restaurant` → Esperando confirmación del restaurante
3. `confirmed` → Restaurante confirmó
4. `preparing` → Restaurante preparando
5. `ready` → Listo para recoger
6. `assigned_driver` → Motorista asignado
7. `picked_up` → Motorista recogió
8. `delivered` → Entregado
9. `cancelled` → Cancelado

### Timeouts y Reintentos

```javascript
// Configuración de timeouts
const TIMEOUTS = {
  RESTAURANT_CONFIRMATION: 5 * 60 * 1000,  // 5 minutos
  DRIVER_ASSIGNMENT: 2 * 60 * 1000,        // 2 minutos
  DRIVER_PICKUP: 10 * 60 * 1000,           // 10 minutos
  DELIVERY: 30 * 60 * 1000                 // 30 minutos
}

// Sistema de reintentos
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_INTERVAL: 60000,  // 1 minuto
  ESCALATION_TIME: 300000 // 5 minutos
}
```

## Testing

### 1. Sandbox Testing
- Usar números de prueba de WhatsApp
- Configurar webhook en ngrok para desarrollo local
- Probar flujos completos

### 2. Producción
- Verificar webhook en servidor de producción
- Configurar monitoreo de mensajes
- Implementar logs de auditoría

## Monitoreo y Analytics

### Métricas Importantes
- Tiempo de respuesta de restaurantes
- Tiempo de entrega promedio
- Tasa de cancelaciones
- Satisfacción del cliente

### Logs de Auditoría
```javascript
// Registrar todas las interacciones
const auditLog = {
  timestamp: new Date(),
  phoneNumber: phoneNumber,
  messageType: 'incoming' | 'outgoing',
  messageContent: messageText,
  orderId: orderId,
  action: 'confirm' | 'reject' | 'assign' | 'deliver',
  responseTime: responseTime
}
```

## Consideraciones de Seguridad

1. **Validación de números**: Verificar que los números pertenezcan a usuarios registrados
2. **Rate limiting**: Limitar mensajes por minuto por número
3. **Autenticación**: Verificar tokens de webhook
4. **Encriptación**: Usar HTTPS para webhooks
5. **Logs seguros**: No registrar información sensible

## Costos

### WhatsApp Business API
- Mensajes de texto: ~$0.005 por mensaje
- Mensajes de template: ~$0.01 por mensaje
- Mensajes de medios: ~$0.02 por mensaje

### Twilio WhatsApp
- Mensajes salientes: ~$0.005 por mensaje
- Mensajes entrantes: Gratis
- Webhook: Gratis

## Próximos Pasos

1. **Fase 1**: Implementar notificaciones básicas
2. **Fase 2**: Agregar confirmaciones automáticas
3. **Fase 3**: Integrar con sistema de motoristas
4. **Fase 4**: Analytics y optimización
5. **Fase 5**: IA para respuestas automáticas

## Recursos Adicionales

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Webhook Security Best Practices](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
