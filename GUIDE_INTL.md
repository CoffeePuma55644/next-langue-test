# 🌍 Guide Complet: Next-Intl avec Changement de Langue par Cookie

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Flux de fonctionnement](#flux-de-fonctionnement)
3. [Architecture](#architecture)
4. [Fichiers clés](#fichiers-clés)
5. [Comment ça marche](#comment-ça-marche)
6. [Dépannage](#dépannage)

---

## Vue d'ensemble

Le système fonctionne selon ce cycle:

```
Premier visiteur
    ↓
Aucun cookie détecté
    ↓
Détection de la langue du navigateur (Accept-Language header)
    ↓
Création automatique d'un cookie avec la locale détectée
    ↓
Affichage en français (si navigateur en français) ou anglais (par défaut)
    ↓
Utilisateur clique sur un bouton de langue
    ↓
La langue change IMMÉDIATEMENT et se souvient pour toujours
```

---

## Flux de fonctionnement

### 🔄 Étape 1: Premier accès à l'application

```
Requête HTTP du navigateur
    ↓
NextIntl intercepte via i18n/request.ts
    ↓
1️⃣ Vérifier si cookie "locale" existe
   ✓ Cookie trouvé → utiliser cette locale
   ✗ Cookie absent → passer à l'étape 2️⃣
    ↓
2️⃣ Lire le header "Accept-Language" du navigateur
   Exemple: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
    ↓
3️⃣ Parser et mapper les codes de langue avec LOCALE_MAPPING
   - "fr-FR" → "fr"
   - "en-US" → "en"
   - Etc.
    ↓
4️⃣ Créer automatiquement un cookie avec la locale détectée
   Cookies.set("locale", "fr", { ... })
    ↓
5️⃣ Charger les messages JSON correspondants
   import('../messages/fr.json')
    ↓
Rendu de la page en français ✨
```

### 🎯 Étape 2: Clic sur un bouton de langue

```
Utilisateur clique sur le bouton "EN"
    ↓
Client Component LanguageSwitcher.tsx exécute
    ↓
handleChangeLanguage("en") appelé
    ↓
Server Action: setLocale("en") exécutée
    ↓
Cookies.set("locale", "en", { ... })
    ↓
window.location.reload() recharge la page
    ↓
Nouvelle requête avec le nouveau cookie
    ↓
i18n/request.ts trouve le cookie "locale" = "en"
    ↓
Charge les messages en anglais
    ↓
Page rendue en anglais ✨
```

---

## Architecture

### 📁 Structure des fichiers

```
projet/
├── i18n/
│   ├── config.ts         ← Configuration centralisée (locales, mapping)
│   ├── actions.ts        ← Server Actions pour modifier le cookie
│   └── request.ts        ← Configuration Next-Intl (initialisation)
├── app/
│   ├── components/
│   │   └── LanguageSwitcher.tsx  ← Boutons de langue (Client Component)
│   ├── layout.tsx        ← Layout principal (Server Component)
│   ├── page.tsx          ← Page d'accueil
│   └── globals.css
├── messages/
│   ├── en.json           ← Traductions anglais
│   ├── fr.json           ← Traductions français
│   └── ln.json           ← Traductions autre langue
└── next.config.ts        ← Config Next.js avec plugin NextIntl
```

---

## Fichiers clés

### 1️⃣ `i18n/config.ts` - Configuration centralisée

```typescript
// Définit les locales supportées
export const SUPPORTED_LOCALES = ["en", "fr", "ln"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

// Locale par défaut si aucune détection
export const DEFAULT_LOCALE: Locale = "en";

// Mapping pour la détection du navigateur
export const LOCALE_MAPPING: Record<string, Locale> = {
  "fr-FR": "fr",
  "fr-BE": "fr",
  "en-US": "en",
  "en-GB": "en",
  // ...
};

// Fonction pour parser l'Accept-Language header
export const getLocaleFromBrowser = (acceptLanguage: string | null) => {
  // Retourne la première locale supportée trouvée
};
```

**Pourquoi?** Centraliser la configuration permet de:
- Ajouter facilement une nouvelle langue
- Modifier le mapping sans chercher partout
- Avoir un type `Locale` strict avec TypeScript

---

### 2️⃣ `i18n/actions.ts` - Server Actions

```typescript
"use server";  // ← Ceci = Server Action (exécutée sur le serveur)

export async function setLocale(locale: Locale) {
  // Vérifier la locale
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Locale '${locale}' n'est pas supportée`);
  }

  const store = await cookies();

  // Modifier le cookie (sécurisé côté serveur ✓)
  store.set("locale", locale, {
    maxAge: 365 * 24 * 60 * 60,  // 1 an
    path: "/",                    // Accessible partout
    httpOnly: true,               // Pas accessible via JavaScript (sécurité)
    sameSite: "lax",              // Protection CSRF
  });

  return { success: true, locale };
}
```

**Pourquoi les Server Actions?**
- ✅ Modifient les cookies de manière sécurisée (côté serveur)
- ✅ Peuvent être appelées depuis un Client Component
- ✅ Pas de route API nécessaire
- ✅ Valident automatiquement les données

---

### 3️⃣ `i18n/request.ts` - Configuration Next-Intl

```typescript
export default getRequestConfig(async () => {
  const store = await cookies();
  const headersList = await headers();

  // 1. D'abord chercher un cookie existant
  let locale = store.get("locale")?.value;

  // 2. Si pas de cookie, déterminer depuis le navigateur
  if (!locale) {
    const acceptLanguage = headersList.get("accept-language");
    locale = getLocaleFromBrowser(acceptLanguage);

    // Stocker automatiquement dans un cookie
    store.set("locale", locale, { ... });
  }

  // 3. Fallback final
  if (!locale) {
    locale = DEFAULT_LOCALE;
  }

  // Charger les messages JSON
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

**Ordre de priorité:**
1. Cookie existant (ce qu'on a choisi avant)
2. Détection du navigateur (Accept-Language header)
3. Fallback anglais (par défaut)

---

### 4️⃣ `app/components/LanguageSwitcher.tsx` - Client Component

```typescript
"use client";  // ← Client Component pour interactivité

import { setLocale } from "@/i18n/actions";

export function LanguageSwitcher() {
  const locale = useLocale();  // Hook Next-Intl pour la locale actuelle
  const [isPending, startTransition] = useTransition();  // État de transition

  const handleChangeLanguage = (newLocale: Locale) => {
    startTransition(async () => {
      await setLocale(newLocale);  // Appel à la Server Action
      window.location.reload();     // Recharger pour appliquer
    });
  };

  // Affiche des boutons EN | FR | LN avec styles
  return (
    <div>
      {SUPPORTED_LOCALES.map((loc) => (
        <button
          onClick={() => handleChangeLanguage(loc)}
          className={locale === loc ? "bg-blue-600" : "bg-gray-200"}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

---

### 5️⃣ `app/layout.tsx` - Layout avec langue dynamique

```typescript
export default async function RootLayout({ children }) {
  // Récupérer la locale côté serveur
  const locale = await getLocale();

  return (
    <html lang={locale}>  {/* ← Dynamique! Pas codé en dur */}
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Important:** `lang={locale}` est DYNAMIQUE, pas codé en dur en "en"!
- Le navigateur/téléphone comprend maintenant la bonne langue
- Les lecteurs d'écran fonctionnent correctement
- SEO amélioré

---

## Comment ça marche

### 🌐 Détection du navigateur en détail

Quand un navigateur fait une requête, il envoie un header `Accept-Language`:

```
Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7
```

Cela signifie:
- `fr-FR` : Français (France) - **préféré**
- `q=0.9` : Français (général) - 90% de préférence
- `q=0.8` : Anglais (US) - 80% de préférence
- `q=0.7` : Anglais (général) - 70% de préférence

**Processus:**
1. Parser le header
2. Essayer chaque langue dans l'ordre
3. Vérifier si elle existe dans `LOCALE_MAPPING`
4. Retourner la première trouvée

Exemple avec ton code:
```typescript
// Utilisateur français
"fr-FR,fr;q=0.9,en;q=0.8"
  ↓ Parser
["fr-FR", "fr", "en"]
  ↓ Chercher dans LOCALE_MAPPING
"fr-FR" → trouvé! = "fr"
  ↓ Retour
locale = "fr"
```

### 🍪 Cookies expliqués

```typescript
store.set("locale", "fr", {
  maxAge: 365 * 24 * 60 * 60,  // Valable 1 an (en secondes)
  path: "/",                    // Accessible sur toutes les pages
  httpOnly: true,               // Sécurité: pas accessible en JavaScript
  sameSite: "lax",              // Sécurité: protection CSRF
});
```

**Résultat dans les DevTools:**
```
Name:    locale
Value:   fr
Path:    /
Expires: [+1 an]
HttpOnly: ✓
```

### 🔄 Flux complet pas à pas

```
Jour 1 - Utilisateur français accède pour la 1ère fois
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Requête: GET http://example.com
2. Header: Accept-Language: fr-FR,fr;q=0.9,en;q=0.8
3. i18n/request.ts lit la requête
4. Pas de cookie → lire Accept-Language
5. Détecter "fr-FR" → mapper à "fr"
6. Créer cookie: locale=fr
7. Charger messages/fr.json
8. Rendu en français ✨
9. Cookie stocké dans le navigateur

Jour 2 - Même utilisateur revient
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Requête: GET http://example.com
2. Cookie envoyé: locale=fr
3. i18n/request.ts lit la requête
4. Cookie trouvé = "fr"
5. Charger messages/fr.json
6. Rendu en français ✨
7. (Accept-Language ignoré car cookie existe)

Jour 2 - Utilisateur clique sur "EN"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. LanguageSwitcher.tsx onClick
2. Server Action: setLocale("en")
3. Modifier cookie: locale=en
4. window.location.reload()
5. Nouvelle requête avec cookie: locale=en
6. i18n/request.ts lit le cookie = "en"
7. Charger messages/en.json
8. Rendu en anglais ✨
9. Cookie mis à jour
```

---

## Dépannage

### ❌ Problème: "Toujours en anglais malgré la détection"

**Cause:** Le cookie n'est pas créé au premier accès

**Solution:**
1. Vérifier que `i18n/request.ts` contient le code de création du cookie
2. Vérifier les DevTools → Application → Cookies
3. Nettoyer les cookies et recharger

### ❌ Problème: "Le changement de langue ne marche pas"

**Cause:** Server Action non appelée ou erreur

**Solution:**
1. Vérifier que `LanguageSwitcher.tsx` a `"use client"`
2. Vérifier que `actions.ts` a `"use server"`
3. Vérifier la console pour les erreurs
4. Vérifier que `reload()` est appelé

### ❌ Problème: "Téléphone toujours en anglais"

**Cause:** Téléphone configuré en anglais + première visite = pas de cookie

**Solution:**
1. Aller sur le site avec le téléphone
2. Cliquer sur "FR" → créer un cookie français
3. Revisiter le site → doit être en français
4. **Ou** configurer le téléphone en français (Paramètres → Langue)

### ❌ Problème: "Accept-Language n'est pas envoyé"

**Cause:** En production, certains proxies/CDN le retirent

**Solution:** Forcer la création d'un cookie même si la détection échoue

---

## Points clés à retenir

✅ **Next-Intl** = Librairie pour l'i18n (traductions)
✅ **Cookies** = Persistance de la préférence
✅ **Accept-Language** = Détection automatique
✅ **Server Actions** = Modification sécurisée des cookies
✅ **Client Component** = Interface interactive (boutons)
✅ **Server Component** = Détection et rendu (layout)

**Le secret:** Combiner détection + cookies + Server Actions = expérience parfaite! 🎉

---

## Tester localement

```bash
# 1. Démarrer en dev
npm run dev

# 2. Aller sur http://localhost:3000
# → Doit être en anglais (ou en français si navigateur configuré)

# 3. Cliquer sur "FR" → doit passer en français
# 4. Recharger la page (F5) → doit rester en français

# 5. Cliquer sur "EN" → doit passer en anglais
# 6. Recharger la page (F5) → doit rester en anglais

# 7. DevTools → Application → Cookies
# → Vérifier le cookie "locale" = "en" ou "fr"
```

