import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './AccountPage.css'
import './LoadingScreen.css'

function FeedPage({ user, onBackToVillage, onBackToCamp }) {
  const [feedPosts, setFeedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState({})
  const [reactions, setReactions] = useState({})

  useEffect(() => {
    loadFeed()
  }, [user])

  const loadFeed = async () => {
    try {
      setLoading(true)
      
      // Load completed quests from all users
      const { data: completedQuests, error } = await supabase
        .from('quests')
        .select(`
          *,
          user_profiles!inner(username, avatar_url)
        `)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      
      // Transform quests into feed posts
      const posts = (completedQuests || []).map(quest => ({
        id: quest.id,
        userId: quest.user_id,
        username: quest.user_profiles?.username || quest.user_id?.substring(0, 8) || 'Aventurier',
        avatar: quest.user_profiles?.avatar_url || null,
        questTitle: quest.title,
        questCategory: quest.category,
        questXP: quest.xp_value || 0,
        questDescription: quest.description,
        completedAt: quest.updated_at || quest.created_at,
        comments: [], // TODO: Load comments from database
        reactions: {} // TODO: Load reactions from database
      }))
      
      setFeedPosts(posts)
    } catch (error) {
      console.error('Error loading feed:', error)
      setFeedPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = (postId, reactionType) => {
    setReactions(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [reactionType]: (prev[postId]?.[reactionType] || 0) + 1
      }
    }))
  }

  const handleAddComment = (postId) => {
    if (!newComment[postId]?.trim()) return
    // TODO: Save comment to database
    const comment = {
      id: Date.now(),
      userId: user.id,
      username: user.email?.split('@')[0] || 'Moi',
      text: newComment[postId],
      time: 'À l\'instant'
    }
    setFeedPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ))
    setNewComment(prev => ({ ...prev, [postId]: '' }))
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  }

  const CATEGORY_EMOJIS = {
    fitness: '💪',
    social: '🎉',
    creative: '🎨',
    learning: '📚',
    wellness: '🧘'
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
                  Archivus : Les parchemins affichés ici racontent les derniers exploits des aventuriers du village !<br />Inspire-toi ou laisse un mot d'encouragement !
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
          {/* Feed Posts */}
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
                    Chargement du feed...
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
            <div className="space-y-6">
              <h2 
                className="text-3xl font-bold mb-6 text-center"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                📋 Affichoir du Village
              </h2>
              
              {feedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p 
                    className="text-xl font-semibold"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#4b4136',
                    }}
                  >
                    Aucune quête complétée dans le village pour le moment...
                  </p>
                </div>
              ) : (
                <>
                  {feedPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass-card rounded-3xl p-6 soft-shadow fade-in"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.9), rgba(245, 235, 220, 0.9))',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Parchemin texture effect */}
                  <div className="absolute inset-0 opacity-10 rounded-3xl" style={{
                    backgroundImage: `
                      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 115, 85, 0.1) 2px, rgba(139, 115, 85, 0.1) 4px),
                      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 115, 85, 0.1) 2px, rgba(139, 115, 85, 0.1) 4px)
                    `,
                    pointerEvents: 'none',
                  }}></div>

                  <div className="relative z-10">
                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center text-xl">
                        {post.avatar ? (
                          <img src={post.avatar} alt={post.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{post.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p 
                          className="font-semibold"
                          style={{
                            fontFamily: "'Cinzel Decorative', serif",
                            color: '#4b4136',
                          }}
                        >
                          {post.username}
                        </p>
                        <p 
                          className="text-sm"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: '#4b4136',
                            opacity: 0.7,
                          }}
                        >
                          {formatTimeAgo(post.completedAt)}
                        </p>
                      </div>
                      <div 
                        className="px-3 py-1 rounded-2xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.4)',
                          border: '1px solid rgba(139, 115, 85, 0.2)',
                        }}
                      >
                        <span className="text-sm font-semibold" style={{ color: '#4b4136' }}>
                          +{post.questXP} XP
                        </span>
                      </div>
                    </div>

                    {/* Quest Content */}
                    <div 
                      className="mb-4 p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '1px solid rgba(139, 115, 85, 0.2)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{CATEGORY_EMOJIS[post.questCategory] || '✨'}</span>
                        <h3 
                          className="text-xl font-bold"
                          style={{
                            fontFamily: "'Cinzel Decorative', serif",
                            color: '#4b4136',
                          }}
                        >
                          {post.questTitle}
                        </h3>
                      </div>
                      <p 
                        className="text-sm"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: '#4b4136',
                          opacity: 0.8,
                        }}
                      >
                        Quête complétée avec succès ! 🎉
                      </p>
                    </div>

                    {/* Reactions */}
                    <div className="flex items-center gap-4 mb-4">
                      <button
                        onClick={() => handleReaction(post.id, 'like')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-2xl hover:bg-white/40 transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid rgba(139, 115, 85, 0.2)',
                        }}
                      >
                        <span>👍</span>
                        <span className="text-sm font-semibold" style={{ color: '#4b4136' }}>
                          {(reactions[post.id]?.like || post.reactions?.like || 0)}
                        </span>
                      </button>
                      <button
                        onClick={() => handleReaction(post.id, 'fire')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-2xl hover:bg-white/40 transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid rgba(139, 115, 85, 0.2)',
                        }}
                      >
                        <span>🔥</span>
                        <span className="text-sm font-semibold" style={{ color: '#4b4136' }}>
                          {(reactions[post.id]?.fire || post.reactions?.fire || 0)}
                        </span>
                      </button>
                      <button
                        onClick={() => handleReaction(post.id, 'celebrate')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-2xl hover:bg-white/40 transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid rgba(139, 115, 85, 0.2)',
                        }}
                      >
                        <span>🎉</span>
                        <span className="text-sm font-semibold" style={{ color: '#4b4136' }}>
                          {(reactions[post.id]?.celebrate || post.reactions?.celebrate || 0)}
                        </span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 rounded-2xl"
                            style={{
                              background: 'rgba(255, 255, 255, 0.4)',
                              border: '1px solid rgba(139, 115, 85, 0.2)',
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <span 
                                className="font-semibold text-sm"
                                style={{
                                  fontFamily: "'Cinzel Decorative', serif",
                                  color: '#4b4136',
                                }}
                              >
                                {comment.username}:
                              </span>
                              <p 
                                className="flex-1 text-sm"
                                style={{
                                  fontFamily: "'Cormorant Garamond', serif",
                                  color: '#4b4136',
                                }}
                              >
                                {comment.text}
                              </p>
                              <span 
                                className="text-xs opacity-60"
                                style={{ color: '#4b4136' }}
                              >
                                {comment.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Écris un commentaire..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="flex-1 px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          border: '1px solid rgba(139, 115, 85, 0.3)',
                          fontFamily: "'Cormorant Garamond', serif",
                          color: '#4b4136',
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id)
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-4 py-2 rounded-2xl font-semibold transition-all"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.9), rgba(245, 235, 220, 0.9))',
                          border: '2px solid rgba(139, 115, 85, 0.3)',
                          color: '#4b4136',
                          fontFamily: "'Cinzel Decorative', serif",
                        }}
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedPage
