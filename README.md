# 🔐 Lockal Pass - Gestionnaire de mots de passe local & sécurisé

**Lockal Pass** est un gestionnaire de mots de passe 100% local, conçu pour stocker les identifiants de manière sécurisée sur une **clé USB**, avec une **interface Chrome** pour l’auto-complétion des champs sur les sites web.

L'objectif est d'avoir **le contrôle total des données**, sans serveur distant, tout en gardant une expérience fluide et sécurisée via une extension navigateur.

---

## 🚀 Fonctionnalités prévues

- 🔑 Mot de passe maître unique (jamais stocké)
- 🔒 Vault chiffré en AES-256 GCM, stocké sur une clé USB
- 🧠 Générateur de mots de passe robustes
- 🌐 Extension Chrome avec auto-remplissage des champs
- 🔐 Extension utilisable uniquement si la clé USB est branchée

---

## 🧰 Technologies envisagées

| Composant | Technos utilisées |
|----------|---------------|------------------------|
| Chiffrement | `AES-256-GCM` via `crypto`|
| Hashing mot de passe maître | `Argon2` |
| Choix du stockage | `driveList` |
| Langage de l'app locale | `Node.js` |
| Extension navigateur | HTML/CSS + JavaScript (Chrome API) |
| Communication extension/app | `chrome.runtime.connectNative` 
| Stockage | Fichier JSON chiffré sur clé USB |

---

## 🔍 Structure projet

localpass/
│
├── cli/ # App locale (Node.js)
│ ├── index.js
│ └── chooseDrive.js #choix de la cle de stockage
│ └── encryption.js # Module gestion chiffrement/déchiffrement AES-256-GCM
│ └── password.js # Module gestion mot de passe maître (hash, validation)
│ └── vault.js # Module gestion fichier vault (lecture, écriture, existence)
|
├── extension/ # Code de l'extension Chrome
│ ├── manifest.json
│ ├── background.js  
│ ├── popup.html
│ ├── popup.js
│ ├── content.js
│ ├──  style.css
  └── icons?
│    ├── icon16.png
│    ├── icon48.png
│    └── icon128.png
│
└── README.md

---

## 📅 Roadmap

- [ ] 🎯 Définir la structure des données
- [ ] 🔐 Implémenter le hash et le chiffrement local
- [ ] 🧪 Lire / écrire dans le vault chiffré
- [ ] 🧩 Créer extension Chrome simple (popup + content script)
- [ ] 🔗 Lier extension via Native Messaging
- [ ] 🔓 Vérification de la présence de la clé USB
- [ ] 🧠 Générateur de mot de passe
- [ ] 🌙 UI propre (UX, thèmes, animations ?)

---

## 🛡️ Sécurité

- Vault chiffré uniquement accessible via mot de passe maître
- Extension inutilisable sans la clé USB
- Jamais d’écriture ou de lecture de mots de passe non chiffrés hors mémoire vive
- Design minimal, zéro cloud, zéro télémétrie

---

## 🧠 Objectif pédagogique

Ce projet sert aussi à :

- Apprendre la cryptographie appliquée
- Comprendre les communications navigateur ↔ système
- Structurer une app locale + extension en conditions réelles
- Renforcer ses réflexes de développeur "parano sain"

---

## 👨‍💻 Auteur

Projet codé par Lucas Depoot guidé par son associé IA 🧠 avec une obsession pour la sécurité et le code propre ✨

---

