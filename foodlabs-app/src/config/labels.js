export const DIETARY_LABELS = [
  { id: 'vegano', name: 'Vegano', icon: '🌱', color: '#10b981' },
  { id: 'vegetariano', name: 'Vegetariano', icon: '🥗', color: '#84cc16' },
  { id: 'sin-gluten', name: 'Sin Gluten', icon: '🌾', color: '#f59e0b' },
  { id: 'sin-lactosa', name: 'Sin Lactosa', icon: '🥛', color: '#3b82f6' },
  { id: 'organico', name: 'Orgánico', icon: '🍃', color: '#22c55e' },
  { id: 'keto', name: 'Keto', icon: '🥑', color: '#8b5cf6' },
  { id: 'bajo-calorias', name: 'Bajo en Calorías', icon: '⚡', color: '#ec4899' },
  { id: 'sin-azucar', name: 'Sin Azúcar', icon: '🚫🍯', color: '#ef4444' },
  { id: 'proteinico', name: 'Proteico', icon: '💪', color: '#f97316' },
  { id: 'fresco', name: 'Fresco', icon: '🥬', color: '#06b6d4' }
]

export const getLabelById = (id) => {
  return DIETARY_LABELS.find(label => label.id === id)
}

export const getLabelsByIds = (ids) => {
  return DIETARY_LABELS.filter(label => ids.includes(label.id))
}
