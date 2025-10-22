# Guía de Entrenamiento - Panel de Administración FoodLabs

## Introducción

Esta guía está diseñada para entrenar al equipo administrativo en el uso del panel de administración de wallets de FoodLabs. El sistema permite gestionar saldos, aprobar recargas y realizar liquidaciones a restaurantes.

---

## 🎯 Objetivos de Aprendizaje

Al completar esta guía, el equipo podrá:
- ✅ Aprobar y rechazar solicitudes de recarga
- ✅ Monitorear balances de clientes y restaurantes
- ✅ Generar liquidaciones y archivos CSV
- ✅ Ejecutar pagos a restaurantes
- ✅ Interpretar el dashboard y KPIs

---

## 📋 Sección 1: Acceso al Panel

### Cómo Acceder

1. **Iniciar sesión** en FoodLabs
   - URL: `foodlab.store/admin`
   - Usuario: Tu email de admin
   - Contraseña: Proporcionada por el super admin

2. **Verificar permisos**
   - Solo usuarios con rol `admin_national` o `super_admin` pueden acceder
   - Si no tienes acceso, contacta al super admin

3. **Navegación al Panel de Wallets**
   - Ir a: **Admin** → **Gestión de Wallets**
   - O directamente a: `foodlab.store/admin/wallets`

---

## 📊 Sección 2: Dashboard Principal

### Vista General

El dashboard muestra 3 KPIs principales:

#### 1. Dinero en Escrow 💰
**¿Qué significa?**
- Dinero que está "en tránsito" esperando confirmación de restaurantes
- Cuando un cliente paga, el dinero va primero a escrow
- Cuando el restaurante acepta la orden, el dinero sale de escrow

**¿Qué hacer si es muy alto?**
- Revisar órdenes pendientes de confirmación
- Contactar restaurantes que no han respondido
- Normal que suba en horarios pico (almuerzo/cena)

#### 2. Comisiones Acumuladas 💵
**¿Qué significa?**
- Dinero que FoodLabs ha ganado en comisiones
- Incluye: 12% de cada pedido + 15% de cada payout
- Este es el ingreso de la plataforma

**¿Cuándo se usa?**
- Para pagar costos operativos
- Para reinvertir en la plataforma
- Para pagar al equipo

#### 3. Restaurantes con Saldo 🏪
**¿Qué significa?**
- Cantidad de restaurantes que tienen dinero pendiente de liquidación
- Cada restaurante acumula dinero de sus ventas
- Necesitan ser pagados periódicamente

**¿Qué hacer?**
- Revisar semanalmente o quincenalmente
- Generar CSV de pagos
- Ejecutar liquidaciones

---

## 🔄 Sección 3: Aprobar Recargas

### Flujo de Recarga

```
1. Cliente solicita recarga → 2. Admin revisa → 3. Admin aprueba/rechaza → 4. Cliente recibe saldo
```

### Proceso Paso a Paso

#### Paso 1: Ver Solicitudes Pendientes

1. Ir a la pestaña **"Recargas"**
2. Verás una lista de solicitudes pendientes con:
   - Nombre/ID del cliente
   - Monto solicitado
   - Fecha de solicitud
   - Comprobante (si lo subió)

#### Paso 2: Verificar la Transferencia

**Opción A: Si el cliente subió comprobante**
1. Hacer clic en **"Ver comprobante"**
2. Verificar que:
   - ✅ El monto coincide
   - ✅ La fecha es reciente
   - ✅ La transferencia fue a la cuenta correcta
   - ✅ El comprobante es legítimo (no editado)

**Opción B: Si no hay comprobante**
1. Revisar la cuenta bancaria de FoodLabs
2. Buscar transferencia que coincida con:
   - Monto exacto
   - Fecha similar
   - Nombre del cliente (si está disponible)

#### Paso 3: Aprobar o Rechazar

