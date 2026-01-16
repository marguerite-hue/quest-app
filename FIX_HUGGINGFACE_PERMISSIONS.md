# 🔑 Fix Hugging Face Avatar Generation - Permissions Insuffisantes

## ❌ PROBLÈME

**Erreur** : `This authentication method does not have sufficient permissions to call Inference Providers`

**Cause** : Le token Hugging Face actuel a seulement des permissions **Read**, mais l'API Inference nécessite des permissions **Inference**.

---

## ✅ SOLUTION : Créer un Nouveau Token avec Bonnes Permissions

### Étape 1 : Créer le Token sur Hugging Face

1. Va sur [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Connecte-toi avec ton compte
3. Clique sur **"Create new token"** (ou **"New token"**)

### Étape 2 : Configurer le Token

**Paramètres** :
- **Name** : `QUEST-APP-Avatar-Generation-Inference`
- **Type** : **Fine-grained** (pas Read, pas Write, mais **Fine-grained**)
- **Permissions** :
  - ✅ Cocher **"Make calls to serverless Inference API"**
  - ✅ OU cocher **"Inference"** (selon l'interface)
  - ❌ PAS seulement "Read" ou "Write"

**Visuel attendu** :
```
Token type: Fine-grained ▼
Repositories access: All
Permissions:
  [ ] Read access to contents of all repos
  [ ] Write access to contents of all repos  
  [✓] Make calls to serverless Inference API  ← IMPORTANT !
```

4. Clique sur **"Generate token"**
5. **COPIE LE TOKEN** immédiatement (tu ne pourras plus le revoir)

**Ton nouveau token** : `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`

---

## 📝 Étape 3 : Mettre à Jour le Token dans l'App

### Option A : Via Code (Rapide)

Je vais mettre à jour le token dans le code local pour toi :

**Attends que je mette à jour les fichiers avec ton nouveau token...**

### Option B : Via Supabase Dashboard (Production)

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard) → Ton projet
2. **Edge Functions** (dans la sidebar)
3. Clique sur **"generate-avatar"**
4. Onglet **"Secrets"** ou **"Settings"**
5. Trouve `HUGGINGFACE_TOKEN` (ou clique "Add new secret")
6. **Name** : `HUGGINGFACE_TOKEN`
7. **Value** : `[TON_NOUVEAU_TOKEN]`
8. Clique sur **"Save"**
9. Retourne sur **"Details"** et clique **"Redeploy"**

---

## 🎯 Alternative : Utiliser un Token d'Organisation

Si tu as une organisation Hugging Face :

1. Va sur [https://huggingface.co/organizations/[TON_ORG]/settings/tokens](https://huggingface.co/organizations)
2. Crée un token au niveau de l'organisation
3. Type : **Fine-grained**
4. Permissions : **Inference API**

**Avantages** :
- Plus de stabilité
- Pas lié à ton compte personnel
- Meilleures limites de rate

---

## 🧪 Test après Mise à Jour

1. Rafraîchis l'app (`F5`)
2. Va sur **Mon campement**
3. Clique sur ton avatar
4. **"Change ton Avatar"** → **"Génère un Avatar IA"**
5. Décris ton avatar (ex: "brave knight with golden armor")
6. Clique **"Générer"**
7. **Résultat attendu** : Avatar généré en 5-10 secondes ✅

---

## ⚠️ Si l'Erreur Persiste

### Vérifier le Type de Token

Le token doit être de type **Fine-grained** avec permission **Inference API**.

**Mauvais token** :
```
Type: Read ❌
```

**Bon token** :
```
Type: Fine-grained ✅
Permissions: Make calls to serverless Inference API ✅
```

### Vérifier le Modèle

Le modèle utilisé (`stabilityai/stable-diffusion-xl-base-1.0`) doit être accessible :
- ✅ Gratuit sur Hugging Face Inference API
- ✅ Pas besoin d'abonnement Pro

### Vérifier les Limites de Rate

Hugging Face Inference API gratuite :
- **Limite** : ~50-100 requêtes/jour
- **Quota** : Réinitialisé toutes les 24h

Si limite atteinte :
1. Attends 24h
2. OU upgrade vers Hugging Face Pro ($9/mois)

---

## 🚀 RÉSUMÉ RAPIDE

**Ce que tu dois faire** :

1. ✅ Va sur https://huggingface.co/settings/tokens
2. ✅ Crée un nouveau token **Fine-grained**
3. ✅ Coche **"Make calls to serverless Inference API"**
4. ✅ Copie le token
5. ✅ **Envoie-moi le nouveau token** pour que je le mette dans le code
6. ✅ Teste la génération d'avatar

---

## 💡 Note Importante

**Ne partage JAMAIS ton token publiquement** (GitHub, Discord, etc.)

Si tu l'envoies ici, je le mettrai dans le code et les fichiers de config, mais assure-toi de ne pas le commit publiquement sur GitHub !

---

**Créé le token et envoie-le-moi !** 🔑
