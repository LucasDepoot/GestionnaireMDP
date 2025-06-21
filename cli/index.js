import inquirer from 'inquirer';
import path from 'path';

import chooseDrive from './chooseDrive.js';
import * as encryption from './encryption.js';
import * as passwordUtils from './password.js';
import * as vaultUtils from './vault.js';

(async () => {
    const drivePath = await chooseDrive();
    if (!drivePath) return;

    const vaultFolder = path.join(drivePath, 'LocalPass');
    const vaultFile = path.join(vaultFolder, 'vault.json');

    if (await vaultUtils.vaultExists(vaultFile)) {
        let vault;
        try {
            vault = await vaultUtils.readVault(vaultFile);
        } catch (e) {
            console.error("❌ Erreur lors de la lecture du vault :", e.message);
            return;
        }

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
            const isValid = await passwordUtils.verifyPassword(vault.passwordHash, currentPassword);
            if (!isValid) throw new Error('Mot de passe incorrect');

            if (action === 'use') {
                if (!vault.vaultData) throw new Error("Aucune donnée chiffrée dans le vault.");
                const decrypted = encryption.decryptData(vault.vaultData, currentPassword);
                console.log('🔓 Mot de passe correct, vault accessible.');
                return;
            }

            if (action === 'overwrite') {
                const { masterPassword, confirmPassword } = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'masterPassword',
                        message: 'Choisissez un nouveau mot de passe maître :',
                        mask: '*',
                        validate(input) {
                            if (!passwordUtils.isStrongPassword(input)) {
                                return 'Le mot de passe doit faire au moins 6 caractères, inclure une majuscule et un caractère spécial.';
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

                const newPasswordHash = await passwordUtils.hashPassword(masterPassword);
                const newEncryptedVaultData = encryption.encryptData("{}", masterPassword);

                await vaultUtils.writeVault(vaultFile, {
                    passwordHash: newPasswordHash,
                    vaultData: newEncryptedVaultData
                });

                console.log(`✅ Vault écrasé et réinitialisé dans : ${vaultFile}`);
                return;
            }
        } catch (e) {
            console.error('❌ Erreur :', e.message);
            return;
        }
    } else {
        // Création du vault
        const { masterPassword, confirmPassword } = await inquirer.prompt([
            {
                type: 'password',
                name: 'masterPassword',
                message: 'Choisissez un mot de passe maître :',
                mask: '*',
                validate(input) {
                    if (!passwordUtils.isStrongPassword(input)) {
                        return 'Le mot de passe doit faire au moins 6 caractères, inclure une majuscule et un caractère spécial.';
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

        const passwordHash = await passwordUtils.hashPassword(masterPassword);
        const encryptedVaultData = encryption.encryptData("{}", masterPassword);

        await vaultUtils.writeVault(vaultFile, {
            passwordHash,
            vaultData: encryptedVaultData
        });

        console.log(`✅ Vault initialisé dans : ${vaultFile}`);
    }
})();
