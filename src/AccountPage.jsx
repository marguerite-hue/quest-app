import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import { getCarnetQuetesUrl } from '@/assets'
import { assetManager } from '@/utils/assetManager'
import LoadingScreen from './LoadingScreen'
import './AccountPage.css'
import './LoadingScreen.css'

const UNIVERSES = {
  sims: {
    name: 'Sims',
    emoji: '🏠',
    color: 'bg-green-400',
    border: 'border-green-600',
    placeholder: 'Décris ton Sim (ex: jeune adulte à la mode avec des cheveux bouclés)',
  },
  minecraft: {
    name: 'Minecraft',
    emoji: '⛏️',
    color: 'bg-yellow-400',
    border: 'border-yellow-600',
    placeholder: 'Décris ton personnage (ex: Steve avec une armure en diamant)',
  },
  wow: {
    name: 'World of Warcraft',
    emoji: '⚔️',
    color: 'bg-blue-400',
    border: 'border-blue-600',
    placeholder: 'Décris ton héros (ex: guerrier elfe de la nuit aux yeux lumineux)',
  },
  finalfantasy: {
    name: 'Final Fantasy',
    emoji: '🗡️',
    color: 'bg-purple-400',
    border: 'border-purple-600',
    placeholder: 'Décris ton personnage (ex: elfe aux longs cheveux blancs et robes flottantes)',
  },
  league: {
    name: 'League of Legends',
    emoji: '🎮',
    color: 'bg-red-400',
    border: 'border-red-600',
    placeholder: 'Décris ton champion (ex: guerrier féroce aux pouvoirs magiques)',
  },
  pacman: {
    name: 'Pacman',
    emoji: '👾',
    color: 'bg-yellow-300',
    border: 'border-yellow-500',
    placeholder: 'Décris ton personnage (ex: fantôme coloré ou design jaune classique)',
  },
  pokemon: {
    name: 'Pokemon',
    emoji: '⚡',
    color: 'bg-pink-400',
    border: 'border-pink-600',
    placeholder: 'Décris ton dresseur (ex: dresseur Pokémon avec Pikachu comme compagnon)',
  },
  zelda: {
    name: 'Zelda',
    emoji: '🛡️',
    color: 'bg-emerald-400',
    border: 'border-emerald-600',
    placeholder: 'Décris ton héros (ex: Link avec l\'épée de légende et le bouclier)',
  },
}

const CATEGORIES = {
  fitness: { emoji: '💪', name: 'Sport & Fitness', color: 'bg-teal-400', border: 'border-teal-600', icon: '🏋️' },
  learning: { emoji: '📚', name: 'Savoir & Apprentissage', color: 'bg-blue-400', border: 'border-blue-600', icon: '📖' },
  career: { emoji: '💼', name: 'Carrière & Travail', color: 'bg-amber-400', border: 'border-amber-600', icon: '💼' },
  creativity: { emoji: '🎨', name: 'Créativité & Projets', color: 'bg-purple-400', border: 'border-purple-600', icon: '🖌️' },
  wellness: { emoji: '🧘', name: 'Bien-être & Santé', color: 'bg-green-400', border: 'border-green-600', icon: '🧘' },
  social: { emoji: '👥', name: 'Social & Communauté', color: 'bg-pink-400', border: 'border-pink-600', icon: '🎊' },
  creative: { emoji: '🎨', name: 'Créativité & Projets', color: 'bg-purple-400', border: 'border-purple-600', icon: '🖌️' }, // backward compat
}

const TIMELINE_LABELS = {
  today: '⚡ Quotidienne',
  'this week': '📅 Hebdomadaire',
  'this month': '🌙 Mensuelle',
  major: '🎯 Majeure',
}

const BACKGROUND_EFFECTS = ['none', 'gradient', 'animated-particles', 'pixel-art', 'holographic']
const EMOJI_STICKERS = ['😀', '🎉', '🔥', '💪', '🎨', '📚', '✨', '🌟', '💯', '👾']

