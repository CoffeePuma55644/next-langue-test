# 📊 Diagrammes et Vue d'ensemble

## 🔄 Flux complet

### 1️⃣ Premier accès (aucun cookie)

```
Requête du navigateur
    ↓
Header Accept-Language: fr-FR,fr;q=0.9
    ↓
i18n/request.ts lire le header
    ↓
Parser: fr-FR → fr
    ↓
Cookie créé: locale=fr
    ↓
Charger messages/fr.json
    ↓
Page en français ✨
```

### 2️⃣ Clic sur "EN"

```
LanguageSwitcher onClick
    ↓
Server Action: setLocale("en")
    ↓
Cookie modifié: locale=en
    ↓
Page recharge (reload)
    ↓
i18n/request.ts lit cookie=en
    ↓
Charger messages/en.json
    ↓
Page en anglais ✨
```

### 3️⃣ Retour demain

```
Cookie envoyé: locale=en
    ↓
i18n/request.ts lit cookie
    ↓
Pas de détection (cookie prioritaire)
    ↓
Charger messages/en.json
    ↓
Page en anglais ✨ (instant!)
```

---

## 📁 Architecture des fichiers

```
Créés:
├─ i18n/config.ts          (Configuration centralisée)
├─ i18n/actions.ts         (Server Actions sécurisées)
├─ app/components/LanguageSwitcher.tsx  (Boutons)
└─ Documentation           (3 guides + README)

Modifiés:
├─ i18n/request.ts         (Détection + cookie auto)
├─ app/layout.tsx          (Lang dynamique)
└─ app/page.tsx            (Ajout du switcher)
```

---

## 🎯 Priorié des locales

```
1. Cookie existant     → PRIORITÉ MAX
   ✅ Utiliser celle-ci

2. Accept-Language     → PRIORITÉ MOYENNE
   ✅ Détection auto + créer cookie

3. Fallback            → FALLBACK
   ✅ Anglais par défaut
```

---

## 🍪 Configuration du cookie

```typescript
{
  maxAge: 365 * 24 * 60 * 60,  // 1 an
  path: "/",                    // Partout
  httpOnly: true,               // Sécurité
  sameSite: "lax",              // Anti-CSRF
}
```

---

## Résumé de ce qui fonctionne

✅ Détection automatique du navigateur
✅ Boutons de changement de langue
✅ Persistance pendant 1 an
✅ Fonctionne sur téléphone
✅ Sécurisé (httpOnly, sameSite)
✅ TypeScript safe
✅ Documentation complète

