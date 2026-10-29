-- Harmoniser les catégories et timelines des quêtes
-- Thèmes: Sport & Fitness, Savoir & Apprentissage, Carrière & Travail, Créativité & Projets, Bien-être & Santé, Social & Communauté
-- Timelines: quotidienne (1 XP), hebdomadaire (7 XP), mensuelle (30 XP), majeure (200 XP)

-- 1. Supprimer toutes les contraintes CHECK existantes sur quests
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'quests'::regclass AND contype = 'c') LOOP
    EXECUTE 'ALTER TABLE quests DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- 2. Mapper les anciennes valeurs vers les nouvelles (avant de recréer les contraintes)
UPDATE quests SET category = 'creativity' WHERE category = 'creative';

-- 3. Ajouter les nouvelles contraintes
ALTER TABLE quests ADD CONSTRAINT quests_category_check 
  CHECK (category IN ('fitness', 'learning', 'career', 'creativity', 'wellness', 'social'));

ALTER TABLE quests ADD CONSTRAINT quests_xp_value_check 
  CHECK (xp_value >= 0 AND xp_value <= 10000);

ALTER TABLE quests ADD CONSTRAINT quests_timeline_check 
  CHECK (timeline IN ('today', 'this week', 'this month', 'major'));