function AccountPage({ user, quests, onBack, onGoToVillagePlace, onOpenRegistry, onOpenFeed }) {
  const [profile, setProfile] = useState(null)
  const [localQuests, setLocalQuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUniverse, setSelectedUniverse] = useState(null)
  const [avatarDescription, setAvatarDescription] = useState('')
  const [avatarBackgroundChoice, setAvatarBackgroundChoice] = useState('transparent') // 'transparent' ou 'custom'
  const [avatarBackgroundDescription, setAvatarBackgroundDescription] = useState('')
  const [backgroundType, setBackgroundType] = useState('color')
  const [backgroundColor, setBackgroundColor] = useState('#3d3a3a')
  const [backgroundOpacity, setBackgroundOpacity] = useState(100)
  const [backgroundEffect, setBackgroundEffect] = useState('none')
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [stickerTab, setStickerTab] = useState('emoji')
  const [stickers, setStickers] = useState([])
  const [selectedSticker, setSelectedSticker] = useState(null)
  const [textStickerContent, setTextStickerContent] = useState('')
  const [textStickerSize, setTextStickerSize] = useState(24)
  const [textStickerColor, setTextStickerColor] = useState('#000000')
  const [selectedQuest, setSelectedQuest] = useState(null)
  const [editingQuest, setEditingQuest] = useState(null)
  const [selectedQuestId, setSelectedQuestId] = useState(null)
  const [generatedAvatar, setGeneratedAvatar] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [customizationMenuOpen, setCustomizationMenuOpen] = useState(false)
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [tentMenuOpen, setTentMenuOpen] = useState(false)
  const avatarRef = useRef(null)
  const tentMenuTimeoutRef = useRef(null)
  const avatarMenuTimeoutRef = useRef(null)
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showStickersModal, setShowStickersModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showQuestBook, setShowQuestBook] = useState(false)
  const [showCreateQuestModal, setShowCreateQuestModal] = useState(false)
  const [questFilterCategory, setQuestFilterCategory] = useState('all')
  const [questFilterTimeline, setQuestFilterTimeline] = useState('all')
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    category: 'fitness',
    xp_value: 7,
    timeline: 'this week',
  })

  // XP par timeline: QUOTIDIENNE 1, HEBDOMADAIRE 7, MENSUELLE 30, MAJEURE 200
  const getXPForTimeline = (timeline) => {
    switch (timeline) {
      case 'today': return 1
      case 'this week': return 7
      case 'this month': return 30
      case 'major': return 200
      default: return 7
    }
  }
  const [arrangeMode, setArrangeMode] = useState(false)
  const [questPositions, setQuestPositions] = useState({})
  const [hiddenQuests, setHiddenQuests] = useState([])
  const [deleteQuestModal, setDeleteQuestModal] = useState(null)
  const [draggedQuest, setDraggedQuest] = useState(null)
  const [resizedQuest, setResizedQuest] = useState(null)
  const [rotatedQuest, setRotatedQuest] = useState(null)
  const [villageEchos, setVillageEchos] = useState([])
  const [questBookImageUrl, setQuestBookImageUrl] = useState(null)
  const [villageEchosOpen, setVillageEchosOpen] = useState(false)
  const [progressionPanelOpen, setProgressionPanelOpen] = useState(true)
  const [selectedProgressQuest, setSelectedProgressQuest] = useState(null)
  const [questCheckpoints, setQuestCheckpoints] = useState({})
  const [liveEchoNotifications, setLiveEchoNotifications] = useState([])
  const [lastEchoCheck, setLastEchoCheck] = useState(null)
  const [questBookPosition, setQuestBookPosition] = useState({ x: 0, y: 0, scale: 1, rotation: 0 })
  const [draggedQuestBook, setDraggedQuestBook] = useState(false)
  const [resizedQuestBook, setResizedQuestBook] = useState(false)
  const [rotatedQuestBook, setRotatedQuestBook] = useState(false)
  const [selectedCompanion, setSelectedCompanion] = useState(null)
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  const [allPlayers, setAllPlayers] = useState([])
  const [companions, setCompanions] = useState([])
  const [followingIds, setFollowingIds] = useState([])
  const pageRef = useRef(null)
  const [, setTimeTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTimeTick(t => t + 1), 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadProfile()
    loadQuests()
    loadQuestBookImage()
    loadAllPlayers()
    loadCompanions()
    loadVillageEchos()
    
    // Refresh echos every 5 seconds (instant notifications)
    const interval = setInterval(() => {
      loadVillageEchos()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [user])

  const loadAllPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, avatar_url, username, email')
        .neq('id', user?.id)
        .limit(50)
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        setAllPlayers([])
        return
      }
      
      // OPTIMIZATION: Load ALL quests in a single query instead of one per player
      const playerIds = data.map(p => p.id).filter(Boolean)
      const { data: allQuests } = await supabase
        .from('quests')
        .select('user_id, status, xp_value')
        .in('user_id', playerIds)
      
      // Create a map of user_id -> quests for fast lookup
      const questsByUser = {}
      ;(allQuests || []).forEach(quest => {
        if (!questsByUser[quest.user_id]) {
          questsByUser[quest.user_id] = []
        }
        questsByUser[quest.user_id].push(quest)
      })
      
      // Calculate stats for each player (no async needed, all data is local)
      const playersWithStats = data.map(player => {
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
          level: level
        }
      })
      
      setAllPlayers(playersWithStats)
    } catch (error) {
      console.error('Error loading players:', error)
    }
  }

  const loadCompanions = async () => {
    if (!user?.id) return
    
    try {
      // Load following relationships
      const { data: follows, error: followsError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)
      
      if (followsError) throw followsError
      
      const followingIds = (follows || []).map(f => f.following_id)
      setFollowingIds(followingIds)
      
      if (followingIds.length === 0) {
        setCompanions([])
        return
      }
      
      // Load companion profiles
      const { data: companionProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, avatar_url, username, email')
        .in('id', followingIds)
      
      if (profilesError) throw profilesError
      
      // Load companion stats
      const { data: companionQuests } = await supabase
        .from('quests')
        .select('user_id, status, xp_value')
        .in('user_id', followingIds)
      
      // Create a map of user_id -> quests
      const questsByUser = {}
      ;(companionQuests || []).forEach(quest => {
        if (!questsByUser[quest.user_id]) {
          questsByUser[quest.user_id] = []
        }
        questsByUser[quest.user_id].push(quest)
      })
      
      // Calculate stats for each companion
      const companionsWithStats = (companionProfiles || []).map(companion => {
        const quests = questsByUser[companion.id] || []
        const completedQuests = quests.filter(q => q.status === 'completed')
        const activeQuests = quests.filter(q => q.status !== 'completed')
        const totalXP = completedQuests.reduce((sum, q) => sum + (q.xp_value || 0), 0)
        const level = Math.floor(totalXP / 100) + 1
        
        return {
          ...companion,
          completed_quests: completedQuests.length,
          active_quests: activeQuests.length,
          total_xp: totalXP,
          level: level
        }
      })
      
      setCompanions(companionsWithStats)
    } catch (error) {
      console.error('Error loading companions:', error)
    }
  }

  const handleFollowUser = async (userId) => {
    if (!user?.id) return
    
    try {
      const isFollowing = followingIds.includes(userId)
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId)
        
        if (error) throw error
        
        setFollowingIds(prev => prev.filter(id => id !== userId))
        setSuccessMessage('Tu ne suis plus cet aventurier')
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          })
        
        if (error) throw error
        
        setFollowingIds(prev => [...prev, userId])
        setSuccessMessage('Tu suis maintenant cet aventurier !')
      }
      
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // Reload companions
      await loadCompanions()
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
      setErrorMessage('Erreur lors de la mise à jour')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const loadVillageEchos = async () => {
    try {
      const echos = []
      
      // 1. Récupérer les quêtes complétées récemment (dernières 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: recentCompletedQuests, error: questsError } = await supabase
        .from('quests')
        .select('id, title, user_id, created_by, created_at, updated_at')
        .eq('status', 'completed')
        .gte('updated_at', oneDayAgo)
        // Removed .neq('user_id', user?.id) to include own quests
        .order('updated_at', { ascending: false })
        .limit(10)
      
      if (questsError) throw questsError
      
      // Récupérer les profils des utilisateurs pour les quêtes
      for (const quest of recentCompletedQuests || []) {
        // Essayer de trouver le profil via user_id d'abord, sinon via email
        let userProfile = null
        
        if (quest.user_id) {
          const { data } = await supabase
            .from('user_profiles')
            .select('username, email')
            .eq('id', quest.user_id)
            .maybeSingle()
          userProfile = data
        } else if (quest.created_by) {
          const { data } = await supabase
            .from('user_profiles')
            .select('username, email')
            .eq('email', quest.created_by)
            .maybeSingle()
          userProfile = data
        }
        
        const username = userProfile?.username || quest.created_by?.split('@')[0] || 'Un aventurier'
        const completedAt = quest.updated_at || quest.created_at
        const timeDiff = Date.now() - new Date(completedAt).getTime()
        const timeAgo = formatTimeAgo(timeDiff)
        
        echos.push({
          id: `quest-${quest.id}`,
          message: `🏆 ${username} a complété la quête "${quest.title}" !`,
          time: timeAgo,
          type: 'achievement',
          timestamp: new Date(completedAt).getTime()
        })
      }
      
      // 2. Récupérer les nouvelles quêtes créées (dernières 24h, tous statuts)
      const { data: newQuests, error: newQuestsError } = await supabase
        .from('quests')
        .select('id, title, user_id, created_by, created_at, status')
        .gte('created_at', oneDayAgo)
        // Removed .neq('user_id', user?.id) to include own quests
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (newQuestsError) throw newQuestsError
      
      // Récupérer les profils des utilisateurs pour les nouvelles quêtes
      for (const quest of newQuests || []) {
        // Essayer de trouver le profil via user_id d'abord, sinon via email
        let userProfile = null
        
        if (quest.user_id) {
          const { data } = await supabase
            .from('user_profiles')
            .select('username, email')
            .eq('id', quest.user_id)
            .maybeSingle()
          userProfile = data
        } else if (quest.created_by) {
          const { data } = await supabase
            .from('user_profiles')
            .select('username, email')
            .eq('email', quest.created_by)
            .maybeSingle()
          userProfile = data
        }
        
        const username = userProfile?.username || quest.created_by?.split('@')[0] || 'Un aventurier'
        const timeDiff = Date.now() - new Date(quest.created_at).getTime()
        const timeAgo = formatTimeAgo(timeDiff)
        
        echos.push({
          id: `new-quest-${quest.id}`,
          message: `📜 ${username} a créé la quête "${quest.title}" !`,
          time: timeAgo,
          type: 'quest',
          timestamp: new Date(quest.created_at).getTime()
        })
      }
      
      // 3. Récupérer les nouveaux joueurs (dernières 24h)
      const { data: newPlayers, error: playersError } = await supabase
        .from('user_profiles')
        .select('id, username, email, created_at')
        .gte('created_at', oneDayAgo)
        // Keep .neq for players (don't show "you joined the village")
        .neq('id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (playersError) throw playersError
      
      for (const player of newPlayers || []) {
        const username = player.username || player.email?.split('@')[0] || 'Un aventurier'
        const timeDiff = Date.now() - new Date(player.created_at).getTime()
        const timeAgo = formatTimeAgo(timeDiff)
        
        echos.push({
          id: `player-${player.id}`,
          message: `✨ ${username} a rejoint le village !`,
          time: timeAgo,
          type: 'info',
          timestamp: new Date(player.created_at).getTime()
        })
      }
      
      // Trier tous les échos par date (plus récents en premier)
      echos.sort((a, b) => b.timestamp - a.timestamp)
      
      const recentEchos = echos.slice(0, 5) // Garder seulement les 5 plus récents
      setVillageEchos(recentEchos)
      
      // Detect new echos and show as live notifications
      if (recentEchos.length > 0 && lastEchoCheck !== null) {
        // Find new echos since last check
        const newEchos = []
        for (const echo of recentEchos) {
          if (echo.id === lastEchoCheck) break
          newEchos.push(echo)
        }
        
        // Show new echos as live notifications (one at a time with delay)
        newEchos.reverse().forEach((echo, index) => {
          setTimeout(() => {
            showLiveNotification(echo)
          }, index * 3000) // 3 seconds between each notification
        })
        
        // Update last check
        if (recentEchos.length > 0) {
          setLastEchoCheck(recentEchos[0].id)
        }
      } else if (recentEchos.length > 0 && lastEchoCheck === null) {
        // First load, set the check but don't show notifications
        setLastEchoCheck(recentEchos[0].id)
      }
    } catch (error) {
      console.error('Error loading village echos:', error)
      setVillageEchos([])
    }
  }

  // Show a live notification that auto-disappears
  const showLiveNotification = (echo) => {
    const notificationId = `live-${echo.id}-${Date.now()}`
    const notification = { ...echo, notificationId }
    
    setLiveEchoNotifications(prev => [...prev, notification])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setLiveEchoNotifications(prev => prev.filter(n => n.notificationId !== notificationId))
    }, 5000)
  }

  const formatTimeAgo = (milliseconds) => {
    if (milliseconds < 0 || !Number.isFinite(milliseconds)) return 'À l\'instant'
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
    } else if (minutes > 0) {
      return `Il y a ${minutes} min`
    } else if (seconds > 0) {
      return `Il y a ${seconds} sec`
    } else {
      return 'À l\'instant'
    }
  }

  // Generate checkpoints for a quest based on timeline
  const generateCheckpoints = (quest) => {
    const checkpoints = []
    const startDate = new Date(quest.created_at)
    
    switch (quest.timeline) {
      case 'today':
        // 1 checkpoint for today
        checkpoints.push({ date: startDate, label: 'Aujourd\'hui', completed: false })
        break
      
      case 'this week':
        // 7 checkpoints (1 per day)
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate)
          date.setDate(date.getDate() + i)
          checkpoints.push({
            date,
            label: `Jour ${i + 1}`,
            completed: false
          })
        }
        break
      
      case 'this month':
        // 4 checkpoints (1 per week)
        for (let i = 0; i < 4; i++) {
          const date = new Date(startDate)
          date.setDate(date.getDate() + (i * 7))
          checkpoints.push({
            date,
            label: `Semaine ${i + 1}`,
            completed: false
          })
        }
        break
      
      case 'major':
        // 1 checkpoint pour quête majeure
        checkpoints.push({ date: startDate, label: 'Quête majeure', completed: false })
        break
      
      default:
        checkpoints.push({ date: startDate, label: 'Checkpoint', completed: false })
    }
    
    return checkpoints
  }

  // Initialize checkpoints for a quest if not exists
  const getQuestCheckpoints = (questId) => {
    if (questCheckpoints[questId]) {
      return questCheckpoints[questId]
    }
    const quest = quests.find(q => q.id === questId)
    if (quest) {
      return generateCheckpoints(quest)
    }
    return []
  }

  // Toggle checkpoint completion
  const toggleCheckpoint = async (questId, checkpointIndex) => {
    const updatedCheckpoints = { ...questCheckpoints }
    if (!updatedCheckpoints[questId]) {
      const quest = quests.find(q => q.id === questId)
      if (quest) {
        updatedCheckpoints[questId] = generateCheckpoints(quest)
      }
    }
    
    if (updatedCheckpoints[questId] && updatedCheckpoints[questId][checkpointIndex]) {
      updatedCheckpoints[questId][checkpointIndex].completed = !updatedCheckpoints[questId][checkpointIndex].completed
      setQuestCheckpoints(updatedCheckpoints)
      
      // Save to profile
      await saveProfile({
        quest_checkpoints: updatedCheckpoints
      })
    }
  }

  // Load checkpoints from profile
  useEffect(() => {
    if (profile?.quest_checkpoints) {
      setQuestCheckpoints(profile.quest_checkpoints)
    }
  }, [profile])

  // Use localQuests if available, otherwise fallback to prop quests
  const effectiveQuests = localQuests.length > 0 ? localQuests : quests

  // Get active recurring quests (not completed, with timeline)
  const recurringQuests = effectiveQuests.filter(q => 
    q.status !== 'completed' && 
    (q.timeline === 'today' || q.timeline === 'this week' || q.timeline === 'this month')
  )

  const loadQuestBookImage = async () => {
    try {
      // Get image URL from Supabase Storage
      // This will generate: https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/journal-quetes.png
      const url = assetManager.getPublicUrl('illustrations/journal-quetes.png')
      console.log('Quest book image URL:', url) // Debug log
      setQuestBookImageUrl(url)
    } catch (error) {
      console.error('Error loading quest book image:', error)
      // Fallback: use the direct URL if assetManager fails
      setQuestBookImageUrl('https://uxgejvkoevtexfquafgg.supabase.co/storage/v1/object/public/game-assets/illustrations/journal-quetes.png')
    }
  }

  useEffect(() => {
    if (profile) {
      applyBackground()
    }
  }, [profile, backgroundColor, backgroundOpacity, backgroundEffect, backgroundImage])

  const loadQuests = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setLocalQuests(data || [])
    } catch (error) {
      console.error('Error loading quests:', error)
      setLocalQuests([])
    }
  }

  const loadProfile = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setProfile(data)
        setSelectedUniverse(data.avatar_universe)
        setAvatarDescription(data.avatar_description || '')
        setBackgroundType(data.background_type || 'color')
        setBackgroundColor(data.background_value || '#3d3a3a')
        setBackgroundEffect(data.background_effect || 'none')
        setStickers(data.stickers || [])
        if (data.quest_positions) {
          setQuestPositions(data.quest_positions)
        }
        if (data.quest_book_position) {
          setQuestBookPosition(data.quest_book_position)
        }
        if (data.hidden_quests) {
          setHiddenQuests(data.hidden_quests)
        }
        if (data.background_type === 'image') {
          setBackgroundImage(data.background_value)
        }
        if (data.avatar_url) {
          setGeneratedAvatar(data.avatar_url)
        }
      } else {
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([{ id: user.id }])
          .select()
          .single()

        if (insertError) throw insertError
        setProfile(newProfile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (updates) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...profile,
          ...updates,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error saving profile:', error)
        throw error
      }
      
      await loadProfile()
      return true
    } catch (error) {
      console.error('Error saving profile:', error)
      throw error
    }
  }

  const handleNotificationClick = (echo) => {
    // Notifications liées à l'affichoir (quête complétée, nouvelle quête, commenté, réagi, etc.)
    if (echo.type === 'achievement' || 
        echo.message.includes('complété') || 
        echo.message.includes('quête') || 
        echo.message.includes('commenté') || 
        echo.message.includes('réagi') ||
        echo.message.includes('réaction')) {
      onOpenFeed && onOpenFeed()
    }
    // Notification nouveau joueur → grand registre
    else if (echo.type === 'info' && echo.message.includes('joueur')) {
      onOpenRegistry && onOpenRegistry()
    }
    // Design de tente → ne fait rien (pas de redirection)
    // type 'creative' est ignoré
  }

  const applyBackground = () => {
    if (!pageRef.current) return

    const page = pageRef.current
    let bgStyle = {}

    if (backgroundType === 'image' && backgroundImage) {
      bgStyle.backgroundImage = `url(${backgroundImage})`
      bgStyle.backgroundSize = 'cover'
      bgStyle.backgroundPosition = 'center'
    } else if (backgroundType === 'color') {
      const opacity = backgroundOpacity / 100
      const rgba = hexToRgba(backgroundColor, opacity)
      bgStyle.backgroundColor = rgba
    }

    if (backgroundEffect === 'gradient') {
      bgStyle.background = `linear-gradient(135deg, ${backgroundColor} 0%, ${lightenColor(backgroundColor)} 100%)`
    } else if (backgroundEffect === 'animated-particles') {
      page.classList.add('particles-bg')
    } else if (backgroundEffect === 'pixel-art') {
      page.classList.add('pixel-bg')
    } else if (backgroundEffect === 'holographic') {
      page.classList.add('holographic-bg')
    }

    Object.assign(page.style, bgStyle)
  }

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const lightenColor = (hex) => {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 40)
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 40)
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 40)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const imageData = event.target.result
        setBackgroundImage(imageData)
        setBackgroundType('image')
        await saveProfile({
          background_type: 'image',
          background_value: imageData,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateAvatar = async () => {
    if (!selectedUniverse || !avatarDescription.trim()) {
      setErrorMessage('Please select a universe and describe your avatar!')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    try {
      setGenerating(true)
      setErrorMessage('')
      setSuccessMessage('')

      const universeName = UNIVERSES[selectedUniverse].name
      // Instructions spécifiques selon l'univers
      let styleInstructions = ''
      switch(selectedUniverse) {
        case 'minecraft':
          styleInstructions = 'génère un avatar dans le style de Minecraft (pixel art, blocs cubiques), '
          break
        case 'sims':
          styleInstructions = 'génère un avatar dans le style des Sims (réaliste mais stylisé, personnage 3D), '
          break
        case 'wow':
          styleInstructions = 'génère un avatar dans le style de World of Warcraft (fantasy épique, style cartoon), '
          break
        case 'finalfantasy':
          styleInstructions = 'génère un avatar dans le style de Final Fantasy (anime japonais, détaillé), '
          break
        case 'league':
          styleInstructions = 'génère un avatar dans le style de League of Legends (champion stylisé, fantasy), '
          break
        case 'pacman':
          styleInstructions = 'génère un avatar dans le style de Pacman (rétro, pixel art arcade), '
          break
        case 'pokemon':
          styleInstructions = 'génère un avatar dans le style de Pokémon (anime coloré, style cartoon japonais), '
          break
        case 'zelda':
          styleInstructions = 'génère un avatar dans le style de Zelda (fantasy médiévale, héros légendaire, style Nintendo), '
          break
        default:
          styleInstructions = `génère un avatar dans le style de ${universeName}, `
      }
      
      // Instructions pour le fond
      let backgroundInstructions = ''
      if (avatarBackgroundChoice === 'transparent') {
        backgroundInstructions = 'sans fond, transparent background, no background'
      } else if (avatarBackgroundDescription.trim()) {
        backgroundInstructions = `avec un fond: ${avatarBackgroundDescription}`
      }
      
      const prompt = `${styleInstructions}${avatarDescription}, profile picture, high quality, detailed, centered face, ${backgroundInstructions}`

      console.log('Generating avatar with prompt:', prompt)
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uxgejvkoevtexfquafgg.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Z2VqdmtvZXZ0ZXhmcXVhZmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjE5NjIsImV4cCI6MjA4MzUzNzk2Mn0.kt9snmmPJHEzf-dSJkFr40v2qu3CcjXl9kmo7ORqXPE'
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-avatar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
          },
          body: JSON.stringify({ prompt }),
        }
      )

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Edge Function not deployed. Please deploy it via Supabase Dashboard. See supabase/functions/generate-avatar/README.md for instructions.')
        }
        
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          const errorMsg = errorData.error || errorData.message || `API error: ${response.status}`
          
          if (response.status === 503 || errorMsg.includes('loading')) {
            throw new Error('Model is loading. Please wait 10-20 seconds and try again!')
          }
          throw new Error(errorMsg)
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.startsWith('image/')) {
        const text = await response.text()
        try {
          const jsonData = JSON.parse(text)
          if (jsonData.error) {
            throw new Error(jsonData.error)
          }
        } catch {
          throw new Error('Unexpected response format from API')
        }
        throw new Error('Unexpected response format from API')
      }

      const blob = await response.blob()
      
      if (blob.size === 0) {
        throw new Error('Received empty image from API')
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result
        setGeneratedAvatar(dataUrl)
        setGenerating(false)
      }
      reader.onerror = () => {
        throw new Error('Failed to process image')
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Error generating avatar:', error)
      let errorMsg = 'Oops! Avatar generation failed. '
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMsg += 'This might be a CORS or network issue. Please check your internet connection and try again.'
      } else if (error.message) {
        errorMsg += error.message
      } else {
        errorMsg += 'Try again?'
      }
      
      setErrorMessage(errorMsg)
      setGenerating(false)
      setTimeout(() => setErrorMessage(''), 7000)
    }
  }

  const handleSaveAvatar = async () => {
    if (!generatedAvatar || !user?.id) return

    try {
      setSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      let blob
      if (generatedAvatar.startsWith('data:')) {
        const response = await fetch(generatedAvatar)
        blob = await response.blob()
      } else {
        const response = await fetch(generatedAvatar)
        blob = await response.blob()
      }

      const timestamp = Date.now()
      const fileName = `${user.id}_avatar_${timestamp}.png`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true,
        })

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('does not exist') || uploadError.code === '404') {
          throw new Error('Storage bucket "avatars" not found. Please run the SQL in supabase/migrations/20260111131803_create_avatars_bucket.sql in your Supabase SQL Editor to create it.')
        }
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      await saveProfile({
        avatar_url: publicUrl,
        avatar_universe: selectedUniverse,
        avatar_description: avatarDescription,
      })

      setGeneratedAvatar(publicUrl)
      setSuccessMessage('Avatar saved successfully! ✨')
      setSaving(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving avatar:', error)
      let errorMsg = 'Couldn\'t save avatar. '
      
      if (error.message?.includes('table') && error.message?.includes('not found')) {
        errorMsg = 'Database table not found. Please run supabase/migrations/20260111124652_create_user_profiles.sql in Supabase SQL Editor.'
      } else if (error.message) {
        errorMsg += error.message
      } else {
        errorMsg += 'Check your connection?'
      }
      
      setErrorMessage(errorMsg)
      setSaving(false)
      setTimeout(() => setErrorMessage(''), 7000)
    }
  }

  const addEmojiSticker = (emoji) => {
    const newSticker = {
      id: Date.now().toString(),
      type: 'emoji',
      content: emoji,
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
      scale: 1,
      rotation: 0,
    }
    const updated = [...stickers, newSticker]
    setStickers(updated)
    saveProfile({ stickers: updated })
  }

  const addTextSticker = () => {
    if (!textStickerContent.trim()) return
    const newSticker = {
      id: Date.now().toString(),
      type: 'text',
      content: textStickerContent,
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
      scale: 1,
      rotation: 0,
      fontSize: textStickerSize,
      color: textStickerColor,
    }
    const updated = [...stickers, newSticker]
    setStickers(updated)
    setTextStickerContent('')
    saveProfile({ stickers: updated })
  }

  const handleStickerDrag = (e, stickerId) => {
    if (!arrangeMode) return
    if (e.type === 'mousedown' && !e.target.classList.contains('sticker-resize-handle') && !e.target.classList.contains('sticker-rotate-handle')) {
      e.preventDefault()
      e.stopPropagation()
      setSelectedSticker(stickerId)
      const sticker = stickers.find(s => s.id === stickerId)
      if (!sticker) return
      const startX = e.clientX - sticker.x
      const startY = e.clientY - sticker.y

      const handleMouseMove = (moveEvent) => {
        const newX = moveEvent.clientX - startX
        const newY = moveEvent.clientY - startY
        const updated = stickers.map(s =>
          s.id === stickerId
            ? { ...s, x: Math.max(0, newX), y: Math.max(0, newY) }
            : s
        )
        setStickers(updated)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        saveProfile({ stickers: stickers })
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
  }

  const handleStickerResize = (e, stickerId) => {
    e.stopPropagation()
    const sticker = stickers.find(s => s.id === stickerId)
    const startX = e.clientX
    const startScale = sticker.scale || 1

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newScale = Math.max(0.5, Math.min(3, startScale + deltaX / 100))
      const updated = stickers.map(s =>
        s.id === stickerId ? { ...s, scale: newScale } : s
      )
      setStickers(updated)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      saveProfile({ stickers })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleStickerRotate = (e, stickerId) => {
    if (!arrangeMode) return
    e.stopPropagation()
    e.preventDefault()
    const sticker = stickers.find(s => s.id === stickerId)
    if (!sticker) return
    const stickerElement = e.currentTarget.closest('.sticker-wrapper')
    if (!stickerElement) return
    const rect = stickerElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    const startRotation = sticker.rotation || 0

    const handleMouseMove = (moveEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI)
      let deltaAngle = currentAngle - startAngle
      // Normalize to -180 to 180 range
      if (deltaAngle > 180) deltaAngle -= 360
      if (deltaAngle < -180) deltaAngle += 360
      const newRotation = (startRotation + deltaAngle + 360) % 360
      const updated = stickers.map(s =>
        s.id === stickerId ? { ...s, rotation: newRotation } : s
      )
      setStickers(updated)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      saveProfile({ stickers: stickers })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const deleteSticker = (stickerId) => {
    const updated = stickers.filter(s => s.id !== stickerId)
    setStickers(updated)
    saveProfile({ stickers: updated })
  }

  const handleQuestDragStart = (e, questId) => {
    if (!arrangeMode) return
    e.preventDefault()
    e.stopPropagation()
    setDraggedQuest(questId)
    
    const bubble = e.currentTarget
    const container = bubble.closest('.relative')
    if (!container) return
    
    const containerRect = container.getBoundingClientRect()
    const bubbleRect = bubble.getBoundingClientRect()
    
    const savedPos = questPositions[questId] || {}
    const currentX = savedPos.x !== undefined ? savedPos.x : bubbleRect.left - containerRect.left
    const currentY = savedPos.y !== undefined ? savedPos.y : bubbleRect.top - containerRect.top
    
    const startX = e.clientX - currentX
    const startY = e.clientY - currentY

    const handleMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - startX - containerRect.left
      const newY = moveEvent.clientY - startY - containerRect.top
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      const bubbleWidth = bubbleRect.width
      const bubbleHeight = bubbleRect.height
      
      // Constrain to container bounds
      const constrainedX = Math.max(0, Math.min(newX, containerWidth - bubbleWidth))
      const constrainedY = Math.max(0, Math.min(newY, containerHeight - bubbleHeight))
      
      setQuestPositions({
        ...questPositions,
        [questId]: { ...savedPos, x: constrainedX, y: constrainedY }
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setDraggedQuest(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleQuestResize = (e, questId) => {
    if (!arrangeMode) return
    e.stopPropagation()
    e.preventDefault()
    setResizedQuest(questId)
    const position = questPositions[questId] || { x: 0, y: 0, scale: 1 }
    const startX = e.clientX
    const startScale = position.scale || 1

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newScale = Math.max(0.5, Math.min(2, startScale + deltaX / 100))
      setQuestPositions({
        ...questPositions,
        [questId]: { ...position, scale: newScale }
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setResizedQuest(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleQuestRotate = (e, questId) => {
    if (!arrangeMode) return
    e.stopPropagation()
    e.preventDefault()
    setRotatedQuest(questId)
    const position = questPositions[questId] || { x: 0, y: 0, rotation: 0 }
    const bubble = e.currentTarget.closest('.quest-bubble')
    if (!bubble) return
    
    const bubbleRect = bubble.getBoundingClientRect()
    const centerX = bubbleRect.left + bubbleRect.width / 2
    const centerY = bubbleRect.top + bubbleRect.height / 2
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    const startRotation = position.rotation || 0

    const handleMouseMove = (moveEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI)
      let deltaAngle = currentAngle - startAngle
      if (deltaAngle > 180) deltaAngle -= 360
      if (deltaAngle < -180) deltaAngle += 360
      const newRotation = (startRotation + deltaAngle + 360) % 360
      setQuestPositions({
        ...questPositions,
        [questId]: { ...position, rotation: newRotation }
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setRotatedQuest(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleDeleteQuest = (questId) => {
    if (!arrangeMode) return
    setDeleteQuestModal(questId)
  }

  const handleCreateQuest = async () => {
    if (!newQuest.title.trim() || !newQuest.description.trim()) {
      setErrorMessage('Veuillez remplir tous les champs')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    // Check if user is logged in
    if (!user?.id) {
      setErrorMessage('Vous devez être connecté pour créer une quête')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    try {
      const { data, error } = await supabase
        .from('quests')
        .insert([{
          title: newQuest.title,
          description: newQuest.description,
          category: newQuest.category,
          xp_value: newQuest.xp_value,
          timeline: newQuest.timeline,
          status: 'pending',
          user_id: user.id,
          created_by: user?.email || 'unknown', // Keep for backward compatibility
        }])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Get the created quest data
      const createdQuest = data?.[0]
      
      // Reset form
      setNewQuest({
        title: '',
        description: '',
        category: 'fitness',
        xp_value: 70,
        timeline: 'this week',
      })
      
      // Close modal
      setShowCreateQuestModal(false)
      
      // Reload data locally (no page refresh)
      await loadQuests()
      await loadProfile()
      await loadAllPlayers()
      
      // Trigger immediate echo notification refresh
      await loadVillageEchos()
      
      // Show live notification for the created quest
      if (createdQuest) {
        const username = profile?.username || user?.email?.split('@')[0] || 'Toi'
        showLiveNotification({
          id: `your-quest-${createdQuest.id}`,
          message: `📜 ${username} a créé la quête "${createdQuest.title}" !`,
          time: "À l'instant",
          type: 'quest'
        })
      }
      
      // Show success message
      setSuccessMessage('Quête créée avec succès ! ✨')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error creating quest:', error)
      
      // More detailed error messages
      if (error.code === 'PGRST301') {
        setErrorMessage('Erreur de permission. Vérifiez vos droits d\'accès.')
      } else if (error.message?.includes('auth')) {
        setErrorMessage('Session expirée. Veuillez vous reconnecter.')
        // Optionally redirect to login
        setTimeout(() => {
          supabase.auth.signOut()
        }, 2000)
      } else {
        setErrorMessage('Erreur lors de la création de la quête. Réessayez.')
      }
      
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const handleQuestBookDragStart = (e) => {
    if (!arrangeMode) return
    e.preventDefault()
    e.stopPropagation()
    setDraggedQuestBook(true)
    
    const container = pageRef.current
    if (!container) return
    
    const containerRect = container.getBoundingClientRect()
    const book = e.currentTarget
    const bookRect = book.getBoundingClientRect()
    
    // Get current position from state or calculate from DOM
    const currentX = questBookPosition.x !== undefined ? questBookPosition.x : bookRect.left - containerRect.left
    const currentY = questBookPosition.y !== undefined ? questBookPosition.y : bookRect.top - containerRect.top
    
    const startX = e.clientX - currentX - containerRect.left
    const startY = e.clientY - currentY - containerRect.top

    const handleMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - startX - containerRect.left
      const newY = moveEvent.clientY - startY - containerRect.top
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      const bookWidth = bookRect.width * (questBookPosition.scale || 1)
      const bookHeight = bookRect.height * (questBookPosition.scale || 1)
      
      const constrainedX = Math.max(0, Math.min(newX, containerWidth - bookWidth))
      const constrainedY = Math.max(0, Math.min(newY, containerHeight - bookHeight))
      
      setQuestBookPosition({
        ...questBookPosition,
        x: constrainedX,
        y: constrainedY
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setDraggedQuestBook(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleQuestBookResize = (e) => {
    if (!arrangeMode) return
    e.stopPropagation()
    e.preventDefault()
    setResizedQuestBook(true)
    const startX = e.clientX
    const startScale = questBookPosition.scale || 1

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newScale = Math.max(0.5, Math.min(2, startScale + deltaX / 100))
      setQuestBookPosition({
        ...questBookPosition,
        scale: newScale
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setResizedQuestBook(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleQuestBookRotate = (e) => {
    if (!arrangeMode) return
    e.stopPropagation()
    e.preventDefault()
    setRotatedQuestBook(true)
    const book = e.currentTarget.closest('.quest-book-container')
    if (!book) return
    
    const container = pageRef.current
    if (!container) return
    
    const containerRect = container.getBoundingClientRect()
    const bookRect = book.getBoundingClientRect()
    
    // Get the actual center of the book in viewport coordinates
    const centerX = bookRect.left + bookRect.width / 2
    const centerY = bookRect.top + bookRect.height / 2
    
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    const startRotation = questBookPosition.rotation || 0

    const handleMouseMove = (moveEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI)
      let deltaAngle = currentAngle - startAngle
      if (deltaAngle > 180) deltaAngle -= 360
      if (deltaAngle < -180) deltaAngle += 360
      const newRotation = (startRotation + deltaAngle + 360) % 360
      setQuestBookPosition({
        ...questBookPosition,
        rotation: newRotation
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setRotatedQuestBook(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const confirmDeleteQuest = async (questId) => {
    const updatedHidden = [...hiddenQuests, questId]
    setHiddenQuests(updatedHidden)
    const updated = { ...questPositions }
    delete updated[questId]
    setQuestPositions(updated)
    setDeleteQuestModal(null)
    setSelectedQuestId(null)
    try {
      await saveProfile({ quest_positions: updated, hidden_quests: updatedHidden })
      setSuccessMessage('Quête masquée ! Tu peux la retrouver dans ton journal de quêtes ✨')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (error) {
      setErrorMessage('Erreur lors de la sauvegarde')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleRefreshAvatar = async () => {
    // Use existing profile settings if available
    const universe = selectedUniverse || profile?.avatar_universe
    const description = avatarDescription || profile?.avatar_description || ''
    
    if (!universe || !description.trim()) {
      setErrorMessage('Please update your avatar first to save settings!')
      setTimeout(() => setErrorMessage(''), 3000)
      setShowAvatarSettingsModal(false)
      setShowAvatarModal(true)
      return
    }
    
    setSelectedUniverse(universe)
    setAvatarDescription(description)
    setShowAvatarSettingsModal(false)
    setShowAvatarModal(true)
    await handleGenerateAvatar()
  }

  const handleUpdateAvatar = () => {
    // Load existing settings if available
    if (profile?.avatar_universe) {
      setSelectedUniverse(profile.avatar_universe)
    }
    if (profile?.avatar_description) {
      setAvatarDescription(profile.avatar_description)
    }
    setShowAvatarModal(true)
  }

  const handleRemoveAvatar = async () => {
    const avatarUrl = profile?.avatar_url || generatedAvatar
    if (!avatarUrl || !user?.id) return

    try {
      // Extract filename from URL only if it's a storage URL (not a data URL)
      if (avatarUrl && !avatarUrl.startsWith('data:')) {
        const urlParts = avatarUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]

        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([fileName])

        if (deleteError) {
          console.error('Error deleting avatar from storage:', deleteError)
        }
      }

      // Remove from profile
      await saveProfile({
        avatar_url: null,
        avatar_universe: null,
        avatar_description: null,
      })

      // Update local state immediately - reset to default state
      setGeneratedAvatar(null)
      setSelectedUniverse(null)
      setAvatarDescription('')
      setProfile(prev => prev ? { ...prev, avatar_url: null, avatar_universe: null, avatar_description: null } : null)
      setSuccessMessage('Avatar supprimé avec succès ! ✨')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error removing avatar:', error)
      setErrorMessage('Couldn\'t remove avatar. ' + (error.message || 'Try again?'))
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  // Calculate stats
  const totalXP = effectiveQuests.filter(q => q.status === 'completed').reduce((sum, q) => sum + q.xp_value, 0)
  const activeQuests = effectiveQuests.filter(q => q.status !== 'completed' && !hiddenQuests.includes(q.id))
  const completedQuests = effectiveQuests.filter(q => q.status === 'completed')
  // Calculate level (100 XP per level, starting at level 1)
  const currentLevel = Math.floor(totalXP / 100) + 1

  // Quest book filters
  const filterQuestForBook = (quest) => {
    if (questFilterCategory !== 'all' && quest.category !== questFilterCategory) return false
    if (questFilterTimeline !== 'all' && quest.timeline !== questFilterTimeline) return false
    return true
  }

  const bookActiveQuests = activeQuests.filter(filterQuestForBook)
  const bookCompletedQuests = completedQuests.filter(filterQuestForBook)
  
  // Calculate category progress
  const getCategoryProgress = (category) => {
    const categoryQuests = effectiveQuests.filter(q => q.category === category)
    const completed = categoryQuests.filter(q => q.status === 'completed').length
    const total = categoryQuests.length
    const xp = categoryQuests.filter(q => q.status === 'completed').reduce((sum, q) => sum + q.xp_value, 0)
    return { completed, total, xp, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  const getUserDisplayName = () => {
    const name = user?.email?.split('@')[0] || 'Player'
    return name.toLowerCase()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-300'
      case 'in_progress': return 'bg-blue-300'
      case 'completed': return 'bg-green-300'
      default: return 'bg-gray-300'
    }
  }

  if (loading) {
    return <LoadingScreen message="Chargement de ton campement..." />
  }

  return (
    <div 
      ref={pageRef} 
      className={`min-h-screen pb-24 relative fade-in ${arrangeMode ? 'arrange-mode' : ''}`}
      onClick={(e) => {
        // Deselect quest when clicking outside in arrange mode
        if (arrangeMode && !e.target.closest('.quest-bubble') && !e.target.closest('.quest-resize-handle') && !e.target.closest('.quest-rotate-handle') && !e.target.closest('.quest-delete-handle')) {
          setSelectedQuestId(null)
        }
      }}
    >
      {/* Gridlines overlay - Full screen when in arrange mode */}
      {arrangeMode && <div className="fixed inset-0 arrange-grid-full pointer-events-none" style={{ zIndex: 0 }}></div>}
      
      {/* Top Navigation - Y2K Style */}
        <div className="sticky top-0 z-50 glass-card border-b border-white/30" style={{ paddingTop: '0px', paddingBottom: '0px' }}>
          <div className="flex items-center justify-between gap-4" style={{ paddingLeft: '65px', paddingRight: '65px' }}>
          {/* Left Navigation Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToVillagePlace || onOpenFeed}
              className="nav-button px-6 py-2.5 rounded-2xl flex-shrink-0"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
              }}
            >
              ← Vers la place du village 🎪
            </button>
          </div>
          
          {/* Archivus Character */}
          <div className="flex items-center gap-0 relative z-40" style={{ marginLeft: '-900px' }}>
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
                Archivus : Te revoilà, aventurier !<br />Tu es ici chez toi {getUserDisplayName()}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 glass-card px-6 py-3 rounded-3xl text-green-700 font-semibold soft-shadow fade-in">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 glass-card px-6 py-3 rounded-3xl text-red-700 font-semibold soft-shadow fade-in">
          {errorMessage}
        </div>
      )}

      {/* Live notifications stack - Top of Écho du Village */}
      <div className="fixed z-50 flex flex-col items-start gap-2" style={{ bottom: '500px', left: '35px', maxWidth: '320px' }}>
        {liveEchoNotifications.map((notification) => (
          <div
            key={notification.notificationId}
            className="px-4 py-3 rounded-2xl w-full fade-in cursor-pointer hover:scale-105 transition-all"
            onClick={() => {
              const isClickable = (notification.type === 'achievement' || 
                notification.message.includes('complété') || 
                notification.message.includes('quête') || 
                notification.message.includes('commenté') || 
                notification.message.includes('réagi') ||
                notification.message.includes('réaction') ||
                (notification.type === 'info' && notification.message.includes('joueur')))
              
              if (isClickable) {
                handleNotificationClick(notification)
              }
            }}
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.98), rgba(245, 235, 220, 0.98))',
              border: '2px solid rgba(139, 115, 85, 0.4)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <div className="text-sm font-semibold text-amber-900 mb-1">
              {notification.message}
            </div>
            <div className="text-xs text-amber-700/70 font-medium">
              {notification.timestamp ? formatTimeAgo(Date.now() - notification.timestamp) : (notification.time || 'À l\'instant')}
            </div>
          </div>
        ))}
      </div>

      {/* Écho du Village - Fixed Bottom Left */}
      <div className="fixed z-40" style={{ bottom: '24px', width: '320px', left: '35px' }}>
        <div 
          className={`glass-card rounded-3xl soft-shadow relative overflow-hidden transition-all duration-300 ${
            villageEchosOpen ? 'p-4' : 'p-3'
          }`}
          style={{
            background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.95), rgba(126, 34, 206, 0.95))',
            border: '2px solid rgba(147, 51, 234, 0.6)',
            boxShadow: 'inset 0 0 20px rgba(147, 51, 234, 0.3), 0 8px 32px rgba(0,0,0,0.2)',
            maxHeight: villageEchosOpen ? '400px' : 'auto',
          }}
        >
          {/* Parchemin texture effect */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)
            `,
            pointerEvents: 'none',
          }}></div>
          
          <div className="relative z-10">
            <div 
              className={`text-lg font-semibold text-center flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${
                villageEchosOpen ? 'mb-3' : 'mb-0'
              }`}
              onClick={() => setVillageEchosOpen(!villageEchosOpen)}
              style={{ 
                fontFamily: "'Cinzel Decorative', serif",
                color: '#ffffff'
              }}
            >
              <span className="text-2xl">📜</span>
              <span>Écho du Village</span>
              <span
                className="ml-2 text-white transition-transform duration-300"
                style={{
                  transform: villageEchosOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </span>
            </div>
            
            <div 
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: villageEchosOpen ? '320px' : '0px',
                opacity: villageEchosOpen ? 1 : 0,
              }}
            >
              <div className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                {villageEchos.length > 0 ? (
                  villageEchos.map((echo) => {
                    // Déterminer si la notification est cliquable
                    const isClickable = (echo.type === 'achievement' || 
                      echo.message.includes('complété') || 
                      echo.message.includes('quête') || 
                      echo.message.includes('commenté') || 
                      echo.message.includes('réagi') ||
                      echo.message.includes('réaction') ||
                      (echo.type === 'info' && echo.message.includes('joueur')))
                    
                    return (
                      <div
                        key={echo.id}
                        onClick={() => {
                          if (isClickable) {
                            handleNotificationClick(echo)
                            setVillageEchosOpen(false)
                          }
                        }}
                        className={`p-3 rounded-2xl bg-white/90 border border-white/40 fade-in ${
                          isClickable ? 'cursor-pointer hover:bg-white transition-all' : ''
                        }`}
                        style={{
                          animationDelay: `${echo.id * 0.1}s`,
                        }}
                      >
                        <div className="text-sm font-semibold text-purple-900 mb-1">
                          {echo.message}
                        </div>
                        <div className="text-xs text-purple-700/70 font-medium">
                          {echo.timestamp ? formatTimeAgo(Date.now() - echo.timestamp) : (echo.time || 'À l\'instant')}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-sm text-white/80 text-center py-4 font-medium">
                    Aucun écho pour le moment...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ta Progression - Fixed Left */}
      <div className="fixed z-40" style={{ top: '162px', width: '320px', left: '35px' }}>
        <div 
          className={`glass-card rounded-3xl soft-shadow relative overflow-hidden transition-all duration-300 ${
            progressionPanelOpen ? 'p-4' : 'p-3'
          }`}
          style={{
            background: 'linear-gradient(to bottom, rgba(250, 240, 230, 1), rgba(245, 235, 220, 1))',
            border: '2px solid rgba(139, 115, 85, 0.3)',
            boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 8px 32px rgba(0,0,0,0.1)',
            maxHeight: progressionPanelOpen ? '400px' : 'auto',
          }}
        >
          {/* Parchemin texture effect */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 115, 85, 0.1) 2px, rgba(139, 115, 85, 0.1) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 115, 85, 0.1) 2px, rgba(139, 115, 85, 0.1) 4px)
            `,
            pointerEvents: 'none',
          }}></div>
          
          <div className="relative z-10">
            <div 
              className={`text-lg font-semibold text-center flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${
                progressionPanelOpen ? 'mb-3' : 'mb-0'
              }`}
              onClick={() => setProgressionPanelOpen(!progressionPanelOpen)}
              style={{ 
                fontFamily: "'Cinzel Decorative', serif",
                color: '#4b4136'
              }}
            >
              <span className="text-2xl">🗺️</span>
              <span>Ta Progression</span>
              <span
                className="ml-2 text-amber-800 transition-transform duration-300"
                style={{
                  transform: progressionPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </span>
            </div>
            
            <div 
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: progressionPanelOpen ? '320px' : '0px',
                opacity: progressionPanelOpen ? 1 : 0,
              }}
            >
              <div className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-800/30 scrollbar-track-transparent">
                {recurringQuests.length > 0 ? (
                  recurringQuests.map((quest) => {
                    const checkpoints = getQuestCheckpoints(quest.id)
                    const completedCount = checkpoints.filter(c => c.completed).length
                    const progressPercentage = (completedCount / checkpoints.length) * 100
                    
                    return (
                      <div
                        key={quest.id}
                        className="p-3 rounded-2xl bg-white/40 border border-amber-800/20 cursor-pointer hover:bg-white/60 transition-all"
                        onClick={() => setSelectedProgressQuest(selectedProgressQuest === quest.id ? null : quest.id)}
                      >
                        <div className="text-sm font-semibold text-amber-900 mb-1">
                          {quest.title}
                        </div>
                        <div className="text-xs text-amber-700/70 font-medium mb-2">
                          {completedCount}/{checkpoints.length} checkpoints
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full h-2 bg-amber-200/50 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        
                        {/* Checkpoints detail (expandable) */}
                        {selectedProgressQuest === quest.id && (
                          <div className="mt-2 pt-2 border-t border-amber-800/20">
                            <div className="grid grid-cols-6 gap-1">
                              {checkpoints.map((checkpoint, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleCheckpoint(quest.id, index)
                                  }}
                                  className="aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all hover:scale-110"
                                  style={{
                                    background: checkpoint.completed 
                                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8))'
                                      : 'rgba(255, 255, 255, 0.6)',
                                    border: '1px solid rgba(139, 115, 85, 0.3)',
                                    color: checkpoint.completed ? '#fff' : '#78350f',
                                  }}
                                  title={checkpoint.label}
                                >
                                  {checkpoint.completed ? '✓' : (index + 1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-sm text-amber-800/60 text-center py-4 font-medium">
                    Aucune quête récurrente en cours...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 relative" style={{ zIndex: 1 }}>
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Y2K Style */}
          <div className="col-span-12 md:col-span-3 space-y-4">
          </div>

          {/* Right Sidebar - Y2K Style */}
          <div className="col-span-12 md:col-span-3 space-y-4">
          </div>
        </div>
      </div>

      {/* Avatar - Fixed Top Right (Aligned with Écho du Village) */}
      <div className="fixed z-40 flex flex-col items-center gap-4" style={{ top: '162px', gap: '16px', right: '35px' }}>
        <div 
          className="relative" 
          style={{ width: '192px', height: '192px' }}
          onMouseLeave={() => {
            avatarMenuTimeoutRef.current = setTimeout(() => {
              setAvatarMenuOpen(false)
            }, 300)
          }}
          onMouseEnter={() => {
            if (avatarMenuTimeoutRef.current) {
              clearTimeout(avatarMenuTimeoutRef.current)
              avatarMenuTimeoutRef.current = null
            }
          }}
        >
          <div 
            ref={avatarRef}
            onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
            className={`w-48 h-48 rounded-full relative overflow-visible cursor-pointer hover:scale-105 transition-transform ${
              !generatedAvatar && !profile?.avatar_url ? 'highlight-avatar' : ''
            }`}
            style={{
              ...(!generatedAvatar && !profile?.avatar_url ? {
                border: '3px solid rgba(255, 215, 0, 0.8)',
                boxShadow: `
                  0 0 20px rgba(255, 215, 0, 0.6),
                  0 0 40px rgba(255, 215, 0, 0.4),
                  inset 0 0 20px rgba(255, 215, 0, 0.2)
                `,
                animation: 'pulse-glow 2s ease-in-out infinite',
              } : {})
            }}
          >
            <img
              src={generatedAvatar || profile?.avatar_url || 'https://via.placeholder.com/200'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover pointer-events-none"
            />
            
            {/* Message si pas d'avatar */}
            {!generatedAvatar && !profile?.avatar_url && (
              <div 
                className="absolute inset-0 flex items-center justify-center rounded-full pointer-events-none"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                <p 
                  className="text-center px-4 text-white font-semibold"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    fontSize: '0.9rem',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                    lineHeight: '1.2',
                  }}
                >
                  Modifie ton apparence ici
                </p>
              </div>
            )}
          </div>

          {/* Avatar Menu */}
          {avatarMenuOpen && (
            <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 z-50 space-y-3">
              {/* Change Avatar */}
              <div className="relative group">
                <button
                  onClick={() => {
                    handleUpdateAvatar()
                    setAvatarMenuOpen(false)
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = ''
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ''
                  }}
                  className="glass-card rounded-full p-3 soft-shadow hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#4b4136', pointerEvents: 'none' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[70]">
                  <div 
                    className="glass-card px-3 py-2 rounded-2xl text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                      border: '2px solid rgba(139, 115, 85, 0.3)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      color: '#4b4136',
                    }}
                  >
                    Change ton Avatar
                  </div>
                </div>
              </div>
              
              {/* Remove Avatar */}
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre avatar ?')) {
                      handleRemoveAvatar()
                    }
                    setAvatarMenuOpen(false)
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.currentTarget.style.transform = 'scale(0.95)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = ''
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ''
                  }}
                  className="glass-card rounded-full p-3 soft-shadow hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#dc2626', pointerEvents: 'none' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[70]">
                  <div 
                    className="glass-card px-3 py-2 rounded-2xl text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                      border: '2px solid rgba(139, 115, 85, 0.3)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      color: '#dc2626',
                    }}
                  >
                    Supprime ton Avatar
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tes compagnons - Below Avatar */}
        <div 
          className="rounded-3xl px-4 py-3 soft-shadow"
          style={{
            background: 'linear-gradient(to bottom, rgba(250, 240, 230, 1), rgba(245, 235, 220, 1))',
            border: '2px solid rgba(139, 115, 85, 0.3)',
            boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 8px 32px rgba(0,0,0,0.1)',
            width: '255px',
          }}
        >
          <h3 
            className="text-base font-semibold mb-3 text-center"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#4b4136',
            }}
          >
            Tes compagnons
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {companions.map((companion) => (
              <button
                key={companion.id}
                onClick={() => {
                  setSelectedCompanion(companion)
                }}
                className="rounded-full overflow-hidden hover:scale-110 transition-transform cursor-pointer"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid rgba(139, 115, 85, 0.3)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                title={companion.username || companion.email?.split('@')[0] || 'Compagnon'}
              >
                <img
                  src={companion.avatar_url || 'https://via.placeholder.com/40'}
                  alt={companion.username || 'Companion'}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {companions.length === 0 && (
              <div 
                className="w-full text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowAllPlayers(true)}
              >
                <p className="text-sm font-medium mb-1" style={{ color: '#4b4136' }}>
                  Ton campement semble bien calme...
                </p>
                <p className="text-xs italic" style={{ color: '#4b4136' }}>
                  Clique ici pour découvrir les aventuriers du village et suivre tes compagnons favoris !
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Aménage ta Tente - sous Tes compagnons */}
        <div 
          className="relative"
          style={{ width: '255px' }}
          onMouseLeave={() => {
            tentMenuTimeoutRef.current = setTimeout(() => setTentMenuOpen(false), 300)
          }}
          onMouseEnter={() => {
            if (tentMenuTimeoutRef.current) {
              clearTimeout(tentMenuTimeoutRef.current)
              tentMenuTimeoutRef.current = null
            }
          }}
        >
          <button
            onClick={() => setTentMenuOpen(!tentMenuOpen)}
            className="pill-button glass-card px-4 py-3 rounded-3xl font-semibold transition-all soft-shadow flex items-center justify-center gap-2 bg-gradient-to-r from-blue-200/80 via-purple-200/80 to-blue-200/80 hover:from-blue-300/80 hover:via-purple-300/80 hover:to-blue-300/80 w-full"
            style={{ 
              color: '#f4c99c',
              fontFamily: "'Cinzel Decorative', serif",
            }}
          >
            <span className="text-xl">🏕️</span>
            <span>Aménage ta Tente</span>
          </button>

          {tentMenuOpen && (
            <div 
              className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 z-50 space-y-3"
              onMouseEnter={() => {
                if (tentMenuTimeoutRef.current) {
                  clearTimeout(tentMenuTimeoutRef.current)
                  tentMenuTimeoutRef.current = null
                }
              }}
            >
              {/* Choisis un fond */}
              <div className="relative group">
                <button
                  onClick={() => {
                    setShowSettingsModal(true)
                    setTentMenuOpen(false)
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)' }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
                  className="glass-card rounded-full p-3 soft-shadow hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    width: '48px', height: '48px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="text-xl">🖼️</span>
                </button>
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[70]">
                  <div className="glass-card px-3 py-2 rounded-2xl text-sm font-semibold" style={{ background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))', border: '2px solid rgba(139, 115, 85, 0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', color: '#4b4136' }}>
                    Choisis un fond
                  </div>
                </div>
              </div>
              {/* Accroche des posters */}
              <div className="relative group">
                <button className="glass-card rounded-full p-3 soft-shadow cursor-not-allowed opacity-50" style={{ background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))', border: '2px solid rgba(139, 115, 85, 0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled>
                  <span className="text-xl">🖼️</span>
                </button>
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[70]">
                  <div className="glass-card px-3 py-2 rounded-2xl text-sm font-semibold" style={{ background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))', border: '2px solid rgba(139, 115, 85, 0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', color: '#4b4136' }}>
                    Accroche des posters (bientôt disponible)
                  </div>
                </div>
              </div>
              {/* Ajoute des stickers */}
              <div className="relative group">
                <button className="glass-card rounded-full p-3 soft-shadow cursor-not-allowed opacity-50" style={{ background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))', border: '2px solid rgba(139, 115, 85, 0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled>
                  <span className="text-xl">✨</span>
                </button>
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[70]">
                  <div className="glass-card px-3 py-2 rounded-2xl text-sm font-semibold" style={{ background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))', border: '2px solid rgba(139, 115, 85, 0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', color: '#4b4136' }}>
                    Ajoute des stickers (bientôt disponible)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spacing between Aménage ta Tente and Quest Book */}
        <div style={{ height: '16px' }}></div>

        {/* Quest Book - Carnet de Quêtes */}
        <div
          className="relative cursor-pointer group transition-all duration-300 hover:scale-105"
          onClick={() => setShowQuestBook(true)}
          style={{ width: '255px' }}
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute -inset-2 bg-gradient-to-br from-amber-200/30 via-pink-200/20 to-purple-200/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          
          {/* Quest Book Image */}
          <div className="relative z-10 w-full">
            {questBookImageUrl ? (
              <img
                src={questBookImageUrl}
                alt="Carnet de Quêtes"
                className="w-full h-auto object-contain drop-shadow-2xl transition-all duration-300 group-hover:drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))',
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/240x180?text=Carnet+de+Quêtes'
                }}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center glass-card rounded-3xl" style={{
                background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.9), rgba(245, 235, 220, 0.9))',
                border: '2px solid rgba(139, 115, 85, 0.3)',
              }}>
                <p className="text-sm font-semibold" style={{ color: '#4b4136' }}>Chargement...</p>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Bottom Stats Bar - Y2K Style (Floating Frosted Glass) */}
      <div 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 rounded-3xl px-6 py-3 soft-shadow"
        style={{
          background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.9), rgba(245, 235, 220, 0.9))',
          border: '2px solid rgba(139, 115, 85, 0.3)',
          boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex gap-6 items-center text-sm flex-wrap justify-center">
          <div className="flex items-center gap-2" style={{ color: '#4b4136' }}>
            <span className="text-xl">⚔️</span>
            <span className="font-semibold">Niveau {currentLevel}</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: '#4b4136' }}>
            <span className="text-xl">🏆</span>
            <span className="font-semibold">{completedQuests.length}/{effectiveQuests.length} quêtes terminées</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: '#4b4136' }}>
            <span className="text-xl">📋</span>
            <span className="font-semibold">{activeQuests.length} {activeQuests.length === 1 ? 'quête' : 'quêtes'} en cours</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: '#4b4136' }}>
            <span className="text-xl">⭐</span>
            <span className="font-semibold">{totalXP} XP</span>
          </div>
        </div>
      </div>

      {/* Companion Profile Modal */}
      {selectedCompanion && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedCompanion(null)}>
          <div 
            className="rounded-3xl p-6 max-w-md w-full soft-shadow" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
              border: '2px solid rgba(139, 115, 85, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                Profil de {selectedCompanion.username || selectedCompanion.email?.split('@')[0] || 'Compagnon'}
              </h2>
              <button 
                onClick={() => setSelectedCompanion(null)} 
                className="text-2xl font-semibold hover:scale-110 transition-transform"
                style={{ color: '#4b4136' }}
              >
                ×
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-4">
              <img
                src={selectedCompanion.avatar_url || 'https://via.placeholder.com/100'}
                alt={selectedCompanion.username || 'Companion'}
                className="w-24 h-24 rounded-full object-cover mb-3"
                style={{
                  border: '2px solid rgba(139, 115, 85, 0.3)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              />
              
              {/* Follow/Unfollow Button */}
              <button
                onClick={() => handleFollowUser(selectedCompanion.id)}
                className="px-6 py-2 rounded-2xl font-semibold transition-all hover:scale-105"
                style={{
                  background: followingIds.includes(selectedCompanion.id)
                    ? 'linear-gradient(to bottom, rgba(139, 115, 85, 0.3), rgba(101, 84, 62, 0.3))'
                    : 'linear-gradient(to bottom, rgba(139, 115, 85, 0.9), rgba(101, 84, 62, 0.9))',
                  border: '2px solid rgba(184, 134, 11, 0.6)',
                  color: followingIds.includes(selectedCompanion.id) ? '#4b4136' : '#fef3c7',
                  fontFamily: "'Cinzel Decorative', serif",
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
              >
                {followingIds.includes(selectedCompanion.id) ? '✓ Suivi' : '+ Suivre'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                <span className="font-semibold" style={{ color: '#4b4136' }}>⚔️ Niveau</span>
                <span style={{ color: '#4b4136' }}>{selectedCompanion.level || 1}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                <span className="font-semibold" style={{ color: '#4b4136' }}>🏆 Quêtes terminées</span>
                <span style={{ color: '#4b4136' }}>{selectedCompanion.completed_quests || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                <span className="font-semibold" style={{ color: '#4b4136' }}>📋 Quêtes en cours</span>
                <span style={{ color: '#4b4136' }}>{selectedCompanion.active_quests || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                <span className="font-semibold" style={{ color: '#4b4136' }}>⭐ Points XP</span>
                <span style={{ color: '#4b4136' }}>{selectedCompanion.total_xp || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Players Modal */}
      {showAllPlayers && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAllPlayers(false)}>
          <div 
            className="rounded-3xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto soft-shadow" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
              border: '2px solid rgba(139, 115, 85, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <h2 
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Des aventuriers avec qui tu devrais t'entendre
                </h2>
                <p 
                  className="text-xl italic font-medium mt-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#4b4136',
                  }}
                >
                  Tous les aventuriers du village sont dans le Grand Registre
                </p>
              </div>
              <button 
                onClick={() => setShowAllPlayers(false)} 
                className="text-2xl font-semibold hover:scale-110 transition-transform"
                style={{ color: '#4b4136' }}
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allPlayers.map((player) => {
                const isFollowing = followingIds.includes(player.id)
                return (
                  <div key={player.id} className="relative">
                    <button
                      onClick={async () => {
                        // Load companion stats
                        const { data: companionQuests } = await supabase
                          .from('quests')
                          .select('status, xp_value')
                          .eq('user_id', player.id)
                        
                        const completedQuests = (companionQuests || []).filter(q => q.status === 'completed')
                        const activeQuests = (companionQuests || []).filter(q => q.status !== 'completed')
                        const totalXP = completedQuests.reduce((sum, q) => sum + (q.xp_value || 0), 0)
                        const level = Math.floor(totalXP / 100) + 1
                        
                        setSelectedCompanion({
                          ...player,
                          completed_quests: completedQuests.length,
                          active_quests: activeQuests.length,
                          total_xp: totalXP,
                          level: level
                        })
                        setShowAllPlayers(false)
                      }}
                      className="flex flex-col items-center p-3 rounded-xl hover:scale-105 transition-transform cursor-pointer w-full"
                      style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        border: isFollowing ? '2px solid rgba(34, 197, 94, 0.6)' : '2px solid rgba(139, 115, 85, 0.3)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div className="relative">
                        <img
                          src={player.avatar_url || 'https://via.placeholder.com/60'}
                          alt={player.username || 'Player'}
                          className="w-16 h-16 rounded-full object-cover mb-2"
                          style={{
                            border: '2px solid rgba(139, 115, 85, 0.3)',
                          }}
                        />
                        {isFollowing && (
                          <div 
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            style={{
                              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))',
                              border: '2px solid white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-center" style={{ color: '#4b4136' }}>
                        {player.username || player.email?.split('@')[0] || 'Joueur'}
                      </p>
                    </button>
                  </div>
                )
              })}
              {allPlayers.length === 0 && (
                <p className="col-span-full text-center text-sm italic" style={{ color: '#4b4136' }}>
                  Aucun autre joueur pour le moment
                </p>
              )}
            </div>
            
            {/* Button to Grand Registre */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setShowAllPlayers(false)
                  onOpenRegistry && onOpenRegistry()
                }}
                className="nav-button px-6 py-2.5 rounded-2xl"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                }}
              >
                📜 Consulter le Grand Registre →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Settings Modal - Y2K Style */}

      {/* Avatar Generator Modal - Harmonisé avec l'app */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAvatarModal(false)}>
          <div 
            className="rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto soft-shadow" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
              border: '2px solid rgba(139, 115, 85, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                Tu souhaites changer d'apparence ?
              </h2>
              <button 
                onClick={() => setShowAvatarModal(false)} 
                className="text-2xl font-semibold hover:scale-110 transition-transform"
                style={{ color: '#4b4136' }}
              >
                ×
              </button>
            </div>
            
            {/* Choisis ton univers */}
            <div className="mb-4">
              <h3 
                className="text-lg font-semibold mb-3"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                Choisis un univers
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(UNIVERSES).map(([key, universe]) => {
                  // Extraire la couleur de l'univers (ex: 'bg-green-400' -> 'green-400')
                  const colorClass = universe.color.replace('bg-', '')
                  const colorMap = {
                    'green-400': { hover: 'rgba(74, 222, 128, 0.3)', border: 'rgba(34, 197, 94, 0.8)', ring: 'rgba(34, 197, 94, 0.6)' },
                    'yellow-400': { hover: 'rgba(250, 204, 21, 0.3)', border: 'rgba(234, 179, 8, 0.8)', ring: 'rgba(234, 179, 8, 0.6)' },
                    'blue-400': { hover: 'rgba(96, 165, 250, 0.3)', border: 'rgba(59, 130, 246, 0.8)', ring: 'rgba(59, 130, 246, 0.6)' },
                    'purple-400': { hover: 'rgba(192, 132, 252, 0.3)', border: 'rgba(168, 85, 247, 0.8)', ring: 'rgba(168, 85, 247, 0.6)' },
                    'red-400': { hover: 'rgba(248, 113, 113, 0.3)', border: 'rgba(239, 68, 68, 0.8)', ring: 'rgba(239, 68, 68, 0.6)' },
                    'yellow-300': { hover: 'rgba(253, 224, 71, 0.3)', border: 'rgba(234, 179, 8, 0.8)', ring: 'rgba(234, 179, 8, 0.6)' },
                    'pink-400': { hover: 'rgba(244, 114, 182, 0.3)', border: 'rgba(236, 72, 153, 0.8)', ring: 'rgba(236, 72, 153, 0.6)' },
                    'emerald-400': { hover: 'rgba(52, 211, 153, 0.3)', border: 'rgba(16, 185, 129, 0.8)', ring: 'rgba(16, 185, 129, 0.6)' },
                  }
                  const colors = colorMap[colorClass] || { hover: 'rgba(139, 115, 85, 0.3)', border: 'rgba(139, 115, 85, 0.8)', ring: 'rgba(139, 115, 85, 0.6)' }
                  const isSelected = selectedUniverse === key
                  
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedUniverse(key)
                        setAvatarDescription('')
                      }}
                      className={`rounded-lg p-2 text-center transition-all hover:scale-105 soft-shadow ${
                        isSelected ? '' : ''
                      }`}
                      style={{
                        background: isSelected 
                          ? `linear-gradient(to bottom, ${colors.hover}, ${colors.hover})`
                          : 'rgba(255, 255, 255, 0.4)',
                        border: isSelected 
                          ? `3px solid ${colors.border}`
                          : '2px solid rgba(139, 115, 85, 0.3)',
                        boxShadow: isSelected 
                          ? `0 0 0 3px ${colors.ring}, 0 4px 16px rgba(0,0,0,0.1)`
                          : '0 4px 16px rgba(0,0,0,0.1)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = colors.hover
                          e.currentTarget.style.background = `linear-gradient(to bottom, ${colors.hover}, ${colors.hover})`
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(139, 115, 85, 0.3)'
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'
                        }
                      }}
                    >
                      <div className="text-2xl mb-0.5">{universe.emoji}</div>
                      <div 
                        className="font-semibold text-[10px] leading-tight"
                        style={{ color: '#4b4136' }}
                      >
                        {universe.name}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedUniverse && (
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label 
                    className="block text-base font-semibold mb-2"
                    style={{
                      fontFamily: "'Cinzel Decorative', serif",
                      color: '#4b4136',
                    }}
                  >
                    Décris ton avatar
                  </label>
                  <input
                    type="text"
                    value={avatarDescription}
                    onChange={(e) => setAvatarDescription(e.target.value)}
                    placeholder={UNIVERSES[selectedUniverse].placeholder}
                    className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '2px solid rgba(139, 115, 85, 0.3)',
                      color: '#4b4136',
                      fontSize: '0.875rem',
                    }}
                    title={UNIVERSES[selectedUniverse].placeholder}
                  />
                </div>

                {/* Choix du fond */}
                <div>
                  <label 
                    className="block text-base font-semibold mb-2"
                    style={{
                      fontFamily: "'Cinzel Decorative', serif",
                      color: '#4b4136',
                    }}
                  >
                    Fond de l'avatar
                  </label>
                  <div className="flex gap-3 mb-3">
                    <button
                      onClick={() => {
                        setAvatarBackgroundChoice('transparent')
                        setAvatarBackgroundDescription('')
                      }}
                      className="flex-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all"
                      style={{
                        background: avatarBackgroundChoice === 'transparent'
                          ? 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))'
                          : 'rgba(255, 255, 255, 0.4)',
                        border: avatarBackgroundChoice === 'transparent'
                          ? '3px solid rgba(184, 134, 11, 0.6)'
                          : '2px solid rgba(139, 115, 85, 0.3)',
                        color: '#4b4136',
                        fontFamily: "'Cinzel Decorative', serif",
                        boxShadow: avatarBackgroundChoice === 'transparent'
                          ? '0 0 0 3px rgba(184, 134, 11, 0.3), 0 4px 12px rgba(0,0,0,0.15)'
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        transform: avatarBackgroundChoice === 'transparent' ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      ✨ Sans fond
                    </button>
                    <button
                      onClick={() => setAvatarBackgroundChoice('custom')}
                      className="flex-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all"
                      style={{
                        background: avatarBackgroundChoice === 'custom'
                          ? 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))'
                          : 'rgba(255, 255, 255, 0.4)',
                        border: avatarBackgroundChoice === 'custom'
                          ? '3px solid rgba(184, 134, 11, 0.6)'
                          : '2px solid rgba(139, 115, 85, 0.3)',
                        color: '#4b4136',
                        fontFamily: "'Cinzel Decorative', serif",
                        boxShadow: avatarBackgroundChoice === 'custom'
                          ? '0 0 0 3px rgba(184, 134, 11, 0.3), 0 4px 12px rgba(0,0,0,0.15)'
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        transform: avatarBackgroundChoice === 'custom' ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      🎨 Fond personnalisé
                    </button>
                  </div>
                  {avatarBackgroundChoice === 'custom' && (
                    <input
                      type="text"
                      value={avatarBackgroundDescription}
                      onChange={(e) => setAvatarBackgroundDescription(e.target.value)}
                      placeholder="Décris le fond souhaité (ex: forêt magique, ciel étoilé, château médiéval...)"
                      className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        border: '2px solid rgba(139, 115, 85, 0.3)',
                        color: '#4b4136',
                        fontSize: '0.875rem',
                      }}
                    />
                  )}
                </div>

                {/* Preview */}
                <div 
                  className="rounded-xl p-4 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  }}
                >
                  <h3 
                    className="text-base font-semibold mb-3"
                    style={{
                      fontFamily: "'Cinzel Decorative', serif",
                      color: '#4b4136',
                    }}
                  >
                    Aperçu
                  </h3>
                  {generatedAvatar || profile?.avatar_url ? (
                    <div className="w-32 h-32 mx-auto mb-3 rounded-full overflow-hidden">
                      <img
                        src={generatedAvatar || profile?.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="text-5xl mb-2">
                      {UNIVERSES[selectedUniverse].emoji}
                    </div>
                  )}
                  {avatarDescription && (
                    <p 
                      className="text-xs font-medium"
                      style={{ color: '#4b4136' }}
                    >
                      {avatarDescription}
                    </p>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  {generatedAvatar && generatedAvatar.startsWith('data:') ? (
                    <>
                      <button
                        onClick={handleSaveAvatar}
                        disabled={saving}
                        className="flex-1 px-4 py-2 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))',
                          border: '2px solid rgba(34, 197, 94, 0.6)',
                          color: '#ffffff',
                          fontFamily: "'Cinzel Decorative', serif",
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
                      </button>
                      <button
                        onClick={handleGenerateAvatar}
                        disabled={generating || !avatarDescription.trim()}
                        className="flex-1 px-4 py-2 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(139, 115, 85, 0.9), rgba(101, 84, 62, 0.9))',
                          border: '2px solid rgba(184, 134, 11, 0.6)',
                          color: '#fef3c7',
                          fontFamily: "'Cinzel Decorative', serif",
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {generating ? (
                          <>
                            <span>✨ Régénération</span>
                            <div className="loading-dots" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', marginLeft: '6px', verticalAlign: 'middle', marginBottom: '-4px' }}>
                              <span 
                                className="dot" 
                                style={{ 
                                  width: '6px', 
                                  height: '6px', 
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.8), rgba(212, 175, 55, 0.8))',
                                  boxShadow: '0 1px 4px rgba(184, 134, 11, 0.3)',
                                  animation: 'dot-bounce-small 1.4s ease-in-out infinite',
                                  animationDelay: '0s'
                                }}
                              ></span>
                              <span 
                                className="dot" 
                                style={{ 
                                  width: '6px', 
                                  height: '6px', 
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.8), rgba(212, 175, 55, 0.8))',
                                  boxShadow: '0 1px 4px rgba(184, 134, 11, 0.3)',
                                  animation: 'dot-bounce-small 1.4s ease-in-out infinite',
                                  animationDelay: '0.2s'
                                }}
                              ></span>
                              <span 
                                className="dot" 
                                style={{ 
                                  width: '6px', 
                                  height: '6px', 
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.8), rgba(212, 175, 55, 0.8))',
                                  boxShadow: '0 1px 4px rgba(184, 134, 11, 0.3)',
                                  animation: 'dot-bounce-small 1.4s ease-in-out infinite',
                                  animationDelay: '0.4s'
                                }}
                              ></span>
                            </div>
                          </>
                        ) : (
                          '✨ Régénérer'
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleGenerateAvatar}
                      disabled={generating || !avatarDescription.trim()}
                      className="w-full px-4 py-2 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(139, 115, 85, 0.9), rgba(101, 84, 62, 0.9))',
                        border: '2px solid rgba(184, 134, 11, 0.6)',
                        color: '#fef3c7',
                        fontFamily: "'Cinzel Decorative', serif",
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {generating ? (
                        <>
                          <span>✨ Génération</span>
                          <div className="loading-dots" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', marginLeft: '6px', verticalAlign: 'middle', marginBottom: '-4px' }}>
                            <span 
                              className="dot" 
                              style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.8), rgba(212, 175, 55, 0.8))',
                                boxShadow: '0 1px 4px rgba(184, 134, 11, 0.3)',
                                animation: 'dot-bounce-small 1.4s ease-in-out infinite',
                                animationDelay: '0s'
                              }}
                            ></span>
                            <span 
                              className="dot" 
                              style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.8), rgba(212, 175, 55, 0.8))',
                                boxShadow: '0 1px 4px rgba(184, 134, 11, 0.3)',
                                animation: 'dot-bounce-small 1.4s ease-in-out infinite',
                                animationDelay: '0.2s'
                              }}
                            ></span>
                            <span 
                              className="dot" 
                              style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.8), rgba(212, 175, 55, 0.8))',
                                boxShadow: '0 1px 4px rgba(184, 134, 11, 0.3)',
                                animation: 'dot-bounce-small 1.4s ease-in-out infinite',
                                animationDelay: '0.4s'
                              }}
                            ></span>
                          </div>
                        </>
                      ) : (
                        '✨ Générer'
                      )}
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <div 
                    className="p-3 rounded-xl font-semibold text-center text-xs"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '2px solid rgba(239, 68, 68, 0.4)',
                      color: '#dc2626',
                    }}
                  >
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div 
                    className="p-3 rounded-xl font-semibold text-center text-xs"
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '2px solid rgba(34, 197, 94, 0.4)',
                      color: '#16a34a',
                    }}
                  >
                    {successMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quest Book Modal - 📜 Carnet de Quêtes */}
      {showQuestBook && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQuestBook(false)}>
          <div 
            className="rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto soft-shadow" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
              border: '2px solid rgba(139, 115, 85, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 
                  className="text-3xl font-semibold flex items-center gap-3"
                  style={{ 
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136'
                  }}
                >
                  <span className="text-3xl">📜</span>
                  Carnet de Quêtes
                </h2>
                <p 
                  className="text-lg md:text-xl mt-2 font-semibold"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#4b4136',
                    opacity: 0.8,
                  }}
                >
                  Ton grimoire d&apos;aventures : crée, suis et célèbre toutes tes quêtes.
                </p>
              </div>
              <button
                onClick={() => setShowQuestBook(false)}
                className="text-3xl font-bold hover:scale-110 transition-transform"
                style={{ color: '#4b4136' }}
              >
                ×
              </button>
            </div>

            {/* Filters */}
            <div 
              className="rounded-3xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                border: '2px solid rgba(139, 115, 85, 0.3)',
                boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1)',
              }}
            >
              <button
                onClick={() => {
                  setShowCreateQuestModal(true)
                  setShowQuestBook(false)
                }}
                className="nav-button px-4 py-3 rounded-3xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                }}
              >
                <span className="text-xl">➕</span>
                Créer une nouvelle quête
              </button>

              <div className="flex flex-col gap-1">
                <label 
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Catégorie
                </label>
                <select
                  value={questFilterCategory}
                  onChange={(e) => setQuestFilterCategory(e.target.value)}
                  className="rounded-3xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    color: '#4b4136',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  <option value="all">Toutes les catégories</option>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label 
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Timeline
                </label>
                <select
                  value={questFilterTimeline}
                  onChange={(e) => setQuestFilterTimeline(e.target.value)}
                  className="rounded-3xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    color: '#4b4136',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  <option value="all">Toutes les durées</option>
                  <option value="today">⚡ Quotidienne</option>
                  <option value="this week">📅 Hebdomadaire</option>
                  <option value="this month">🌙 Mensuelle</option>
                  <option value="major">🎯 Majeure</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {/* Quêtes en cours */}
              <section 
                className="rounded-3xl p-4 md:p-5"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  border: '2px solid rgba(139, 115, 85, 0.3)',
                  boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 
                    className="text-xl font-bold flex items-center gap-2"
                    style={{
                      fontFamily: "'Cinzel Decorative', serif",
                      color: '#4b4136',
                    }}
                  >
                    <span className="text-2xl">🌟</span>
                    Quêtes en cours
                  </h3>
                  <span 
                    className="text-xs font-semibold px-3 py-1 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      color: '#4b4136',
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                  >
                    {bookActiveQuests.length} quêtes
                  </span>
                </div>
                {bookActiveQuests.length === 0 ? (
                  <div 
                    className="text-sm text-center py-6"
                    style={{
                      color: '#4b4136',
                      opacity: 0.7,
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                  >
                    Aucune quête en cours avec ces filtres.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookActiveQuests.map((quest) => {
                      const category = CATEGORIES[quest.category] || CATEGORIES.fitness
                      const isInProgress = quest.status === 'in_progress'
                      const progress = isInProgress ? 70 : 30
                      return (
                        <button
                          key={quest.id}
                          onClick={() => setSelectedQuest(quest)}
                          className="w-full text-left rounded-2xl px-4 py-3 transition-all"
                          style={{
                            background: 'rgba(255, 255, 255, 0.5)',
                            border: '2px solid rgba(139, 115, 85, 0.2)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{category.emoji}</div>
                              <div>
                                <div 
                                  className="text-sm font-bold"
                                  style={{
                                    fontFamily: "'Cinzel Decorative', serif",
                                    color: '#4b4136',
                                  }}
                                >
                                  {quest.title}
                                </div>
                                <div 
                                  className="text-xs line-clamp-2"
                                  style={{
                                    color: '#4b4136',
                                    opacity: 0.7,
                                    fontFamily: "'Cormorant Garamond', serif",
                                  }}
                                >
                                  {quest.description}
                                </div>
                                <div className="mt-1 flex gap-2 flex-wrap text-[11px]">
                                  <span 
                                    className="px-2 py-0.5 rounded-2xl"
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.7)',
                                      color: '#4b4136',
                                      fontFamily: "'Cormorant Garamond', serif",
                                    }}
                                  >
                                    {quest.xp_value} XP
                                  </span>
                                  <span 
                                    className="px-2 py-0.5 rounded-2xl"
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.7)',
                                      color: '#4b4136',
                                      fontFamily: "'Cormorant Garamond', serif",
                                    }}
                                  >
                                    {TIMELINE_LABELS[quest.timeline] || quest.timeline}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div 
                              className="text-xs font-semibold"
                              style={{
                                color: '#4b4136',
                                fontFamily: "'Cormorant Garamond', serif",
                              }}
                            >
                              {quest.status === 'pending' ? 'À commencer' : 'En cours'}
                            </div>
                          </div>
                          <div 
                            className="mt-3 w-full h-2 rounded-full overflow-hidden"
                            style={{
                              background: 'rgba(139, 115, 85, 0.2)',
                            }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${progress}%`,
                                background: 'linear-gradient(to right, rgba(184, 134, 11, 0.6), rgba(218, 165, 32, 0.6))',
                              }}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Quêtes complétées */}
              <section 
                className="rounded-3xl p-4 md:p-5"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  border: '2px solid rgba(139, 115, 85, 0.3)',
                  boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 
                    className="text-xl font-bold flex items-center gap-2"
                    style={{
                      fontFamily: "'Cinzel Decorative', serif",
                      color: '#4b4136',
                    }}
                  >
                    <span className="text-2xl">🏆</span>
                    Quêtes complétées
                  </h3>
                  <span 
                    className="text-xs font-semibold px-3 py-1 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      color: '#4b4136',
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                  >
                    {bookCompletedQuests.length} quêtes
                  </span>
                </div>
                {bookCompletedQuests.length === 0 ? (
                  <div 
                    className="text-sm text-center py-6"
                    style={{
                      color: '#4b4136',
                      opacity: 0.7,
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                  >
                    Aucune quête complétée avec ces filtres.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookCompletedQuests.map((quest) => {
                      const category = CATEGORIES[quest.category] || CATEGORIES.fitness
                      const date = quest.updated_at || quest.created_at
                      const formattedDate = date ? new Date(date).toLocaleDateString() : 'Date inconnue'
                      return (
                        <div
                          key={quest.id}
                          className="rounded-2xl px-4 py-3"
                          style={{
                            background: 'rgba(139, 115, 85, 0.1)',
                            border: '2px solid rgba(139, 115, 85, 0.2)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{category.emoji}</div>
                              <div>
                                <div 
                                  className="text-sm font-bold"
                                  style={{
                                    fontFamily: "'Cinzel Decorative', serif",
                                    color: '#4b4136',
                                  }}
                                >
                                  {quest.title}
                                </div>
                                <div 
                                  className="text-xs line-clamp-2"
                                  style={{
                                    color: '#4b4136',
                                    opacity: 0.7,
                                    fontFamily: "'Cormorant Garamond', serif",
                                  }}
                                >
                                  {quest.description}
                                </div>
                                <div className="mt-1 flex gap-2 flex-wrap text-[11px]">
                                  <span 
                                    className="px-2 py-0.5 rounded-2xl"
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.7)',
                                      color: '#4b4136',
                                      fontFamily: "'Cormorant Garamond', serif",
                                    }}
                                  >
                                    +{quest.xp_value} XP gagnés
                                  </span>
                                  <span 
                                    className="px-2 py-0.5 rounded-2xl"
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.7)',
                                      color: '#4b4136',
                                      fontFamily: "'Cormorant Garamond', serif",
                                    }}
                                  >
                                    Terminé le {formattedDate}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div 
                              className="text-xs font-semibold"
                              style={{
                                color: '#4b4136',
                                fontFamily: "'Cormorant Garamond', serif",
                              }}
                            >
                              Complétée ✨
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal (Background Customization) - Style harmonisé */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSettingsModal(false)}>
          <div 
            className="rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto soft-shadow" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
              border: '2px solid rgba(139, 115, 85, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                🖼️ Personnalise le fond de ta tente
              </h2>
              <button 
                onClick={() => setShowSettingsModal(false)} 
                className="text-3xl font-semibold hover:scale-110 transition-transform"
                style={{ color: '#4b4136' }}
              >
                ×
              </button>
            </div>
            
            {/* Upload Photo Section */}
            <div 
              className="rounded-xl p-4 mb-4"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                border: '2px solid rgba(139, 115, 85, 0.2)',
              }}
            >
              <h3 
                className="text-lg font-semibold mb-3"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                📷 Upload une photo personnelle
              </h3>
              
              <div className="flex flex-col gap-3">
                <label 
                  className="cursor-pointer inline-block"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  <div
                    className="px-6 py-3 rounded-xl font-semibold text-center transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(139, 115, 85, 0.9), rgba(101, 84, 62, 0.9))',
                      border: '2px solid rgba(184, 134, 11, 0.6)',
                      color: '#fef3c7',
                      fontFamily: "'Cinzel Decorative', serif",
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    📁 Choisir une image
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {backgroundImage && backgroundType === 'image' && (
                  <div className="relative">
                    <img 
                      src={backgroundImage} 
                      alt="Fond actuel" 
                      className="w-full h-48 object-cover rounded-xl border-2 border-amber-800/30 shadow-md" 
                    />
                    <button
                      onClick={async () => {
                        setBackgroundImage(null)
                        setBackgroundType('color')
                        setBackgroundColor('#3d3a3a')
                        await saveProfile({
                          background_type: 'color',
                          background_value: '#3d3a3a',
                          background_image: null,
                        })
                      }}
                      className="absolute top-2 right-2 px-3 py-1 rounded-lg font-semibold text-sm transition-all hover:scale-105"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(220, 38, 38, 0.9), rgba(185, 28, 28, 0.9))',
                        border: '2px solid rgba(220, 38, 38, 0.6)',
                        color: '#fff',
                        fontFamily: "'Cinzel Decorative', serif",
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Predefined Backgrounds Section */}
            <div 
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                border: '2px solid rgba(139, 115, 85, 0.2)',
              }}
            >
              <h3 
                className="text-lg font-semibold mb-3"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                🎨 Ou choisis un fond prédéfini
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Fond 1 : Gris foncé (défaut) */}
                <button
                  onClick={async () => {
                    setBackgroundColor('#3d3a3a')
                    setBackgroundType('color')
                    setBackgroundImage(null)
                    setBackgroundOpacity(100)
                    await saveProfile({
                      background_type: 'color',
                      background_value: '#3d3a3a',
                      background_image: null,
                    })
                  }}
                  className="relative h-24 rounded-xl border-2 transition-all hover:scale-105 hover:border-amber-600"
                  style={{
                    backgroundColor: '#3d3a3a',
                    borderColor: backgroundColor === '#3d3a3a' && backgroundType === 'color' ? 'rgba(184, 134, 11, 0.8)' : 'rgba(139, 115, 85, 0.3)',
                    boxShadow: backgroundColor === '#3d3a3a' && backgroundType === 'color' ? '0 0 15px rgba(184, 134, 11, 0.5)' : 'none',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-sm font-semibold px-2 py-1 rounded"
                      style={{
                        background: 'rgba(250, 240, 230, 0.9)',
                        color: '#4b4136',
                        fontFamily: "'Cormorant Garamond', serif",
                      }}
                    >
                      Gris foncé
                    </span>
                  </div>
                </button>

                {/* Fond 2 : Beige clair */}
                <button
                  onClick={async () => {
                    setBackgroundColor('#f5f5dc')
                    setBackgroundType('color')
                    setBackgroundImage(null)
                    setBackgroundOpacity(100)
                    await saveProfile({
                      background_type: 'color',
                      background_value: '#f5f5dc',
                      background_image: null,
                    })
                  }}
                  className="relative h-24 rounded-xl border-2 transition-all hover:scale-105 hover:border-amber-600"
                  style={{
                    backgroundColor: '#f5f5dc',
                    borderColor: backgroundColor === '#f5f5dc' && backgroundType === 'color' ? 'rgba(184, 134, 11, 0.8)' : 'rgba(139, 115, 85, 0.3)',
                    boxShadow: backgroundColor === '#f5f5dc' && backgroundType === 'color' ? '0 0 15px rgba(184, 134, 11, 0.5)' : 'none',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-sm font-semibold px-2 py-1 rounded"
                      style={{
                        background: 'rgba(61, 58, 58, 0.7)',
                        color: '#f5f5dc',
                        fontFamily: "'Cormorant Garamond', serif",
                      }}
                    >
                      Beige clair
                    </span>
                  </div>
                </button>

                {/* Fond 3 : Brun chaleureux */}
                <button
                  onClick={async () => {
                    setBackgroundColor('#6b5b4a')
                    setBackgroundType('color')
                    setBackgroundImage(null)
                    setBackgroundOpacity(100)
                    await saveProfile({
                      background_type: 'color',
                      background_value: '#6b5b4a',
                      background_image: null,
                    })
                  }}
                  className="relative h-24 rounded-xl border-2 transition-all hover:scale-105 hover:border-amber-600"
                  style={{
                    backgroundColor: '#6b5b4a',
                    borderColor: backgroundColor === '#6b5b4a' && backgroundType === 'color' ? 'rgba(184, 134, 11, 0.8)' : 'rgba(139, 115, 85, 0.3)',
                    boxShadow: backgroundColor === '#6b5b4a' && backgroundType === 'color' ? '0 0 15px rgba(184, 134, 11, 0.5)' : 'none',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-sm font-semibold px-2 py-1 rounded"
                      style={{
                        background: 'rgba(250, 240, 230, 0.9)',
                        color: '#4b4136',
                        fontFamily: "'Cormorant Garamond', serif",
                      }}
                    >
                      Brun chaleureux
                    </span>
                  </div>
                </button>

                {/* Fond 4 : Vert forêt */}
                <button
                  onClick={async () => {
                    setBackgroundColor('#2d4a3e')
                    setBackgroundType('color')
                    setBackgroundImage(null)
                    setBackgroundOpacity(100)
                    await saveProfile({
                      background_type: 'color',
                      background_value: '#2d4a3e',
                      background_image: null,
                    })
                  }}
                  className="relative h-24 rounded-xl border-2 transition-all hover:scale-105 hover:border-amber-600"
                  style={{
                    backgroundColor: '#2d4a3e',
                    borderColor: backgroundColor === '#2d4a3e' && backgroundType === 'color' ? 'rgba(184, 134, 11, 0.8)' : 'rgba(139, 115, 85, 0.3)',
                    boxShadow: backgroundColor === '#2d4a3e' && backgroundType === 'color' ? '0 0 15px rgba(184, 134, 11, 0.5)' : 'none',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-sm font-semibold px-2 py-1 rounded"
                      style={{
                        background: 'rgba(250, 240, 230, 0.9)',
                        color: '#4b4136',
                        fontFamily: "'Cormorant Garamond', serif",
                      }}
                    >
                      Vert forêt
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stickers on Main Page (always visible, but interactive only in arrange mode) */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {stickers.filter(sticker => sticker.content !== '🔥' && sticker.content !== '😀').map(sticker => (
          <div
            key={sticker.id}
            className="sticker-wrapper absolute pointer-events-auto"
            style={{
              left: `${sticker.x}px`,
              top: `${sticker.y}px`,
            }}
            onClick={() => {
              if (arrangeMode) {
                setSelectedSticker(sticker.id)
              }
            }}
          >
            <div
              className={`sticker-content ${selectedSticker === sticker.id && arrangeMode ? 'ring-4 ring-blue-500' : ''} ${arrangeMode ? 'cursor-move' : 'cursor-default'}`}
              onMouseDown={(e) => {
                if (arrangeMode && !e.target.classList.contains('sticker-resize-handle') && !e.target.classList.contains('sticker-rotate-handle')) {
                  handleStickerDrag(e, sticker.id)
                }
              }}
              onDoubleClick={() => {
                if (arrangeMode) {
                  deleteSticker(sticker.id)
                }
              }}
              style={{
                transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`,
                transformOrigin: 'center',
              }}
            >
              {sticker.type === 'emoji' ? (
                <div className="text-4xl drop-shadow-lg">{sticker.content}</div>
              ) : sticker.type === 'image' ? (
                <img 
                  src={sticker.content} 
                  alt="Sticker" 
                  className="w-24 h-24 object-contain drop-shadow-lg"
                />
              ) : (
                <div
                  className="font-bold drop-shadow-lg"
                  style={{
                    fontSize: `${sticker.fontSize || 24}px`,
                    color: sticker.color || '#000000',
                  }}
                >
                  {sticker.content}
                </div>
              )}
            </div>
            
            {/* Resize Handle - Only visible in arrange mode when selected */}
            {arrangeMode && selectedSticker === sticker.id && (
              <div
                className="sticker-resize-handle"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handleStickerResize(e, sticker.id)
                }}
                title="Redimensionner"
              />
            )}
            
            {/* Rotate Handle - Only visible in arrange mode when selected */}
            {arrangeMode && selectedSticker === sticker.id && (
              <div
                className="sticker-rotate-handle"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handleStickerRotate(e, sticker.id)
                }}
                title="Tourner"
              />
            )}
          </div>
        ))}
      </div>

      {/* Stickers Modal */}
      {showStickersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowStickersModal(false)
          setArrangeMode(false)
        }}>
          <div className="sims-card bg-gradient-to-b from-white to-gray-100 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-black text-purple-900 uppercase">🎭 Decorate with Stickers</h2>
              <button onClick={() => {
                setShowStickersModal(false)
                setArrangeMode(false)
              }} className="text-3xl font-black hover:scale-110 transition-transform">×</button>
            </div>
            
            <div className="flex gap-2 mb-4 border-b-4 border-purple-600">
              {['emoji', 'text', 'upload', 'library'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setStickerTab(tab)}
                  className={`px-4 py-2 font-black border-b-4 uppercase text-sm ${
                    stickerTab === tab
                      ? 'border-purple-600 text-purple-900 bg-gradient-to-b from-purple-200 to-purple-300'
                      : 'border-transparent text-purple-700 hover:border-purple-400 hover:bg-purple-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {stickerTab === 'emoji' && (
              <div className="grid grid-cols-5 gap-4 mb-4">
                {EMOJI_STICKERS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmojiSticker(emoji)}
                    className="sims-card text-4xl p-4 bg-gradient-to-b from-purple-200 to-purple-300 border-6 border-purple-600 rounded-xl hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {stickerTab === 'text' && (
              <div className="space-y-4 mb-4">
                <input
                  type="text"
                  value={textStickerContent}
                  onChange={(e) => setTextStickerContent(e.target.value)}
                  placeholder="Enter text..."
                  className="w-full border-4 border-purple-600 px-4 py-2 rounded-xl"
                />
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Size</label>
                    <input
                      type="number"
                      value={textStickerSize}
                      onChange={(e) => setTextStickerSize(parseInt(e.target.value))}
                      min="12"
                      max="72"
                      className="w-20 border-4 border-purple-600 px-2 py-1 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Color</label>
                    <input
                      type="color"
                      value={textStickerColor}
                      onChange={(e) => setTextStickerColor(e.target.value)}
                      className="w-20 h-10 border-4 border-purple-600 rounded"
                    />
                  </div>
                  <button
                    onClick={addTextSticker}
                    className="sims-button bg-gradient-to-b from-purple-400 to-purple-500 border-4 border-purple-600 text-purple-900 font-black px-4 py-2 rounded-xl self-end uppercase text-sm"
                  >
                    Add Text
                  </button>
                </div>
              </div>
            )}

            {stickerTab === 'upload' && (
              <div className="space-y-4 mb-4">
                <input type="file" accept="image/*" className="mb-2" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="font-bold">Remove Background (Coming Soon)</span>
                </label>
              </div>
            )}

            {stickerTab === 'library' && (
              <div className="text-center py-8 text-purple-600 font-bold text-lg">
                Coming soon - sticker library! 🎨
              </div>
            )}

            <div className="sims-card relative min-h-[200px] border-6 border-purple-600 rounded-xl p-4 bg-gradient-to-b from-gray-50 to-gray-100">
              {stickers.map(sticker => (
                <div
                  key={sticker.id}
                  className={`sticker-wrapper absolute ${selectedSticker === sticker.id ? 'z-10' : ''}`}
                  style={{
                    left: `${sticker.x}px`,
                    top: `${sticker.y}px`,
                  }}
                  onClick={() => setSelectedSticker(sticker.id)}
                >
                  <div
                    className={`sticker-content ${selectedSticker === sticker.id ? 'ring-4 ring-blue-500' : ''} ${arrangeMode ? 'cursor-move' : ''}`}
                    onMouseDown={(e) => arrangeMode && handleStickerDrag(e, sticker.id)}
                    onDoubleClick={() => arrangeMode && deleteSticker(sticker.id)}
                    style={{
                      transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`,
                      transformOrigin: 'center',
                    }}
                  >
                    {sticker.type === 'emoji' ? (
                      <div className="text-4xl drop-shadow-lg">{sticker.content}</div>
                    ) : sticker.type === 'image' ? (
                      <img 
                        src={sticker.content} 
                        alt="Sticker" 
                        className="w-24 h-24 object-contain drop-shadow-lg"
                      />
                    ) : (
                      <div
                        className="font-bold drop-shadow-lg"
                        style={{
                          fontSize: `${sticker.fontSize || 24}px`,
                          color: sticker.color || '#000000',
                        }}
                      >
                        {sticker.content}
                      </div>
                    )}
                  </div>
                  
                  {/* Resize Handle */}
                  {arrangeMode && selectedSticker === sticker.id && (
                    <div
                      className="sticker-resize-handle"
                      onMouseDown={(e) => handleStickerResize(e, sticker.id)}
                      title="Resize"
                    />
                  )}
                  
                  {/* Rotate Handle */}
                  {arrangeMode && selectedSticker === sticker.id && (
                    <div
                      className="sticker-rotate-handle"
                      onMouseDown={(e) => handleStickerRotate(e, sticker.id)}
                      title="Rotate"
                    />
                  )}
                </div>
              ))}
              {stickers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No stickers yet. Add some from the tabs above!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="glass-card rounded-3xl p-8 max-w-md w-full soft-shadow" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-800">✨ Éditer</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-3xl font-bold text-purple-700 hover:scale-110 transition-transform"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Ajouter un emoji */}
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setShowStickersModal(true)
                  setStickerTab('emoji')
                }}
                className="w-full glass-card px-6 py-4 rounded-3xl text-left flex items-center gap-4 text-purple-700 font-semibold hover:bg-white/40 transition-all soft-shadow"
              >
                <span className="text-3xl">😀</span>
                <div>
                  <div className="font-bold">Ajouter un emoji</div>
                  <div className="text-sm text-purple-600 font-normal">Choisir un emoji à ajouter</div>
                </div>
              </button>

              {/* Ajouter une photo */}
              <button
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const imageUrl = event.target?.result
                        if (imageUrl) {
                          const newSticker = {
                            id: Date.now().toString(),
                            type: 'image',
                            content: imageUrl,
                            x: Math.random() * 300 + 100,
                            y: Math.random() * 300 + 100,
                            scale: 1,
                            rotation: 0,
                          }
                          const updated = [...stickers, newSticker]
                          setStickers(updated)
                          saveProfile({ stickers: updated })
                          setShowEditModal(false)
                          setSuccessMessage('Photo ajoutée ! ✨')
                          setTimeout(() => setSuccessMessage(''), 3000)
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }
                  input.click()
                }}
                className="w-full glass-card px-6 py-4 rounded-3xl text-left flex items-center gap-4 text-purple-700 font-semibold hover:bg-white/40 transition-all soft-shadow"
              >
                <span className="text-3xl">📷</span>
                <div>
                  <div className="font-bold">Ajouter une photo</div>
                  <div className="text-sm text-purple-600 font-normal">Télécharger une image</div>
                </div>
              </button>

              {/* Ajouter une photo IA */}
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setShowAvatarModal(true)
                }}
                className="w-full glass-card px-6 py-4 rounded-3xl text-left flex items-center gap-4 text-purple-700 font-semibold hover:bg-white/40 transition-all soft-shadow"
              >
                <span className="text-3xl">🎨</span>
                <div>
                  <div className="font-bold">Ajouter une photo IA</div>
                  <div className="text-sm text-purple-600 font-normal">Générer avec l'IA</div>
                </div>
              </button>

              {/* Bibliothèque de stickers */}
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setShowStickersModal(true)
                }}
                className="w-full glass-card px-6 py-4 rounded-3xl text-left flex items-center gap-4 text-purple-700 font-semibold hover:bg-white/40 transition-all soft-shadow"
              >
                <span className="text-3xl">📚</span>
                <div>
                  <div className="font-bold">Bibliothèque de stickers</div>
                  <div className="text-sm text-purple-600 font-normal">Voir tous les stickers</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quest Confirmation Modal */}
      {deleteQuestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteQuestModal(null)}>
          <div className="glass-card rounded-3xl p-8 max-w-md w-full soft-shadow" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-800">⚠️ Masquer cette quête ?</h2>
              <button
                onClick={() => setDeleteQuestModal(null)}
                className="text-3xl font-bold text-purple-700 hover:scale-110 transition-transform"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-yellow-100/60 border-2 border-yellow-400/60 rounded-2xl p-4 mb-4">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  ⚠️ Attention
                </p>
                <p className="text-sm text-yellow-800">
                  Cette action ne supprime <strong>pas définitivement</strong> la quête. Tu peux la retrouver dans ton <strong>journal de quêtes</strong> sur la place du village.
                </p>
              </div>
              <p className="text-purple-700 font-medium">
                La quête sera simplement masquée de l'affichage de ton campement.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteQuestModal(null)}
                className="flex-1 pill-button glass-card px-6 py-3 rounded-3xl text-purple-700 font-semibold hover:bg-white/40 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => confirmDeleteQuest(deleteQuestModal)}
                className="flex-1 pill-button glass-card px-6 py-3 rounded-3xl bg-red-200/60 text-red-800 font-semibold hover:bg-red-300/60 transition-all"
              >
                Masquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Detail Modal with Edit/Delete */}
      {selectedQuest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedQuest(null)}>
          <div 
            className="rounded-3xl p-6 md:p-8 max-w-md w-full soft-shadow" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
              border: '2px solid rgba(139, 115, 85, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                {selectedQuest.title}
              </h3>
              <button 
                onClick={() => setSelectedQuest(null)} 
                className="text-3xl font-semibold hover:scale-110 transition-transform"
                style={{ color: '#4b4136' }}
              >
                ×
              </button>
            </div>
            
            <p 
              className="mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: '#4b4136',
                fontSize: '1rem',
              }}
            >
              {selectedQuest.description}
            </p>
            
            <div className="flex gap-2 mb-4 flex-wrap">
              <span 
                className="px-3 py-1 rounded-2xl text-sm font-semibold"
                style={{
                  background: selectedQuest.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : 
                             selectedQuest.status === 'in_progress' ? 'rgba(59, 130, 246, 0.2)' : 
                             'rgba(251, 191, 36, 0.2)',
                  border: selectedQuest.status === 'completed' ? '1px solid rgba(34, 197, 94, 0.4)' : 
                         selectedQuest.status === 'in_progress' ? '1px solid rgba(59, 130, 246, 0.4)' : 
                         '1px solid rgba(251, 191, 36, 0.4)',
                  color: selectedQuest.status === 'completed' ? '#15803d' : 
                        selectedQuest.status === 'in_progress' ? '#1e40af' : 
                        '#d97706'
                }}
              >
                {selectedQuest.status === 'completed' ? '✅ Complétée' : 
                 selectedQuest.status === 'in_progress' ? '🔄 En cours' : 
                 '📝 En attente'}
              </span>
              <span 
                className="px-3 py-1 rounded-2xl text-sm font-semibold"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  border: '1px solid rgba(139, 115, 85, 0.2)',
                  color: '#4b4136',
                }}
              >
                +{selectedQuest.xp_value} XP
              </span>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingQuest(selectedQuest)
                  setSelectedQuest(null)
                }}
                className="flex-1 px-4 py-2 rounded-2xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(to bottom, rgba(139, 115, 85, 0.9), rgba(101, 84, 62, 0.9))',
                  border: '2px solid rgba(184, 134, 11, 0.6)',
                  color: '#fef3c7',
                  fontFamily: "'Cinzel Decorative', serif",
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
              >
                ✏️ Modifier
              </button>
              <button
                onClick={async () => {
                  if (window.confirm(`Êtes-vous sûr de vouloir supprimer la quête "${selectedQuest.title}" ?`)) {
                    try {
                      const { error } = await supabase
                        .from('quests')
                        .delete()
                        .eq('id', selectedQuest.id)
                        .eq('user_id', user.id)
                      
                      if (error) throw error
                      
                      setSelectedQuest(null)
                      await loadQuests()
                      await loadProfile()
                      setSuccessMessage('Quête supprimée avec succès ! ✨')
                      setTimeout(() => setSuccessMessage(''), 3000)
                    } catch (error) {
                      console.error('Error deleting quest:', error)
                      setErrorMessage('Erreur lors de la suppression. Réessaie !')
                      setTimeout(() => setErrorMessage(''), 3000)
                    }
                  }
                }}
                className="flex-1 px-4 py-2 rounded-2xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(to bottom, rgba(220, 38, 38, 0.9), rgba(185, 28, 28, 0.9))',
                  border: '2px solid rgba(220, 38, 38, 0.6)',
                  color: '#fef3c7',
                  fontFamily: "'Cinzel Decorative', serif",
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quest Modal */}
      {editingQuest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingQuest(null)}>
          <div 
            className="rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto soft-shadow" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
              border: '2px solid rgba(139, 115, 85, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="text-3xl font-bold flex items-center gap-2"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                <span className="text-2xl">✏️</span>
                <span>Modifier la Quête</span>
              </h2>
              <button 
                onClick={() => setEditingQuest(null)} 
                className="text-3xl font-semibold hover:scale-110 transition-transform"
                style={{ color: '#4b4136' }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Titre de la quête
                </label>
                <input
                  type="text"
                  value={editingQuest.title}
                  onChange={(e) => setEditingQuest({...editingQuest, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(139, 115, 85, 0.3)',
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#4b4136',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Description
                </label>
                <textarea
                  value={editingQuest.description}
                  onChange={(e) => setEditingQuest({...editingQuest, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(139, 115, 85, 0.3)',
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#4b4136',
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Statut
                </label>
                <select
                  value={editingQuest.status}
                  onChange={(e) => setEditingQuest({...editingQuest, status: e.target.value})}
                  className="w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(139, 115, 85, 0.3)',
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#4b4136',
                  }}
                >
                  <option value="pending">📝 En attente</option>
                  <option value="in_progress">🔄 En cours</option>
                  <option value="completed">✅ Complétée</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingQuest(null)}
                  className="flex-1 px-4 py-3 rounded-3xl font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    color: '#4b4136',
                    fontFamily: "'Cinzel Decorative', serif",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('quests')
                        .update({
                          title: editingQuest.title,
                          description: editingQuest.description,
                          status: editingQuest.status,
                          updated_at: new Date().toISOString(),
                        })
                        .eq('id', editingQuest.id)
                        .eq('user_id', user.id)
                      
                      if (error) throw error
                      
                      setEditingQuest(null)
                      await loadQuests()
                      await loadProfile()
                      await loadVillageEchos()
                      setSuccessMessage('Quête modifiée avec succès ! ✨')
                      setTimeout(() => setSuccessMessage(''), 3000)
                    } catch (error) {
                      console.error('Error updating quest:', error)
                      setErrorMessage('Erreur lors de la modification. Réessaie !')
                      setTimeout(() => setErrorMessage(''), 3000)
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-3xl font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    background: 'linear-gradient(to bottom, rgba(139, 115, 85, 0.9), rgba(101, 84, 62, 0.9))',
                    border: '2px solid rgba(184, 134, 11, 0.6)',
                    color: '#fef3c7',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  Enregistrer ✨
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Quest Modal */}
      {showCreateQuestModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateQuestModal(false)}>
          <div 
            className="rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto soft-shadow" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 240, 230, 0.95), rgba(245, 235, 220, 0.95))',
              border: '2px solid rgba(139, 115, 85, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  color: '#4b4136',
                }}
              >
                ✨ Créer une nouvelle quête
              </h2>
              <button
                onClick={() => setShowCreateQuestModal(false)}
                className="text-3xl font-bold hover:scale-110 transition-transform"
                style={{ color: '#4b4136' }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Titre
                </label>
                <input
                  type="text"
                  value={newQuest.title}
                  onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-600"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    color: '#4b4136',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                  placeholder="Ex: Faire 30 minutes de sport"
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Description
                </label>
                <textarea
                  value={newQuest.description}
                  onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-600"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    color: '#4b4136',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                  rows={3}
                  placeholder="Décris ta quête en détail..."
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Catégorie
                </label>
                <select
                  value={newQuest.category}
                  onChange={(e) => setNewQuest({ ...newQuest, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-600"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    color: '#4b4136',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  {Object.entries(CATEGORIES)
                    .filter(([key]) => key !== 'creative')
                    .map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Durée
                </label>
                <select
                  value={newQuest.timeline}
                  onChange={(e) => {
                    const timeline = e.target.value
                    setNewQuest({ 
                      ...newQuest, 
                      timeline: timeline,
                      xp_value: getXPForTimeline(timeline)
                    })
                  }}
                  className="w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-600"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    color: '#4b4136',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  <option value="today">⚡ QUOTIDIENNE = 1 XP/jour</option>
                  <option value="this week">📅 HEBDOMADAIRE = 7 XP/semaine</option>
                  <option value="this month">🌙 MENSUELLE = 30 XP/mois</option>
                  <option value="major">🎯 MAJEURE = 200 XP/quête</option>
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    color: '#4b4136',
                  }}
                >
                  Voici les points que cette quête te fera gagner
                </label>
                <div
                  className="w-full px-4 py-2 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid rgba(139, 115, 85, 0.3)',
                    color: '#4b4136',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  {newQuest.xp_value} XP
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateQuestModal(false)}
                  className="flex-1 nav-button px-6 py-3 rounded-3xl font-semibold"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateQuest}
                  className="flex-1 nav-button px-6 py-3 rounded-3xl font-semibold"
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                  }}
                >
                  Créer la quête ✨
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountPage
