import drivelist from 'drivelist';
import inquirer from 'inquirer';

async function chooseDrive() {
  const drives = await drivelist.list();

  if (drives.length === 0) {
    console.log("Aucun périphérique détecté.");
    return null;
  }
//   Recuperation de la liste des peripheriques
  const choices = drives.map((drive, index) => {
    const mountpoints = drive.mountpoints.map(m => m.path).join(', ') || 'Pas de point de montage';
    return {
      name: `${drive.description} - ${drive.device} - ${mountpoints}`,
      value: index
    };
  });
//  Proposition des disques dans le terminal
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'driveIndex',
      message: 'Choisissez le périphérique où créer le vault :',
      choices
    }
  ]);

  const chosenDrive = drives[answers.driveIndex];

  // On retourne le premier point de montage (généralement c'est suffisant)
  if (chosenDrive.mountpoints.length === 0) {
    console.log("Le périphérique choisi n'a pas de point de montage accessible.");
    return null;
  }

  return chosenDrive.mountpoints[0].path;
}
export default chooseDrive;
