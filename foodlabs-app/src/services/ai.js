// Servicio de AI para sugerir descripciones de productos
// Soporta OpenAI y Anthropic Claude

// Configuración de OpenAI
const openaiConfig = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  model: "gpt-3.5-turbo",
  maxTokens: 100,
  temperature: 0.7
}

// Configuración de Anthropic Claude (no instalado por ahora)
const anthropicConfig = {
  apiKey: null, // import.meta.env.VITE_ANTHROPIC_API_KEY,
  model: "claude-3-haiku-20240307",
  maxTokens: 100
}

// Función principal para sugerir descripción
export const suggestProductDescription = async (productName, category, comercioType) => {
  try {
    // Intentar con OpenAI primero
    if (openaiConfig.apiKey) {
      return await suggestWithOpenAI(productName, category, comercioType)
    }
    
    // Fallback: generar descripción simple sin AI
    return generateSimpleDescription(productName, category, comercioType)
    
  } catch (error) {
    console.error('Error generating description:', error)
    // Fallback: generar descripción simple sin AI
    return generateSimpleDescription(productName, category, comercioType)
  }
}

  // Función fallback para generar descripción simple sin AI
  const generateSimpleDescription = (productName, category, comercioType) => {
    if (comercioType === 'restaurant') {
      return `Delicioso ${productName}${category && category !== 'general' ? ` de la categoría ${category}` : ''}. Preparado con ingredientes frescos y de calidad.`
    } else {
      return `Excelente ${productName}${category && category !== 'general' ? ` de la categoría ${category}` : ''}. Producto de alta calidad con garantía.`
    }
  }

// Función para generar descripción con OpenAI
const suggestWithOpenAI = async (productName, category, comercioType) => {
  const prompt = comercioType === 'restaurant' 
    ? `Genera una descripción atractiva y breve (máximo 2-3 líneas) para un platillo de restaurante llamado "${productName}"${category && category !== 'general' ? ` de la categoría "${category}"` : ''}. Debe ser apetitosa y destacar ingredientes o características especiales.`
    : `Genera una descripción atractiva y breve (máximo 2-3 líneas) para un producto de tienda llamado "${productName}"${category && category !== 'general' ? ` de la categoría "${category}"` : ''}. Debe destacar características, beneficios y calidad del producto.`
  
  // Crear cliente OpenAI
  const OpenAI = (await import('openai')).default
  const openai = new OpenAI({
    apiKey: openaiConfig.apiKey,
    dangerouslyAllowBrowser: true // Solo para desarrollo
  })
  
  const response = await openai.chat.completions.create({
    model: openaiConfig.model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: openaiConfig.maxTokens,
    temperature: openaiConfig.temperature
  })
  
  return response.choices[0].message.content.trim()
}

// Función para generar descripción con Anthropic Claude (comentada por ahora)
/*
const suggestWithAnthropic = async (productName, category, comercioType) => {
  const prompt = comercioType === 'restaurant' 
    ? `Genera una descripción atractiva y breve (máximo 2-3 líneas) para un platillo de restaurante llamado "${productName}" de la categoría "${category}". Debe ser apetitosa y destacar ingredientes o características especiales.`
    : `Genera una descripción atractiva y breve (máximo 2-3 líneas) para un producto de tienda llamado "${productName}" de la categoría "${category}". Debe destacar características, beneficios y calidad del producto.`
  
  // Crear cliente Anthropic
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const anthropic = new Anthropic({
    apiKey: anthropicConfig.apiKey
  })
  
  const response = await anthropic.messages.create({
    model: anthropicConfig.model,
    max_tokens: anthropicConfig.maxTokens,
    messages: [{ role: "user", content: prompt }]
  })
  
  return response.content[0].text.trim()
}
*/

// Función para verificar si hay servicios de AI configurados
export const isAIConfigured = () => {
  return true // Siempre disponible con fallback
}

// Función para obtener el nombre del servicio configurado
export const getConfiguredService = () => {
  if (openaiConfig.apiKey) return 'OpenAI'
  return 'Fallback'
}