**Para APROBAR:**
1. Hacer clic en **"Aprobar"**
2. El sistema automáticamente:
   - Acredita el saldo al cliente
   - Envía notificación (si está configurado)
   - Registra la transacción

**Para RECHAZAR:**
1. Hacer clic en **"Rechazar"**
2. Escribir razón del rechazo (ej: "Comprobante no válido")
3. El cliente puede solicitar nuevamente

#### Mejores Prácticas

✅ **SÍ hacer:**
- Verificar cada comprobante cuidadosamente
- Aprobar en menos de 24 horas
- Comunicar al cliente si hay problema
- Documentar razones de rechazo

❌ **NO hacer:**
- Aprobar sin verificar
- Ignorar solicitudes por varios días
- Rechazar sin dar razón
- Compartir información de pagos

---

## 💰 Sección 4: Gestión de Balances

### Ver Balances de Todos los Usuarios

1. Ir a la pestaña **"Balances"**
2. Verás una tabla con:
   - ID del usuario
   - Nombre (si está disponible)
   - Balance actual
   - Moneda (HNL/GTQ)
   - Tipo de usuario (cliente/restaurante)

### Filtrar y Buscar

**Filtros disponibles:**
- Por tipo de usuario
- Por moneda
- Por rango de balance

**Búsqueda:**
- Por nombre
- Por ID
- Por número de teléfono

### Interpretar Balances

**Balance Alto en Cliente:**
- Normal si compra frecuentemente
- Puede indicar que le gusta pre-cargar saldo

**Balance Alto en Restaurante:**
- Necesita liquidación pronto
- Revisar historial de ventas

**Balance Negativo:**
- ⚠️ ERROR - No debería pasar
- Contactar al equipo técnico inmediatamente

---

## 📤 Sección 5: Liquidaciones a Restaurantes

### ¿Cuándo Hacer Liquidaciones?

**Frecuencia recomendada:**
- **Pequeños restaurantes**: Semanal
- **Restaurantes grandes**: Quincenal
- **A petición**: Si el restaurante lo solicita

### Proceso de Liquidación

#### Paso 1: Revisar Restaurantes Pendientes

1. Ir a la pestaña **"Liquidaciones"**
2. Ver lista de restaurantes con saldo > 0
3. Para cada restaurante verás:
   - Nombre del restaurante
   - Saldo acumulado
   - Comisión de payout (15%)
   - Monto final a transferir

**Ejemplo:**
```
Restaurante: TaiTai
Saldo acumulado: L 1,000.00
Comisión de payout (15%): L 150.00
─────────────────────────────
Monto a transferir: L 850.00
```

#### Paso 2: Generar CSV de Pagos

1. Hacer clic en **"Generar CSV"**
2. Se descargará un archivo con formato:
   ```
   ID Restaurante, Nombre, Monto Original, Comisión, Monto Final, Fecha
   m001, TaiTai, 1000.00, 150.00, 850.00, 2024-01-15
   ```
3. Usar este archivo para:
   - Subir al banco (si aceptan CSV)
   - Referencia para hacer transferencias manuales
   - Contabilidad interna

#### Paso 3: Hacer las Transferencias

**Opción A: Transferencias Manuales**
1. Abrir banca en línea
2. Para cada restaurante:
   - Transferir el monto final
   - Usar concepto: "Liquidación FoodLabs - [Fecha]"
   - Guardar comprobante

**Opción B: Carga Masiva (si el banco lo permite)**
1. Subir archivo CSV al portal del banco
2. Revisar vista previa
3. Confirmar todas las transferencias
4. Descargar comprobantes

#### Paso 4: Marcar como Pagado

1. Regresar al panel de FoodLabs
2. Seleccionar restaurantes pagados (checkbox)
3. Hacer clic en **"Marcar como Pagado"**
4. El sistema automáticamente:
   - Resetea el balance a 0
   - Registra la transacción
   - Cobra la comisión de payout (15%)
   - Actualiza el historial

