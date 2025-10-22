# 🧪 Guía de Testing - FoodLab

## 🚀 Quick Start

```bash
cd foodlabs-app
npm run dev
```

La app debería abrir en `http://localhost:5173`

---

## ✅ Test 1: Guest Checkout (Sin autenticación)

### Objetivo
Verificar que usuarios NO registrados pueden hacer pedidos.

### Pasos:
1. **Abrir la app** (sin hacer login)
2. **Agregar productos al carrito**
   - Click en un producto
   - Click "Agregar al Carrito"
   - Repetir con 2-3 productos
3. **Abrir carrito**
   - Click en el botón flotante del carrito (abajo derecha)
4. **Finalizar pedido**
   - Click "Pedir por WhatsApp"
5. **Completar form como guest**
   - Nombre: `Tu Nombre`
   - Teléfono: `+504 1234-5678`
   - Dirección: `Tu dirección`
6. **Enviar a WhatsApp**
   - Click "Pedir por WhatsApp"
   - Verificar que se abre WhatsApp
   - **Verificar mensaje incluye tu nombre**

### ✅ Resultado esperado:
- Form se muestra vacío
- Mensaje de WhatsApp: "¡Hola! Soy **Tu Nombre** y quiero hacer un pedido..."
- Orden se crea en Firestore

---

## ✅ Test 2: Google Sign-in

### Objetivo
Verificar que el login con Google funciona.

### Pasos:
1. **Hacer logout** (si estás logueado)
   - Click en el ícono de usuario
   - Click "Cerrar Sesión"
2. **Login con Google**
   - Click en "Iniciar" (en el header)
   - Click "Continuar con Google"
   - Selecciona tu cuenta Google
3. **Verificar sesión activa**
   - Deberías ver tu nombre en el header
   - Click en el ícono de usuario
   - Verificar que muestra tu email

### ✅ Resultado esperado:
- Login exitoso sin errores
- Nombre aparece en header
- User menu funcional
- Datos guardados en Firestore (`users/{uid}`)

---

## ✅ Test 3: Auth Checkout (Con autenticación)

### Objetivo
Verificar auto-fill de datos para usuarios autenticados.

### Pasos:
1. **Estar logueado** (del Test 2)
2. **Agregar productos al carrito**
3. **Abrir carrito y finalizar**
   - Click "Pedir por WhatsApp"
4. **Verificar auto-fill**
   - ✅ Nombre debería estar pre-llenado
   - ✅ Mensaje: "¡Hola {TuPrimerNombre}!"
5. **Completar datos faltantes**
   - Teléfono: `+504 8869-4777`
   - Dirección: `Col. Palmira`
6. **Enviar a WhatsApp**
   - Click "Pedir por WhatsApp"

### ✅ Resultado esperado:
- Form pre-llenado con tu nombre
- Mensaje de WhatsApp: "¡Hola! Soy **Santiago** y quiero hacer un pedido..." (usando firstName)
- Orden se crea en Firestore con tu `userId`

---

## ✅ Test 4: Persistencia de Sesión

### Objetivo
Verificar que la sesión se mantiene después de cerrar/abrir.

### Pasos:
1. **Estar logueado**
2. **Cerrar la pestaña del navegador**
3. **Abrir nueva pestaña**
4. **Ir a** `http://localhost:5173`
5. **Verificar**
   - ¿Sigues logueado?
   - ¿Aparece tu nombre en el header?

### ✅ Resultado esperado:
- Sesión activa automáticamente
- No pide login de nuevo
- Estado restaurado

---

## ✅ Test 5: Firestore Real-time

### Objetivo
Verificar que las órdenes se guardan en Firestore.

### Pasos:
1. **Abrir Firebase Console**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Proyecto: `foodlab-production`
   - Click "Firestore Database"
2. **Crear una orden** (guest o auth)
3. **Verificar en Firestore**
   - Deberías ver la colección `orders`
   - Click en la orden más reciente
   - Verificar campos:
     - `customer.name`
     - `customer.phone`
     - `customer.isGuest` (true/false)
     - `items[]`
     - `total`
     - `status: "pending"`

### ✅ Resultado esperado:
- Orden aparece en Firestore inmediatamente
- Datos correctos
- Estructura correcta

---

## ✅ Test 6: Users Collection

### Objetivo
Verificar que los usuarios se guardan correctamente.

### Pasos:
1. **Login con Google** (si no estás logueado)
2. **Abrir Firebase Console → Firestore**
3. **Ir a colección `users`**
4. **Buscar tu UID**
5. **Verificar campos:**
   - `email`
   - `displayName`
   - `firstName` ← **NUEVO**
   - `lastName` ← **NUEVO**
   - `role: "customer"`
   - `permissions[]`

### ✅ Resultado esperado:
- Usuario existe en Firestore
- `firstName` y `lastName` extraídos correctamente
- Role asignado

---

## ✅ Test 7: Super Admin

### Objetivo
Verificar roles de super admin.

### Pasos:
1. **Login con** `santiago@foodlab.store` o `admin@foodlab.store`
2. **Abrir Firebase Console → Firestore**
3. **Verificar tu usuario**
   - `role: "super_admin"`
   - `permissions: ["all", ...]`

### ✅ Resultado esperado:
- Role de super_admin asignado automáticamente
- Permisos completos

---

## 🐛 Troubleshooting

### Error: "Firebase not configured"
**Solución:**
```bash
cd foodlabs-app
cp .env.example .env
# Editar .env con tus credenciales
```

### Error: "Permission denied" en Firestore
**Solución:**
1. Ve a Firebase Console → Firestore → Rules
2. Verifica que las reglas estén publicadas
3. Revisa que no diga `allow read, write: if false;`

### Error: "Google Sign-in popup cerrado"
**Solución:**
- Intenta de nuevo
- Verifica que no tengas bloqueador de popups
- Prueba en ventana incógnita

### Login funciona pero no guarda en Firestore
**Solución:**
1. Revisa Firestore Rules
2. Verifica permisos en Firebase Console
3. Checa la consola del navegador (F12)

### Auto-fill no funciona
**Solución:**
1. Verifica que estés logueado
2. Checa que `user.firstName` existe en Firestore
3. Logout y login de nuevo

---

## 📊 Checklist Completo

### Guest Flow:
- [ ] Puede agregar productos al carrito
- [ ] Modal de checkout aparece
- [ ] Form está vacío
- [ ] Puede llenar datos manualmente
- [ ] WhatsApp se abre con mensaje correcto
- [ ] Orden se crea en Firestore

### Auth Flow:
- [ ] Google Sign-in funciona
- [ ] Nombre aparece en header
- [ ] User menu funcional
- [ ] Checkout auto-llena datos
- [ ] WhatsApp usa firstName
- [ ] Orden se crea con userId

### Persistencia:
- [ ] Sesión se mantiene al recargar
- [ ] Sesión se mantiene en nueva pestaña
- [ ] Datos persisten en localStorage

### Firestore:
- [ ] Colección `users` creada
- [ ] Colección `orders` creada
- [ ] firstName/lastName guardados
- [ ] Roles asignados correctamente

---

## 🎯 Testing Completado

Si todos los tests pasan: **¡Listo para producción!** 🎉

Si hay errores: Revisa la consola del navegador (F12) y manda screenshot.

---

## 📞 Soporte

Si necesitas ayuda:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Copia cualquier error en rojo
4. Manda screenshot

