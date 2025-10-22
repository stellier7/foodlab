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

## AI Chatbot con WhatsApp

### Arquitectura de IA Conversacional

El sistema de WhatsApp puede integrar un chatbot con inteligencia artificial para atención automática 24/7.

```
Cliente → WhatsApp → AI Bot (GPT-4/Claude) → [¿Resuelve?]
                                               ├─ Sí: Respuesta automática
                                               └─ No: Ticket + Escalación a humano
```

### Flujo de Conversación con IA

1. **Cliente envía mensaje** → "Hola, ¿cuánto tarda mi pedido?"
2. **IA analiza el mensaje** → Identifica intención (consulta de estado)
3. **Bot consulta base de datos** → Busca pedido activo del cliente
4. **Si encuentra información:**
   - Responde automáticamente: "Tu pedido #123 está en camino, llega en 15 minutos 🚗"
   - Actualiza contexto de conversación
5. **Si NO encuentra información o es compleja:**
   - Crea ticket en sistema
   - Notifica a agente humano por WhatsApp
   - Responde al cliente: "Un agente te responderá pronto. Ticket #456 creado ✅"

### Casos de Uso del AI Bot

#### Atención Automatizada (No requiere humano)
- ✅ Consultar estado de pedido
- ✅ Ver menú y precios
- ✅ Horarios de restaurantes
- ✅ Métodos de pago
- ✅ Zonas de entrega
- ✅ Rastrear pedido en tiempo real
- ✅ Consultar saldo de wallet
- ✅ FAQ general

#### Escalación a Humano (Crea ticket)
- ❌ Quejas o problemas con pedidos
- ❌ Modificar pedido en curso
- ❌ Solicitudes especiales
- ❌ Problemas de pago
- ❌ Conversaciones complejas
- ❌ Preguntas no identificadas

### Implementación Técnica

#### 1. Servicio de IA

```javascript
// src/services/aiChatbot.js
import OpenAI from 'openai'
import { getOrderById } from './firestore'
import { createTicket, notifySupport } from './support'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

class AIChatbot {
  constructor() {
    this.conversationHistory = new Map() // Mantener contexto por usuario
  }

  async analyzeMessage(phoneNumber, message) {
    // Obtener contexto del usuario
    const userContext = await this.getUserContext(phoneNumber)
    const conversationHistory = this.conversationHistory.get(phoneNumber) || []

    // Preparar prompt para la IA
    const systemPrompt = `
Eres un asistente de FoodLabs, plataforma de delivery en Honduras.
Tu objetivo es ayudar a los clientes con sus pedidos.

Información del usuario:
${JSON.stringify(userContext, null, 2)}

Instrucciones:
- Si el cliente pregunta por su pedido, busca en sus órdenes activas
- Si no puedes ayudar, indica que crearás un ticket
- Sé amable, breve y usa emojis apropiadamente
- Responde en español de Honduras
`

    // Llamar a la IA
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
      functions: [
        {
          name: 'get_order_status',
          description: 'Obtener estado de un pedido por ID',
          parameters: {
            type: 'object',
            properties: {
              orderId: { type: 'string', description: 'ID del pedido' }
            }
          }
        },
        {
          name: 'create_support_ticket',
          description: 'Crear ticket de soporte cuando no puedas resolver',
          parameters: {
            type: 'object',
            properties: {
              issue: { type: 'string', description: 'Descripción del problema' },
              category: { type: 'string', enum: ['order', 'payment', 'delivery', 'other'] }
            }
          }
        }
      ],
      function_call: 'auto'
    })

    const aiResponse = response.choices[0].message

    // Manejar function calls
    if (aiResponse.function_call) {
      const functionName = aiResponse.function_call.name
      const functionArgs = JSON.parse(aiResponse.function_call.arguments)

      if (functionName === 'get_order_status') {
        return await this.handleOrderStatusRequest(phoneNumber, functionArgs.orderId)
      } else if (functionName === 'create_support_ticket') {
        return await this.handleTicketCreation(phoneNumber, message, functionArgs)
      }
    }

    // Actualizar historial
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse.content }
    )
    this.conversationHistory.set(phoneNumber, conversationHistory)

    return {
      message: aiResponse.content,
      needsHuman: false
    }
  }

  async getUserContext(phoneNumber) {
    // Obtener órdenes activas, historial, wallet, etc.
    const activeOrders = await getActiveOrdersByPhone(phoneNumber)
    const walletBalance = await getWalletBalance(phoneNumber)
    
    return {
      phoneNumber,
      activeOrders: activeOrders.length,
      lastOrder: activeOrders[0] || null,
      walletBalance
    }
  }

  async handleOrderStatusRequest(phoneNumber, orderId) {
    const order = await getOrderById(orderId)
    
    if (!order) {
      return {
        message: 'No encontré ese pedido. ¿Puedes verificar el número?',
        needsHuman: false
      }
    }

    const statusMessages = {
      'pending_restaurant': 'Tu pedido está esperando confirmación del restaurante ⏳',
      'preparing': 'El restaurante está preparando tu pedido 👨‍🍳',
      'ready': 'Tu pedido está listo! El motorista va en camino 🚗',
      'delivered': 'Tu pedido fue entregado! 🎉'
    }

    return {
      message: `Pedido #${order.id}:\n${statusMessages[order.paymentStatus]}\nTotal: L${order.total}`,
      needsHuman: false
    }
  }

  async handleTicketCreation(phoneNumber, originalMessage, functionArgs) {
    // Crear ticket en sistema
    const ticket = await createTicket({
      phoneNumber,
      issue: functionArgs.issue,
      category: functionArgs.category,
      originalMessage,
      status: 'open',
      createdAt: new Date()
    })

    // Notificar a soporte por WhatsApp
    await notifySupport({
      ticketId: ticket.id,
      phoneNumber,
      issue: functionArgs.issue,
      category: functionArgs.category
    })

    return {
      message: `He creado el ticket #${ticket.id} 📋\nUn agente te contactará pronto. Gracias por tu paciencia! 🙏`,
      needsHuman: true,
      ticketId: ticket.id
    }
  }
}