#### Paso 5: Notificar Restaurantes

**Por WhatsApp (manual por ahora):**
```
Hola [Restaurante],

Te informamos que hemos procesado tu liquidación:
💰 Monto transferido: L 850.00
📅 Fecha: 15/01/2024
🏦 Referencia: [número]

El dinero estará disponible en 24-48 horas.

Gracias por ser parte de FoodLabs! 🍽️
```

### Errores Comunes y Soluciones

#### Error 1: "No se puede marcar como pagado"
**Solución:**
- Verificar que seleccionaste restaurantes
- Verificar conexión a internet
- Refrescar la página
- Contactar soporte técnico

#### Error 2: "Balance negativo después del payout"
**Solución:**
- ⚠️ Grave - No continuar
- Tomar screenshot
- Contactar equipo técnico inmediatamente
- No hacer más liquidaciones hasta resolver

#### Error 3: "CSV no descarga"
**Solución:**
- Verificar bloqueador de pop-ups
- Probar otro navegador
- Limpiar caché
- Contactar soporte técnico

---

## 🚨 Sección 6: Situaciones Especiales

### Cliente Solicita Reembolso

**¿Cuándo procede?**
- ✅ Orden cancelada por restaurante
- ✅ Problema con la entrega
- ✅ Error del sistema
- ❌ Cliente cambió de opinión (revisar política)

**Proceso:**
1. Verificar razón del reembolso
2. Revisar historial de transacciones
3. Si procede:
   - Contactar equipo técnico para reembolso manual
   - Por ahora no hay botón de reembolso automático
4. Documentar en sistema de tickets

### Restaurante Reporta Saldo Incorrecto

**Proceso:**
1. Ir a pestaña **"Balances"**
2. Buscar al restaurante
3. Revisar transacciones recientes
4. Comparar con órdenes completadas
5. Si hay discrepancia:
   - Tomar screenshot de todo
   - Contactar equipo técnico
   - No modificar manualmente

### Cliente No Recibió Saldo Después de Aprobar

**Proceso:**
1. Verificar que se aprobó correctamente
2. Pedir al cliente que cierre sesión y vuelva a entrar
3. Verificar en pestaña "Balances" que sí se acreditó
4. Si persiste el problema:
   - Es problema de caché del navegador
   - Pedir que limpie caché
   - Contactar soporte técnico

---

## 📈 Sección 7: Métricas y Reportes

### Métricas Clave a Monitorear

#### Diarias
- [ ] Recargas pendientes (debe ser < 5)
- [ ] Dinero en escrow (normal si aumenta en horas pico)
- [ ] Tickets de soporte nuevos

#### Semanales
- [ ] Total de recargas aprobadas
- [ ] Total de recargas rechazadas (debe ser < 5%)
- [ ] Restaurantes con saldo > L 5,000
- [ ] Comisiones acumuladas

#### Mensuales
- [ ] Total de liquidaciones procesadas
- [ ] Promedio de tiempo para aprobar recargas
- [ ] Restaurantes más activos
- [ ] Crecimiento de usuarios con wallet

### Cómo Exportar Datos

**Por ahora (manual):**
1. Ir a pestaña correspondiente
2. Tomar screenshots
3. Copiar datos a Excel manualmente

**Próximamente (automático):**
- Botón "Exportar Reporte"
- Generación automática de PDF
- Envío por email

---

## 🛡️ Sección 8: Seguridad y Mejores Prácticas

### Protección de Datos

**SÍ hacer:**
- ✅ Cerrar sesión al terminar
- ✅ No compartir credenciales
- ✅ Verificar URL correcta antes de login
- ✅ Reportar actividad sospechosa
- ✅ Usar contraseña fuerte

**NO hacer:**
- ❌ Dejar sesión abierta en computadora pública
- ❌ Compartir pantalla con datos sensibles
- ❌ Tomar fotos de comprobantes en celular personal
- ❌ Compartir información de clientes
- ❌ Modificar datos sin autorización

