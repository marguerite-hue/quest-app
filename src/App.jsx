import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import AccountPage from './AccountPage'
import UserRegistryPage from './UserRegistryPage'
import FeedPage from './FeedPage'
import VillagePlacePage from './VillagePlacePage'
import LoadingScreen from './LoadingScreen'
import './App.css'
import './LoadingScreen.css'

const CATEGORIES = {
  fitness: { emoji: '💪', color: 'bg-red-400', border: 'border-red-600' },
  learning: { emoji: '📚', color: 'bg-blue-400', border: 'border-blue-600' },
  career: { emoji: '💼', color: 'bg-amber-400', border: 'border-amber-600' },
  creativity: { emoji: '🎨', color: 'bg-purple-400', border: 'border-purple-600' },
  wellness: { emoji: '🧘', color: 'bg-green-400', border: 'border-green-600' },
  social: { emoji: '👥', color: 'bg-pink-400', border: 'border-pink-600' },
}

const TIMELINE_OPTIONS = ['today', 'this week', 'this month', 'major']

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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setMessage('')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setMessage('Erreur : ' + error.message)
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
        className="rounded-3xl p-6 max-w-2xl w-full soft-shadow relative z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
          border: '2px solid rgba(139, 115, 85, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* Titre principal */}
        <div className="text-center mb-2">
          <h1 
            className="text-4xl font-bold mb-0"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#4b4136',
            }}
          >
            Quest
          </h1>
        </div>

        {/* Archivus Character avec bulle de dialogue */}
        <div className="flex items-center gap-0 relative z-40 mb-4 justify-center">
          <div className="flex-shrink-0 flex flex-col items-center overflow-hidden" style={{ height: 'clamp(110px, 19vh, 200px)' }}>
            <img
              src="https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/archivus-perso.png"
              alt="Archivus"
              className="object-cover"
              style={{
                width: 'clamp(110px, 19vh, 200px)',
                height: 'clamp(110px, 19vh, 200px)',
                objectPosition: 'center top',
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
          <div 
            className="relative px-5 py-2 rounded-2xl -ml-4"
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
              className="font-medium relative z-10"
              style={{
                fontSize: '1.05rem',
                fontFamily: "'Cormorant Garamond', serif",
                color: '#4b4136',
                fontStyle: 'italic',
                lineHeight: '1.3',
              }}
            >
              Archivus : {isSignUp ? <>Bienvenue aventurier !<br />Crée ton compte pour commencer l'aventure.</> : <>Bienvenue aventurier !<br />Connecte-toi avec ton mail pour continuer ton aventure.</>}
            </p>
          </div>
        </div>

        {/* Bouton Google - bien visible */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full px-8 py-3 rounded-3xl font-semibold text-xl flex items-center justify-center gap-3 hover:opacity-95 transition-opacity"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              background: '#4285F4',
              border: 'none',
              color: 'white',
              boxShadow: '0 4px 14px rgba(66, 133, 244, 0.4)',
            }}
          >
            <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Se connecter avec Google
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-amber-700/30" />
          <span className="text-xl font-semibold" style={{ color: '#4b4136', fontFamily: "'Cormorant Garamond', serif" }}>ou avec ton email</span>
          <div className="flex-1 h-px bg-amber-700/30" />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ pseudo - uniquement en mode inscription */}
          {isSignUp && (
            <div>
              <label 
                className="block text-lg font-semibold mb-1"
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
                className="w-full px-4 py-2.5 rounded-3xl text-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
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
              className="block text-lg font-semibold mb-1"
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
              className="w-full px-4 py-2.5 rounded-3xl text-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
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
              className="nav-button w-full px-8 py-3 rounded-3xl font-semibold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  fontSize: '1.4rem',
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
          className="mt-3 text-center text-xl font-medium"
          style={{
            color: '#4b4136',
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
  const [showVillagePlace, setShowVillagePlace] = useState(true) // Feed = page d'accueil
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
  if (showVillagePlace) {
    return (
      <>
        {showFeed ? (
          <FeedPage
            user={user}
            isVillagePlace={false}
            onBackToVillage={() => setShowFeed(false)}
            onBackToCamp={() => {
              setShowVillagePlace(false)
              setShowFeed(false)
              setShowAccount(true)
            }}
          />
        ) : (
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
            onOpenFeed={() => setShowFeed(true)}
          />
        )}
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
            setShowVillagePlace(true)
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
  // Par défaut, afficher le Feed (déjà géré par showVillagePlace)
  // Par défaut, afficher la Place du Village (déjà géré par showVillagePlace)
  return null
}

export default App
