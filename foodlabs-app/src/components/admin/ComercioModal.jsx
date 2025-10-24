import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Store, Utensils, MapPin, Phone, Mail, Clock, Edit, RotateCcw } from 'lucide-react'
import ImageUploader from './ImageUploader'
import { createUserWithRole } from '../../services/auth'
import { useAppStore } from '../../stores/useAppStore'

const ComercioModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  comercio = null, 
  isLoading = false 
}) => {
  // Hook del store para obtener las ubicaciones
  const store = useAppStore()
  const LOCATIONS = store.LOCATIONS || {}
  
  // Obtener opciones de países y ciudades del sistema
  const getLocationOptions = () => {
    const countries = Object.entries(LOCATIONS).map(([key, value]) => ({
      value: key,
      label: `${value.flag} ${value.name}`
    }))
    
    const cities = Object.entries(LOCATIONS).reduce((acc, [countryKey, countryData]) => {
      acc[countryKey] = countryData.cities.map(city => ({
        value: city.code,
        label: city.name
      }))
      return acc
    }, {})
    
    return { countries, cities }
  }
  
  const { countries, cities } = getLocationOptions()
  
  // Función para manejar cambio de país
  const handleCountryChange = (countryKey) => {
    const countryData = LOCATIONS[countryKey]
    if (countryData && countryData.cities.length > 0) {
      const firstCity = countryData.cities[0]
      setFormData(prev => ({
        ...prev,
        location: {
          country: countryKey,
          countryName: countryData.name,
          city: firstCity.code,
          cityName: firstCity.name
        }
      }))
    }
  }
  
  // Función para manejar cambio de ciudad
  const handleCityChange = (cityCode) => {
    const currentCountry = formData.location.country
    const countryData = LOCATIONS[currentCountry]
    const city = countryData.cities.find(c => c.code === cityCode)
    
    if (city) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          city: cityCode,
          cityName: city.name
        }
      }))
    }
  }
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'restaurante',
    categoria: '',
    tier: 'local',
    direccion: {
      calle: '',
      ciudad: '',
      codigoPostal: '',
      coordenadas: { lat: 0, lng: 0 },
      zona: ''
    },
    location: {
      country: 'honduras',
      countryName: 'Honduras',
      city: 'TGU',
      cityName: 'Tegucigalpa'
    },
    contacto: {
      telefono: '',
      whatsapp: '',
      email: '',
      sitioWeb: ''
    },
    horarios: {
      lunes: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
      martes: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
      miercoles: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
      jueves: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
      viernes: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
      sabado: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
      domingo: { abierto: '08:00', cerrado: '22:00', estaAbierto: true }
    },
    configuracion: {
      radioEntrega: 5,
      pedidoMinimo: 0,
      costoEntrega: 0,
      tiempoEstimado: 30,
      metodosPago: ['efectivo'],
      comision: 10,
      logo: '',
      imagen: '',
      descripcion: ''
    }
  })

  // Estados para email y password del usuario
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [isEditingCredentials, setIsEditingCredentials] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const [editingEmail, setEditingEmail] = useState('')

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [tempCredentials, setTempCredentials] = useState(null)

  // Función para cargar datos del usuario cuando está en modo edición
  const loadUserData = async (comercioId) => {
    if (!comercioId) return
    
    setIsLoadingUser(true)
    try {
      // Importar el servicio de usuarios
      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const { db } = await import('../../config/firebase')
      
      // Buscar el usuario por comercioId
      const usersQuery = query(
        collection(db, 'users'),
        where('comercioId', '==', comercioId)
      )
      
      const usersSnapshot = await getDocs(usersQuery)
      
      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0]
        const userData = userDoc.data()
        
        setUserEmail(userData.email || '')
        setUserPassword('••••••••') // Mostrar asteriscos para la contraseña
        console.log('✅ Usuario cargado:', userData.email)
      } else {
        console.log('⚠️ No se encontró usuario para el comercio:', comercioId)
        setUserEmail('')
        setUserPassword('')
      }
    } catch (error) {
      console.error('❌ Error cargando usuario:', error)
      setUserEmail('')
      setUserPassword('')
    } finally {
      setIsLoadingUser(false)
    }
  }

  // Función para regenerar contraseña
  const handleRegeneratePassword = async () => {
    if (!comercio?.id) return
    
    try {
      setIsLoadingUser(true)
      
      // Importar el servicio de auth
      const { regeneratePassword } = await import('../../services/auth')
      
      // Regenerar contraseña
      const result = await regeneratePassword(userEmail)
      
      if (result.success) {
        setUserPassword(result.tempPassword)
        setIsEditingCredentials(false)
        alert('Nueva contraseña generada: ' + result.tempPassword)
      } else {
        alert('Error al regenerar contraseña: ' + result.error)
      }
    } catch (error) {
      console.error('Error regenerating password:', error)
      alert('Error al regenerar contraseña: ' + error.message)
    } finally {
      setIsLoadingUser(false)
    }
  }

  // Función para iniciar edición del email
  const handleEditEmail = () => {
    setIsEditingCredentials(true)
    setEditingEmail(userEmail)
  }

  // Función para guardar email editado
  const handleSaveEmail = async () => {
    if (!comercio?.id) return
    try {
      setIsLoadingUser(true)
      
      // Actualizar email si cambió
      if (editingEmail !== userEmail) {
        // Actualizar en Firestore
        const { collection, query, where, getDocs, updateDoc } = await import('firebase/firestore')
        const { db } = await import('../../config/firebase')
        const usersQuery = query(
          collection(db, 'users'),
          where('comercioId', '==', comercio.id)
        )
        const usersSnapshot = await getDocs(usersQuery)
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0]
          await updateDoc(userDoc.ref, {
            email: editingEmail
          })
          setUserEmail(editingEmail)
        }
      }
      
      setIsEditingCredentials(false)
      alert('✅ Email actualizado correctamente')
      
    } catch (error) {
      console.error('Error updating email:', error)
      alert('Error al actualizar email: ' + error.message)
    } finally {
      setIsLoadingUser(false)
    }
  }

  // Función para cancelar edición del email
  const handleCancelEditEmail = () => {
    setIsEditingCredentials(false)
    setEditingEmail('')
  }

  // Opciones para dropdowns
  const tipoOptions = [
    { value: 'restaurante', label: 'Restaurante', icon: Utensils },
    { value: 'tienda', label: 'Tienda', icon: Store }
  ]

  const categoriaOptions = {
    restaurante: [
      'Comida Rápida',
      'Restaurante',
      'Cafetería',
      'Bar',
      'Pizzería',
      'Asiática',
      'Mexicana',
      'Italiana',
      'Americana'
    ],
    tienda: [
      'Deportes',
      'Electrónicos',
      'Ropa',
      'Hogar',
      'Farmacia',
      'Supermercado',
      'Conveniencia',
      'Ferretería'
    ]
  }

  const tierOptions = [
    { value: 'local', label: 'Local' },
    { value: 'premium', label: 'Premium' },
    { value: 'enterprise', label: 'Enterprise' }
  ]

  const metodosPagoOptions = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'qr', label: 'QR' }
  ]

  // Cargar datos del comercio si está editando
  useEffect(() => {
    if (comercio) {
      setFormData({
        nombre: comercio.nombre || '',
        tipo: comercio.tipo || 'restaurante',
        categoria: comercio.categoria || '',
        tier: comercio.tier || 'local',
        direccion: comercio.direccion || formData.direccion,
        location: comercio.location || {
          country: 'honduras',
          countryName: 'Honduras',
          city: 'TGU',
          cityName: 'Tegucigalpa'
        },
        contacto: comercio.contacto || formData.contacto,
        horarios: comercio.horarios || formData.horarios,
        configuracion: comercio.configuracion || formData.configuracion
      })
      
      // Cargar datos del usuario
      loadUserData(comercio.id)
    } else {
      // Reset form for new comercio
      setFormData({
        nombre: '',
        tipo: 'restaurante',
        categoria: '',
        tier: 'local',
        direccion: {
          calle: '',
          ciudad: '',
          codigoPostal: '',
          coordenadas: { lat: 0, lng: 0 },
          zona: ''
        },
        contacto: {
          telefono: '',
          whatsapp: '',
          email: '',
          sitioWeb: ''
        },
        horarios: {
          lunes: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
          martes: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
          miercoles: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
          jueves: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
          viernes: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
          sabado: { abierto: '08:00', cerrado: '22:00', estaAbierto: true },
          domingo: { abierto: '08:00', cerrado: '22:00', estaAbierto: true }
        },
        configuracion: {
          radioEntrega: 5,
          pedidoMinimo: 0,
          costoEntrega: 0,
          tiempoEstimado: 30,
          metodosPago: ['efectivo'],
          comision: 10,
          logo: '',
          imagen: '',
          descripcion: ''
        }
      })
    }
    setErrors({})
  }, [comercio, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleHorarioChange = (dia, field, value) => {
    setFormData(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          [field]: value
        }
      }
    }))
  }

  const handleMetodoPagoToggle = (metodo) => {
    setFormData(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        metodosPago: prev.configuracion.metodosPago.includes(metodo)
          ? prev.configuracion.metodosPago.filter(m => m !== metodo)
          : [...prev.configuracion.metodosPago, metodo]
      }
    }))
  }

  const handleImageUploaded = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        logo: imageUrl
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida'
    }

    if (!formData.direccion.calle.trim()) {
      newErrors.direccion = 'La dirección es requerida'
    }

    if (!formData.direccion.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida'
    }

    if (!formData.contacto.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    }

    if (!formData.location || !formData.location.city) {
      newErrors.location = 'La ubicación es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Crear el comercio en Firestore
      const comercioData = {
        ...formData,
        ownerId: 'admin', // TODO: Get from auth context
        estado: 'pendiente'
      }

      console.log('🔍 ComercioModal - Llamando onSave...')
      const comercioId = await onSave(comercioData)
      console.log('🔍 ComercioModal - Resultado de onSave:', comercioId)
      
      // Verificar que se obtuvo un ID válido
      if (!comercioId) {
        console.error('❌ ComercioModal - No se recibió comercioId:', comercioId)
        throw new Error('No se pudo crear el comercio. Intenta de nuevo.')
      }
      
      // Solo crear usuario si estamos en modo creación (no edición)
      if (!comercio) {
        console.log('🔍 ComercioModal - Modo creación, creando usuario...')
        
        // 2. Generar email automático y contraseña temporal
        const autoEmail = `${comercioId.toLowerCase().replace(/\s+/g, '')}@foodlab.store`
        
        const userResult = await createUserWithRole({
          email: autoEmail,
          role: 'business',
          displayName: formData.nombre,
          comercioId: comercioId,
          country: formData.direccion.ciudad,
          region: formData.direccion.ciudad,
          generateTempPassword: true
        })
        
        if (!userResult.success) {
          throw new Error('Comercio creado pero error al crear usuario: ' + userResult.error)
        }
        
        // 3. Mostrar credenciales temporales
        setTempCredentials({
          email: autoEmail,
          password: userResult.tempPassword,
          comercioId: comercioId
        })
        setShowCredentials(true)
      } else {
        console.log('🔍 ComercioModal - Modo edición, no se crea usuario')
      }
      
    } catch (error) {
      console.error('Error saving comercio:', error)
      alert('Error al guardar el comercio: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: window.innerWidth < 768 ? '10px' : '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: window.innerWidth < 768 ? '100%' : '900px',
        maxHeight: window.innerWidth < 768 ? '95vh' : '90vh',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: 0,
            color: '#111827'
          }}>
            {comercio ? 'Editar Comercio' : 'Nuevo Comercio'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: window.innerWidth < 768 ? '16px' : '24px' 
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Información básica */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Información Básica
              </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px' 
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Nombre del Comercio *
                </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.nombre ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ej: FoodLab TGU"
                  />
                  {errors.nombre && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.nombre}</p>}
                </div>

                {/* Credenciales del Usuario - Solo en modo edición */}
                {comercio && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                      📧 Credenciales del Usuario
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                          Email del Usuario
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="email"
                            value={isEditingCredentials ? editingEmail : userEmail}
                            readOnly={!isEditingCredentials}
                            onChange={isEditingCredentials ? (e) => setEditingEmail(e.target.value) : undefined}
                            style={{
                              flex: 1,
                              padding: '12px',
                              border: `1px solid ${isEditingCredentials ? '#3b82f6' : '#d1d5db'}`,
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: isEditingCredentials ? 'white' : '#f9fafb',
                              color: isEditingCredentials ? '#111827' : '#6b7280',
                              cursor: isEditingCredentials ? 'text' : 'default'
                            }}
                            placeholder={isLoadingUser ? 'Cargando...' : 'No hay usuario asociado'}
                          />
                          <button
                            type="button"
                            onClick={isEditingCredentials ? handleSaveEmail : handleEditEmail}
                            disabled={isLoadingUser || !userEmail}
                            style={{
                              padding: '12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              backgroundColor: 'white',
                              cursor: isLoadingUser || !userEmail ? 'not-allowed' : 'pointer',
                              color: isLoadingUser || !userEmail ? '#9ca3af' : '#3b82f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title={isEditingCredentials ? 'Guardar email' : 'Editar email'}
                          >
                            <Edit size={16} />
                          </button>
                          {isEditingCredentials && (
                            <button
                              type="button"
                              onClick={handleCancelEditEmail}
                              style={{
                                padding: '12px',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Cancelar edición"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                    
                    <div style={{ marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={handleRegeneratePassword}
                        disabled={isLoadingUser || !userEmail}
                        style={{
                          padding: '10px 16px',
                          border: '1px solid #10b981',
                          borderRadius: '6px',
                          backgroundColor: 'white',
                          cursor: isLoadingUser || !userEmail ? 'not-allowed' : 'pointer',
                          color: isLoadingUser || !userEmail ? '#9ca3af' : '#10b981',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        title="Generar nueva contraseña temporal"
                      >
                        <RotateCcw size={16} />
                        Generar nueva contraseña
                      </button>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                        💡 La contraseña se generará automáticamente y se mostrará en pantalla para que puedas copiarla y enviarla al comercio.
                      </p>
                    </div>
                    
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                      💡 Haz clic en el ícono de editar para modificar el email. Usa "Generar nueva contraseña" para crear una contraseña temporal.
                    </p>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Tipo de Comercio *
                  </label>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                    gap: '12px' 
                  }}>
                    {tipoOptions.map(option => {
                      const Icon = option.icon
                      return (
                        <label key={option.value} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          cursor: 'pointer',
                          padding: window.innerWidth < 768 ? '8px' : '0',
                          backgroundColor: window.innerWidth < 768 ? '#f9fafb' : 'transparent',
                          borderRadius: window.innerWidth < 768 ? '8px' : '0',
                          border: window.innerWidth < 768 ? '1px solid #e5e7eb' : 'none'
                        }}>
                          <input
                            type="radio"
                            name="tipo"
                            value={option.value}
                            checked={formData.tipo === option.value}
                            onChange={(e) => handleInputChange('tipo', e.target.value)}
                          />
                          <Icon size={16} />
                          <span>{option.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '16px', 
                marginTop: '16px' 
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Categoría *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.categoria ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categoriaOptions[formData.tipo]?.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                  {errors.categoria && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.categoria}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => handleInputChange('tier', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {tierOptions.map(tier => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                📍 Ubicación del Comercio
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '16px' 
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.direccion.calle}
                    onChange={(e) => handleNestedInputChange('direccion', 'calle', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.direccion ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Calle, número, colonia"
                  />
                  {errors.direccion && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.direccion}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    País *
                  </label>
                  <select
                    value={formData.location?.country || 'honduras'}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.country ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {countries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  {errors.country && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.country}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Ciudad *
                  </label>
                  <select
                    value={formData.location?.city || 'TGU'}
                    onChange={(e) => handleCityChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.city ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {cities[formData.location?.country || 'honduras']?.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.city}</p>}
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Información de Contacto
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '16px' 
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.contacto.telefono}
                    onChange={(e) => handleNestedInputChange('contacto', 'telefono', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.telefono ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="+504 9999-9999"
                  />
                  {errors.telefono && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.telefono}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contacto.email}
                    onChange={(e) => handleNestedInputChange('contacto', 'email', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="contacto@comercio.com"
                  />
                  {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Logo */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Logo del Comercio
              </h3>
              
              {!comercio ? (
                // Modo creación: mostrar mensaje informativo
                <div style={{
                  padding: '20px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#1e40af', fontSize: '14px', margin: 0 }}>
                    💡 Podrás agregar el logo después de crear el comercio
                  </p>
                </div>
              ) : (
                // Modo edición: mostrar ImageUploader normal
                <ImageUploader
                  onImageUploaded={handleImageUploaded}
                  currentImage={formData.configuracion.logo}
                  comercioId={comercio.id}
                  type="logo"
                  label="Logo del comercio"
                  required={false}
                />
              )}
            </div>

            {/* Configuración básica */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Configuración de Delivery
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px' 
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Radio de Entrega (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.configuracion.radioEntrega || ''}
                    onChange={(e) => handleNestedInputChange('configuracion', 'radioEntrega', parseInt(e.target.value) || 5)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Pedido Mínimo (L)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.configuracion.pedidoMinimo || ''}
                    onChange={(e) => handleNestedInputChange('configuracion', 'pedidoMinimo', parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Tiempo Estimado (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formData.configuracion.tiempoEstimado || ''}
                    onChange={(e) => handleNestedInputChange('configuracion', 'tiempoEstimado', parseInt(e.target.value) || 30)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Métodos de pago */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Métodos de Pago
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {metodosPagoOptions.map(metodo => (
                  <label key={metodo.value} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: `1px solid ${formData.configuracion.metodosPago.includes(metodo.value) ? '#3b82f6' : '#d1d5db'}`,
                    borderRadius: '8px',
                    backgroundColor: formData.configuracion.metodosPago.includes(metodo.value) ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.configuracion.metodosPago.includes(metodo.value)}
                      onChange={() => handleMetodoPagoToggle(metodo.value)}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{metodo.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : (comercio ? 'Actualizar' : 'Crear Comercio')}
          </button>
        </div>
      </div>

      {/* Modal de credenciales temporales */}
      {showCredentials && tempCredentials && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0,
                  color: '#111827'
                }}>
                  🎉 Comercio Creado Exitosamente
                </h2>
                <button
                  onClick={() => {
                    setShowCredentials(false)
                    setTempCredentials(null)
                    onClose()
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#6b7280',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0
              }}>
                Guarda estas credenciales para compartirlas con el comercio. Deberán cambiar la contraseña en el primer login.
              </p>
            </div>

            <div style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 12px 0'
                }}>
                  📧 Email del Comercio
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <code style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#0f172a'
                  }}>
                    {tempCredentials.email}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(tempCredentials.email)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #f59e0b'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#92400e',
                  margin: '0 0 12px 0'
                }}>
                  🔑 Contraseña Temporal
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <code style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    border: '1px solid #f59e0b',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#92400e'
                  }}>
                    {tempCredentials.password}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(tempCredentials.password)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#ecfdf5',
                borderRadius: '8px',
                border: '1px solid #10b981'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#065f46',
                  margin: '0 0 8px 0'
                }}>
                  🚨 Importante
                </h3>
                <ul style={{
                  color: '#047857',
                  fontSize: '13px',
                  margin: 0,
                  paddingLeft: '16px'
                }}>
                  <li>El comercio debe cambiar esta contraseña en el primer login</li>
                  <li>Puede acceder en: <strong>foodlab.store/comercio/login</strong></li>
                  <li>Guarda estas credenciales de forma segura</li>
                </ul>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowCredentials(false)
                    setTempCredentials(null)
                    onClose()
                  }}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:bg-green-700"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComercioModal
