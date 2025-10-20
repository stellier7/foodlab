import { useState } from 'react'
import { MapPin, X } from 'lucide-react'

const LocationSelector = ({ isOpen, onConfirm, onClose }) => {
  const [selectedCountry, setSelectedCountry] = useState('Honduras')
  const [selectedCity, setSelectedCity] = useState('Tegucigalpa')

  const countries = [
    { value: 'Honduras', label: 'Honduras' }
  ]

  const cities = {
    'Honduras': [
      { value: 'Tegucigalpa', label: 'Tegucigalpa' },
      { value: 'San Pedro Sula', label: 'San Pedro Sula' }
    ]
  }

  const handleConfirm = () => {
    onConfirm(selectedCountry, selectedCity)
  }

  if (!isOpen) return null

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="slide-in-bottom"
        style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="tap-effect"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: '#f3f4f6',
            color: '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
            }}
          >
            <MapPin size={32} style={{ color: 'white' }} strokeWidth={2.5} />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}
          >
            Selecciona tu ubicación
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Esto nos ayudará a mostrarte la información correcta
          </p>
        </div>

        {/* Country Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}
          >
            País:
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value)
              setSelectedCity(cities[e.target.value][0].value)
            }}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              backgroundColor: 'white',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          >
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        {/* City Selector */}
        <div style={{ marginBottom: '28px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}
          >
            Ciudad:
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              backgroundColor: 'white',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          >
            {cities[selectedCountry].map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className="btn-primary ripple"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <MapPin size={20} strokeWidth={2.5} />
          Confirmar Ubicación
        </button>

        {/* Skip Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '12px',
            border: 'none',
            background: 'transparent',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => (e.target.style.color = '#111827')}
          onMouseLeave={(e) => (e.target.style.color = '#6b7280')}
        >
          Ahora no
        </button>
      </div>
    </div>
  )
}

export default LocationSelector

