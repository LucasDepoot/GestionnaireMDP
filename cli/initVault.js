import inquirer from 'inquirer';
import crypto from 'crypto';
import argon2 from 'argon2';
import { createCipheriv, randomBytes, createDecipheriv } from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import chooseDrive from './chooseDrive.js';

const ALGO = 'aes-256-gcm';

// Fonction pour chiffrer une chaîne JSON à l'aide d'un mot de passe
function encryptData(data, password) {
    const salt = crypto.randomBytes(16); // Creation d'un salt aleatoire
    const key = crypto.scryptSync(password, salt, 32); // Dérive une clé à partir du mot de passe
    const iv = randomBytes(12); // Vecteur d'initialisation
    const cipher = createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag(); // Authentification du message

    return {
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        content: encrypted.toString('hex')
    };
}

// Fonction pour déchiffrer les données
function decryptData(encryptedData, password) {
    const salt = Buffer.from(encryptData.salt, 'hex');
    const key = crypto.scryptSync(password, salt, 32);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    const encrypted = Buffer.from(encryptedData.content, 'hex');

    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
// Fonction de verification du mot de passe maitre
function isStrongPassword(password) {
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\/]/.test(password);
    return password.length >= minLength && hasUppercase && hasSpecialChar;
}

(async () => {
    const drivePath = await chooseDrive();
    if (!drivePath) return;

    const vaultFolder = path.join(drivePath, 'LocalPass');
    const vaultFile = path.join(vaultFolder, 'vault.json');

    let vaultExists;
    try {
        vaultExists = await fs.pathExists(vaultFile);
    } catch (e) {
        console.error("❌ Impossible de vérifier l'existence du fichier vault :", e.message);
        return;
    }

    if (vaultExists) {
        let vault;
        try {
            vault = await fs.readJson(vaultFile);
        } catch (e) {
            console.error("❌ Erreur lors de la lecture du vault :", e.message);
            return;
        }

        // Demander à l'utilisateur ce qu'il veut faire
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
            console.log('🚫 Opération annulée.');
            return;
        }

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

            if (action === 'use') {
                if (!vault.vaultData) throw new Error("Aucune donnée chiffrée dans le vault.");
                const decrypted = decryptData(vault.vaultData, currentPassword);
                console.log('🔓 Mot de passe correct, vault accessible.');
                // Les données sont accessibles ici dans `decrypted`
                return;
            }

            if (action === 'overwrite') {
                // On confirme que l'utilisateur est bien autorisé à écraser
                const { masterPassword, confirmPassword } = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'masterPassword',
                        message: 'Choisissez un mot de passe maître :',
                        mask: '*',
                        validate(input) {
                            if (!isStrongPassword(input)) {
                                return 'Le mot de passe doit faire au moins 8 caractères, inclure une majuscule et un caractère spécial.';
                            }
                            return true;
                        }
                    },
                    {
                        type: 'password',
                        name: 'confirmPassword',
                        message: 'Confirmez le mot de passe :',
                        mask: '*'
                    }
                ]);

                if (masterPassword !== confirmPassword) {
                    console.log('❌ Les mots de passe ne correspondent pas. Opération annulée.');
                    return;
                }

                await fs.ensureDir(vaultFolder);

                const newPasswordHash = await argon2.hash(masterPassword);
                const newEncryptedVaultData = encryptData("{}", masterPassword);

                await fs.writeJson(vaultFile, {
                    passwordHash: newPasswordHash,
                    vaultData: newEncryptedVaultData
                }, { spaces: 2 });

                console.log(`✅ Vault écrasé et réinitialisé dans : ${vaultFile}`);
                return;
            }
        } catch (e) {
            console.error('❌ Erreur :', e.message);
            return;
        }
    }

    // Si aucun vault n'existe, on en crée un nouveau
    try {
        const { masterPassword, confirmPassword } = await inquirer.prompt([
            {
                type: 'password',
                name: 'masterPassword',
                message: 'Choisissez un mot de passe maître :',
                mask: '*',
                validate(input) {
                    if (!isStrongPassword(input)) {
                        return 'Le mot de passe doit faire au moins 8 caractères, inclure une majuscule et un caractère spécial.';
                    }
                    return true;
                }
            },
            {
                type: 'password',
                name: 'confirmPassword',
                message: 'Confirmez le mot de passe :',
                mask: '*'
            }
        ]);

        if (masterPassword !== confirmPassword) {
            console.log('❌ Les mots de passe ne correspondent pas. Opération annulée.');
            return;
        }
        await fs.ensureDir(vaultFolder);

        const passwordHash = await argon2.hash(masterPassword);
        const encryptedVaultData = encryptData("{}", masterPassword);

        await fs.writeJson(vaultFile, {
            passwordHash,
            vaultData: encryptedVaultData
        }, { spaces: 2 });

        console.log(`✅ Vault initialisé dans : ${vaultFile}`);
    } catch (e) {
        console.error("❌ Une erreur est survenue lors de la création du vault :", e.message);
    }
})();
