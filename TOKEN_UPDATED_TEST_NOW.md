# ✅ TOKEN HUGGING FACE MIS À JOUR !

## 🎉 Fichiers Mis à Jour

✅ **Code Local** :
- `src/supabase.js` → Token updaté
- `supabase/functions/generate-avatar/index.ts` → Token updaté

✅ **Documentation** :
- `DEPLOY_FUNCTION_NOW.md` → Token updaté
- `deploy-function.sh` → Token updaté
- `supabase/functions/generate-avatar/README.md` → Token updaté

**Nouveau token** : `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`

---

## 🧪 TEST 1 : Génération Local (Devrait Marcher Maintenant)

1. **Rafraîchis ton navigateur** (`F5`)
2. Va sur **Mon campement**
3. Clique sur ton avatar
4. Clique sur **"Change ton Avatar"**
5. Sélectionne un univers (ex: Minecraft, Zelda, etc.)
6. Décris ton avatar (ex: "brave knight with golden armor")
7. Clique sur **"Générer"**

**Résultat attendu** : 
- ✅ Avatar généré en 5-10 secondes
- ✅ Pas d'erreur "insufficient permissions"

---

## 🚀 DÉPLOYER SUR SUPABASE (Pour Production)

Pour que la génération d'avatar marche en production (pas seulement en local), tu dois mettre à jour le secret sur Supabase :

### Option A : Via Dashboard (Facile)

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard/project/uxgejvkoevtexfquafgg)
2. Dans la sidebar, clique sur **"Edge Functions"** (icône ⚡)
3. Clique sur la fonction **"generate-avatar"**
4. Cherche l'onglet **"Secrets"** ou **"Environment Variables"** ou **"Settings"**
5. Si `HUGGINGFACE_TOKEN` existe déjà :
   - Clique sur **Edit** ou **Update**
   - Remplace par : `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`
6. Si `HUGGINGFACE_TOKEN` n'existe pas :
   - Clique sur **"Add new secret"**
   - **Name** : `HUGGINGFACE_TOKEN`
   - **Value** : `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`
7. Clique sur **"Save"**
8. **Redéploie** la fonction (bouton "Redeploy" ou "Deploy")

### Option B : Via CLI (Pour les Pros)

```bash
# 1. Installer Supabase CLI si pas déjà fait
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier ton projet
supabase link --project-ref uxgejvkoevtexfquafgg

# 4. Mettre à jour le secret
supabase secrets set HUGGINGFACE_TOKEN=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

# 5. Redéployer la fonction
supabase functions deploy generate-avatar
```

---

## 📊 Vérification

### Après Déploiement Supabase

1. Va dans **Supabase Dashboard** → **Edge Functions** → **generate-avatar**
2. Tu devrais voir dans **Secrets** :
   - ✅ `HUGGINGFACE_TOKEN` = `hf_zZd...` (masqué)
3. Status de la fonction : **Active** ✅

### Test Production

1. **Déploie** ton app (si tu l'as déjà déployée sur Vercel/Netlify/autre)
2. Va sur l'URL de production
3. Teste la génération d'avatar
4. ✅ Devrait marcher !

---

## 🔍 Si Ça Ne Marche Toujours Pas

### Vérifier les Permissions du Token

1. Va sur [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Trouve ton token `QUEST-APP-Avatar-Inference`
3. Vérifie qu'il a :
   - ✅ Type : **Fine-grained**
   - ✅ Permission : **"Make calls to serverless Inference API"**

### Vérifier les Logs Supabase

1. **Supabase Dashboard** → **Edge Functions** → **generate-avatar**
2. Onglet **"Logs"** ou **"Invocations"**
3. Cherche les erreurs récentes
4. Si tu vois "insufficient permissions", le secret n'est pas mis à jour
5. Si tu vois "404", la fonction n'est pas déployée
6. Si tu vois "503", le modèle HuggingFace est en train de charger (attends 20s)

---

## ⚡ RÉSUMÉ RAPIDE

### Pour Tester Maintenant (Local) :
1. ✅ Rafraîchis l'app (`F5`)
2. ✅ Génère un avatar
3. ✅ Devrait marcher !

### Pour Production :
1. ⏳ Va sur Supabase Dashboard
2. ⏳ Met à jour le secret `HUGGINGFACE_TOKEN`
3. ⏳ Redéploie la fonction
4. ✅ Teste en production

---

## 🎨 Exemples de Prompts

**Minecraft** :
- "Steve with diamond armor"
- "Creeper face"
- "Enderman character"

**Zelda** :
- "brave knight with golden armor"
- "Link with master sword"
- "princess Zelda"

**World of Warcraft** :
- "orc warrior with axe"
- "night elf hunter"
- "undead mage"

**Pokemon** :
- "Pikachu style character"
- "fire type trainer"
- "legendary pokemon trainer"

---

## ✅ STATUT

| Étape | Status |
|-------|--------|
| Token créé sur Hugging Face | ✅ Fait |
| Token mis à jour dans code local | ✅ Fait |
| Token mis à jour dans Edge Function | ✅ Fait |
| Documentation mise à jour | ✅ Fait |
| Test local | 🧪 À tester |
| Déploiement Supabase | ⏳ À faire |
| Test production | ⏳ À faire |

---

**Teste la génération d'avatar maintenant !** 🎨
