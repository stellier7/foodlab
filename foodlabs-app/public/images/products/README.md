# 📸 Product Images

Esta carpeta contiene las imágenes de los productos de SportsShop.

## 📁 Estructura Recomendada:

```
products/
├── padel/
│   ├── paletas/
│   ├── pelotas/
│   └── accesorios/
├── tennis/
├── futbol/
└── otros/
```

## 🖼️ Especificaciones de Imágenes:

### **Tamaño Recomendado:**
- **Resolución**: 800x600px mínimo
- **Formato**: JPG o PNG
- **Peso**: Máximo 500KB por imagen
- **Aspect Ratio**: 4:3 o 3:2

### **Estilo:**
- Fondo blanco o transparente
- Iluminación uniforme
- Producto centrado
- Múltiples ángulos (opcional)

## 📱 Cómo Agregar Imágenes:

### **1. Subir Imagen:**
```bash
# Ejemplo para PadelBuddy
cp /ruta/a/tu/imagen.jpg padelbuddy-phone-mount.jpg
```

### **2. Usar en el Código:**
```javascript
// En SportsShopPage.jsx
{
  id: 'sp3',
  name: 'PadelBuddy - Phone Mount',
  image: '/images/products/padelbuddy-phone-mount.jpg', // Ruta relativa desde public/
  // ... resto de propiedades
}
```

## 🎯 Imágenes Necesarias:

### **PadelBuddy:**
- [ ] `padelbuddy-phone-mount.jpg` - Vista principal
- [ ] `padelbuddy-detail.jpg` - Vista de las ventosas
- [ ] `padelbuddy-in-use.jpg` - En uso en cancha

### **Otros Productos:**
- [ ] `paleta-padel-pro.jpg`
- [ ] `pelotas-padel-x3.jpg`
- [ ] `bolso-deportivo.jpg`
- [ ] `munequeras-pro.jpg`
- [ ] `zapatillas-padel.jpg`
- [ ] `camiseta-tecnica.jpg`

## 🔧 Optimización Automática:

Las imágenes se sirven desde `/public/` y se pueden optimizar automáticamente con:
- Vite (ya configurado)
- Lazy loading implícito
- WebP conversion (opcional)

## 📝 Notas:

- Todas las imágenes son públicas
- Se pueden acceder directamente: `http://localhost:5173/images/products/tu-imagen.jpg`
- Vite optimiza automáticamente las imágenes
- Usar nombres descriptivos sin espacios

---

**¡Agrega tus imágenes aquí y actualiza las rutas en el código! 📸**
