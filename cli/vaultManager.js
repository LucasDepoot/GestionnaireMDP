import { readVault, writeVault } from './vault.js';
import { decryptData, encryptData } from './encryption.js';
import inquirer from 'inquirer';
import fs from "fs-extra";

export async function addCredentialsToVault(vaultPath, masterPassword, credentials) {
  try {
    const vault = await readVault(vaultPath);
    const decryptedJSON = decryptData(vault.vaultData, masterPassword);
    const data = JSON.parse(decryptedJSON);

    if (data[credentials.site]) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `⚠️ Des identifiants existent déjà pour ${credentials.site}. Les écraser ?`,
          default: false
        }
      ]);

      if (!overwrite) {
        console.log('❌ Ajout annulé.');
        return;
      }
    }

    // Mise à jour ou ajout
    data[credentials.site] = {
      login: credentials.login,
      password: credentials.password
    };

    const newEncryptedData = encryptData(JSON.stringify(data), masterPassword);
    await writeVault(vaultPath, {
      passwordHash: vault.passwordHash, // on ne modifie pas le hash
      vaultData: newEncryptedData
    });

    console.log(`✅ Identifiants enregistrés pour ${credentials.site}`);
  } catch (err) {
    console.error('❌ Erreur lors de l\'ajout dans le vault :', err.message);
  }
}

export async function removeEntry(vaultFile, masterPassword, domainToRemove) {
  try {
    // 1. Lire et déchiffrer le vault
    const vaultContent = await fs.readJson(vaultFile);
    const decrypted = decryptData(vaultContent.vaultData, masterPassword);
    const vaultJson = JSON.parse(decrypted);

    // 2. Vérifier si le domaine existe
    if (!vaultJson[domainToRemove]) {
      throw new Error(`Le domaine "${domainToRemove}" n'existe pas dans le vault.`);
    }

    // 3. Supprimer l'entrée
    delete vaultJson[domainToRemove];

    // 4. Ré-encrypter les données modifiées
    const encryptedData = encryptData(JSON.stringify(vaultJson), masterPassword);

    // 5. Écrire dans le fichier vault
    vaultContent.vaultData = encryptedData;
    await fs.writeJson(vaultFile, vaultContent, { spaces: 2 });

    console.log(`✅ L'entrée pour "${domainToRemove}" a été supprimée.`);
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression dans le vault : ${error.message}`);
  }
}
export async function updateEntry(vaultFile, domain, newUsername, newPassword, masterPassword) {
  try {
    const vault = await fs.readJson(vaultFile);
    if (!vault.vaultData) throw new Error('Aucune donnée chiffrée dans le vault.');

    // Déchiffre les données existantes (JSON string)
    const decryptedJson = decryptData(vault.vaultData, masterPassword);
    const vaultEntries = JSON.parse(decryptedJson);

    // Vérifie si l'entrée existe
    if (!vaultEntries[domain]) {
      throw new Error(`Entrée pour le domaine "${domain}" non trouvée.`);
    }

    // Modifie username et password uniquement si fournis
    if (newUsername !== undefined && newUsername !== null) {
      const trimmedUsername = newUsername.trim();
      if (trimmedUsername !== '') {
        vaultEntries[domain].username = trimmedUsername;
      }
    }
    if (newPassword !== undefined && newPassword !== null) {
      const trimmedPassword = newPassword.trim();
      if (trimmedPassword !== '') {
        vaultEntries[domain].password = trimmedPassword;
      }
    }

    // Rechiffre les données mises à jour
    const updatedEncryptedData = encryptData(JSON.stringify(vaultEntries), masterPassword);

    // Remplace l'ancien vaultData par le nouveau chiffré
    vault.vaultData = updatedEncryptedData;

    // Écrit dans le fichier
    await fs.writeJson(vaultFile, vault, { spaces: 2 });

    console.log(`✅ Entrée mise à jour pour le domaine "${domain}".`);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour dans le vault :', error.message);
  }
}

export async function getVaultEntries(vaultFilePath, masterPassword) {
  try {
    const vault = await fs.readJson(vaultFilePath);
    if (!vault.vaultData) throw new Error('Pas de données chiffrées dans le vault');

    const decryptedJson = decryptData(vault.vaultData, masterPassword);
    const entries = JSON.parse(decryptedJson);
    console.log(entries);
    return entries; // objet complet avec tous les couples identifiant/mot de passe
  } catch (err) {
    throw new Error(`Erreur lors de la lecture ou déchiffrement du vault : ${err.message}`);
  }
}