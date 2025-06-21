import fs from 'fs-extra';
import path from 'path';

export async function vaultExists(filePath) {
    return fs.pathExists(filePath);
}

export async function readVault(filePath) {
    return fs.readJson(filePath);
}

export async function writeVault(filePath, data) {
    await fs.ensureDir(path.dirname(filePath));
    return fs.writeJson(filePath, data, { spaces: 2 });
}
