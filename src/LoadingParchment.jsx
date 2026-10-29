import './LoadingScreen.css'

function LoadingParchment({ message = 'Chargement...' }) {
  return (
    <div
      className="parchment-container"
      style={{
        background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
        border: '2px solid rgba(139, 115, 85, 0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        borderRadius: '24px',
        padding: '24px 32px',
        position: 'relative',
        minWidth: '300px',
      }}
    >
      {/* Effet de brillance animé */}
      <div className="parchment-shine"></div>

      <p
        className="text-xl md:text-2xl font-semibold text-center relative z-10"
        style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#4b4136',
        }}
      >
        {message}
      </p>

      {/* Points de chargement animés */}
      <div className="loading-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  )
}

export default LoadingParchment