### Manejo de Información Sensible

**Información que es sensible:**
- Balances de usuarios
- Comprobantes de pago
- Números de cuenta bancaria
- Datos personales de clientes

**Protocolo:**
1. Solo acceder cuando sea necesario
2. No compartir con personas no autorizadas
3. No guardar en dispositivos personales
4. Reportar cualquier brecha de seguridad

---

## 📞 Sección 9: Contactos y Soporte

### ¿A Quién Contactar?

**Problemas Técnicos:**
- Email: soporte@foodlab.store
- WhatsApp: [Número del equipo técnico]
- Respuesta en: < 2 horas

**Dudas Administrativas:**
- Email: admin@foodlab.store
- WhatsApp: [Número del super admin]
- Respuesta en: < 4 horas

**Emergencias (sistema caído):**
- Llamar directamente: [Número de emergencia]
- Disponible: 24/7

### Antes de Contactar Soporte

✅ **Tener lista:**
1. Descripción clara del problema
2. Screenshots (si aplica)
3. ID de usuario/orden afectado
4. Pasos que ya intentaste
5. Navegador y versión

---

## 📝 Sección 10: Ejercicios Prácticos

### Ejercicio 1: Aprobar Recarga

**Escenario:**
Cliente "Juan Pérez" solicita recarga de L 500. Subió comprobante que muestra transferencia de L 500 a la cuenta de FoodLabs el día de hoy.

**Tareas:**
1. [ ] Navegar a pestaña de recargas
2. [ ] Encontrar la solicitud
3. [ ] Ver el comprobante
4. [ ] Aprobar la recarga
5. [ ] Verificar que el saldo se actualizó

### Ejercicio 2: Generar Liquidación

**Escenario:**
3 restaurantes tienen saldo pendiente:
- TaiTai: L 1,200
- Pizza Express: L 850
- Baleadas María: L 2,400

**Tareas:**
1. [ ] Ir a pestaña de liquidaciones
2. [ ] Seleccionar los 3 restaurantes
3. [ ] Generar CSV
4. [ ] Calcular monto total a transferir (considerando 15% comisión)
5. [ ] Marcar como pagados

**Respuesta esperada:**
- Total original: L 4,450
- Comisión total (15%): L 667.50
- Total a transferir: L 3,782.50

### Ejercicio 3: Investigar Discrepancia

**Escenario:**
Restaurante reporta que tiene L 500 en su wallet pero el panel muestra L 450.

**Tareas:**
1. [ ] Buscar al restaurante en balances
2. [ ] Revisar transacciones recientes
3. [ ] Identificar posible causa
4. [ ] Documentar hallazgos
5. [ ] Decidir si contactar soporte técnico

---

## ✅ Checklist de Certificación

Para completar el entrenamiento, debes:

- [ ] Completar lectura de toda la guía
- [ ] Realizar los 3 ejercicios prácticos
- [ ] Aprobar al menos 2 recargas reales
- [ ] Generar 1 CSV de liquidación
- [ ] Conocer todos los contactos de soporte
- [ ] Entender las mejores prácticas de seguridad

**Certificado por:** ___________________
**Fecha:** ___________________

---

## 📚 Recursos Adicionales

- [Video Tutorial: Cómo Aprobar Recargas](enlace-pendiente)
- [Video Tutorial: Proceso de Liquidaciones](enlace-pendiente)
- [FAQ - Preguntas Frecuentes](enlace-pendiente)
- [Política de Reembolsos](enlace-pendiente)

---

## 🔄 Actualizaciones

**Versión 1.0** - Enero 2024
- Documento inicial

**Próximas actualizaciones incluirán:**
- Integración con WhatsApp Business API
- Reembolsos automáticos
- Reportes automatizados
- Sistema de tickets integrado

---

¿Preguntas? Contacta al equipo de FoodLabs 🚀
