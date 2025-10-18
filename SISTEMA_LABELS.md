# Sistema de Labels Dietarios - FoodLabs

## Fecha: Octubre 18, 2025

### Funcionalidad Implementada

Se ha agregado un sistema completo de labels (etiquetas) dietarios para ayudar a los clientes a filtrar productos según sus preferencias alimentarias.

---

## 1. Labels Disponibles

### 🌱 Vegano
- **Color**: Verde (#10b981)
- **Icono**: Hoja (Leaf)
- **Descripción**: No contiene productos de origen animal
- **Ejemplos**: Agua, Coca Cola, Jugos naturales, Pepsi Light

### 🌿 Vegetariano
- **Color**: Verde (#059669)  
- **Icono**: Brote (Sprout)
- **Descripción**: No contiene carne ni pescado
- **Ejemplos**: CroiLab, Gyozas, Loaded Fries

### 🐟 Pescaradiano
- **Color**: Azul (#0ea5e9)
- **Icono**: Pescado (Fish)
- **Descripción**: No contiene carne, pero sí pescado
- **Ejemplos**: Tallarin (con camarones)

### ❤️ Fit
- **Color**: Naranja (#f97316)
- **Icono**: Corazón (Heart)
- **Descripción**: Opción saludable/baja en calorías
- **Ejemplos**: Pepsi Light, Jugos naturales, Limonada, Tamarindo

---

## 2. Productos sin Labels

Los productos que no tienen labels especiales **no necesitan ninguna configuración adicional**. El campo se deja vacío y la UI automáticamente no mostrará ningún badge.

**Ejemplos de productos sin labels:**
- Orange Chicken
- Boneless
- Angus Burger
- Chicken Sandwich

---

## 3. Productos con Múltiples Labels

Un producto puede tener varios labels al mismo tiempo. Se separan con punto y coma (;) en el CSV.

**Ejemplos:**
- **Pepsi Light**: `Vegano;Fit`
- **Jugo Natural**: `Vegano;Fit`
- **Limonada**: `Vegano;Fit`
- **Tamarindo**: `Vegano;Fit`

---

## 4. Implementación Técnica

### CSV (`foodlabs-products.csv`)
```csv
Restaurante,Producto,...,Labels
FoodLab TGU,Pepsi Light,...,Vegano;Fit
FoodLab TGU,Loaded Fries,...,Vegetariano
FoodLab TGU,Orange Chicken,...,
```

### Datos en la App
```javascript
{
  id: 'pepsi-light',
  name: 'Pepsi Light',
  basePrice: 41.73,
  labels: ['Vegano', 'Fit']  // Array de strings
}
```

### Badges Visuales

**En RestaurantDetailPage:**
- Badges pequeños (11px) debajo de la descripción
- Icono + texto
- Colores distintivos por tipo

**En ProductModal:**
- Badges más grandes (13px) con borde
- Prominentes y claros
- Se muestran antes de las opciones de tamaño

---

## 5. FitLabs - Filtro Automático

### Funcionalidad
La página FitLabs **automáticamente** filtra y muestra solo los productos que tienen el label "Fit", sin importar de qué restaurante provengan.

### Características:
- ✅ Muestra productos de **todos los restaurantes**
- ✅ Filtra solo los que tienen label "Fit"
- ✅ Badge especial "FIT" en la imagen
- ✅ Contador de opciones disponibles
- ✅ Muestra otros labels adicionales (Vegano, Vegetariano)
- ✅ Modal de producto completo al hacer clic

### Productos Fit Actuales:
1. **Pepsi Light** (Vegano + Fit) - FoodLab TGU y SPS
2. **Natural 16oz** (Vegano + Fit) - FoodLab TGU y SPS
3. **Tamarindo 16oz** (Vegano + Fit) - FoodLab TGU y SPS
4. **Limonada 16oz** (Vegano + Fit) - FoodLab TGU y SPS

**Total:** 8 opciones fit (4 productos x 2 restaurantes)

---

## 6. Beneficios del Sistema

### Para Clientes:
✅ Fácil identificación de productos según preferencias dietarias
✅ Visualización clara con iconos y colores
✅ Página dedicada para productos fit
✅ Información transparente

### Para Restaurantes:
✅ Destacar opciones saludables
✅ Atraer clientes con preferencias específicas
✅ Diferenciación de productos
✅ Fácil de configurar (solo agregar en CSV)

### Para el Negocio:
✅ Mayor alcance de mercado
✅ Mejor experiencia de usuario
✅ SEO mejorado (búsquedas por "vegano", "fit", etc.)
✅ Tendencia hacia alimentación consciente

---

## 7. Cómo Agregar Labels a Nuevos Productos

### Opción 1: CSV
```csv
FoodLab TGU,Ensalada César,Entradas,,89.50,...,Vegetariano
FoodLab TGU,Smoothie Verde,Bebidas,,65.00,...,Vegano;Fit
```

### Opción 2: En el Código
```javascript
{
  id: 'ensalada-cesar',
  name: 'Ensalada César',
  basePrice: 89.50,
  description: 'Ensalada fresca con aderezo césar',
  labels: ['Vegetariano']
}
```

---

## 8. Configuración de Labels

### Constante `LABEL_CONFIG`
Ubicación: 
- `src/pages/RestaurantDetailPage.jsx`
- `src/components/ProductModal.jsx`

```javascript
const LABEL_CONFIG = {
  'Vegano': { 
    icon: Leaf, 
    color: '#10b981', 
    bgColor: '#d1fae5', 
    label: 'Vegano' 
  },
  'Vegetariano': { 
    icon: Sprout, 
    color: '#059669', 
    bgColor: '#a7f3d0', 
    label: 'Vegetariano' 
  },
  'Pescaradiano': { 
    icon: Fish, 
    color: '#0ea5e9', 
    bgColor: '#e0f2fe', 
    label: 'Pescaradiano' 
  },
  'Fit': { 
    icon: FitIcon, 
    color: '#f97316', 
    bgColor: '#fed7aa', 
    label: 'Fit' 
  }
}
```

### Para Agregar un Nuevo Label:
1. Agregar entrada en `LABEL_CONFIG`
2. Elegir icono de `lucide-react`
3. Definir colores (color principal y fondo)
4. Actualizar plantilla CSV
5. Actualizar documentación

---

## 9. Flujo de Usuario

### Escenario 1: Cliente busca opciones veganas
1. Navega a cualquier restaurante
2. Ve badges "Vegano" en productos
3. Identifica rápidamente sus opciones
4. Hace pedido con confianza

### Escenario 2: Cliente busca opciones fit
1. Va directamente a FitLabs
2. Ve todas las opciones saludables de todos los restaurantes
3. Elige su producto
4. Agrega al carrito desde el modal

### Escenario 3: Restaurante agrega producto nuevo
1. Llena plantilla CSV con producto
2. Agrega labels apropiados (ej: "Vegetariano;Fit")
3. Sube la plantilla
4. El sistema automáticamente:
   - Muestra badges en el menú
   - Filtra a FitLabs si tiene "Fit"
   - Permite búsquedas por label

---

## 10. Próximas Mejoras Sugeridas

### Corto Plazo:
- 🔍 **Filtros en página principal** para buscar por label
- 🏷️ **Más labels**: Sin gluten, Sin lactosa, Orgánico
- 📊 **Analytics**: Rastrear qué labels son más populares

### Mediano Plazo:
- 👤 **Perfil de usuario** con preferencias dietarias guardadas
- 🔔 **Notificaciones** cuando se agregan productos con sus labels favoritos
- ⭐ **Destacados**: Sección "Para ti" basada en preferencias

### Largo Plazo:
- 🤖 **IA**: Sugerencias personalizadas
- 📱 **App móvil nativa** con filtros avanzados
- 🌍 **Certificaciones**: Validación de claims veganos/fit con certificados

---

## 11. Archivos Modificados

### Nuevos Archivos:
- `/foodlabs-products.csv` - Actualizado con columna Labels
- `/PLANTILLA_PRODUCTOS.md` - Actualizado con información de labels
- `/SISTEMA_LABELS.md` - Este documento

### Archivos Modificados:
- `src/pages/FoodLabsPage.jsx` - Labels agregados a todos los productos
- `src/pages/RestaurantDetailPage.jsx` - Badges visuales de labels
- `src/components/ProductModal.jsx` - Badges en modal de producto
- `src/pages/FitLabsPage.jsx` - Transformado de "coming soon" a listado funcional

---

## 12. Datos Estadísticos

### Productos por Label (actual):

| Label | Cantidad | Porcentaje |
|-------|----------|------------|
| Vegano | 14 | 42% |
| Vegetariano | 6 | 18% |
| Pescaradiano | 2 | 6% |
| Fit | 8 | 24% |
| Sin label | 10 | 30% |

### Restaurantes con Productos Fit:
- ✅ FoodLab TGU (4 productos)
- ✅ FoodLab SPS (4 productos)

---

## Contacto

Para preguntas sobre el sistema de labels o sugerencias de nuevos labels, contactar al equipo de desarrollo.

**Última actualización:** Octubre 18, 2025

