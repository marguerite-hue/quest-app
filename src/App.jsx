import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import AccountPage from './AccountPage'
import VillagePlacePage from './VillagePlacePage'
import UserRegistryPage from './UserRegistryPage'
import FeedPage from './FeedPage'
import LoadingScreen from './LoadingScreen'
import './App.css'
import './LoadingScreen.css'

const CATEGORIES = {
  fitness: { emoji: '💪', color: 'bg-red-400', border: 'border-red-600' },
  social: { emoji: '🎉', color: 'bg-pink-400', border: 'border-pink-600' },
  creative: { emoji: '🎨', color: 'bg-purple-400', border: 'border-purple-600' },
  learning: { emoji: '📚', color: 'bg-blue-400', border: 'border-blue-600' },
  wellness: { emoji: '🧘', color: 'bg-green-400', border: 'border-green-600' },
}

const XP_OPTIONS = [10, 25, 50, 100]
const TIMELINE_OPTIONS = ['today', 'this week', 'this month']

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    if (isSignUp && !username.trim()) {
      setMessage('Veuillez entrer un pseudo')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      setLoading(true)
      setMessage('')
      
      if (isSignUp) {
        // Créer un compte
        // Stocker le pseudo temporairement pour le sauvegarder après connexion
        if (username.trim()) {
          localStorage.setItem('pending_username', username.trim())
        }
        
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: window.location.origin,
            shouldCreateUser: true,
            data: {
              username: username.trim(),
            },
          },
        })
        if (error) throw error
        setMessage('Vérifie ton email pour créer ton compte ! ✨')
      } else {
        // Se connecter
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        setMessage('Vérifie ton email pour le lien de connexion ! ✨')
      }
    } catch (error) {
      console.error('Error sending magic link:', error)
      setMessage('Erreur : ' + error.message)
      if (isSignUp) {
        localStorage.removeItem('pending_username')
      }
    } finally {
      setLoading(false)
    }
  }

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
      
      <div 
        className="rounded-3xl p-8 max-w-2xl w-full soft-shadow relative z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
          border: '2px solid rgba(139, 115, 85, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* Archivus Character avec bulle de dialogue */}
        <div className="flex items-center gap-0 relative z-40 mb-8 justify-center">
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
            className="relative px-4 py-1 rounded-2xl -ml-4"
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
              className="text-lg md:text-xl font-medium relative z-10"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: '#4b4136',
                fontStyle: 'italic',
              }}
            >
              Archivus : {isSignUp ? <>Bienvenue aventurier !<br />Crée ton compte pour commencer l'aventure.</> : <>Bienvenue aventurier !<br />Connecte-toi avec ton mail pour continuer ton aventure.</>}
            </p>
          </div>
        </div>

        {/* Titre principal */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#4b4136',
            }}
          >
            Quest Tracker
          </h1>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ pseudo - uniquement en mode inscription */}
          {isSignUp && (
            <div>
              <label 
                className="block text-lg font-semibold mb-2"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                Pseudo d'aventurier
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: Aventurier123"
                required={isSignUp}
                className="w-full px-4 py-3 rounded-3xl text-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '2px solid rgba(139, 115, 85, 0.3)',
                  color: '#4b4136',
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              />
            </div>
          )}
          
          <div>
            <label 
              className="block text-lg font-semibold mb-2"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                color: '#4b4136',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              className="w-full px-4 py-3 rounded-3xl text-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                border: '2px solid rgba(139, 115, 85, 0.3)',
                color: '#4b4136',
                fontFamily: "'Cormorant Garamond', serif",
              }}
            />
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="nav-button w-full px-8 py-4 rounded-3xl font-semibold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
              }}
            >
              {loading 
                ? 'Envoi en cours...' 
                : isSignUp 
                  ? '✨ Créer mon compte' 
                  : '🔑 Se connecter'
              }
            </button>

            {/* Basculer entre connexion et inscription */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setMessage('')
                  setUsername('') // Réinitialiser le pseudo quand on change de mode
                }}
                className="text-base font-medium hover:underline"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: '#4b4136',
                  opacity: 0.8,
                  fontSize: '1.1rem',
                }}
              >
                {isSignUp 
                  ? 'Déjà un compte ? Se connecter' 
                  : 'Pas encore de compte ? Créer un compte'
                }
              </button>
            </div>
          </div>
        </form>

        {/* Message de confirmation/erreur */}
        {message && (
          <div 
            className={`mt-6 p-4 rounded-3xl text-center font-semibold soft-shadow ${
              message.includes('Vérifie') 
                ? 'bg-green-200/60 text-green-800' 
                : 'bg-red-200/60 text-red-800'
            }`}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            {message}
          </div>
        )}

        {/* Instructions */}
        <div 
          className="mt-6 text-center text-sm font-medium"
          style={{
            color: '#4b4136',
            opacity: 0.7,
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          <p>✨ Aucun mot de passe nécessaire ! ✨</p>
          <p>Nous t'enverrons un lien magique pour te connecter</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quests, setQuests] = useState([])
  const [questsLoading, setQuestsLoading] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [showVillagePlace, setShowVillagePlace] = useState(true) // Page d'accueil par défaut
  const [showUserRegistry, setShowUserRegistry] = useState(false)
  const [showFeed, setShowFeed] = useState(false)

  const totalXP = quests
    .filter(q => q.status === 'completed')
    .reduce((sum, q) => sum + q.xp_value, 0)
  const currentLevel = Math.floor(totalXP / 100) + 1
  const xpInCurrentLevel = totalXP % 100

  useEffect(() => {
    let mounted = true
    
    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Loading timeout, forcing loading to false')
        setLoading(false)
      }
    }, 3000)

    // Check for existing session
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        if (!mounted) return
        clearTimeout(timeoutId)
        if (error) {
          console.error('Session error:', error)
        }
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          loadQuests(session.user.email)
          
          // Vérifier s'il y a un pseudo en attente à sauvegarder
          const pendingUsername = localStorage.getItem('pending_username')
          if (pendingUsername) {
            try {
              // Vérifier si le profil existe déjà
              const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('username')
                .eq('id', session.user.id)
                .single()
              
              // Sauvegarder le pseudo si le profil n'existe pas ou n'a pas de username
              if (!existingProfile || !existingProfile.username) {
                await supabase
                  .from('user_profiles')
                  .upsert({
                    id: session.user.id,
                    username: pendingUsername,
                    updated_at: new Date().toISOString(),
                  })
              }
              
              // Nettoyer le localStorage
              localStorage.removeItem('pending_username')
            } catch (error) {
              console.error('Error saving pending username:', error)
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error getting session:', error)
        if (mounted) {
          clearTimeout(timeoutId)
          setLoading(false)
        }
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        loadQuests(session.user.email)
        
        // Vérifier s'il y a un pseudo en attente à sauvegarder
        const pendingUsername = localStorage.getItem('pending_username')
        if (pendingUsername) {
          try {
            // Vérifier si le profil existe déjà
            const { data: existingProfile } = await supabase
              .from('user_profiles')
              .select('username')
              .eq('id', session.user.id)
              .single()
            
            // Sauvegarder le pseudo si le profil n'existe pas ou n'a pas de username
            if (!existingProfile || !existingProfile.username) {
              await supabase
                .from('user_profiles')
                .upsert({
                  id: session.user.id,
                  username: pendingUsername,
                  updated_at: new Date().toISOString(),
                })
            }
            
            // Nettoyer le localStorage
            localStorage.removeItem('pending_username')
          } catch (error) {
            console.error('Error saving pending username:', error)
          }
        }
      } else {
        setQuests([])
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const loadQuests = async (userEmail) => {
    if (!userEmail) return
    
    try {
      setQuestsLoading(true)
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('created_by', userEmail)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuests(data || [])
    } catch (error) {
      console.error('Error loading quests:', error)
      alert('Failed to load quests: ' + error.message)
    } finally {
      setQuestsLoading(false)
    }
  }


  const updateQuestStatus = async (questId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .update({ status: newStatus })
        .eq('id', questId)
        .select()

      if (error) throw error
      setQuests(quests.map(q => (q.id === questId ? data[0] : q)))
    } catch (error) {
      console.error('Error updating quest:', error)
      alert('Failed to update quest: ' + error.message)
    }
  }


  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Failed to logout: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-200/60 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-200/60 text-blue-800'
      case 'completed':
        return 'bg-green-200/60 text-green-800'
      default:
        return 'bg-gray-200/60 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed ✨'
      default:
        return status
    }
  }

  if (loading) {
    return <LoadingScreen message="Chargement du royaume..." />
  }

  if (!user) {
    return <LoginScreen onLogin={() => {}} />
  }

  if (showFeed) {
    return (
      <>
        <FeedPage
          user={user}
          onBackToVillage={() => {
            setShowFeed(false)
            setShowVillagePlace(true)
          }}
          onBackToCamp={() => {
            setShowFeed(false)
            setShowAccount(true)
          }}
        />
        {/* Logout Button - Fixed bottom right */}
        <div className="fixed bottom-4 right-4 z-50 group">
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleLogout}
              className="glass-card px-3 py-1.5 rounded-2xl text-red-700 font-semibold text-sm whitespace-nowrap cursor-pointer hover:bg-white/40 transition-all"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                border: '2px solid rgba(139, 115, 85, 0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}
            >
              Quitter le royaume
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-4xl cursor-pointer hover:opacity-80 transition-opacity"
          >
            🚪
          </button>
        </div>
      </>
    )
  }

  if (showUserRegistry) {
    return (
      <>
        <UserRegistryPage
          user={user}
          onBackToVillage={() => {
            setShowUserRegistry(false)
            setShowVillagePlace(true)
          }}
          onBackToCamp={() => {
            setShowUserRegistry(false)
            setShowAccount(true)
          }}
        />
        {/* Logout Button - Fixed bottom right */}
        <div className="fixed bottom-4 right-4 z-50 group">
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleLogout}
              className="glass-card px-3 py-1.5 rounded-2xl text-red-700 font-semibold text-sm whitespace-nowrap cursor-pointer hover:bg-white/40 transition-all"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                border: '2px solid rgba(139, 115, 85, 0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}
            >
              Quitter le royaume
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-4xl cursor-pointer hover:opacity-80 transition-opacity"
          >
            🚪
          </button>
        </div>
      </>
    )
  }

  if (showVillagePlace) {
    return (
      <>
        <VillagePlacePage
          user={user}
          onBack={() => {
            setShowVillagePlace(false)
            setShowAccount(true)
          }}
          onOpenRegistry={() => {
            setShowVillagePlace(false)
            setShowUserRegistry(true)
          }}
          onOpenFeed={() => {
            setShowVillagePlace(false)
            setShowFeed(true)
          }}
        />
        {/* Logout Button - Fixed bottom right */}
        <div className="fixed bottom-4 right-4 z-50 group">
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleLogout}
              className="glass-card px-3 py-1.5 rounded-2xl text-red-700 font-semibold text-sm whitespace-nowrap cursor-pointer hover:bg-white/40 transition-all"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                border: '2px solid rgba(139, 115, 85, 0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}
            >
              Quitter le royaume
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-4xl cursor-pointer hover:opacity-80 transition-opacity"
          >
            🚪
          </button>
        </div>
      </>
    )
  }

  if (showAccount) {
    return (
      <>
        <AccountPage
          user={user}
          quests={quests}
          onBack={() => setShowAccount(false)}
          onGoToVillagePlace={() => {
            setShowAccount(false)
            setShowVillagePlace(true)
          }}
          onOpenRegistry={() => {
            setShowAccount(false)
            setShowUserRegistry(true)
          }}
          onOpenFeed={() => {
            setShowAccount(false)
            setShowFeed(true)
          }}
        />
        {/* Logout Button - Fixed bottom right */}
        <div className="fixed bottom-4 right-4 z-50 group">
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleLogout}
              className="glass-card px-3 py-1.5 rounded-2xl text-red-700 font-semibold text-sm whitespace-nowrap cursor-pointer hover:bg-white/40 transition-all"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                border: '2px solid rgba(139, 115, 85, 0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}
            >
              Quitter le royaume
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-4xl cursor-pointer hover:opacity-80 transition-opacity"
          >
            🚪
          </button>
        </div>
    </>
  )
  }

  // Par défaut, afficher la Place du Village (déjà géré par showVillagePlace)
  return null
}

export default App
