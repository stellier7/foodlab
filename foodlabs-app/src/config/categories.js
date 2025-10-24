export const CATEGORIES = {
  restaurant: [
    { value: 'entradas', label: 'Entradas' },
    { value: 'platos-fuertes', label: 'Platos Fuertes' },
    { value: 'postres', label: 'Postres' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'combos', label: 'Combos' }
  ],
  shop: [
    { value: 'accesorios', label: 'Accesorios' },
    { value: 'ropa', label: 'Ropa' },
    { value: 'equipamiento', label: 'Equipamiento' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'otros', label: 'Otros' },
    { value: 'general', label: 'General' }
  ]
}

// Función helper para obtener categorías por tipo
export const getCategoriesByType = (comercioType) => {
  return CATEGORIES[comercioType] || CATEGORIES.restaurant
}

// Función helper para obtener la etiqueta de una categoría
export const getCategoryLabel = (value, comercioType) => {
  const categories = getCategoriesByType(comercioType)
  const category = categories.find(cat => cat.value === value)
  return category?.label || value
}
