# Resumen de Cambios - Sistema de Productos FoodLabs

## Fecha: Octubre 17, 2025

### Cambios Implementados

Se ha reorganizado completamente el sistema de productos de FoodLabs para soportar:
- Múltiples restaurantes por ciudad (FoodLab TGU y FoodLab SPS)
- Variantes de productos (tamaños)
- Opciones de combo con cambio dinámico de imágenes
- Estructura de datos limpia y escalable

---

## 1. Archivos Creados

### `/foodlabs-products.csv`
CSV reorganizado con todos los productos de ambos restaurantes FoodLab.

**Estructura:**
- Restaurante, Producto, Categoría, Tamaño, Precio FL App, Costo por Plato, Comisión Foodlab, Tiene Combo, Precio Combo Adicional, Imagen, Imagen Combo, Descripción

**Productos incluidos:**
- **FoodLab TGU**: 25 productos (incluyendo CroiLab, Gyozas, Orange Chicken, Boneless con variantes, bebidas)
- **FoodLab SPS**: 24 productos (incluyendo burgers, sandwiches, Boneless con variantes, bebidas)

### `/PLANTILLA_PRODUCTOS.md`
Guía completa para que los restaurantes llenen sus productos.

**Incluye:**
- Instrucciones paso a paso
- Descripción de cada columna
- Ejemplos de productos simples, con variantes y con combos
- Validaciones recomendadas para Google Sheets
- Consejos para imágenes
- Preguntas frecuentes

---

## 2. Cambios en el Código

### `src/stores/useAppStore.js`
**Actualizado para manejar variantes de productos:**

```javascript
// Antes: identificación por id
const existingItem = cart.find(
  cartItem => cartItem.id === item.id
)

// Ahora: identificación por variantKey
const variantKey = `${item.id}-${item.selectedSize || 'default'}-${item.withCombo || false}`
const existingItem = cart.find(
  cartItem => cartItem.variantKey === variantKey
)
```

**Beneficio:** Ahora "Boneless 12 piezas" y "Boneless 12 piezas con Combo" son items diferentes en el carrito.

---

### `src/components/ProductModal.jsx`
**Nueva funcionalidad de variantes y combos:**

**Estado agregado:**
```javascript
const [selectedSize, setSelectedSize] = useState(null)
const [withCombo, setWithCombo] = useState(false)
```

**Características:**
1. **Selector de tamaño** (pills)
   - Muestra todos los tamaños disponibles
   - Indica el precio adicional de cada tamaño
   - Diseño moderno con feedback visual

2. **Toggle de combo**
   - Switch elegante para activar/desactivar combo
   - Muestra precio adicional
   - Descripción del combo incluido

3. **Precio dinámico**
   - Se calcula en tiempo real: `basePrice + sizeModifier + comboPrice`
   - Se actualiza al cambiar tamaño o combo

4. **Imagen dinámica**
   - Cambia automáticamente cuando se activa el combo
   - Transición suave entre imágenes

**Ejemplo de cálculo:**
```
Boneless Regular: L 193.40
  + Tamaño "12 piezas": +L 134.74
  + Combo: +L 32.66
  = Total: L 360.80
```

---

### `src/components/ShoppingCart.jsx`
**Actualizado para mostrar variantes:**

**Cambios:**
1. Usa `variantKey` en lugar de `id` para identificar items
2. Muestra precios en Lempiras (L) en lugar de dólares ($)
3. El nombre del producto ya incluye las variantes: "Boneless - 12 piezas con Combo"

---

### `src/pages/FoodLabsPage.jsx`
**Dos restaurantes FoodLab con menús completos:**

**Estructura de producto con variantes:**
```javascript
{
  id: 'boneless',
  name: 'Boneless',
  basePrice: 193.40,
  description: 'Deliciosos boneless de pollo crujiente',
  image: '/images/products/foodLab/orangeChicken.jpeg',
  
  // Variantes de tamaño
  sizes: [
    { value: 'regular', label: 'Regular', priceModifier: 0 },
    { value: 'regular-papas', label: 'Regular + Papas', priceModifier: 33.39 },
    { value: '12', label: '12 piezas', priceModifier: 134.74 },
    { value: '24', label: '24 piezas', priceModifier: 405.15 }
  ],
  
  // Opción de combo
  comboOptions: {
    available: true,
    price: 32.66,
    description: 'Incluye papas fritas',
    includesImage: '/images/products/foodLab/loadedFries.jpeg'
  }
}
```

**Categorías por restaurante:**
- Más vendidos
- Entradas
- Platos principales
- Bebidas

---

### `src/pages/RestaurantDetailPage.jsx`
**Actualizado para pasar restaurantId al modal:**

```javascript
<ProductModal
  product={selectedProduct}
  restaurantId={restaurant.id}  // ← Nuevo
  isOpen={isModalOpen}
  onClose={closeModal}
/>
```

---

## 3. Flujo de Usuario

### Antes:
1. Usuario ve producto "Boneless 12 piezas combo"
2. Hace clic y agrega al carrito
3. Es un producto separado de "Boneless 12 piezas"

### Ahora:
1. Usuario ve producto "Boneless"
2. Hace clic y se abre modal
3. Selecciona tamaño: "12 piezas" (+L 134.74)
4. Activa combo (+L 32.66)
5. Ve precio total actualizado: L 360.80
6. La imagen cambia para mostrar el combo
7. Agrega al carrito con nombre: "Boneless - 12 piezas con Combo"

---

## 4. Ventajas del Nuevo Sistema

### Para el Negocio:
✅ Un solo producto "Boneless" en lugar de 8 productos separados
✅ Fácil agregar nuevos tamaños o combos
✅ Precios centralizados y fáciles de actualizar
✅ Dos restaurantes separados por ciudad

### Para el Usuario:
✅ Interfaz más limpia y moderna
✅ Mejor experiencia al personalizar pedido
✅ Feedback visual inmediato
✅ Precios transparentes y claros

### Para Desarrollo:
✅ Código más mantenible
✅ Estructura escalable
✅ Fácil agregar más opciones (bebidas, etc.)
✅ Sistema de variantes reutilizable

---

## 5. Próximos Pasos Sugeridos

1. **Imágenes de productos:**
   - Agregar imágenes reales en `/public/images/products/foodLab/`
   - Seguir nomenclatura: `boneless.jpeg`, `boneless12.jpeg`, `boneless12Combo.jpeg`

2. **Filtrado por ciudad:**
   - Detectar ubicación del usuario
   - Mostrar solo restaurante de su ciudad

3. **Más opciones:**
   - Agregar selección de bebida al combo
   - Agregar extras/modificadores

4. **Backend:**
   - Importar CSV a base de datos
   - API para actualizar productos

5. **Portal para restaurantes:**
   - Que puedan editar sus productos
   - Subir imágenes directamente
   - Ver estadísticas de ventas

---

## 6. Notas Técnicas

### Cálculo de Precios
- Todos los precios en el CSV están en Lempiras
- La comisión FoodLab es 7% del precio de venta
- Los combos son un precio adicional fijo

### Compatibilidad
- El sistema es compatible con productos que no tienen variantes
- Si un producto no tiene `sizes`, se comporta como antes
- Si no tiene `comboOptions.available`, no muestra el toggle

### Performance
- Las imágenes se cargan solo cuando se necesitan
- El precio se calcula en tiempo real sin APIs
- El carrito usa localStorage para persistencia

---

## Contacto

Para preguntas o cambios adicionales, contactar al equipo de desarrollo.

**Última actualización:** Octubre 17, 2025

