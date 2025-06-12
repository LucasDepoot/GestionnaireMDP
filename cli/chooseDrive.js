import fs from 'fs-extra';
import drivelist from 'drivelist';
import inquirer from 'inquirer';

async function chooseDrive() {
    const drives = await drivelist.list();

    // Filtrer uniquement ceux avec un point de montage accessible en lecture + écriture
    const usableDrives = [];

    for (const drive of drives) {
        if (drive.mountpoints.length === 0) continue; // pas de point de montage

        const mountPath = drive.mountpoints[0].path;

        try {
            // Test accès en lecture + écriture
            await fs.access(mountPath, fs.constants.R_OK | fs.constants.W_OK);
            usableDrives.push(drive);
        } catch {
            // Pas accessible en lecture/écriture => on ignore
        }
    }

    // Gestion d'erreur si il n'y a pas de disques utilisables
    if (usableDrives.length === 0) {
        console.log("Aucun périphérique utilisable détecté.");
        return null;
    }

    // On parcourt la liste de disques pour l'afficher
    const choices = usableDrives.map((drive, index) => {
        const mountpoints = drive.mountpoints.map(m => m.path).join(', ');
        return {
            name: `${drive.description} - ${drive.device} - ${mountpoints}`,
            value: index
        };
    });

    // Demande à l'user de choisir le disque
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'driveIndex',
            message: 'Choisissez le périphérique où créer le vault :',
            choices
        }
    ]);

    const chosenDrive = usableDrives[answers.driveIndex];
    return chosenDrive.mountpoints[0].path;
}

export default chooseDrive;
