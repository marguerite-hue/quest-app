import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './AccountPage.css'
import './LoadingScreen.css'

function FeedPage({ user, onBackToVillage, onBackToCamp }) {
  const [feedPosts, setFeedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState({})
  const [reactions, setReactions] = useState({})
  
  // Quest Updates state
  const [userQuests, setUserQuests] = useState([])
  const [selectedQuest, setSelectedQuest] = useState(null)
  const [updateText, setUpdateText] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [posting, setPosting] = useState(false)
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState('all') // 'all', 'nouvelle_quete', 'update_quete', 'discussion'
  
  // Weekly stats
  const [weeklyStats, setWeeklyStats] = useState({
    updates: 0,
    quests: 0
  })
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    loadFeed()
    loadUserQuests()
    loadWeeklyStats()
    loadProfile()
  }, [user])
  
  const loadProfile = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, avatar_url, email')
        .eq('id', user.id)
        .maybeSingle()
      
      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }
  
  const loadUserQuests = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('id, title, category, status')
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUserQuests(data || [])
    } catch (error) {
      console.error('Error loading user quests:', error)
    }
  }
  
  const loadWeeklyStats = async () => {
    if (!user?.id) return
    
    try {
      // Get date 7 days ago
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const oneWeekAgoISO = oneWeekAgo.toISOString()
      
      // Count quests created this week
      const { count: questsCount, error: questsError } = await supabase
        .from('quests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneWeekAgoISO)
      
      // Count updates posted this week
      const { count: updatesCount, error: updatesError } = await supabase
        .from('quest_updates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneWeekAgoISO)
      
      if (questsError) throw questsError
      if (updatesError) throw updatesError
      
      setWeeklyStats({
        quests: questsCount || 0,
        updates: updatesCount || 0
      })
    } catch (error) {
      console.error('Error loading weekly stats:', error)
    }
  }

  const handlePostUpdate = async () => {
    if (!user?.id || !selectedQuest || !updateText.trim()) {
      alert('Sélectionne une quête et écris ton update !')
      return
    }
    
    try {
      setPosting(true)
      
      const { error } = await supabase
        .from('quest_updates')
        .insert({
          quest_id: selectedQuest,
          user_id: user.id,
          update_text: updateText.trim(),
          visibility: visibility
        })
      
      if (error) throw error
      
      // Reset form
      setUpdateText('')
      setSelectedQuest(null)
      
      // Reload feed and stats
      await loadFeed()
      await loadWeeklyStats()
    } catch (error) {
      console.error('Error posting update:', error)
      alert('Erreur lors de la publication. Réessaie !')
    } finally {
      setPosting(false)
    }
  }

  const loadFeed = async () => {
    try {
      setLoading(true)
      
      // Load ALL quests from all users (created, in_progress, completed)
      const { data: allQuests, error } = await supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) {
        console.error('Error loading feed:', error)
        throw error
      }
      
      // Load quest updates
      const { data: allUpdates, error: updatesError } = await supabase
        .from('quest_updates')
        .select('id, quest_id, user_id, update_text, visibility, created_at')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (updatesError) {
        console.error('Error loading updates:', updatesError)
      }
      
      if ((!allQuests || allQuests.length === 0) && (!allUpdates || allUpdates.length === 0)) {
        setFeedPosts([])
        return
      }
      
      // Load user profiles separately to avoid relationship issue
      const questUserIds = (allQuests || []).map(q => q.user_id).filter(Boolean)
      const updateUserIds = (allUpdates || []).map(u => u.user_id).filter(Boolean)
      const userIds = [...new Set([...questUserIds, ...updateUserIds])]
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, username, avatar_url, email')
        .in('id', userIds)
      
      // Create a map of user_id -> profile
      const profileMap = {}
      ;(profiles || []).forEach(profile => {
        profileMap[profile.id] = profile
      })
      
      // Load quest info for updates (to display quest title)
      const updateQuestIds = (allUpdates || []).map(u => u.quest_id).filter(Boolean)
      const { data: updateQuests } = await supabase
        .from('quests')
        .select('id, title, category')
        .in('id', updateQuestIds)
      
      const questMap = {}
      ;(updateQuests || []).forEach(quest => {
        questMap[quest.id] = quest
      })
      
      // Load reactions for all quests AND updates
      const questIds = (allQuests || []).map(q => q.id)
      const updateIds = (allUpdates || []).map(u => u.id)
      
      const { data: questReactionsData } = await supabase
        .from('quest_reactions')
        .select('quest_id, user_id, reaction_type')
        .in('quest_id', questIds)
        .is('update_id', null)
      
      const { data: updateReactionsData } = await supabase
        .from('quest_reactions')
        .select('update_id, user_id, reaction_type')
        .in('update_id', updateIds)
        .is('quest_id', null)
      
      // Load comments for all quests AND updates
      const { data: questCommentsData } = await supabase
        .from('quest_comments')
        .select('id, quest_id, user_id, comment_text, created_at')
        .in('quest_id', questIds)
        .is('update_id', null)
        .order('created_at', { ascending: true })
      
      const { data: updateCommentsData } = await supabase
        .from('quest_comments')
        .select('id, update_id, user_id, comment_text, created_at')
        .in('update_id', updateIds)
        .is('quest_id', null)
        .order('created_at', { ascending: true })
      
      // Get comment authors
      const questCommentUserIds = [...new Set((questCommentsData || []).map(c => c.user_id))]
      const updateCommentUserIds = [...new Set((updateCommentsData || []).map(c => c.user_id))]
      const commentUserIds = [...new Set([...questCommentUserIds, ...updateCommentUserIds])]
      const { data: commentProfiles } = await supabase
        .from('user_profiles')
        .select('id, username, avatar_url')
        .in('id', commentUserIds)
      
      const commentProfileMap = {}
      ;(commentProfiles || []).forEach(profile => {
        commentProfileMap[profile.id] = profile
      })
      
      // Group reactions by quest_id
      const reactionsByQuest = {}
      ;(questReactionsData || []).forEach(reaction => {
        if (!reactionsByQuest[reaction.quest_id]) {
          reactionsByQuest[reaction.quest_id] = []
        }
        reactionsByQuest[reaction.quest_id].push(reaction)
      })
      
      // Group reactions by update_id
      const reactionsByUpdate = {}
      ;(updateReactionsData || []).forEach(reaction => {
        if (!reactionsByUpdate[reaction.update_id]) {
          reactionsByUpdate[reaction.update_id] = []
        }
        reactionsByUpdate[reaction.update_id].push(reaction)
      })
      
      // Group comments by quest_id
      const commentsByQuest = {}
      ;(questCommentsData || []).forEach(comment => {
        if (!commentsByQuest[comment.quest_id]) {
          commentsByQuest[comment.quest_id] = []
        }
        const profile = commentProfileMap[comment.user_id]
        commentsByQuest[comment.quest_id].push({
          id: comment.id,
          userId: comment.user_id,
          username: profile?.username || 'Aventurier',
          avatar: profile?.avatar_url || null,
          text: comment.comment_text,
          createdAt: comment.created_at
        })
      })
      
      // Group comments by update_id
      const commentsByUpdate = {}
      ;(updateCommentsData || []).forEach(comment => {
        if (!commentsByUpdate[comment.update_id]) {
          commentsByUpdate[comment.update_id] = []
        }
        const profile = commentProfileMap[comment.user_id]
        commentsByUpdate[comment.update_id].push({
          id: comment.id,
          userId: comment.user_id,
          username: profile?.username || 'Aventurier',
          avatar: profile?.avatar_url || null,
          text: comment.comment_text,
          createdAt: comment.created_at
        })
      })
      
      // Transform quests into feed posts
      const questPosts = (allQuests || []).map(quest => {
        const profile = profileMap[quest.user_id]
        const questReactions = reactionsByQuest[quest.id] || []
        
        // Count reactions by type
        const reactionCounts = {
          like: questReactions.filter(r => r.reaction_type === 'like').length,
          love: questReactions.filter(r => r.reaction_type === 'love').length,
          laugh: questReactions.filter(r => r.reaction_type === 'laugh').length
        }
        
        // Check if current user has reacted
        const userReactions = {
          like: questReactions.some(r => r.user_id === user?.id && r.reaction_type === 'like'),
          love: questReactions.some(r => r.user_id === user?.id && r.reaction_type === 'love'),
          laugh: questReactions.some(r => r.user_id === user?.id && r.reaction_type === 'laugh')
        }
        
        // Get username from profile or fallback to created_by email or user_id
        let username = 'Aventurier'
        if (profile?.username) {
          username = profile.username
        } else if (profile?.email) {
          username = profile.email.split('@')[0]
        } else if (quest.created_by) {
          username = quest.created_by.split('@')[0]
        } else if (quest.user_id) {
          username = quest.user_id.substring(0, 8)
        }
        
        return {
          type: 'quest',
          id: quest.id,
          userId: quest.user_id,
          username: username,
          avatar: profile?.avatar_url || null,
          questTitle: quest.title,
          questCategory: quest.category,
          questXP: quest.xp_value || 0,
          questDescription: quest.description,
          questStatus: quest.status,
          questTimeline: quest.timeline,
          postedAt: quest.created_at,
          updatedAt: quest.updated_at || quest.created_at,
          comments: commentsByQuest[quest.id] || [],
          reactionCounts: reactionCounts,
          userReactions: userReactions
        }
      })
      
      // Transform updates into feed posts
      const updatePosts = (allUpdates || []).map(update => {
        const profile = profileMap[update.user_id]
        const quest = questMap[update.quest_id]
        const updateReactions = reactionsByUpdate[update.id] || []
        
        // Count reactions by type
        const reactionCounts = {
          like: updateReactions.filter(r => r.reaction_type === 'like').length,
          love: updateReactions.filter(r => r.reaction_type === 'love').length,
          laugh: updateReactions.filter(r => r.reaction_type === 'laugh').length
        }
        
        // Check if current user has reacted
        const userReactions = {
          like: updateReactions.some(r => r.user_id === user?.id && r.reaction_type === 'like'),
          love: updateReactions.some(r => r.user_id === user?.id && r.reaction_type === 'love'),
          laugh: updateReactions.some(r => r.user_id === user?.id && r.reaction_type === 'laugh')
        }
        
        // Get username
        let username = 'Aventurier'
        if (profile?.username) {
          username = profile.username
        } else if (profile?.email) {
          username = profile.email.split('@')[0]
        } else if (update.user_id) {
          username = update.user_id.substring(0, 8)
        }
        
        return {
          type: 'update',
          id: update.id,
          userId: update.user_id,
          username: username,
          avatar: profile?.avatar_url || null,
          updateText: update.update_text,
          questTitle: quest?.title || 'Quête inconnue',
          questCategory: quest?.category || 'other',
          postedAt: update.created_at,
          comments: commentsByUpdate[update.id] || [],
          reactionCounts: reactionCounts,
          userReactions: userReactions
        }
      })
      
      // Merge and sort all posts by date (most recent first)
      const allPosts = [...questPosts, ...updatePosts].sort((a, b) => {
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      })
      
      setFeedPosts(allPosts)
    } catch (error) {
      console.error('Error loading feed:', error)
      setFeedPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (postId, reactionType, postType) => {
    if (!user?.id) {
      alert('Connecte-toi pour réagir !')
      return
    }

    try {
      const post = feedPosts.find(p => p.id === postId)
      const hasReacted = post?.userReactions?.[reactionType]
      
      const isUpdate = postType === 'update'

      if (hasReacted) {
        // Remove reaction
        const deleteQuery = supabase
          .from('quest_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType)
        
        if (isUpdate) {
          deleteQuery.eq('update_id', postId).is('quest_id', null)
        } else {
          deleteQuery.eq('quest_id', postId).is('update_id', null)
        }

        const { error } = await deleteQuery
        if (error) throw error
      } else {
        // Add reaction
        const insertData = {
          user_id: user.id,
          reaction_type: reactionType
        }
        
        if (isUpdate) {
          insertData.update_id = postId
        } else {
          insertData.quest_id = postId
        }

        const { error } = await supabase
          .from('quest_reactions')
          .insert(insertData)

        if (error) throw error
      }

      // Reload feed to update counts
      await loadFeed()
    } catch (error) {
      console.error('Error handling reaction:', error)
      alert('Erreur lors de la réaction. Réessaie !')
    }
  }

  const handleAddComment = async (postId, postType) => {
    if (!user?.id) {
      alert('Connecte-toi pour commenter !')
      return
    }

    const comment = newComment[postId]
    if (!comment?.trim()) {
      return
    }

    try {
      const isUpdate = postType === 'update'
      
      const insertData = {
        user_id: user.id,
        comment_text: comment.trim()
      }
      
      if (isUpdate) {
        insertData.update_id = postId
      } else {
        insertData.quest_id = postId
      }

      const { error } = await supabase
        .from('quest_comments')
        .insert(insertData)

      if (error) throw error

      // Clear input
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }))

      // Reload feed to show new comment
      await loadFeed()
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Erreur lors de l\'ajout du commentaire. Réessaie !')
    }
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
                  Archivus : Les parchemins affichés ici racontent les derniers exploits des aventuriers du village !
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
                      className="object-cover mx-auto"
                      style={{
                        width: '106px',
                        height: '106px',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="mb-1 text-center">
                <h2 
                  className="text-2xl font-bold mb-0"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  📜 Fil d'actualités
                </h2>
                <p 
                  className="text-base md:text-lg font-medium italic mb-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#4b4136',
                    opacity: 0.7,
                  }}
                >
                  Découvre les updates des aventuriers : inspire-toi ou laisse un mot d'encouragement !
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex justify-center gap-3 mb-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="px-4 py-2 rounded-2xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: categoryFilter === 'all' 
                      ? 'linear-gradient(to bottom, rgba(139, 115, 85, 0.9), rgba(101, 84, 62, 0.9))'
                      : 'rgba(255, 255, 255, 0.85)',
                    border: categoryFilter === 'all'
                      ? '2px solid rgba(184, 134, 11, 0.6)'
                      : '2px solid rgba(139, 115, 85, 0.3)',
                    color: categoryFilter === 'all' ? '#fef3c7' : '#4b4136',
                    fontFamily: "'Cinzel Decorative', serif",
                    boxShadow: categoryFilter === 'all' ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none',
                  }}
                >
                  📋 Tout ({feedPosts.length})
                </button>
                <button
                  onClick={() => setCategoryFilter('nouvelle_quete')}
                  className="px-4 py-2 rounded-2xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: categoryFilter === 'nouvelle_quete'
                      ? 'linear-gradient(to bottom, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))'
                      : 'rgba(255, 255, 255, 0.85)',
                    border: categoryFilter === 'nouvelle_quete'
                      ? '2px solid rgba(34, 197, 94, 0.6)'
                      : '2px solid rgba(139, 115, 85, 0.3)',
                    color: categoryFilter === 'nouvelle_quete' ? '#fff' : '#4b4136',
                    fontFamily: "'Cinzel Decorative', serif",
                    boxShadow: categoryFilter === 'nouvelle_quete' ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none',
                  }}
                >
                  📜 Nouvelle quête ({feedPosts.filter(p => p.type === 'quest').length})
                </button>
                <button
                  onClick={() => setCategoryFilter('update_quete')}
                  className="px-4 py-2 rounded-2xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: categoryFilter === 'update_quete'
                      ? 'linear-gradient(to bottom, rgba(147, 51, 234, 0.9), rgba(109, 40, 217, 0.9))'
                      : 'rgba(255, 255, 255, 0.85)',
                    border: categoryFilter === 'update_quete'
                      ? '2px solid rgba(147, 51, 234, 0.6)'
                      : '2px solid rgba(139, 115, 85, 0.3)',
                    color: categoryFilter === 'update_quete' ? '#fff' : '#4b4136',
                    fontFamily: "'Cinzel Decorative', serif",
                    boxShadow: categoryFilter === 'update_quete' ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none',
                  }}
                >
                  🎯 Update de quête ({feedPosts.filter(p => p.type === 'update' && p.questTitle).length})
                </button>
                <button
                  onClick={() => setCategoryFilter('discussion')}
                  className="px-4 py-2 rounded-2xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: categoryFilter === 'discussion'
                      ? 'linear-gradient(to bottom, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.9))'
                      : 'rgba(255, 255, 255, 0.85)',
                    border: categoryFilter === 'discussion'
                      ? '2px solid rgba(251, 191, 36, 0.6)'
                      : '2px solid rgba(139, 115, 85, 0.3)',
                    color: categoryFilter === 'discussion' ? '#fff' : '#4b4136',
                    fontFamily: "'Cinzel Decorative', serif",
                    boxShadow: categoryFilter === 'discussion' ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none',
                  }}
                >
                  💬 Discussion ({feedPosts.filter(p => p.type === 'update' && !p.questTitle).length})
                </button>
              </div>
              
              {/* Main Layout: Sidebar (1/5) + Feed (4/5) */}
              <div className="flex gap-6 items-start">
                {/* Left Sidebar - Weekly Recap (20% width) */}
                <div className="w-1/5 flex-shrink-0 sticky self-start" style={{ top: '120px', maxHeight: 'calc(100vh - 140px)' }}>
                  {/* Weekly Recap Card */}
                  {user && (
                <div
                  className="glass-card rounded-3xl p-5 soft-shadow fade-in"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.95), rgba(240, 230, 255, 0.95))',
                    border: '2px solid rgba(147, 51, 234, 0.3)',
                    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.1)',
                  }}
                >
                  {/* Header with avatar and username */}
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden relative bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold" style={{ color: '#fff' }}>
                          {(profile?.username || profile?.email || 'A')[0].toUpperCase()}
                        </span>
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="text-center">
                      <h3
                        className="text-base font-bold mb-0.5"
                        style={{
                          fontFamily: "'Cinzel Decorative', serif",
                          color: '#4b4136',
                        }}
                      >
                        {profile?.username || profile?.email?.split('@')[0] || 'Aventurier'}
                      </h3>
                      <p
                        className="text-xs flex items-center justify-center gap-1"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: '#6b21a8',
                        }}
                      >
                        <span>📈</span>
                        <span className="font-semibold">Cette semaine</span>
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="flex flex-col gap-2">
                    {/* Updates Card */}
                    <div
                      className="rounded-2xl p-3 flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
                        border: '2px solid rgba(251, 191, 36, 0.3)',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'rgba(251, 191, 36, 0.3)',
                        }}
                      >
                        <span className="text-xl">🔄</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-2xl font-bold mb-0"
                          style={{
                            fontFamily: "'Cinzel Decorative', serif",
                            color: '#d97706',
                          }}
                        >
                          {weeklyStats.updates}
                        </div>
                        <div
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: '#d97706',
                          }}
                        >
                          Updates
                        </div>
                      </div>
                    </div>

                    {/* Quests Card */}
                    <div
                      className="rounded-2xl p-3 flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
                        border: '2px solid rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'rgba(34, 197, 94, 0.3)',
                        }}
                      >
                        <span className="text-xl">🎯</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-2xl font-bold mb-0"
                          style={{
                            fontFamily: "'Cinzel Decorative', serif",
                            color: '#15803d',
                          }}
                        >
                          {weeklyStats.quests}
                        </div>
                        <div
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: '#15803d',
                          }}
                        >
                          Quêtes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                </div>
                
                {/* Right Content - Feed (80% width) */}
                <div className="flex-1">
              {/* Update Creator */}
              {user && (
                <div
                  className="glass-card rounded-2xl p-4 soft-shadow fade-in mb-4"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <textarea
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    placeholder="Qu'as-tu accompli aujourd'hui ?"
                    className="w-full px-3 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 mb-3"
                    rows={2}
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '0.95rem',
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(139, 115, 85, 0.2)',
                      color: '#4b4136',
                      resize: 'none',
                    }}
                  />
                  
                  {/* Quest Selector (Optional) */}
                  <div className="mb-3">
                    <select
                      value={selectedQuest || ''}
                      onChange={(e) => setSelectedQuest(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(139, 115, 85, 0.2)',
                        color: '#4b4136',
                      }}
                    >
                      <option value="">📝 Post simple (optionnel : lie à une quête)</option>
                      {userQuests.map(quest => (
                        <option key={quest.id} value={quest.id}>
                          🎯 {quest.title} ({quest.status === 'in_progress' ? 'En cours' : 'En attente'})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Visibility & Publish */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setVisibility('public')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          visibility === 'public' ? 'bg-pink-500 text-white' : 'bg-white/60 text-gray-600'
                        }`}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          border: visibility === 'public' ? 'none' : '1px solid rgba(139, 115, 85, 0.2)',
                        }}
                      >
                        🌍 Public
                      </button>
                      <button
                        onClick={() => setVisibility('followers')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          visibility === 'followers' ? 'bg-pink-500 text-white' : 'bg-white/60 text-gray-600'
                        }`}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          border: visibility === 'followers' ? 'none' : '1px solid rgba(139, 115, 85, 0.2)',
                        }}
                      >
                        👥 Abonnés
                      </button>
                    </div>
                    
                    <button
                      onClick={handlePostUpdate}
                      disabled={posting || !updateText.trim()}
                      className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(to right, #ec4899, #f43f5e)',
                        color: 'white',
                        fontFamily: "'Cinzel Decorative', serif",
                        boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
                      }}
                    >
                      {posting ? '✨ Publication...' : '✈️ Publier'}
                    </button>
                  </div>
                </div>
              )}
              
              {feedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p 
                    className="text-xl font-semibold"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#4b4136',
                    }}
                  >
                    Aucune quête dans le village pour le moment...
                  </p>
                </div>
              ) : (
                <>
                  {(() => {
                    const filteredPosts = feedPosts.filter(post => {
                      if (categoryFilter === 'all') return true
                      if (categoryFilter === 'nouvelle_quete') return post.type === 'quest'
                      if (categoryFilter === 'update_quete') return post.type === 'update' && post.questTitle
                      if (categoryFilter === 'discussion') return post.type === 'update' && !post.questTitle
                      return true
                    })

                    if (filteredPosts.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <p 
                            className="text-lg font-semibold"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              color: '#4b4136',
                              opacity: 0.7,
                            }}
                          >
                            Aucun post dans cette catégorie pour le moment...
                          </p>
                        </div>
                      )
                    }

                    return filteredPosts.map((post) => {
                    // Différencier visuellement les posts simples des updates de quête
                    const isQuestUpdate = post.type === 'update' && post.questTitle
                    const isSimplePost = post.type === 'update' && !post.questTitle
                    
                    return (
                <div
                  key={post.id}
                  className="glass-card rounded-2xl p-4 soft-shadow fade-in"
                  style={{
                    background: isSimplePost 
                      ? 'linear-gradient(to bottom, rgba(255, 245, 235, 0.95), rgba(255, 250, 240, 0.95))' // Plus clair pour post simple
                      : isQuestUpdate 
                      ? 'linear-gradient(to bottom, rgba(237, 233, 254, 0.9), rgba(243, 232, 255, 0.9))' // Violet léger pour update de quête
                      : 'linear-gradient(to bottom, rgba(250, 240, 230, 0.9), rgba(245, 235, 220, 0.9))', // Beige par défaut
                    border: isSimplePost 
                      ? '2px solid rgba(251, 191, 36, 0.4)' // Bordure dorée pour post simple
                      : isQuestUpdate 
                      ? '2px solid rgba(147, 51, 234, 0.4)' // Bordure violette pour update de quête
                      : '2px solid rgba(139, 115, 85, 0.3)', // Bordure brune par défaut
                    boxShadow: isSimplePost 
                      ? 'inset 0 0 20px rgba(251, 191, 36, 0.08), 0 8px 32px rgba(0,0,0,0.1)'
                      : isQuestUpdate 
                      ? 'inset 0 0 20px rgba(147, 51, 234, 0.08), 0 8px 32px rgba(0,0,0,0.1)'
                      : 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Parchemin texture effect */}
                  <div className="absolute inset-0 opacity-10 rounded-2xl" style={{
                    backgroundImage: `
                      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 115, 85, 0.1) 2px, rgba(139, 115, 85, 0.1) 4px),
                      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 115, 85, 0.1) 2px, rgba(139, 115, 85, 0.1) 4px)
                    `,
                    pointerEvents: 'none',
                  }}></div>

                  <div className="relative z-10">
                    {/* Post Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center text-lg flex-shrink-0">
                        {post.avatar ? (
                          <img src={post.avatar} alt={post.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{post.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p 
                          className="font-semibold text-sm"
                          style={{
                            fontFamily: "'Cinzel Decorative', serif",
                            color: '#4b4136',
                          }}
                        >
                          {post.username}
                        </p>
                        <p 
                          className="text-xs"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: '#4b4136',
                            opacity: 0.7,
                          }}
                        >
                          {formatTimeAgo(post.postedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.type === 'update' ? (
                          post.questTitle ? (
                            // Update liée à une quête
                            <div 
                              className="px-3 py-1 rounded-2xl"
                              style={{
                                background: 'rgba(147, 51, 234, 0.2)',
                                border: '1px solid rgba(147, 51, 234, 0.4)',
                              }}
                            >
                              <span className="text-xs font-semibold" style={{ color: '#6b21a8' }}>
                                🎯 Update de quête
                              </span>
                            </div>
                          ) : (
                            // Post simple
                            <div 
                              className="px-3 py-1 rounded-2xl"
                              style={{
                                background: 'rgba(251, 191, 36, 0.2)',
                                border: '1px solid rgba(251, 191, 36, 0.4)',
                              }}
                            >
                              <span className="text-xs font-semibold" style={{ color: '#d97706' }}>
                                ✨ Partage
                              </span>
                            </div>
                          )
                        ) : (
                          <>
                            <div 
                              className="px-3 py-1 rounded-2xl"
                              style={{
                                background: post.questStatus === 'completed' ? 'rgba(34, 197, 94, 0.2)' : 
                                           post.questStatus === 'in_progress' ? 'rgba(59, 130, 246, 0.2)' : 
                                           'rgba(251, 191, 36, 0.2)',
                                border: post.questStatus === 'completed' ? '1px solid rgba(34, 197, 94, 0.4)' : 
                                       post.questStatus === 'in_progress' ? '1px solid rgba(59, 130, 246, 0.4)' : 
                                       '1px solid rgba(251, 191, 36, 0.4)',
                              }}
                            >
                              <span className="text-xs font-semibold" style={{ 
                                color: post.questStatus === 'completed' ? '#15803d' : 
                                       post.questStatus === 'in_progress' ? '#1e40af' : 
                                       '#d97706'
                              }}>
                                {post.questStatus === 'completed' ? '✅ Complétée' : 
                                 post.questStatus === 'in_progress' ? '🔄 En cours' : 
                                 '📝 Nouvelle'}
                              </span>
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
                          </>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div 
                      className="mb-3 p-3 rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '1px solid rgba(139, 115, 85, 0.2)',
                      }}
                    >
                      {post.type === 'update' ? (
                        <>
                          {/* Update Content */}
                          {post.questTitle ? (
                            // Update liée à une quête - afficher le titre de la quête
                            <>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-lg">{CATEGORY_EMOJIS[post.questCategory] || '✨'}</span>
                                <h3 
                                  className="text-base font-bold"
                                  style={{
                                    fontFamily: "'Cinzel Decorative', serif",
                                    color: '#4b4136',
                                  }}
                                >
                                  {post.questTitle}
                                </h3>
                              </div>
                              <p 
                                className="text-sm line-clamp-3"
                                style={{
                                  fontFamily: "'Cormorant Garamond', serif",
                                  color: '#4b4136',
                                  lineHeight: '1.5',
                                }}
                              >
                                {post.updateText}
                              </p>
                            </>
                          ) : (
                            // Post simple - juste le texte, pas de titre de quête
                            <p 
                              className="text-sm"
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: '#4b4136',
                                lineHeight: '1.6',
                                fontSize: '0.95rem',
                              }}
                            >
                              {post.updateText}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Quest Content */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-lg">{CATEGORY_EMOJIS[post.questCategory] || '✨'}</span>
                            <h3 
                              className="text-base font-bold"
                              style={{
                                fontFamily: "'Cinzel Decorative', serif",
                                color: '#4b4136',
                              }}
                            >
                              {post.questTitle}
                            </h3>
                          </div>
                          <p 
                            className="text-sm mb-1.5 line-clamp-2"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              color: '#4b4136',
                            }}
                          >
                            {post.questDescription}
                          </p>
                          <p 
                            className="text-xs italic"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              color: '#4b4136',
                              opacity: 0.6,
                            }}
                          >
                            {post.questStatus === 'completed' ? '✨ Quête complétée avec succès !' : 
                             post.questStatus === 'in_progress' ? '🔥 En cours de réalisation...' : 
                             `📅 À réaliser : ${post.questTimeline}`}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Reactions */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => handleReaction(post.id, 'like', post.type)}
                        className="flex items-center gap-1 px-2 py-1 rounded-2xl hover:bg-white/40 transition-all text-sm"
                        style={{
                          background: post.userReactions?.like ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                          border: post.userReactions?.like ? '2px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(139, 115, 85, 0.2)',
                        }}
                      >
                        <span>👍</span>
                        <span className="text-xs font-semibold" style={{ color: '#4b4136' }}>
                          {post.reactionCounts?.like || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => handleReaction(post.id, 'love', post.type)}
                        className="flex items-center gap-1 px-2 py-1 rounded-2xl hover:bg-white/40 transition-all text-sm"
                        style={{
                          background: post.userReactions?.love ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                          border: post.userReactions?.love ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(139, 115, 85, 0.2)',
                        }}
                      >
                        <span>❤️</span>
                        <span className="text-xs font-semibold" style={{ color: '#4b4136' }}>
                          {post.reactionCounts?.love || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => handleReaction(post.id, 'laugh', post.type)}
                        className="flex items-center gap-1 px-2 py-1 rounded-2xl hover:bg-white/40 transition-all text-sm"
                        style={{
                          background: post.userReactions?.laugh ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                          border: post.userReactions?.laugh ? '2px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(139, 115, 85, 0.2)',
                        }}
                      >
                        <span>😂</span>
                        <span className="text-xs font-semibold" style={{ color: '#4b4136' }}>
                          {post.reactionCounts?.laugh || 0}
                        </span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-2 rounded-xl"
                            style={{
                              background: 'rgba(255, 255, 255, 0.4)',
                              border: '1px solid rgba(139, 115, 85, 0.2)',
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center text-xs flex-shrink-0">
                                {comment.avatar ? (
                                  <img src={comment.avatar} alt={comment.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span>{comment.username[0].toUpperCase()}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span 
                                    className="font-semibold text-xs"
                                    style={{
                                      fontFamily: "'Cinzel Decorative', serif",
                                      color: '#4b4136',
                                    }}
                                  >
                                    {comment.username}
                                  </span>
                                  <span 
                                    className="text-xs opacity-60"
                                    style={{ 
                                      color: '#4b4136',
                                      fontFamily: "'Cormorant Garamond', serif",
                                    }}
                                  >
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                </div>
                                <p 
                                  className="text-xs"
                                  style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: '#4b4136',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {comment.text}
                                </p>
                              </div>
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
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id, post.type)
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          border: '1px solid rgba(139, 115, 85, 0.3)',
                          fontFamily: "'Cormorant Garamond', serif",
                          color: '#4b4136',
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id, post.type)}
                        className="px-3 py-1.5 rounded-2xl font-semibold transition-all text-sm"
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
                    )
                  })
                  })()}
                </>
              )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedPage
