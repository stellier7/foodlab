import { Dumbbell, Heart, Calendar, Users } from 'lucide-react'

const FitLabsPage = () => {
  return (
    <main style={{ paddingBottom: '80px' }}>
      {/* Coming Soon Section */}
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div className="card fade-in stagger-2" style={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '32px 24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginTop: '24px'
          }}>
            <div className="card fade-in stagger-3 tap-effect" style={{ 
              padding: '20px', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Dumbbell size={36} style={{ margin: '0 auto 12px', color: '#10b981', strokeWidth: 2 }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: '#111827' }}>Gimnasios</h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Encuentra tu gym perfecto</p>
            </div>
            
            <div className="card fade-in stagger-4 tap-effect" style={{ 
              padding: '20px', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Calendar size={36} style={{ margin: '0 auto 12px', color: '#10b981', strokeWidth: 2 }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: '#111827' }}>Clases</h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Yoga, pilates, y más</p>
            </div>
            
            <div className="card fade-in stagger-5 tap-effect" style={{ 
              padding: '20px', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Users size={36} style={{ margin: '0 auto 12px', color: '#10b981', strokeWidth: 2 }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: '#111827' }}>Entrenadores</h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Sesiones personales</p>
            </div>
            
            <div className="card fade-in stagger-6 tap-effect" style={{ 
              padding: '20px', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Heart size={36} style={{ margin: '0 auto 12px', color: '#10b981', strokeWidth: 2 }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: '#111827' }}>Bienestar</h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Planes nutricionales</p>
            </div>
          </div>

          <div className="glass fade-in stagger-6" style={{ 
            marginTop: '32px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <p style={{ 
              color: '#15803d', 
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🚀</span>
              Estamos trabajando en traerte las mejores opciones de fitness
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default FitLabsPage

