import inquirer from 'inquirer';
import crypto from 'crypto';
import argon2 from 'argon2';
import { createCipheriv, randomBytes, createDecipheriv } from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import chooseDrive from './chooseDrive.js';

const ALGO = 'aes-256-gcm';

// Fonction pour chiffrer les données avec mot de passe clair
function encryptData(data, password) {
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    content: encrypted.toString('hex')
  };
}

// Fonction pour déchiffrer les données avec mot de passe clair
function decryptData(encryptedData, password) {
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const tag = Buffer.from(encryptedData.tag, 'hex');
  const encrypted = Buffer.from(encryptedData.content, 'hex');

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

(async () => {
  const drivePath = await chooseDrive();
  if (!drivePath) return;

  const vaultFolder = path.join(drivePath, 'LocalPass');
  const vaultFile = path.join(vaultFolder, 'vault.json');

  const vaultExists = await fs.pathExists(vaultFile);

  if (vaultExists) {
    // Charger le fichier vault
    const vault = await fs.readJson(vaultFile);

    // Demander l'action
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Un vault existe déjà sur ce périphérique. Que voulez-vous faire ?',
        choices: [
          { name: 'Utiliser le vault existant', value: 'use' },
          { name: 'Écraser le vault existant', value: 'overwrite' },
          { name: 'Annuler', value: 'cancel' }
        ]
      }
    ]);

    if (action === 'cancel') {
      console.log('Opération annulée.');
      return;
    }

    if (action === 'use') {
      // Vérifier le mot de passe maître avant d'utiliser
      const { currentPassword } = await inquirer.prompt([
        {
          type: 'password',
          name: 'currentPassword',
          message: 'Entrez le mot de passe maître :',
          mask: '*'
        }
      ]);

      try {
        const isValid = await argon2.verify(vault.passwordHash, currentPassword);
        if (!isValid) throw new Error('Mot de passe incorrect');

        // Déchiffrer les données si besoin ici, ou continuer
        const decrypted = decryptData(vault.vaultData, currentPassword);

        console.log('Mot de passe correct, vault accessible.');
        // Tu peux faire ce que tu veux avec les données décryptées
      } catch (e) {
        console.log('Mot de passe incorrect, opération annulée.');
      }
      return;
    }

    if (action === 'overwrite') {
      // Demander le mot de passe maître actuel pour confirmer
      const { currentPassword } = await inquirer.prompt([
        {
          type: 'password',
          name: 'currentPassword',
          message: 'Entrez le mot de passe maître actuel pour confirmer :',
          mask: '*'
        }
      ]);

      try {
        const isValid = await argon2.verify(vault.passwordHash, currentPassword);
        if (!isValid) throw new Error('Mot de passe incorrect');

        console.log('Mot de passe confirmé, vous pouvez écraser le vault.');

        // Nouveau mot de passe maître
        const { newMasterPassword } = await inquirer.prompt([
          {
            type: 'password',
            name: 'newMasterPassword',
            message: 'Choisissez un nouveau mot de passe maître :',
            mask: '*'
          }
        ]);

        await fs.ensureDir(vaultFolder);

        // Hasher le nouveau mot de passe
        const newPasswordHash = await argon2.hash(newMasterPassword);

        // Chiffrer un contenu vide "{}"
        const newEncryptedVaultData = encryptData("{}", newMasterPassword);

        // Écrire le fichier complet avec hash + données chiffrées
        await fs.writeJson(vaultFile, {
          passwordHash: newPasswordHash,
          vaultData: newEncryptedVaultData
        }, { spaces: 2 });

        console.log(`🔐 Vault écrasé et initialisé dans : ${vaultFile}`);

      } catch (e) {
        console.log('Mot de passe incorrect, opération annulée.');
      }
      return;
    }
  } else {
    // Pas de vault, création
    const { masterPassword } = await inquirer.prompt([
      {
        type: 'password',
        name: 'masterPassword',
        message: 'Choisissez un mot de passe maître :',
        mask: '*'
      }
    ]);

    await fs.ensureDir(vaultFolder);

    const passwordHash = await argon2.hash(masterPassword);
    const encryptedVaultData = encryptData("{}", masterPassword);

    await fs.writeJson(vaultFile, {
      passwordHash,
      vaultData: encryptedVaultData
    }, { spaces: 2 });

    console.log(`🔐 Vault initialisé dans : ${vaultFile}`);
  }
})();
