import inquirer from 'inquirer';

// Demande de mot de passe dans le terminal
async function askMasterPassword() {
    // Parametre du prompt
  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'masterPassword',
      message: '🔐 Entrez votre mot de passe maître :',
      mask: '*',
    },
  ]);
  return answers.masterPassword;
}

(async () => {
  const masterPassword = await askMasterPassword();
  console.log('Mot de passe maître reçu (à ne jamais afficher en prod) :', masterPassword);
  // Ici on pourra continuer avec le hash et stockage
})();
