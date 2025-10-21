# 🔐 Credenciales para Testing - FoodLabs

## ADMINISTRADOR

**Login**: `/admin/login`

```
Email: admin@foodlabs.com
Password: admin123
```

**Permisos**:
- ✅ Ver TODAS las órdenes de TODOS los comercios
- ✅ Cambiar estados de cualquier orden
- ✅ Ver estadísticas globales
- ✅ Gestionar inventario completo
- ✅ Exportar datos

---

## COMERCIOS

### Shop
**Login**: `/business/login`

```
Comercio: Shop (seleccionar del dropdown)
ID: sportsshop
Password: shop123
```

**Panel**: `/business/sportsshop`

**Permisos**:
- ✅ Ver solo órdenes de Shop
- ✅ Aceptar/rechazar órdenes
- ✅ Cambiar estados de sus órdenes
- ✅ Ver inventario de PadelBuddy
- ❌ No puede ver órdenes de FoodLabs

---

### FoodLab TGU
**Login**: `/business/login`

```
Comercio: FoodLab TGU (seleccionar del dropdown)
ID: foodlab-tgu
Password: foodlab123
```

**Panel**: `/business/foodlab-tgu`

**Permisos**:
- ✅ Ver solo órdenes de FoodLab TGU
- ✅ Aceptar/rechazar órdenes
- ✅ Cambiar estados de sus órdenes
- ❌ No puede ver órdenes de Shop o FoodLab SPS

---

### FoodLab SPS
**Login**: `/business/login`

```
Comercio: FoodLab SPS (seleccionar del dropdown)
ID: foodlab-sps
Password: foodlab123
```

**Panel**: `/business/foodlab-sps`

**Permisos**:
- ✅ Ver solo órdenes de FoodLab SPS
- ✅ Aceptar/rechazar órdenes
- ✅ Cambiar estados de sus órdenes
- ❌ No puede ver órdenes de Shop o FoodLab TGU

---

## PRODUCTOS - DATOS IMPORTANTES

### PadelBuddy (Shop):
```
ID: sp3
Stock inicial: 20 unidades
Precio USD: $13.15
Precio HNL: L 325.00 (exacto)
Features: 12 ventosas, Forma de raqueta, Para vidrio, Grabación HD
Categoría: Deportes
```

### Orange Chicken (FoodLabs):
```
ID: orange-chicken
Stock: 999 (ilimitado)
Precio USD: $9.21
Precio HNL: L 227.90 (exacto)
Labels: ninguno
```

### Boneless (FoodLabs):
```
ID: boneless
Stock: 999 (ilimitado)
Precio USD: $7.82
Precio HNL: L 193.40 (exacto)
Sizes: Regular, Regular + Papas, 12 piezas, 24 piezas
```

---

## 🌍 UBICACIONES

### Honduras - Tegucigalpa:
```
Coordenadas: 14.0723, -87.1921
Restaurantes: FoodLab TGU
Moneda: Lempiras (HNL)
```

### Honduras - San Pedro Sula:
```
Coordenadas: 15.5047, -88.0253
Restaurantes: FoodLab SPS
Moneda: Lempiras (HNL)
```

---

## 💰 TASAS DE CAMBIO

```
1 USD = 24.75 HNL (Lempiras)
1 USD = 7.80 GTQ (Quetzales)
```

**Para actualizar tasas**:
- Archivo: `foodlabs-app/src/stores/useAppStore.js`
- Líneas: 10-14
- Modificar valores de `EXCHANGE_RATES`

---

## 📦 INVENTARIO INICIAL

```javascript
inventory: {
  'sp3': { stock: 20, reserved: 0, sold: 0 },           // PadelBuddy
  'orange-chicken': { stock: 999, reserved: 0, sold: 0 },
  'boneless': { stock: 999, reserved: 0, sold: 0 },
  'angus-burger': { stock: 999, reserved: 0, sold: 0 },
  'chicken-sandwich': { stock: 999, reserved: 0, sold: 0 },
  'tallarin': { stock: 999, reserved: 0, sold: 0 },
  'loaded-fries': { stock: 999, reserved: 0, sold: 0 },
  'croilab': { stock: 999, reserved: 0, sold: 0 },
  'gyozas': { stock: 999, reserved: 0, sold: 0 }
}
```

---

## 🎨 CATEGORÍAS DE SHOP

```javascript
{ id: 'all', name: 'Todo', emoji: '🏪' },
{ id: 'sports', name: 'Deportes', emoji: '⚽' },
{ id: 'convenience', name: 'Conveniencia', emoji: '🏬' },
{ id: 'pharmacy', name: 'Farmacias', emoji: '💊' }
```

---

## 🔄 FLUJO DE ÓRDENES Y STOCK

### Escenario Completo:

```
1. Usuario agrega PadelBuddy al carrito
   Stock: 20

2. Usuario hace checkout (WhatsApp)
   Stock: 20 (aún pending)

3. Orden creada en sistema
   Estado: pending
   Stock: 20

4. Comercio/Admin acepta orden
   Estado: pending → confirmed
   Stock: 20 → 19 ✅
   Sold: 0 → 1 ✅

5. Comercio marca como "En Preparación"
   Estado: confirmed → preparing
   Stock: 19 (sin cambio)

6. Comercio marca como "Listo"
   Estado: preparing → ready
   Stock: 19 (sin cambio)

7. Comercio marca como "Entregado"
   Estado: ready → delivered
   Stock: 19 (sin cambio)

TOTAL: Stock final = 19 ✅
```

### Si se cancela:
```
1. Orden cancelada (cualquier estado)
   Estado: X → cancelled
   Stock: 19 → 20 ✅
   Sold: 1 → 0 ✅
```

---

## 📞 WHATSAPP CHECKOUT

**Número**: +504 8869-4777

**Formato de mensaje**:
```
🏆 *NUEVO PEDIDO - Shop*

👤 *Cliente:* [Nombre]
📍 *Dirección:* [Dirección]

📋 *Pedido:*

🏆 *Shop*
• PadelBuddy - Phone Mount x1 - L325.00

💰 *Resumen:*
Subtotal: L325.00
FoodLab: L24.38
*Total: L349.38*

💳 *Método de pago:* Efectivo/Transferencia/Tarjeta

¡Gracias por elegir Shop! 🏆
```

---

## ✅ TODO LISTO PARA PRODUCCIÓN

**Último commit**: `88b1b45`  
**Archivos modificados**: 15+  
**Nuevas funcionalidades**: 10+  
**Sin errores**: ✅  
**Testeado localmente**: ✅  

**¡A hacer deploy! 🚀**

