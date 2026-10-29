import './LoadingScreen.css'
import LoadingParchment from './LoadingParchment'

function LoadingScreen({ message = 'Chargement...' }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 fade-in"
      style={{
        backgroundImage: 'url(https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/village.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <LoadingParchment message={message} />
      </div>
    </div>
  )
}

export default LoadingScreen
