import crypto from 'crypto';
import dotenv from "dotenv";

dotenv.config();

//SHA256
export function hash(dado) {
  const secret = process.env.SALT_SECRET || 'saltpadrao';
  return crypto.createHmac('sha256', secret).update(dado).digest('hex');
}

//AES
const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.SECURE_DATA_KEY, "hex"); // 32 bytes
const iv = Buffer.from(process.env.SECURE_DATA_IV, "hex"); // 16 bytes

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
