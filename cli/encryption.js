import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

export function encryptData(data, password) {
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        content: encrypted.toString('hex'),
    };
}

export function decryptData(encryptedData, password) {
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const key = crypto.scryptSync(password, salt, 32);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    const encrypted = Buffer.from(encryptedData.content, 'hex');

    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
