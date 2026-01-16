# 🔑 Comment Mettre à Jour le Token Hugging Face

## ❌ PROBLÈME

Erreur : `Invalid username or password`

**Cause** : Le token Hugging Face dans l'Edge Function Supabase a expiré.

---

## ✅ SOLUTION 1 : Mettre à Jour le Token dans Supabase Dashboard (RAPIDE)

### Étape 1 : Va sur Supabase Dashboard

1. Va sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionne ton projet **QUEST-APP**
3. Clique sur **"Edge Functions"** dans la sidebar à gauche
4. Clique sur **"generate-avatar"**
5. Clique sur l'onglet **"Settings"** ou **"Secrets"**

### Étape 2 : Ajouter le Token comme Variable d'Environnement

1. Clique sur **"Add new secret"**
2. **Name** : `HUGGINGFACE_TOKEN`
3. **Value** : `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`
4. Clique sur **"Save"**

### Étape 3 : Redéployer la Function

1. Retourne sur l'onglet **"Details"**
2. Clique sur **"Redeploy"** ou **"Deploy"**
3. Attends quelques secondes

✅ **TERMINÉ !** Ton avatar devrait maintenant se générer correctement.

---

## ✅ SOLUTION 2 : Redéployer via CLI (SI TU AS SUPABASE CLI)

### Prérequis

```bash
# Si tu n'as pas encore Supabase CLI
brew install supabase/tap/supabase
```

### Commandes

```bash
# 1. Se connecter à Supabase
supabase login

# 2. Lier ton projet
supabase link --project-ref uxgejvkoevtexfquafgg

# 3. Créer le secret
supabase secrets set HUGGINGFACE_TOKEN=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

# 4. Redéployer la fonction
supabase functions deploy generate-avatar
```

✅ **TERMINÉ !**

---

## 🔑 TOKEN ACTUEL

```
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
```

**Ce token est valide jusqu'au :** (vérifie sur [Hugging Face Settings](https://huggingface.co/settings/tokens))

---

## 🆕 SI LE TOKEN A EXPIRÉ : Créer un Nouveau Token

### Étape 1 : Va sur Hugging Face

1. Va sur [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Connecte-toi avec ton compte
3. Clique sur **"New token"**

### Étape 2 : Créer le Token

1. **Name** : `QUEST-APP-Avatar-Generation`
2. **Type** : **Read** (pas besoin de Write)
3. Clique sur **"Generate a token"**
4. **COPIE LE TOKEN** (tu ne pourras plus le revoir)

### Étape 3 : Mettre à Jour le Token

1. Utilise **Solution 1** ou **Solution 2** ci-dessus
2. Remplace le token par ton nouveau token

---

## 🧪 TESTER SI ÇA MARCHE

1. Va sur **Mon campement**
2. Clique sur ton avatar
3. Clique sur **"Change ton Avatar"**
4. Clique sur **"Génère un Avatar IA"**
5. Écris une description (ex: "brave knight with golden armor")
6. Clique sur **"Générer"**
7. **Résultat attendu** : Avatar généré en 5-10 secondes ✅

---

## 📝 NOTES

- Le token Hugging Face **n'expire jamais** par défaut, mais peut être révoqué
- Si tu as l'erreur `Invalid username or password`, c'est que le token est révoqué ou incorrect
- Le fallback dans le code local (`src/supabase.js`) fonctionne pour le dev local, mais **l'Edge Function sur Supabase** a besoin de son propre token

---

## 🚀 RÉSUMÉ RAPIDE

**Pour fix rapidement** :

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard) → Ton projet
2. **Edge Functions** → **generate-avatar** → **Settings** → **Secrets**
3. Ajoute `HUGGINGFACE_TOKEN` = `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`
4. Redéploie la function
5. ✅ Teste la génération d'avatar

---

**Si tu as besoin d'aide, dis-moi où tu bloques !** 🤝
