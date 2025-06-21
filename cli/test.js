import { updateEntry , getVaultEntries } from './vaultManager.js';

const vaultFile = '/media/lucas/AE LUCAS/LocalPass/vault.json';
const domain = 'github.com';
const newUsername = 'lucasUpdated';
const newPassword = undefined;
const masterPassword = '1Test/'; // mot de passe maître pour déchiffrer

(async () => {
  try {
    await updateEntry(vaultFile, domain, newUsername, newPassword, masterPassword);
    console.log('✅ Identifiants modifiés');
    getVaultEntries(vaultFile , masterPassword);
  } catch (e) {
    console.error('❌ Erreur du test :', e.message);
  }
})();

