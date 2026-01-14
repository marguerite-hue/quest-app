import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './AccountPage.css'
import './LoadingScreen.css'

function UserRegistryPage({ user, onBackToVillage, onBackToCamp }) {
  const [allPlayers, setAllPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllPlayers()
  }, [user])

  const loadAllPlayers = async () => {
    try {
      setLoading(true)
      
      // First, get all user profiles (excluding current user)
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, avatar_url, username, email')
        .neq('id', user?.id)
        .limit(100)
      
      if (profilesError) {
        console.error('Error loading profiles:', profilesError)
        throw profilesError
      }
      
      // If no profiles found, return empty array
      if (!profiles || profiles.length === 0) {
        setAllPlayers([])
        return
      }
      
      // Get emails from auth.users for profiles that don't have email
      const profilesWithEmail = await Promise.all(profiles.map(async (profile) => {
        if (!profile.email && profile.id) {
          // Try to get email from auth.users (this might require a function or different approach)
          // For now, we'll use the id as fallback
          return {
            ...profile,
            email: profile.email || `${profile.id.substring(0, 8)}@user.local`
          }
        }
        return profile
      }))
      
      // Load quests for each player to calculate stats
      const playersWithStats = await Promise.all(profilesWithEmail.map(async (player) => {
        // Try to get quests by email first, then by user_id if email doesn't work
        let playerQuests = []
        
        if (player.email) {
          const { data: questsByEmail } = await supabase
            .from('quests')
            .select('status, xp_value')
            .eq('created_by', player.email)
          playerQuests = questsByEmail || []
        }
        
        // Also try by user_id if available
        if (player.id && playerQuests.length === 0) {
          const { data: questsById } = await supabase
            .from('quests')
            .select('status, xp_value')
            .eq('user_id', player.id)
          if (questsById) {
            playerQuests = questsById
          }
        }
        
        const completedQuests = (playerQuests || []).filter(q => q.status === 'completed')
        const activeQuests = (playerQuests || []).filter(q => q.status !== 'completed' && q.status !== 'pending')
        const totalXP = completedQuests.reduce((sum, q) => sum + (q.xp_value || 0), 0)
        const level = Math.floor(totalXP / 100) + 1
        
        return {
          ...player,
          completed_quests: completedQuests.length,
          active_quests: activeQuests.length,
          total_xp: totalXP,
          level: level,
          username: player.username || player.email?.split('@')[0] || player.id?.substring(0, 8) || 'Aventurier'
        }
      }))
      
      setAllPlayers(playersWithStats.sort((a, b) => b.total_xp - a.total_xp))
    } catch (error) {
      console.error('Error loading players:', error)
      setAllPlayers([])
    } finally {
      setLoading(false)
    }
  }

  const getUserDisplayName = () => {
    return user?.email?.split('@')[0] || 'Aventurier'
  }

  return (
    <div 
      className="min-h-screen pb-24 relative fade-in"
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
        {/* Top Navigation - Matching other pages style */}
        <div className="sticky top-0 z-50 glass-card border-b border-white/30 py-1">
          <div className="flex items-center gap-4" style={{ paddingLeft: '65px', paddingRight: '65px' }}>
            {/* Left Button - Back to Village Place */}
            <button
              onClick={onBackToVillage}
              className="nav-button px-6 py-2.5 rounded-2xl flex-shrink-0"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
              }}
            >
              ← Vers la place du village 🎪
            </button>
            
            {/* Archivus Character */}
            <div className="flex items-center gap-0 relative z-40 flex-1 ml-6">
              <div className="flex-shrink-0 flex flex-col items-center overflow-hidden" style={{ height: '120px' }}>
                <img
                  src="https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/archivus-perso.png"
                  alt="Archivus"
                  className="object-cover"
                  style={{
                    width: '120px',
                    height: '120px',
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
                  className="text-lg md:text-xl font-medium relative z-10"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#4b4136',
                    fontStyle: 'italic',
                  }}
                >
                  Archivus : Ah, tu consultes le grand registre du Village !<br />Parcours ces pages et trouve tes futurs compagnons de quêtes !
                </p>
              </div>
            </div>
            
            {/* Right Button - Back to Camp */}
            <button
              onClick={onBackToCamp}
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
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-24 relative" style={{ zIndex: 1 }}>
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="text-center">
                <div className="inline-block">
                  <div className="archivus-loading mb-6">
                    <img
                      src="https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/archivus-perso.png"
                      alt="Archivus"
                      className="w-24 h-24 object-cover mx-auto"
                      style={{
                        filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                  <p 
                    className="text-xl font-semibold mb-4"
                    style={{
                      fontFamily: "'Cinzel Decorative', serif",
                      color: '#4b4136',
                    }}
                  >
                    Chargement du registre...
                  </p>
                  <div className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 
                className="text-3xl font-bold mb-6 text-center"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                📜 Grand Registre du Village
              </h2>
              
              {allPlayers.length === 0 ? (
                <div className="text-center py-12">
                  <p 
                    className="text-xl font-semibold"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#4b4136',
                    }}
                  >
                    Aucun autre aventurier dans le village pour le moment...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="glass-card rounded-3xl p-6 soft-shadow fade-in"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.9), rgba(245, 235, 220, 0.9))',
                        border: '2px solid rgba(139, 115, 85, 0.3)',
                        boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 8px 32px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center text-2xl flex-shrink-0">
                          {player.avatar_url ? (
                            <img 
                              src={player.avatar_url} 
                              alt={player.username} 
                              className="w-full h-full rounded-full object-cover" 
                            />
                          ) : (
                            <span>{player.username[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p 
                            className="text-xl font-bold truncate"
                            style={{
                              fontFamily: "'Cinzel Decorative', serif",
                              color: '#4b4136',
                            }}
                          >
                            {player.username}
                          </p>
                          <p 
                            className="text-sm opacity-70 truncate"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              color: '#4b4136',
                            }}
                          >
                            Niveau {player.level}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div 
                          className="flex justify-between items-center px-3 py-2 rounded-2xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.5)',
                            border: '1px solid rgba(139, 115, 85, 0.2)',
                          }}
                        >
                          <span 
                            className="text-sm font-semibold"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              color: '#4b4136',
                            }}
                          >
                            XP Total
                          </span>
                          <span 
                            className="text-sm font-bold"
                            style={{
                              fontFamily: "'Cinzel Decorative', serif",
                              color: '#4b4136',
                            }}
                          >
                            {player.total_xp} XP
                          </span>
                        </div>
                        
                        <div 
                          className="flex justify-between items-center px-3 py-2 rounded-2xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.5)',
                            border: '1px solid rgba(139, 115, 85, 0.2)',
                          }}
                        >
                          <span 
                            className="text-sm font-semibold"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              color: '#4b4136',
                            }}
                          >
                            Quêtes complétées
                          </span>
                          <span 
                            className="text-sm font-bold"
                            style={{
                              fontFamily: "'Cinzel Decorative', serif",
                              color: '#4b4136',
                            }}
                          >
                            {player.completed_quests}
                          </span>
                        </div>
                        
                        <div 
                          className="flex justify-between items-center px-3 py-2 rounded-2xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.5)',
                            border: '1px solid rgba(139, 115, 85, 0.2)',
                          }}
                        >
                          <span 
                            className="text-sm font-semibold"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              color: '#4b4136',
                            }}
                          >
                            Quêtes actives
                          </span>
                          <span 
                            className="text-sm font-bold"
                            style={{
                              fontFamily: "'Cinzel Decorative', serif",
                              color: '#4b4136',
                            }}
                          >
                            {player.active_quests}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserRegistryPage
