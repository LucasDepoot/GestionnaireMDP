import argon2 from 'argon2';

export function isStrongPassword(password) {
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\/]/.test(password);
    return password.length >= minLength && hasUppercase && hasSpecialChar;
}

export async function hashPassword(password) {
    return argon2.hash(password);
}

export async function verifyPassword(hash, password) {
    return argon2.verify(hash, password);
}
