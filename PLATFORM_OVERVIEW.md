# Labs Platform - Overview

Una plataforma unificada con tres secciones principales: **FoodLabs**, **FitLabs**, y **SportsShop**.

## 🚀 Acceso Local

El servidor está corriendo en: **http://localhost:5173**

## 📱 Secciones

### 1. FoodLabs (`/`)
- **Descripción**: Plataforma de delivery de comida
- **Color**: Naranja (#f97316)
- **Características**:
  - Catálogo de restaurantes locales
  - Menús expandibles
  - Sistema de calificaciones
  - FoodLabs Select (restaurantes premium)
  - Checkout vía WhatsApp

### 2. FitLabs (`/fitlabs`)
- **Descripción**: Centro de fitness y bienestar (Próximamente)
- **Color**: Verde (#10b981)
- **Características planeadas**:
  - Gimnasios
  - Clases grupales (yoga, pilates, etc.)
  - Entrenadores personales
  - Planes nutricionales

### 3. SportsShop (`/sportsshop`)
- **Descripción**: Tienda deportiva (especializada en padel)
- **Color**: Azul (#3b82f6)
- **Características**:
  - Catálogo de productos deportivos
  - Categorías: Padel, Accesorios, Calzado, Ropa
  - Envío gratis en compras mayores a $100
  - Sistema de stock
  - Tags de "¡Últimos!" para productos con bajo inventario

## 🛒 Carrito Unificado

El carrito funciona de manera unificada entre todas las secciones:
- Puedes agregar productos de FoodLabs y SportsShop al mismo carrito
- El mensaje de WhatsApp se adapta según el tipo de productos
- Los fees se calculan de manera inteligente según el tipo de pedido

## 🎨 Características Técnicas

### Stack
- **Frontend**: React + Vite
- **State Management**: Zustand (con persistencia)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: Inline styles (fácil de mantener y modificar)

### Estructura de archivos
```
src/
├── components/
│   ├── Header.jsx (navegación unificada)
│   ├── RestaurantList.jsx
│   └── ShoppingCart.jsx (carrito unificado)
├── pages/
│   ├── FoodLabsPage.jsx
│   ├── FitLabsPage.jsx
│   └── SportsShopPage.jsx
├── stores/
│   └── useAppStore.js (Zustand store)
└── App.jsx (routing principal)
```

## 🔄 Próximos Pasos

### Para FitLabs:
- [ ] Integrar catálogo de gimnasios
- [ ] Sistema de reservas de clases
- [ ] Perfiles de entrenadores
- [ ] Planes nutricionales

### Para SportsShop:
- [ ] Agregar más productos
- [ ] Sistema de filtros avanzados
- [ ] Reviews de productos
- [ ] Wishlist

### Para FoodLabs:
- [ ] Más restaurantes
- [ ] Sistema de búsqueda
- [ ] Filtros por categoría
- [ ] Tracking de órdenes en tiempo real

## 💡 Cómo Agregar Productos a SportsShop

Edita el archivo: `src/pages/SportsShopPage.jsx`

Agrega productos al array `products`:
```javascript
{
  id: 'sp7',
  name: 'Nombre del Producto',
  price: 49.99,
  category: 'padel', // o 'accessories', 'footwear', 'clothing'
  description: 'Descripción del producto',
  image: 'https://...',
  stock: 20
}
```

## 🎯 Features del Carrito

- **Agregar/Quitar items**: Con botones + y -
- **Resumen de fees**: Muestra todos los cargos desglosados
- **WhatsApp Checkout**: Genera mensaje automático con el pedido
- **Persistencia**: El carrito se guarda en localStorage
- **Multi-sección**: Maneja productos de diferentes secciones

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

---

**Nota**: Este es un MVP. Puedes ir agregando productos y funcionalidades gradualmente sin romper lo existente.

