// Script para generar slugs para comercios existentes
import { db } from '../src/config/firebase.js'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

const COMERCIOS_COLLECTION = 'comercios'

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '') // Remove leading/trailing -
}

// Check if slug is available for a business type
const isSlugAvailable = async (slug, tipo, excludeId = null, existingSlugs = []) => {
  // Check against existing slugs in memory first
  const conflict = existingSlugs.find(s => s.slug === slug && s.tipo === tipo && s.id !== excludeId)
  if (conflict) return false
  
  return true // For now, assume available since we're generating all at once
}

// Generate unique slug
const generateUniqueSlug = async (name, tipo, location = null, excludeId = null, existingSlugs = []) => {
  let baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1
  
  // Try base slug
  if (await isSlugAvailable(slug, tipo, excludeId, existingSlugs)) {
    return slug
  }
  
  // Try with location suffix
  if (location?.city) {
    const citySlug = generateSlug(location.city)
    slug = `${baseSlug}-${citySlug}`
    if (await isSlugAvailable(slug, tipo, excludeId, existingSlugs)) {
      return slug
    }
  }
  
  // Try with numbers
  while (counter < 100) {
    slug = `${baseSlug}${counter}`
    if (await isSlugAvailable(slug, tipo, excludeId, existingSlugs)) {
      return slug
    }
    counter++
  }
  
  // Fallback to ID-based slug
  return `${baseSlug}-${Date.now()}`
}

const generateSlugsForComercios = async () => {
  try {
    console.log('🔍 Fetching all comercios...')
    const querySnapshot = await getDocs(collection(db, COMERCIOS_COLLECTION))
    
    const comercios = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }))
    
    console.log(`📊 Found ${comercios.length} comercios`)
    
    // First pass: generate all slugs and track them
    const slugsToUpdate = []
    const existingSlugs = []
    
    for (const comercio of comercios) {
      if (!comercio.slug) {
        const slug = await generateUniqueSlug(
          comercio.nombre, 
          comercio.tipo, 
          comercio.location,
          comercio.id,
          existingSlugs
        )
        
        slugsToUpdate.push({ id: comercio.id, slug })
        existingSlugs.push({ id: comercio.id, slug, tipo: comercio.tipo })
        
        console.log(`✅ Generated slug "${slug}" for ${comercio.nombre} (${comercio.tipo})`)
      } else {
        console.log(`⏭️ Skipping ${comercio.nombre} - already has slug: ${comercio.slug}`)
        existingSlugs.push({ id: comercio.id, slug: comercio.slug, tipo: comercio.tipo })
      }
    }
    
    // Second pass: update all comercios with their new slugs
    console.log(`\n🔄 Updating ${slugsToUpdate.length} comercios with slugs...`)
    
    for (const { id, slug } of slugsToUpdate) {
      const comercioRef = doc(db, COMERCIOS_COLLECTION, id)
      await updateDoc(comercioRef, { slug })
      console.log(`✅ Updated comercio ${id} with slug: ${slug}`)
    }
    
    console.log(`\n🎉 Successfully generated slugs for ${slugsToUpdate.length} comercios!`)
    
  } catch (error) {
    console.error('❌ Error generating slugs:', error)
  }
}

// Run the script
generateSlugsForComercios()
