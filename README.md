# 🔐 LocalPass - Gestionnaire de mots de passe local & sécurisé

**LocalPass** est un gestionnaire de mots de passe 100% local, conçu pour stocker les identifiants de manière sécurisée sur une **clé USB**, avec une **interface Chrome** pour l’auto-complétion des champs sur les sites web.

L'objectif est d'avoir **le contrôle total des données**, sans serveur distant, tout en gardant une expérience fluide et sécurisée via une extension navigateur.

---

## 🚀 Fonctionnalités prévues

- 🔑 Mot de passe maître unique (jamais stocké)
- 🔒 Vault chiffré en AES-256 GCM, stocké sur une clé USB
- 🧠 Générateur de mots de passe robustes
- 💻 Interface CLI locale (ajout, modification, suppression, lecture)
- 🌐 Extension Chrome avec auto-remplissage des champs
- 🔐 Extension utilisable uniquement si la clé USB est branchée

---

## 🧰 Technologies envisagées

| Composant | Choix préféré | Alternatives possibles |
|----------|---------------|------------------------|
| Chiffrement | `AES-256-GCM` via `crypto`|
| Hashing mot de passe maître | `Argon2` |
| Choix du stockage | `driveList` |
| Langage de l'app locale | `Node.js` |
| Extension navigateur | HTML/CSS + JavaScript (Chrome API) | WebExtension (Firefox) |
| Communication extension/app | `chrome.runtime.connectNative` | WebSocket, fichiers temporaires |
| Stockage | Fichier JSON chiffré sur clé USB |

---

## 🔍 Structure projet envisagée

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
│ ├── popup.html
│ ├── popup.js
│ └── content.js
│
└── README.md
│── vault.json # Vault chiffré (sur la clé)

---

## 📅 Roadmap (à affiner)

- [ ] 🎯 Définir la structure des données
- [ ] 🔐 Implémenter le hash et le chiffrement local (CLI)
- [ ] 🧪 Lire / écrire dans le vault chiffré (via CLI)
- [ ] 🧩 Créer extension Chrome simple (popup + content script)
- [ ] 🔗 Lier extension et CLI via Native Messaging
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

