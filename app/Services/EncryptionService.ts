import crypto from 'crypto'

const algorithm = 'aes-128-ecb'

export default class EncryptionService {
    public async encrypt(text: string, key: string) {
        key = key.substring(0, 16)
        let thekey = await this.atohex(key)
        const iv = null
        let cipher = crypto.createCipheriv(algorithm, thekey, iv)
        cipher.setAutoPadding(false)
        
        // Add padding ff
        let pad = 16 - (text.length % 16)
        let bufferedText = await this.hexstringtohex((await this.atohex(text)).toString('hex') + 'ff'.repeat(pad))
        
        let mystr = cipher.update(bufferedText)
        return Buffer.concat([mystr, cipher.final()]).toString('base64')
    }

    public async decrypt(cipher: string, key: string) {
        key = key.substring(0, 16)
        let thekey = await this.atohex(key)
        let thedeciper = await this.b64tohex(cipher)
        const iv = null
        let decipher = crypto.createDecipheriv(algorithm, thekey, iv)
        decipher.setAutoPadding(false)
        let mystr = decipher.update(thedeciper).toString('hex')
        // Remove padding
        mystr = mystr.replace(/ff+$/g, '')

        return await this.hextoutf8(mystr)
    }

    // Base64 to hex
    public async b64tohex(str: string) {
        return Buffer.from(str, 'base64')
    }

    // ASCII to hex
    public async atohex(str: string) {
        return Buffer.from(str, 'ascii')
    }

    // Hex to UTF8
    public async hextoutf8(str: string) {
        return Buffer.from(str, 'hex').toString('utf8')
    }

    // Hex to Hex
    public async hexstringtohex(str: string) {
        return Buffer.from(str, 'hex')
    }
}