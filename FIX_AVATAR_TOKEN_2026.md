# 🔧 FIX AVATAR - NOUVEAU TOKEN HUGGING FACE 2026

## ❌ PROBLÈME

Erreur lors de la génération d'avatar :
```
Oops! Avatar generation failed. Invalid username or password.
```

**Cause** : Le token Hugging Face est **expiré** ou n'a **pas les bonnes permissions**.

---

## ✅ SOLUTION EN 3 ÉTAPES

### ÉTAPE 1 : Créer un Nouveau Token Hugging Face 🔑

1. **Va sur** : https://huggingface.co/settings/tokens

2. **Clique sur** : `New token`

3. **Configure le token** :
   - **Name** : `QUEST App Avatar Generator 2026`
   - **Type** : **`Fine-grained`** (IMPORTANT !)
   - **Permissions** : ✅ **`Make calls to serverless Inference API`**
     - C'est la permission ESSENTIELLE pour générer des images
   - **Repository/Model** : `None` (ou `All` si demandé)

4. **Clique sur** : `Generate token`

5. **COPIE LE TOKEN** :
   ```
   hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   ⚠️ **TU NE POURRAS PLUS LE VOIR APRÈS !**

---

### ÉTAPE 2 : Mettre à Jour le Token dans Supabase 📦

#### Option A : Via le Dashboard Supabase (RECOMMANDÉ)

1. **Va sur** : https://supabase.com/dashboard

2. **Sélectionne ton projet** : QUEST-APP

3. **Va dans** : `Settings` (⚙️ dans la sidebar gauche)

4. **Clique sur** : `Edge Functions`

5. **Trouve la section** : `Secrets` ou `Environment Variables`

6. **Ajoute/Modifie** :
   - **Key** : `HUGGINGFACE_TOKEN`
   - **Value** : `hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (ton nouveau token)

7. **Clique sur** : `Save` ou `Add Secret`

#### Option B : Via la CLI Supabase

```bash
# Dans ton terminal
cd /Users/margueritejapy/Desktop/QUEST-APP

# Set le secret
supabase secrets set HUGGINGFACE_TOKEN=hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Vérifie
supabase secrets list
```

---

### ÉTAPE 3 : Redéployer la Fonction Edge 🚀

#### Via la CLI

```bash
# Deploy la fonction avec le nouveau secret
supabase functions deploy generate-avatar

# Vérifie les logs
supabase functions logs generate-avatar
```

**OU**

#### Via le Dashboard

1. **Va sur** : https://supabase.com/dashboard
2. **Sélectionne** : `Edge Functions`
3. **Clique sur** : `generate-avatar`
4. **Clique sur** : `Redeploy` ou `Deploy`

---

## 🧪 TESTER

### Test 1 : Via le Dashboard Supabase

1. **Va sur** : https://supabase.com/dashboard
2. **Edge Functions** → `generate-avatar`
3. **Clique sur** : `Invoke function`
4. **Body** :
   ```json
   {
     "prompt": "a fantasy adventurer portrait, medieval style, digital art"
   }
   ```
5. **Clique sur** : `Run`
6. **Résultat attendu** : Image générée ✅

### Test 2 : Dans l'App

1. **Rafraîchis l'app** (`F5`)
2. **Va sur** : Mon campement
3. **Clique sur** : L'avatar
4. **Clique sur** : `Change ton Avatar` (crayon)
5. **Décris ton avatar** : "un elfe mystique"
6. **Clique sur** : `Générer mon Avatar ✨`
7. **Résultat attendu** : Avatar généré avec succès ! ✅

---

## ⚠️ PROBLÈMES COURANTS

### 1. "Token not found"
- **Cause** : Le secret n'est pas configuré dans Supabase
- **Solution** : Retourne à l'Étape 2

### 2. "Insufficient permissions"
- **Cause** : Le token n'a pas la permission `Inference API`
- **Solution** : Crée un nouveau token **Fine-grained** avec la bonne permission

### 3. "Model not found"
- **Cause** : Le modèle `stabilityai/stable-diffusion-xl-base-1.0` n'est pas accessible
- **Solution** : Vérifie que ton compte Hugging Face a accès au modèle

### 4. "Rate limit exceeded"
- **Cause** : Trop de requêtes
- **Solution** : Attends 1 minute et réessaie

---

## 📝 ALTERNATIVE : Mettre à Jour le Code (Temporaire)

Si tu veux tester rapidement sans passer par le dashboard :

```typescript
// supabase/functions/generate-avatar/index.ts
const HUGGINGFACE_TOKEN = Deno.env.get('HUGGINGFACE_TOKEN') || 'hf_TON_NOUVEAU_TOKEN_ICI'
```

Puis redéploie :
```bash
supabase functions deploy generate-avatar
```

⚠️ **ATTENTION** : Cette méthode expose ton token dans le code. Utilise-la UNIQUEMENT pour tester !

---

## ✅ CHECKLIST

- [ ] Créer un nouveau token sur Hugging Face (Type: Fine-grained)
- [ ] Cocher la permission `Make calls to serverless Inference API`
- [ ] Copier le token
- [ ] Mettre à jour le secret `HUGGINGFACE_TOKEN` dans Supabase
- [ ] Redéployer la fonction `generate-avatar`
- [ ] Tester dans l'app
- [ ] ✨ Avatar généré avec succès !

---

## 🔍 VÉRIFIER LES LOGS

Si ça ne marche toujours pas :

```bash
# Voir les logs de la fonction
supabase functions logs generate-avatar --follow

# Invoke manuellement pour tester
supabase functions invoke generate-avatar --body '{"prompt":"test"}'
```

---

## 📞 BESOIN D'AIDE ?

Si après ces étapes ça ne marche toujours pas :

1. **Copie-colle l'erreur exacte** que tu vois
2. **Vérifie les logs** dans le dashboard Supabase
3. **Vérifie** que ton compte Hugging Face est actif

---

**Commence par l'Étape 1 et suis le guide !** 🚀

Une fois le nouveau token configuré, la génération d'avatar devrait fonctionner ! ✨
