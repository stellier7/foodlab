# Plantilla de Productos FoodLabs

Esta plantilla está diseñada para que los restaurantes puedan agregar sus productos de forma fácil y organizada a la plataforma FoodLabs.

## Instrucciones para Google Sheets

### Cómo usar esta plantilla

1. **Copia la plantilla** a tu propio Google Sheets
2. **Llena cada columna** con la información de tus productos
3. **Envía el link** del Google Sheets completado a FoodLabs
4. Nosotros nos encargaremos de importar tus productos a la plataforma

### Estructura de la Plantilla

La plantilla debe tener **3 pestañas**:

#### Pestaña 1: Instrucciones
Esta pestaña (copia este documento para referencias)

#### Pestaña 2: Productos (Tabla Principal)
Aquí agregarás todos tus productos. Ver estructura abajo.

#### Pestaña 3: Ejemplo
Copia de los productos de FoodLab como referencia.

---

## Columnas de la Tabla de Productos

| Columna | Descripción | Ejemplo | Requerido | Notas |
|---------|-------------|---------|-----------|-------|
| **Restaurante** | Nombre completo de tu restaurante + ciudad | "FoodLab TGU" | Sí | Formato: "Nombre Ciudad" |
| **Producto** | Nombre base del producto (sin tamaño) | "Boneless" | Sí | No incluir tamaño aquí |
| **Categoría** | Categoría del menú | "Más vendidos" | Sí | Opciones: Más vendidos, Entradas, Platos principales, Bebidas, Productos especiales |
| **Tamaño** | Tamaño o variante del producto | "12 piezas" | No | Dejar vacío si no aplica. Ej: Regular, 12 piezas, 355ml |
| **Precio FL App** | Precio de venta en la app (Lempiras) | 227.90 | Sí | Solo número, sin símbolo L |
| **Costo por Plato** | Costo de producción (Lempiras) | 163.84 | Sí | Para cálculos internos |
| **Comisión Foodlab** | Comisión del 7% | =E2*0.07 | Auto | Fórmula automática |
| **Tiene Combo** | ¿Ofrece opción de combo? | "Sí" o "No" | Sí | Dropdown: Sí/No |
| **Precio Combo Adicional** | Precio extra del combo | 32.66 | Condicional | Solo si "Tiene Combo" = Sí |
| **Imagen** | Nombre del archivo de imagen | "boneless.jpeg" | Sí | Debe coincidir exactamente con el nombre del archivo |
| **Imagen Combo** | Nombre de imagen cuando se selecciona combo | "bonelessCombo.jpeg" | No | Solo si "Tiene Combo" = Sí |
| **Descripción** | Descripción breve del producto | "Deliciosos boneless..." | Sí | Máximo 100 caracteres |
| **Labels** | Etiquetas dietarias y especiales | "Vegano;Fit" | No | Separar con punto y coma. Opciones: Vegano, Vegetariano, Pescaradiano, Fit |

---

## Ejemplos de Productos

### Producto Simple (sin variantes)
```
Restaurante: FoodLab TGU
Producto: Orange Chicken
Categoría: Más vendidos
Tamaño: [vacío]
Precio FL App: 227.90
Costo por Plato: 163.84
Comisión Foodlab: =227.90*0.07
Tiene Combo: No
Precio Combo Adicional: [vacío]
Imagen: orangeChicken.jpeg
Imagen Combo: [vacío]
Descripción: Pollo crujiente bañado en salsa de naranja dulce
```

### Producto con Tamaños y Combos
```
# Fila 1: Boneless Regular
Restaurante: FoodLab SPS
Producto: Boneless
Categoría: Más vendidos
Tamaño: Regular
Precio FL App: 193.40
Costo por Plato: 139.04
Comisión Foodlab: =193.40*0.07
Tiene Combo: Sí
Precio Combo Adicional: 32.66
Imagen: boneless.jpeg
Imagen Combo: bonelessPapas.jpeg
Descripción: Deliciosos boneless de pollo crujiente
Labels: [vacío]

# Fila 2: Boneless 12 piezas
Restaurante: FoodLab SPS
Producto: Boneless
Categoría: Más vendidos
Tamaño: 12 piezas
Precio FL App: 328.14
Costo por Plato: 235.90
Comisión Foodlab: =328.14*0.07
Tiene Combo: Sí
Precio Combo Adicional: 98.96
Imagen: boneless12.jpeg
Imagen Combo: boneless12Combo.jpeg
Descripción: 12 piezas de boneless crujientes
Labels: [vacío]
```

