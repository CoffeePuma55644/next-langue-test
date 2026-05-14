# 🧪 Guide de test - Changement de langue

## ✅ Avant de tester

Assurez-vous que:
- ✓ `npm run dev` fonctionne sans erreurs
- ✓ Vous êtes sur `http://localhost:3000`
- ✓ Les DevTools sont ouvertes (F12 ou Ctrl+Shift+I)

---

## 🎯 Test 1: Détection automatique (1ère visite)

### Étape 1: Nettoyer les cookies
1. Ouvrir DevTools (F12)
2. Aller à `Application` → `Cookies` → `http://localhost:3000`
3. Supprimer le cookie `locale` (si existant)
4. Recharger la page (F5)

### Résultat attendu:
- ✅ Page en ANGLAIS (c'est le fallback par défaut)
- ✅ Dans DevTools → Cookies → `locale` = `en`
- ✅ Dans DevTools → Console → `<html lang="en">`

### Pourquoi? 
Si votre navigateur est en anglais (US/GB), l'Accept-Language header sera en anglais, donc la locale détectée sera "en".

---

## 🎯 Test 2: Changement de langue via bouton

### Étape 1: Cliquer sur "FR"
1. Sur la page, cliquer le bouton "FR"
2. Attendre le rechargement de la page

### Résultat attendu:
- ✅ Titre change: "Hello world!" → "Salut tout le monde!"
- ✅ Bouton "FR" devient bleu
- ✅ DevTools → Cookies → `locale` = `fr`
- ✅ DevTools → Éléments → `<html lang="fr">`

### Résultat réel en cas d'erreur:
- ❌ Rien ne se passe: vérifier la console (erreurs?)
- ❌ Page se recharge mais reste en anglais: vérifier le cookie

---

## 🎯 Test 3: Persistance du cookie

### Étape 1: Recharger la page (F5)
Après avoir changé en français, recharger la page

### Résultat attendu:
- ✅ Page RESTE en français
- ✅ Pas de scintillement (pas de changement de langue)
- ✅ Cookie toujours `locale` = `fr`

### Ceci prouve que:
- Le cookie persiste ✓
- La détection du navigateur est ignorée (cookie prioritaire) ✓

---

## 🎯 Test 4: Revenir en anglais

### Étape 1: Cliquer sur "EN"
1. Cliquer le bouton "EN"
2. Attendre le rechargement

### Résultat attendu:
- ✅ Titre change: "Salut tout le monde!" → "Hello world!"
- ✅ Bouton "EN" devient bleu
- ✅ DevTools → Cookies → `locale` = `en`
- ✅ DevTools → Éléments → `<html lang="en">`

---

## 📱 Test 5: Sur téléphone (même réseau WiFi)

### Prérequis:
- PC et téléphone sur le même WiFi
- Trouver l'IP de votre PC (CMD: `ipconfig` → regarder IPv4 Address)
- Exemple: `192.168.1.10`

### Étape 1: Accès depuis le téléphone
1. Sur le téléphone, ouvrir le navigateur
2. Aller à: `http://192.168.1.10:3000`
3. La page s'affiche

### Résultat attendu (téléphone en anglais):
- ✅ Page en ANGLAIS (navigateur téléphone en anglais = Accept-Language: en)
- ✅ Peut voir le bouton "FR"

### Étape 2: Cliquer sur "FR"
1. Cliquer le bouton "FR"
2. Page recharge

### Résultat attendu:
- ✅ Texte change en français: "Salut tout le monde!"
- ✅ Le français persiste si on recharge (cookie stocké)

### Résultat réel si ça ne marche pas:
- ❌ Page reste en anglais: vérifier que la Server Action fonctionne
  - Ouvrir DevTools du téléphone (Chrome: volume-haut + M)
  - Regarder la console pour les erreurs

---

## 🔍 Diagnostic: Vérifier les cookies

### Dans DevTools (PC):
```
F12 → Application → Cookies → http://localhost:3000

Colonne "Name"    | Colonne "Value"
─────────────────┼──────────────
locale            | en          (ou "fr" selon le choix)
```

### Propriétés attendues:
- ✅ Path: `/`
- ✅ Expires/Max-Age: +1 an
- ✅ HttpOnly: ✓ (coché)
- ✅ Secure: dépend (non en localhost)
- ✅ SameSite: Lax

### Sur téléphone:
Malheureusement pas facile à voir, mais si la langue persiste après reload → c'est que le cookie fonctionne

---

## 🐛 Debugging: Console JavaScript

### Si rien ne marche:
Ouvrir la console (F12) et chercher:

#### Erreur 1: "Locale 'xyz' n'est pas supportée"
```
Cause: Vous avez cliqué sur une locale qui n'existe pas
Solution: Vérifier que SUPPORTED_LOCALES contient cette locale
```

#### Erreur 2: "Module not found: ../messages/xyz.json"
```
Cause: Fichier de traduction manquant
Solution: Créer messages/fr.json, messages/en.json, etc.
```

#### Erreur 3: Pas d'erreur mais rien ne change
```
Cause: Possible que reload() ne se déclenche pas
Solution: Ajouter un console.log() dans le composant pour vérifier
```

---

## ✨ Points de vérification pour la résolution d'erreurs

### 1. Fichier `i18n/config.ts` existe?
```bash
ls i18n/config.ts  # Doit exister
```

### 2. Fichier `i18n/actions.ts` existe?
```bash
ls i18n/actions.ts  # Doit exister
```

### 3. Fichier `app/components/LanguageSwitcher.tsx` existe?
```bash
ls app/components/LanguageSwitcher.tsx  # Doit exister
```

### 4. Fichiers de traductions existent?
```bash
ls messages/en.json  # Doit exister
ls messages/fr.json  # Doit exister
```

### 5. Importer correctement?
```typescript
import { setLocale } from "@/i18n/actions";  // ✓
import { setLocale } from "./../../i18n/actions";  // ✗ Mauvais chemin
```

---

## 🎓 Flux complet à observer

```
1️⃣ Première visite
   → Pas de cookie
   → Accept-Language: en (ou fr selon navigateur)
   → Cookie créé: locale=en (ou fr)
   → Page affichée dans cette langue

2️⃣ Clic sur "FR"
   → Server Action appelée
   → Cookie modifié: locale=fr
   → Page recharge
   → Titre change en français

3️⃣ Recharge la page
   → Cookie trouvé: locale=fr
   → Page affichée en français
   → Pas de changement de langue (rapide!)

4️⃣ Clic sur "EN"
   → Server Action appelée
   → Cookie modifié: locale=en
   → Page recharge
   → Titre change en anglais

5️⃣ Recharge la page
   → Cookie trouvé: locale=en
   → Page affichée en anglais
```

---

## 📊 Tableau de test

Remplissez ce tableau au fur et à mesure:

```
| Test | Résultat | Notes |
|------|----------|-------|
| Nettoyage cookie | ✅ / ❌ | |
| 1ère visite → anglais | ✅ / ❌ | |
| Clic FR → français | ✅ / ❌ | |
| Recharge → français | ✅ / ❌ | |
| Clic EN → anglais | ✅ / ❌ | |
| Recharge → anglais | ✅ / ❌ | |
| Téléphone: FR → français | ✅ / ❌ | |
| Téléphone: recharge → français | ✅ / ❌ | |
| Cookie visible | ✅ / ❌ | |
| `lang` dynamique | ✅ / ❌ | |
```

---

## 🎯 Résumé

Tout fonctionne si:
1. ✅ Première visite → anglais (ou français si navigateur en français)
2. ✅ Clic sur "FR" → français immédiatement
3. ✅ Recharge → français persiste
4. ✅ Clic sur "EN" → anglais immédiatement
5. ✅ Recharge → anglais persiste

Et **c'est pareil sur le téléphone!** 🎉

