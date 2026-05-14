# 🔧 Correction: Erreur Cookies Modification

## ❌ Le problème

L'erreur suivante s'affichait:
```
Uncaught Error: Cookies can only be modified in a Server Action or Route Handler.
```

**Raison:** On tentait de modifier les cookies dans `i18n/request.ts`, mais ce fichier n'est pas une Server Action - c'est juste une fonction de configuration.

---

## ✅ La solution

### 1. **Nettoyer `i18n/request.ts`**

On a retiré la ligne de création du cookie:
```typescript
// ❌ AVANT (erreur)
store.set("locale", locale, { ... });

// ✅ APRÈS (pas de modification ici)
// Note: Le cookie sera créé via setLocale() ou le middleware
```

### 2. **Créer un middleware (`middleware.ts`)**

Les middlewares peuvent modifier les cookies! 🎯

```typescript
// middleware.ts (nouveau fichier à la racine du projet)

import { NextRequest, NextResponse } from "next/server";
import { getLocaleFromBrowser } from "./i18n/config";

export function middleware(request: NextRequest) {
  // 1. Vérifier si le cookie existe
  const locale = request.cookies.get("locale")?.value;

  if (locale) {
    return NextResponse.next();
  }

  // 2. Pas de cookie → créer un depuis Accept-Language
  const acceptLanguage = request.headers.get("accept-language");
  const detectedLocale = getLocaleFromBrowser(acceptLanguage);

  // 3. Ajouter le cookie à la réponse
  const response = NextResponse.next();
  response.cookies.set("locale", detectedLocale, {
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 🔄 Flux correctif

### Avant (❌ Erreur)
```
Requête
    ↓
i18n/request.ts (essaie de créer le cookie)
    ↓
❌ ERROR: "Cookies can only be modified in Server Action"
```

### Après (✅ Fonctionne)
```
Requête
    ↓
middleware.ts (crée le cookie)
    ↓
i18n/request.ts (lit le cookie)
    ↓
Page affichée ✅
```

---

## 🎯 Comment ça marche maintenant

### 1️⃣ 1ère visite
```
Utilisateur français visite
    ↓
middleware.ts intercepte
    ↓
Pas de cookie → créer depuis Accept-Language
    ↓
Cookie créé: locale="fr"
    ↓
i18n/request.ts lit le cookie
    ↓
Page en français ✨
```

### 2️⃣ Clic "EN"
```
LanguageSwitcher onClick
    ↓
Server Action: setLocale("en")
    ↓
Cookie modifié: locale="en"
    ↓
Page recharge
    ↓
middleware.ts voit le cookie = "en"
    ↓
Pas besoin de modifier
    ↓
i18n/request.ts lit cookie="en"
    ↓
Page en anglais ✨
```

### 3️⃣ Retour (pas de changement)
```
Cookie existe: locale="en"
    ↓
middleware.ts ne fait rien
    ↓
Page recharge rapidement
    ↓
Page en anglais ✨
```

---

## 🛡️ Ordre des couches

```
1. middleware.ts       ← Crée le cookie au 1er accès
              ↓
2. i18n/request.ts     ← Lit le cookie + charge les messages
              ↓
3. i18n/actions.ts     ← Modifie le cookie au changement de langue
              ↓
4. app/layout.tsx      ← Utilise la locale pour <html lang>
              ↓
5. LanguageSwitcher.tsx ← Appelle setLocale() au clic
```

---

## ✅ Maintenant ça fonctionne!

```bash
npm run dev

# 1ère visite → Langue détectée ✅
# Clic "FR" → Français ✅
# Recharge → Persiste ✅
# Clic "EN" → Anglais ✅
```

---

## 📝 Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `i18n/request.ts` | ❌ Retiré la création de cookie |
| `middleware.ts` | ✅ Créé (crée le cookie au 1er accès) |

---

## 🎓 Concepts clés

### Server Actions (`"use server"`)
✅ Modifient les cookies
✅ Sécurisé (côté serveur)
❌ Ne peuvent pas être appelés au montage initial

### Middlewares
✅ Modifient les cookies
✅ S'exécutent à CHAQUE requête
✅ AVANT le code de l'app
❌ Moins flexibles que les Server Actions

**Solution: Les deux ensemble!**
- Middleware pour créer le cookie automatiquement
- Server Action pour le modifier au changement

---

## ⚠️ Note de Next.js

Vous verrez peut-être:
```
⚠ The "middleware" file convention is deprecated. 
Please use "proxy" instead.
```

C'est juste une warning, le middleware fonctionne quand même! 
(C'est pour les prochaines versions de Next.js)

---

## 🚀 Résultat final

✅ Pas d'erreur
✅ Cookie créé automatiquement
✅ Détection du navigateur fonctionne
✅ Changement de langue fonctionne
✅ Persistance fonctionne

**Mission accomplie!** 🎉