### Bebida con Tamaño
```
Restaurante: FoodLab TGU
Producto: Coca Cola
Categoría: Bebidas
Tamaño: 355ml
Precio FL App: 41.73
Costo por Plato: 30.00
Comisión Foodlab: =41.73*0.07
Tiene Combo: No
Precio Combo Adicional: [vacío]
Imagen: cocaCola.jpeg
Imagen Combo: [vacío]
Descripción: Coca Cola 355ml
Labels: Vegano
```

---

## Validaciones Recomendadas en Google Sheets

### Para la columna "Categoría" (C):
Validación de datos → Lista de opciones:
- Más vendidos
- Entradas
- Platos principales
- Bebidas
- Productos especiales

### Para la columna "Tiene Combo" (H):
Validación de datos → Lista de opciones:
- Sí
- No

### Para la columna "Comisión Foodlab" (G):
Fórmula: `=E2*0.07`
(Donde E2 es el Precio FL App)

### Para columnas de precios (E, F, G, I):
Formato → Número → 2 decimales

### Para la columna "Labels" (M):
Validación de datos → Lista de opciones (permitir múltiples):
- Vegano
- Vegetariano
- Pescaradiano
- Fit

**Nota:** Para múltiples labels, separar con punto y coma. Ejemplo: `Vegano;Fit`

---

## Consejos para las Imágenes

1. **Nombres de archivo**: Usa nombres descriptivos y sin espacios
   - ✅ Correcto: `boneless12.jpeg`, `orangeChicken.jpeg`
   - ❌ Incorrecto: `Foto 1.jpeg`, `IMG_2023.jpeg`

2. **Formato**: JPEG o PNG

3. **Tamaño**: Mínimo 800x600 px, preferible 1200x900 px

4. **Calidad**: Fotos claras, bien iluminadas, sobre fondo neutro

5. **Combos**: Si el producto tiene combo, toma una foto que muestre el plato con los extras (papas, bebida, etc.)

---

## Preguntas Frecuentes

**P: ¿Qué hago si un producto tiene múltiples tamaños?**
R: Crea una fila por cada tamaño. Usa el mismo nombre en "Producto" pero diferente "Tamaño".

**P: ¿Qué es la comisión de FoodLab?**
R: Es el 7% del precio de venta que FoodLabs cobra por usar la plataforma. Se calcula automáticamente.

**P: ¿Puedo ofrecer combos en algunos tamaños y en otros no?**
R: Sí. Cada fila (tamaño) puede tener su propia configuración de combo.

**P: ¿Cómo subo las imágenes?**
R: Primero llena la plantilla con los nombres de las imágenes. Luego te enviaremos un link para subir las fotos.

**P: ¿Qué incluye un combo típicamente?**
R: Los combos generalmente incluyen papas fritas y/o bebida. Especifica qué incluye en la descripción del producto.

**P: ¿Qué son los labels?**
R: Los labels son etiquetas que ayudan a los clientes a filtrar productos según sus preferencias dietarias:
- **Vegano**: No contiene productos de origen animal
- **Vegetariano**: No contiene carne ni pescado
- **Pescaradiano**: No contiene carne, pero sí pescado
- **Fit**: Opción saludable/baja en calorías

**P: ¿Un producto puede tener múltiples labels?**
R: Sí. Por ejemplo, una limonada natural puede ser "Vegano;Fit". Separa con punto y coma (;).

---

## Contacto

Si tienes preguntas sobre cómo llenar la plantilla, contacta a FoodLabs:
- Email: [contacto@foodlabs.hn]
- WhatsApp: [+504 XXXX-XXXX]

---

**Última actualización**: Octubre 2025

