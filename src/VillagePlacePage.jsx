import './AccountPage.css'

function VillagePlacePage({ user, onBack, onOpenRegistry, onOpenFeed }) {

  return (
    <div 
      className="h-screen overflow-hidden relative fade-in"
      style={{
        backgroundImage: 'url(https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/village.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/10 z-0"></div>
      <div className="relative z-10">
      {/* Top Navigation - Matching My Account style */}
        <div className="sticky top-0 z-50 glass-card border-b border-white/30" style={{ paddingTop: '0px', paddingBottom: '0px' }}>
          <div className="flex items-center gap-4" style={{ paddingLeft: '65px', paddingRight: '65px' }}>
          {/* Archivus Character */}
          <div className="flex items-center gap-0 relative z-40 flex-1">
            <div className="flex-shrink-0 flex flex-col items-center overflow-hidden" style={{ height: '130px' }}>
              <img
                src="https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/archivus-perso.png"
                alt="Archivus"
                className="object-cover"
                style={{
                  width: '130px',
                  height: '130px',
                  objectPosition: 'center top',
                }}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            <div 
              className="relative glass-card px-4 py-1 rounded-2xl -ml-4"
              style={{
                background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                border: '2px solid rgba(139, 115, 85, 0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                width: 'fit-content',
                maxWidth: '100%',
              }}
            >
              {/* Speech bubble tail */}
              <div 
                className="absolute left-0 top-3 -ml-2 w-4 h-4 transform rotate-45"
                style={{
                  background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                  borderLeft: '2px solid rgba(139, 115, 85, 0.3)',
                  borderBottom: '2px solid rgba(139, 115, 85, 0.3)',
                }}
              ></div>
                <p
                  className="text-base md:text-lg font-medium relative z-10"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#4b4136',
                    fontStyle: 'italic',
                    lineHeight: '1.3',
                  }}
                >
                  Archivus : Bienvenue sur la place du village !<br />Ici, tous les aventuriers partagent leurs exploits.
                </p>
            </div>
          </div>
          
          <button
            onClick={onBack}
            className="nav-button px-6 py-2.5 rounded-2xl flex-shrink-0 ml-auto"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
            }}
          >
            Vers ton campement 🏕️ →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Affichoir and Grand Registre - Symmetric Layout */}
        <div className="relative w-full h-full">
          {/* Affichoir - Left Side */}
          <div
            className="relative cursor-pointer group transition-all duration-300 hover:scale-102"
            onClick={() => onOpenFeed && onOpenFeed()}
            style={{
              position: 'absolute',
              left: 'calc(15% - 20px)',
              top: '350px',
              width: '550px',
              zIndex: 2,
            }}
          >
            <img
              src="https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/affichoir.png"
              alt="Affichoir"
              className="relative z-10 w-full h-auto drop-shadow-2xl transition-all duration-300 group-hover:drop-shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
              style={{
                filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))',
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x600?text=Affichoir'
              }}
            />
          </div>

          {/* Grand Registre - Right Side (Symmetric) */}
          <div
            className="relative cursor-pointer group transition-all duration-300 hover:scale-102"
            onClick={() => onOpenRegistry && onOpenRegistry()}
            style={{
              position: 'absolute',
              right: 'calc(15% - 20px)',
              top: '350px',
              width: '550px',
              zIndex: 2,
            }}
          >
            <img
              src="https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/grand-registre.png"
              alt="Grand Registre"
              className="relative z-10 w-full h-auto drop-shadow-2xl transition-all duration-300 group-hover:drop-shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
              style={{
                filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))',
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x600?text=Grand+Registre'
              }}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default VillagePlacePage
