import crypto from 'crypto';

const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-ctr';

export function encrypt(text: string, password: string) {
  const key = crypto.createHash('md5').update(password).digest('hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text: string, password: string) {
  const [iv, content] = text.split(':');
  const key = crypto.createHash('md5').update(password).digest('hex');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex'),
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(content, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString();
}
