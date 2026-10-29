import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './AccountPage.css'
import './LoadingScreen.css'
import LoadingParchment from './LoadingParchment'

function UserRegistryPage({ user, onBackToVillage, onBackToCamp }) {
  const [allPlayers, setAllPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [followingIds, setFollowingIds] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadAllPlayers()
  }, [user])

  const loadFollowingIds = async () => {
    if (!user?.id) return []
    const { data: follows } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)
    return (follows || []).map(f => f.following_id)
  }

  const handleFollowUser = async (playerId) => {
    if (!user?.id) return
    try {
      const isFollowing = followingIds.includes(playerId)
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', playerId)
        if (error) throw error
        setFollowingIds(prev => prev.filter(id => id !== playerId))
        setMessage('Tu ne suis plus cet aventurier')
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: playerId
          })
        if (error) throw error
        setFollowingIds(prev => [...prev, playerId])
        setMessage('Aventurier ajouté en ami !')
      }
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error following/unfollowing:', error)
      setMessage('Erreur lors de l\'ajout')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const loadAllPlayers = async () => {
    try {
      setLoading(true)
      
      // Get all user profiles (current user included, they are part of the village)
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, avatar_url, username, email')
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
      
      // Load who the current user is following
      const following = await loadFollowingIds()
      setFollowingIds(following)

      // OPTIMIZATION: Load ALL quests in a single query instead of one per player
      const profileIds = profilesWithEmail.map(p => p.id).filter(Boolean)
      const { data: allQuests } = await supabase
        .from('quests')
        .select('user_id, status, xp_value')
        .in('user_id', profileIds)
      
      // Create a map of user_id -> quests for fast lookup
      const questsByUser = {}
      ;(allQuests || []).forEach(quest => {
        if (!questsByUser[quest.user_id]) {
          questsByUser[quest.user_id] = []
        }
        questsByUser[quest.user_id].push(quest)
      })
      
      // Calculate stats for each player (no async needed, all data is local)
      const playersWithStats = profilesWithEmail.map(player => {
        const playerQuests = questsByUser[player.id] || []
        
        const completedQuests = playerQuests.filter(q => q.status === 'completed')
        const activeQuests = playerQuests.filter(q => q.status === 'in_progress')
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
      })
      
      // Sort by total XP (highest first)
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
        <div className="sticky top-0 z-50 glass-card border-b border-white/30" style={{ paddingTop: '0px', paddingBottom: '0px' }}>
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

        {/* Message toast */}
        {message && (
          <div 
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-semibold"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.98), rgba(245, 235, 220, 0.98))',
              border: '2px solid rgba(139, 115, 85, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              color: '#4b4136',
            }}
          >
            {message}
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-24 relative" style={{ zIndex: 1 }}>
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <LoadingParchment message="Chargement du registre..." />
            </div>
          ) : (
            <div className="space-y-4">
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
                  {allPlayers.map((player) => {
                    const isMe = player.id === user?.id
                    return (
                    <div
                      key={player.id}
                      className="glass-card rounded-3xl p-6 soft-shadow fade-in"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(250, 240, 230, 1), rgba(245, 235, 220, 1))',
                        border: isMe ? '2px solid rgba(184, 134, 11, 0.6)' : '2px solid rgba(139, 115, 85, 0.3)',
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
                            {player.username}{isMe && ' (moi)'}
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
                        {!isMe && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFollowUser(player.id)
                          }}
                          className="px-4 py-2 rounded-2xl font-semibold text-sm transition-all flex-shrink-0"
                          style={{
                            fontFamily: "'Cinzel Decorative', serif",
                            background: followingIds.includes(player.id)
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))'
                              : 'linear-gradient(135deg, rgba(139, 115, 85, 0.9), rgba(101, 84, 62, 0.9))',
                            border: '2px solid rgba(139, 115, 85, 0.4)',
                            color: '#fef3c7',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        >
                          {followingIds.includes(player.id) ? '✓ Ami' : '+ Ajouter en ami'}
                        </button>
                        )}
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
                    )
                  })}
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
