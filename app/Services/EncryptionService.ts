import crypto from 'crypto'

const algorithm = 'aes-128-ecb';
const iv = null;

export default class EncryptionService {
    public async encrypt(text: string, key: string) {
        key = key.substring(0, 16);
        var cipher = crypto.createCipheriv(algorithm, key, iv);

        var mystr = cipher.update(text, 'utf8', 'base64')
        mystr += cipher.final('base64');

        return mystr;
    }

    public async decrypt(text: string, key: string) {
        key = key.substring(0, 16);
        var cipher = crypto.createDecipheriv(algorithm, key, iv);
        var mystr = cipher.update(text, 'base64', 'utf8')
        mystr += cipher.final('utf8');

        return mystr
    }
}