export default new AIChatbot()
```

#### 2. Integrar con Webhook de WhatsApp

```javascript
// Actualizar handleIncomingMessage en webhook.js
async function handleIncomingMessage(message, contact) {
  const phoneNumber = contact.wa_id
  const messageText = message.text?.body || ''

  // Identificar si es cliente, restaurante o motorista
  const userType = await identifyUserType(phoneNumber)
  
  if (userType === 'restaurant' || userType === 'driver') {
    // Manejar como antes (confirmaciones, etc.)
    await handleBusinessMessage(phoneNumber, messageText, userType)
  } else {
    // Cliente: usar AI chatbot
    const response = await AIChatbot.analyzeMessage(phoneNumber, messageText)
    await WhatsAppService.sendMessage(phoneNumber, response.message)
    
    // Si necesita humano, marcar conversación
    if (response.needsHuman) {
      await flagConversationForHuman(phoneNumber, response.ticketId)
    }
  }
}
```

#### 3. Sistema de Tickets

```javascript
// src/services/support.js
import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import WhatsAppService from './whatsapp'

export async function createTicket(ticketData) {
  const ticket = await addDoc(collection(db, 'support_tickets'), {
    ...ticketData,
    status: 'open',
    createdAt: new Date(),
    assignedTo: null,
    resolvedAt: null
  })
  
  return { id: ticket.id, ...ticketData }
}

export async function notifySupport(ticketInfo) {
  const SUPPORT_NUMBERS = [
    '+50488694777', // Tu hermano o team de soporte
    // Agregar más números según sea necesario
  ]
  
  for (const supportNumber of SUPPORT_NUMBERS) {
    await WhatsAppService.sendMessage(
      supportNumber,
      `🆘 Nuevo ticket #${ticketInfo.ticketId}\n\n` +
      `Cliente: ${ticketInfo.phoneNumber}\n` +
      `Categoría: ${ticketInfo.category}\n` +
      `Problema: ${ticketInfo.issue}\n\n` +
      `Responde: "Atender ${ticketInfo.ticketId}" para tomar el caso`
    )
  }
}

export async function assignTicket(ticketId, agentPhone) {
  const ticketRef = doc(db, 'support_tickets', ticketId)
  await updateDoc(ticketRef, {
    assignedTo: agentPhone,
    assignedAt: new Date(),
    status: 'in_progress'
  })
}

export async function resolveTicket(ticketId, resolution) {
  const ticketRef = doc(db, 'support_tickets', ticketId)
  await updateDoc(ticketRef, {
    status: 'resolved',
    resolution,
    resolvedAt: new Date()
  })
}
```

### Panel de Admin para Tickets

Agregar en `AdminWalletPage.jsx` una nueva pestaña:

```javascript
// Tab de Soporte
{activeTab === 'support' && (
  <div>
    <h3>Tickets de Soporte</h3>
    {tickets.map(ticket => (
      <div key={ticket.id} className="ticket-card">
        <span className={`status ${ticket.status}`}>{ticket.status}</span>
        <p>#{ticket.id} - {ticket.category}</p>
        <p>{ticket.issue}</p>
        <button onClick={() => assignTicket(ticket.id)}>Atender</button>
      </div>
    ))}
  </div>
)}
```

### Configuración de Variables de Entorno

```env
# AI Chatbot
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Alternativa: Claude
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229

# Límites
AI_MAX_TOKENS=500
AI_TEMPERATURE=0.7
```

### Costos Estimados de IA

#### OpenAI GPT-4 Turbo
- Input: ~$0.01 por 1K tokens
- Output: ~$0.03 por 1K tokens
- Promedio por mensaje: ~$0.02-0.05

#### Anthropic Claude 3
- Input: ~$0.015 por 1K tokens
- Output: ~$0.075 por 1K tokens
- Promedio por mensaje: ~$0.03-0.08

**Estimación mensual (1000 conversaciones):**
- ~$30-80 USD/mes dependiendo del modelo

### Ventajas del AI Chatbot

✅ **Atención 24/7** sin costo de personal
✅ **Respuestas instantáneas** a preguntas comunes
✅ **Escalación inteligente** solo cuando es necesario
✅ **Reduce carga** de equipo de soporte
✅ **Mejora experiencia** del cliente
✅ **Recopila datos** de conversaciones para mejorar

### Métricas de Éxito

- **Tasa de resolución automática**: % de conversaciones sin escalación
- **Tiempo de respuesta**: Promedio < 3 segundos
- **Satisfacción del cliente**: Encuestas post-conversación
- **Tickets creados**: Cuántos requieren humano
- **Ahorro de tiempo**: Horas de soporte ahorradas

## Próximos Pasos

1. **Fase 1**: Implementar notificaciones básicas
2. **Fase 2**: Agregar confirmaciones automáticas
3. **Fase 3**: Integrar AI Chatbot para clientes
4. **Fase 4**: Sistema de tickets y escalación
5. **Fase 5**: Integrar con motoristas
6. **Fase 6**: Analytics y optimización

## Recursos Adicionales

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Webhook Security Best Practices](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
